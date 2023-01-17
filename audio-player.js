// TODO:
//
// - [x] fix bpm
// - [ ] add seeded random modifiers to newPlayer(); this allows to create new player values on the fly.
// - [ ] random lead play (+ canviar filtre baix dinàmicament)
// - [ ] introduir valors delays als arrays
// - [ ] mapejar seeds a variables
// - [ ] acabar UI
// - [ ] all variables are either randomseeded or determined by user
// - [x] chop AAAB son 8 o 16 beats
// - [x] dur rand(x,y) - legato
// - [x] + delay de cada kit
// - [x] conditional triggers drumkit [0.0,1.0]

// global vars
// random seeds
// general random
//
let randseed1 = seedrandom(Math.random());
// let randseed1 = seedrandom(1);
// drumkit delay
let randseed2 = seedrandom(2);
// lead + bass || bass
let randseed3 = seedrandom(3);
// sample choice
let randseed4 = seedrandom(4);

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
let bpm = linlin(Math.random(), 0, 1, 86,98);

// number of slices per part (A and B)
const numSlices = seedChoose(randseed1, [8,16]);
console.debug("num slices: %d", numSlices);

/// Variables holding arrays with sample file names are in dedicated files for
/// each group. This makes it easier to generate and maintain.
let baseSamplesDirectoryUrl = "samples/";

// starters
let starterBaseUrl = baseSamplesDirectoryUrl + "starters/";
let starterFilename = starterBaseUrl + choose(starters); // 'starters' is declared in kick-filenames.js
let isStarterReady = false;
let playLead = Math.round(Math.random());
// lead
let leadConfig = {
    name: "lead",
    filename: starterFilename,
    filter : "highpass",
    rate: 2,
    cutoff : linexp(linlin(Math.random(), 0,1, 80,90), sonicPiFilterMin, sonicPiFilterMax, hzMin, hzMax),
    pan : choose([-0.5,0.5]),
    delays: [0],
    startPositions: [0],
    legato: linlin(seedrand(randseed1), 0, 1, 0.6, 0.8),
    dur: beatDur,
    volume: 1,
    play: playLead,
};
// bass
let bassConfig = {
    name: "bass",
    filename: starterFilename,
    filter : "lowpass",
    rate: 1,
    // set cutoff to a higher value if lead is not playing
    cutoff : linexp(playLead? 80:100, sonicPiFilterMin, sonicPiFilterMax, hzMin, hzMax),
    pan : linlin(Math.random(), 0,1, -0.09, 0),
    delays: [0],
    startPositions: [0],
    dur: beatDur ,
    volume: 1,
};

// drumkit
//
// WARNING!:
// There are 2 types of drum delay: drumkit delay (general), and individual delay.
// The INDIVIDUAL delay is a SEQUENCE with a size equal to that of PATTERN. Delays
// in the same slots as 'rests' won't have any effect.
const drumkitDelay = linlin(seedrand(randseed1),0 ,1 , 0, 0.05) + (choose([-1,1]) * randseed1 / 90);
const drumkitVolume = 1.1;
const drumkitDur = beatDur;
// kick
const kickDelay = linlin(seedrand(randseed1),0 ,1 , 0, 0.087) + (choose([-1,1]) * randseed1 / 30);
let kickBaseUrl = baseSamplesDirectoryUrl + "ab-kicks/";
let kickConfig = {
    name: "kick",
    filename: kickBaseUrl + choose(kicks), // 'kicks' is declared in kick-filenames.js
    pattern : [1,0,1,0, 1,0,1,0], // playing probability - 1=always; 0=never; 0.5=50%
    //delays :  [0,0.93,0.72,0.74,1.7,0.83,0.97,0.5].map(x => x + drumkitDelay + kickDelay)
    delays :  [0,-0.07,-0.35,0.39,1.09,-0.08,-0.11,0.39].map(x => x + drumkitDelay + kickDelay),
    startPositions: [0],
    dur: drumkitDur,
    volume: drumkitVolume * linlin(Math.random(), 0, 1, 1.8, 2.0),
};
// snare
const snareDelay = linlin(seedrand(randseed1),0 ,1 , 0, 0.076) + (choose([-1.5,1.5]) * randseed1 / 30);
let snareBaseUrl = baseSamplesDirectoryUrl + "ab-snares-snaps-claps/";
let snareConfig = {
    name: "snare",
    filename: snareBaseUrl + choose(snares), // 'kicks' is declared in kick-filenames.js
    pattern : [0,0,1,0,0,0,1,0.1], // playing probability - 1=always; 0=never; 0.5=50%
    delays :  [0,0,0.02,0,0,0,0,-0.15].map(x => x + drumkitDelay + snareDelay),
    startPositions: [0],
    dur: drumkitDur,
    volume: drumkitVolume * linlin(Math.random(), 0, 1, 1.8, 2.0),
};
console.debug(snareConfig.pattern);
// hats
const hihatDelay = linlin(seedrand(randseed1), 0, 1, -0.01, 0.05 + 0.005 * randseed1);
let hihatBaseUrl = baseSamplesDirectoryUrl + "ab-hats/";
let hihatConfig = {
    name: "hihat",
    filename: hihatBaseUrl + choose(hats), // 'kicks' is declared in kick-filenames.js
    pattern : [0.933,1,1,1,1,1,1,0.833], // playing probability - 1=always; 0=never; 0.5=50%
    delays : [0,0.02,0,0.02,0,0.02,0,0.02].map(x => x + drumkitDelay + hihatDelay),
    startPositions: [0],
    dur: drumkitDur,
    volume: drumkitVolume * linlin(Math.random(), 0, 1, 0.2, 2.0),
};

function newPlayer (playerConfig) {
    const buf = new Tone.ToneAudioBuffer(playerConfig.filename, () => {
        console.info("bufer loaded:", playerConfig.filename);
    });

    // TODO: add seeded random modifiers

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
            const partA = choosen(chunks, numSlices);
            const partB = choosen(chunks, numSlices);
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

        if( gate != rest && gate > Math.random() ) {
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

    }, loopInterval).start();

    return;
}

/// \brief  play the thing.
///
/// This is the main object playing the samples with their assigned delays.
function play() {
    // prevent overdub
    stop();

    starterFilename = starterBaseUrl + choose(starters); // 'starters' is declared in kick-filenames.js

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
    bassConfig.player.dispose();
    leadConfig.player.dispose();
    kickConfig.player.dispose();
    snareConfig.player.dispose();
    hihatConfig.player.dispose();
}

