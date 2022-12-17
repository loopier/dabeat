// global vars
// random seeds
let randseed1 = 0;
let randseed2 = 0;
let randseed3 = 0;

// sonic-pi filter frequency range mapping
const sonicPiFilterMin = 0;
const sonicPiFilterMax = 140;
const hzMin = 20;
const hzMax = 20000;

// sequencer
const Sequencer = { numSteps: 8, beatDur: Tone.Time("8n").toSeconds() };
console.debug("sequencer:", Sequencer);
const rest = 0;
// tempo
let bpm = linlin(Math.random(), 0, 1, 86,98);

// musical structure
const ScoreStructure = {
    AAAB: 1,
    AAAAAABB: 2,
};
// define structure to be used
const scoreStructure = ScoreStructure.AAAB;
// number of slices per part (A and B)
const numSlices = 8;

/// Variables holding arrays with sample file names are in dedicated files for
/// each group. This makes it easier to generate and maintain.
let baseSamplesDirectoryUrl = "samples/";

// starters
let starterBaseUrl = baseSamplesDirectoryUrl + "starters/";
let starterFilename = starterBaseUrl + choose(starters); // 'starters' is declared in kick-filenames.js
let isStarterReady = false;
// bass
let bassConfig = {
    name: "bass",
    filename: starterFilename,
    filter : "lowpass",
    rate: 1,
    cutoff : linexp(80, sonicPiFilterMin, sonicPiFilterMax, hzMin, hzMax),
    pan : linlin(Math.random(), 0,1, -0.09, 0),
    delays: [0],
    startPositions: [0],
    durs: [1],
    volume: 1,
};
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
    durs: [1],
    volume: 1,
};

// drumkit
//
// WARNING!:
// There are 2 types of drum delay: drumkit delay (general), and individual delay.
// The INDIVIDUAL delay is a SEQUENCE with a size equal to that of PATTERN. Delays
// in the same slots as 'rests' won't have any effect.
const drumkitDelay = 0;//linlin(Math.random(), 0,1, 0, 0.5) + (choose([-1,1]) * randseed1 / 90);
const drumkitVolume = 1.1;
// kick
let kickBaseUrl = baseSamplesDirectoryUrl + "ab-kicks/";
let kickConfig = {
    name: "kick",
    filename: kickBaseUrl + choose(kicks), // 'kicks' is declared in kick-filenames.js
    pattern : [1,  0,0,0,   1,0,0,0],
    delays :  [0.3,0,0,0,-0.3,0,0,0].map(x => x + drumkitDelay),
    startPositions: [0],
    durs: [1],
    volume: drumkitVolume * linlin(Math.random(), 0, 1, 1.8, 2.0),
};
let snareBaseUrl = baseSamplesDirectoryUrl + "ab-snares-snaps-claps/";
let snareConfig = {
    name: "snare",
    filename: snareBaseUrl + choose(snares), // 'kicks' is declared in kick-filenames.js
    pattern : [0,1],
    delays : [1].map(x => x + drumkitDelay),
    startPositions: [0],
    durs: [1],
    volume: drumkitVolume * linlin(Math.random(), 0, 1, 1.8, 2.0),
};
let hihatBaseUrl = baseSamplesDirectoryUrl + "ab-hats/";
let hihatConfig = {
    name: "hihat",
    filename: hihatBaseUrl + choose(hats), // 'kicks' is declared in kick-filenames.js
    pattern : [1,1,1,1,1,1,1,1],
    delays : [1].map(x => x + drumkitDelay),
    startPositions: [0],
    durs: [1],
    volume: drumkitVolume * linlin(Math.random(), 0, 1, 1.8, 2.0),
};

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
            const partA = choosen(chunks, numSlices);
            const partB = choosen(chunks, numSlices);
            playerConfig.startPositions = createScore(scoreStructure, partA, partB);
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
    let loopInterval = Sequencer.beatDur;

    const loop = new Tone.Loop((time) => {
        const gate = config.pattern ? config.pattern[step % config.pattern.length] : 1;
        if( gate != rest ) {
            const name = config.name;
            const player = config.player;
            // subtracting the previous delay from the previous step
            loopInterval = loopInterval - delay;
            delay = Sequencer.beatDur * config.delays[ step % config.delays.length ];
            loopInterval = (Sequencer.beatDur * config.durs[ step % config.durs.length ]) + delay;
            const dur = "8n";
            const startPoint = config.startPositions[ step % config.startPositions.length ];
            const volume = linexp(config.volume ? config.volume : 1 , 0, 1, -80, -0.001);

            player.volume.value = linlin(volume, -1, 1, -15, 15);
            player.playbackRate = config.rate? config.rate : 1;
            player.start(time + delay, startPoint, dur);

            console.log("delay[%d]: %f", step % config.delays.length, config.delays[step % config.delays.length]);
        } else {
            loopInterval = Sequencer.beatDur;
        }

        step = (step + 1) % config.pattern.length;

        accumulatedTime += loopInterval;
        let modulo = accumulatedTime % Sequencer.numbteps;
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

    Tone.Transport.start();
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

