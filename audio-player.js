// TODO:
//
// - [x] fix bpm
// - [x] add perlin noise with multiplier to chop. Multiplier modifies delta between startpoints
// - [ ] change implementation to allow dynamic variable tweeking
// - [x] mapejar seeds a variables
// - [x] all variables are either randomseeded or determined by user
// - [x] random lead play (+ canviar filtre baix dinàmicament)
// - [x] introduir valors delays als arrays
// - [ ] acabar UI
// - [x] chop AAAB son 8 o 16 beats
// - [x] dur rand(x,y) - legato
// - [x] + delay de cada kit
// - [x] conditional triggers drumkit [0.0,1.0]

// global vars
// let seed = Math.random(); ///< testing variable
let seed = 1;

let cb = 0; ///< stands for "complexitat del beat": [0..5]. Affects the drumkit delays.
let cs = 1; ///< stands for "complexitat del sample". Used to choose if lead plays or not.

// general random
let rand = seedrand(seed);
// sonic-pi filter frequency range mapping
const sonicPiFilterMin = 0;
const sonicPiFilterMax = 140;
const hzMin = 20;
const hzMax = 20000;

// sequencer
//const beatDur = Tone.Time("8n").toSeconds();
const beatDur = "8n";
const numSteps = 8;
const rest = 0;
// tempo
let bpm;

// number of slices per part (A and B)
let numSlices = seedChoose(seed, [8,16]);
console.debug("num slices: %d", numSlices);

/// Variables holding arrays with sample file names are in dedicated files for
/// each group. This makes it easier to generate and maintain.
let baseSamplesDirectoryUrl = "samples/";

// starters
let starterBaseUrl = baseSamplesDirectoryUrl + "starters/";
let starterFilename;
let isStarterReady = false;
let playLead;
let leadConfig = {};
let bassConfig = {};

// drumkit
//
// WARNING!:
// There are 2 types of drum delay: drumkit delay (general), and individual delay.
// The INDIVIDUAL delay is a SEQUENCE with a size equal to that of PATTERN. Delays
// in the same slots as 'rests' won't have any effect.
let drumkitDelayModifier;
let drumkitDelay;
let drumkitVolume = 1.1;
let drumkitDur = beatDur;
// kick
let kickPattern = [1,0,1,0, 1,0,1,0]; // playing probability - 1=always; 0=never; 0.5=50%
let kickDelays =  [0,-0.07,-0.35,0.39,1.09,-0.08,-0.11,0.39];
let kickBaseUrl = baseSamplesDirectoryUrl + "ab-kicks/";
let kickDelay;
let kickConfig = {};
// snare
let snarePattern = [0,0,1,0,0,0,1,0.1]; // playing probability - 1=always; 0=never; 0.5=50%
let snareDelays =  [0,0,0.02,0,0,0,0,-0.15];
let snareBaseUrl = baseSamplesDirectoryUrl + "ab-snares-snaps-claps/";
let snareDelay;
let snareConfig = {};
// hats
let hihatPattern = [0.933,1,1,1,1,1,1,0.833]; // playing probability - 1=always; 0=never; 0.5=50%
let hihatDelays = [0,0.02,0,0.02,0,0.02,0,0.02];
let hihatBaseUrl = baseSamplesDirectoryUrl + "ab-hats/";
let hihatDelay;
let hihatConfig = {};

