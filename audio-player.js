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
    cutoff : linexp(linlin(Math.random(), 0,1, 80,90), sonicPiFilterMin, sonicPiFilterMax, hzMin, hzMax),
    pan : choose([-0.5,0.5]),
    delays: [0],
    startPositions: [0],
    durs: [1],
    volume: 1,
};

// drumkit
const drumkitDelay = 0;//linlin(Math.random(), 0,1, 0, 0.5) + (choose([-1,1]) * randseed1 / 90);
const drumkitVolume = 1.1;
// kick
let kickBaseUrl = baseSamplesDirectoryUrl + "ab-kicks/";
let kickConfig = {
    name: "kick",
    filename: kickBaseUrl + choose(kicks), // 'kicks' is declared in kick-filenames.js
    pattern : [1,0,0,0,1,0,0,0],
    // delays : [0.01, 0, 0.03, 0, 0.16, 0, 0.18, 0].map(x => x * drumkitDelay),
    delays : [1].map(x => x * drumkitDelay),
    startPositions: [0],
    durs: [1],
    volume: drumkitVolume * linlin(Math.random(), 0, 1, 1.8, 2.0),
};
let snareBaseUrl = baseSamplesDirectoryUrl + "ab-snares-snaps-claps/";
let snareConfig = {
    name: "snare",
    filename: snareBaseUrl + choose(snares), // 'kicks' is declared in kick-filenames.js
    pattern : [0,1],
    delays : [1].map(x => x * drumkitDelay),
    startPositions: [0],
    durs: [1],
    volume: drumkitVolume * linlin(Math.random(), 0, 1, 1.8, 2.0),
};
let hihatBaseUrl = baseSamplesDirectoryUrl + "ab-hats/";
let hihatConfig = {
    name: "hihat",
    filename: hihatBaseUrl + choose(hats), // 'kicks' is declared in kick-filenames.js
    pattern : [1,1,1,1,1,1,1,1],
    delays : [1].map(x => x * drumkitDelay),
    startPositions: [0],
    durs: [1],
    volume: drumkitVolume * linlin(Math.random(), 0, 1, 1.8, 2.0),
};

function newPlayer (playerConfig) {
    console.log("filename: ", playerConfig.filename);
    console.log("rate:", playerConfig.rate);
    console.log("volume:", playerConfig.volume);
    console.log("delaytime:", playerConfig.delaytime);
    console.log("delayfb:", playerConfig.delayfb);
    console.log("cutoff:", playerConfig.cutoff);
    console.log("filter:", playerConfig.filter);
    console.log("pan:", playerConfig.pan);
    console.log("dur:", playerConfig.dur);

    const buf = new Tone.ToneAudioBuffer(playerConfig.filename, () => {
        console.log("bufer loaded:", playerConfig.filename);
    });

    let player = new Tone.Player(buf, () => {
        console.log("player ready:", playerConfig.filename);
    });

    let lastModule = player;

    if( playerConfig.cutoff != undefined && playerConfig.filter != undefined ) {
        console.log(`cutoff:${playerConfig.cutoff} filter:${playerConfig.filter}`);
        const filter = new Tone.OnePoleFilter(playerConfig.cutoff, playerConfig.filter);
        lastModule.connect(filter);
        lastModule = filter;
    }

    if( playerConfig.pan != undefined ) {
        console.log(`pan:${playerConfig.pan}`);
        const panner = new Tone.Panner(playerConfig.pan);
        lastModule.connect(panner);
        lastModule = panner;
    }

    if( playerConfig.delaytime != undefined && playerConfig.delayfb != undefined ) {
        console.log(`delaytime:${playerConfig.delaytime} delayfb:${playerConfig.delayfb}`);
        const delay = new Tone.FeedbackDelay(playerConfig.delaytime, playerConfig.delayfb);
        lastModule.connect(delay);
        lastModule = delay;
    }

    lastModule.toDestination();
    // player.toDestination();
    console.log(`last module: ${lastModule}`);
    console.log("---");

    return player;
}