function newPlayer (playerConfig) {
    const buf = new Tone.ToneAudioBuffer(playerConfig.filename, () => {
        console.info("bufer loaded:", playerConfig.filename);
    });

    let player = new Tone.Player(buf, () => {
        console.info("%s sample ready: %s", playerConfig.name, playerConfig.filename);
        console.info("player name:", playerConfig.name);
        if( playerConfig.name == "bass" || playerConfig.name == "lead" ) {
            console.debug("buffer duration:", buf.duration);
            // stretch to match bpm
            const numMeasures = 64;
            // const stretchRatio = ...;
            // chop in 4 beats per measure
            const numBeats = 4 * numMeasures;
            const chunks = chop(buf.duration, numBeats);
            // const partA = choosen(chunks, numSlices);
            // const partB = choosen(chunks, numSlices);
            const partA = perlinChoosen(chunks, numSlices, playerConfig.startPositionsDelta);
            const partB = perlinChoosen(chunks, numSlices, playerConfig.startPositionsDelta);
            playerConfig.startPositions = createScore(partA, partB);
            // create a pattern to play all steps in the score structure
            playerConfig.pattern = [];
            playerConfig.pattern.length = playerConfig.startPositions.length;
            playerConfig.pattern.fill(1);
            // playerConfig.rate = sampleStretchRatioAccordingToPau( buf.duration, bpm ) * (playerConfig.name == "bass"? 1 : 2);
            playerConfig.rate = sampleStretchRatio( buf.duration, bpm ) * (playerConfig.name == "bass"? 1 : 2);

            console.debug("parts:\n%o\n%o", partA, partB);
            console.debug("%s startpositions: %o", playerConfig.name, playerConfig.startPositions);
            console.debug("%s pattern:", playerConfig.name, playerConfig.pattern);
            console.debug("%s rate:", playerConfig.name, playerConfig.rate);

        }

        loop(playerConfig);
    });


    // add effects
    //
    // 'lastModule' is used to dynamically add effects to the chain and connect the last one
    // to the '.toDestionation()' function.
    let lastModule = player;

    if( playerConfig.cutoff != undefined && playerConfig.filter != undefined ) {
        console.info(`cutoff:${playerConfig.cutoff} filter:${playerConfig.filter}`);
        const filter = new Tone.OnePoleFilter(playerConfig.cutoff, playerConfig.filter);
        lastModule.connect(filter);
        lastModule = filter;
    }

    if( playerConfig.pan != undefined ) {
        console.info(`pan:${playerConfig.pan}`);
        const panner = new Tone.Panner(playerConfig.pan);
        lastModule.connect(panner);
        lastModule = panner;
    }

    if( playerConfig.delaytime != undefined && playerConfig.delayfb != undefined ) {
        console.info(`delaytime:${playerConfig.delaytime} delayfb:${playerConfig.delayfb}`);
        const delay = new Tone.FeedbackDelay(playerConfig.delaytime, playerConfig.delayfb);
        lastModule.connect(delay);
        lastModule = delay;
    }

    lastModule.toDestination();
    console.debug(`last module: ${lastModule}`);
    console.log("---");

    return player;
}

function loop (config) {
    printPlayer(config);

    let step = 0;
    let delay = 0;
    let accumulatedTime = 0;
    let loopInterval = Tone.Time(config.dur).toSeconds(); 
    
    if( config.name == "lead" && (config.play == false || config.play == undefined)) {
        console.debug("don't play lead");
        return;
    }

    const loop = new Tone.Loop((time) => {
        const gate = config.pattern ? config.pattern[step % config.pattern.length] : 1;

        if( gate != rest && gate > rand ) {
            const name = config.name;
            const player = config.player;
                  
            // subtracting the previous delay from the previous step
            loopInterval = loopInterval - delay;
            delay = loopInterval * config.delays[ step % config.delays.length ];
            loopInterval = loopInterval + delay;
            const startPoint = config.startPositions[ step % config.startPositions.length ];
            const volume = linexp(config.volume ? config.volume : 1 , 0, 1, -80, -0.001);
            const legato = loopInterval * (config.legato ? config.legato : 1);

            player.volume.value = linlin(volume, -1, 1, -15, 15);
            player.playbackRate = config.rate ? config.rate : 1;
            player.start(time + delay, startPoint, legato);

            // console.debug("%s delay[%d]: %f", config.name, step % config.delays.length, config.delays[step % config.delays.length]);
            // console.debug("name: %s, interval: %s, dur: %s", config.name, loopInterval, config.dur);
        }

        step = (step + 1) % config.pattern.length;

        accumulatedTime += 1;
        let modulo = accumulatedTime % numSteps;
        if( step == 7 ){
            console.debug("accumulated time:", accumulatedTime);
            console.debug("modulo:", modulo);
            accumulatedTime = 0;
        }

    }, loopInterval);

    // loop.start();

    if( config.loop == undefined ) {
        config.loop = loop;
        config.loop.start();
    }

    return;
}

function systemSetup() {
    bpm = linlin(rand, 0, 1, 86,98);
    rand = seedrand(seed);

    starterFilename = starterBaseUrl + seedChoose(seed, starters);
    playLead = cs % 2;

    leadConfig.name = "lead";
    leadConfig.filename = starterFilename;
    leadConfig.filter  = "highpass";
    leadConfig.rate = 2;
    leadConfig.cutoff = linexp(linlin(rand, 0,1, 80,90), sonicPiFilterMin, sonicPiFilterMax, hzMin, hzMax);
    leadConfig.pan = seedChoose(seed, [-0.5,0.5]);
    leadConfig.delays = [0];
    leadConfig.startPositions = [0];
    leadConfig.startPositionsDelta = cs; ///< determines if the startpositions are contiguous or far appart
    leadConfig.legato = linlin(rand, 0, 1, 0.6, 0.8);
    leadConfig.dur = beatDur;
    leadConfig.volume = 1;
    leadConfig.play = playLead;

    bassConfig.name = "bass";
    bassConfig.filename = starterFilename;
    bassConfig.filter  = "lowpass";
    bassConfig.rate = 1;
    // set cutoff to a higher value if lead is not playing
    bassConfig.cutoff  = linexp(playLead? 80:100, sonicPiFilterMin, sonicPiFilterMax, hzMin, hzMax);
    bassConfig.pan  = linlin(rand, 0,1, -0.09, 0);
    bassConfig.delays = [0];
    bassConfig.startPositions = [0];
    bassConfig.startPositionsDelta = cs; ///< determines if the startpositions are contiguous or far appart
    bassConfig.dur = beatDur ;
    bassConfig.volume = 1;

    drumkitDelayModifier = cb;
    drumkitDelay = linlin(rand,0 ,1 , 0, 0.05) + (seedChoose(seed, [-1,1]) * drumkitDelayModifier / 90);

    kickDelay = linlin(rand,0 ,1 , 0, 0.087) + (seedChoose(seed, [-1,1]) * drumkitDelayModifier / 30);
    kickConfig.name = "kick";
    kickConfig.filename = kickBaseUrl + seedChoose(seed, kicks); // 'kicks' is declared in kick-filenames.js
    kickConfig.pattern  = kickPattern;
    kickConfig.delays = kickDelays.map(x => x + drumkitDelay + kickDelay);
    kickConfig.startPositions = [0];
    kickConfig.dur = drumkitDur;
    kickConfig.volume = drumkitVolume * linlin(rand, 0, 1, 1.8, 2.0);

    snareDelay = linlin(rand,0 ,1 , 0, 0.076) + (seedChoose(seed, [-1.5,1.5]) * drumkitDelayModifier / 30);
    snareConfig.name = "snare";
    snareConfig.filename = snareBaseUrl + seedChoose(seed, snares); // 'snares' is declared snares-filenames.js
    snareConfig.pattern  = snarePattern;
    snareConfig.delays  = snareDelays.map(x => x + drumkitDelay + snareDelay);
    snareConfig.startPositions = [0];
    snareConfig.dur = drumkitDur;
    snareConfig.volume = drumkitVolume * linlin(rand, 0, 1, 1.8, 2.0);

    hihatDelay = linlin(rand, 0, 1, -0.01, 0.05 + 0.005 * drumkitDelayModifier);
    hihatConfig.name = "hihat";
    hihatConfig.filename = hihatBaseUrl + seedChoose(seed, hats); // 'hats' is declared in hats-filenames.js
    hihatConfig.pattern = hihatPattern;
    hihatConfig.delays = hihatDelays.map(x => x + drumkitDelay + hihatDelay);
    hihatConfig.startPositions = [0];
    hihatConfig.dur = drumkitDur;
    hihatConfig.volume = drumkitVolume * linlin(rand, 0, 1, 0.2, 2.0);
}

/// \brief  play the thing.
///
/// This is the main object playing the samples with their assigned delays.
function play() {
    // prevent overdub
    stop();
    systemSetup();

    bassConfig.player = newPlayer(bassConfig);
    leadConfig.player = newPlayer(leadConfig);
    kickConfig.player = newPlayer(kickConfig);
    snareConfig.player = newPlayer(snareConfig);
    hihatConfig.player = newPlayer(hihatConfig);

    Tone.Transport.start("+1", "0:0:0");
    // FIX: bad hack. Couldn't find a better way to set the tempo...
    //      ...bpm.value = x doesn't seem to work, not even before calling start()
    Tone.Transport.bpm.rampTo(bpm, 0.1);

    // console.info("BPM: ", Tone.Transport.bpm.value);
    console.info("BPM: ", bpm);
}

function stop() {
    if( Tone.Transport.state != "started") return;
    Tone.Transport.stop();
    // bassConfig.player.dispose();
    // leadConfig.player.dispose();
    // kickConfig.player.dispose();
    // snareConfig.player.dispose();
    // hihatConfig.player.dispose();
}