function loop (config) {
    let step = 0;
    // default time to next sequencer event
    console.log("sequencing:", config.name);
    console.log("player", config.player);

    let delay = 0;
    let accumulatedTime = 0;
    let loopInterval = Sequencer.beatDur;
    const loop = new Tone.Loop((time) => {
        // triggered every eighth note.
        // console.log(time);

        const gate = config.pattern ? config.pattern[step % config.pattern.length] : 1;
        if( gate != rest ) {
            const name = config.name;
            const player = config.player;
            // const delay = config.delays[ step % config.delays.length ] * Tone.Time("8n");
            // subtracting the previous delay from the previous step
            loopInterval = loopInterval - delay;
            delay = Sequencer.beatDur * config.delays[ step % config.delays.length ];
            loopInterval = (Sequencer.beatDur * config.durs[ step % config.durs.length ]) + delay;
            const dur = loopInterval;
            const start = config.startPositions[ step % config.startPositions.length ];
            const volume = linexp(config.volume ? config.volume : 1 , 0, 1, -80, -0.001);
            player.volume.value = linlin(volume, -1, 1, -15, 15);
            player.start(0, start, dur);
        } else {
            loopInterval = Sequencer.beatDur;
        }
        step = (step + 1) % Sequencer.numSteps;

        // console.log(`${step}:${name} player:${config.filename} delay:${delay} start:${start} dur:${dur} vol:${config.volume}`);
        // console.log(`${i}:${name} config.delay:${config.delays[ step % config.delays.length ]} delay:${delay}`);
        // console.log(`${i} player:${player}`);

        accumulatedTime += loopInterval;
        let modulo = accumulatedTime % Sequencer.numbteps;
        if( step == 7 ){
            console.debug("accumulated time:", accumulatedTime);
            console.debug("modulo:", modulo);
            accumulatedTime = 0;
        }
        console.debug('%d:%s interval: %f', step, config.name, loopInterval)
        // console.debug("time:       ", time)
        // console.debug("time delta: ", time - oldtime);
        // console.debug("name: ", name);
        // console.debug("player: ", config.filename);
        // console.debug("delay: ", delay);
        // console.debug("dur: ", dur);
        // console.debug("start: ", start);
        // console.debug("dur: ", dur);
        // console.debug("volume:", config.volume, " gain: ", player.volume.value);
        // console.debug("gate: ", gate);
        console.debug("---");

    }, "8n").start();

    return;
}

function loopAll(configs) {
    let step = 0;
    const loop = new Tone.Loop((time) => {
        for( let i = 0; i < configs.length; i++ ) {
            const config = configs[i];
            const gate = config.pattern[ step % config.pattern.length ];
            if( gate != rest ) {
                const player = config.player;
                player.start(0,0,loop.interval);
            }

            console.debug(config.name);
        }
        step = (step + 1) % Sequencer.numSteps;
    }, "8n").start();
}

function partAll(configs) {
    let step = 0;
    const part = new Tone.Part((time, value) => {
        for( let i = 0; i < configs.length; i++ ) {
            const config = configs[i];
            const gate = config.pattern[ step % config.pattern.length ];
            if( gate != rest ) {
                const player = config.player;
                player.start(0,0,loop.interval);
            }

            console.debug(config.name);
        }
        step = (step + 1) % Sequencer.numSteps;
    }, ["1n", 0]).start();

    part.loop = true;
    part.playbackRate = 4;
}

/// \brief  play the thing.
///
/// This is the main object playing the samples with their assigned delays.
function play() {
    // prevent overdub
    stop();

    bassConfig.player = newPlayer(bassConfig);
    leadConfig.player = newPlayer(leadConfig);
    kickConfig.player = newPlayer(kickConfig);
    snareConfig.player = newPlayer(snareConfig);
    hihatConfig.player = newPlayer(hihatConfig);

    // const band = [bassConfig, leadConfig, kickConfig, snareConfig, hihatConfig]; // full
    // const band = [kickConfig, snareConfig, hihatConfig]; // drumkit
    const band = [kickConfig, snareConfig, hihatConfig]; // kick
    // for( i = 0; i < band.length; i++ ) {
    //     // console.log("%d: %o", i, band[i].pattern);
    //     loop(band[i]);
    // }
    // loopAll(band);
    partAll(band);

    // loop(bassConfig);

    Tone.Transport.start();
}

function stop() {
    if( Tone.Transport.state != "started") return;
    Tone.Transport.stop();
}

