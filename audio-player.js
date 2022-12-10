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
const Sequencer = { numSteps: 8 }
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
    durs: ["8n"],
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
    durs: ["8n"],
    volume: 1,
};

// drumkit
const drumkitDelay = linlin(Math.random(), 0,1, 0, 0.5) + (choose([-1,1]) * randseed1 / 90);
const drumkitVolume = 1.1;
// kick
let kickBaseUrl = baseSamplesDirectoryUrl + "ab-kicks/";
let kickConfig = {
    name: "kick",
    filename: kickBaseUrl + choose(kicks), // 'kicks' is declared in kick-filenames.js
    pattern : [1,0,1,0,1,0,1,0],
    delays : [0.93, 0.73, 0.74, 1.7, 0.83, 0.97, 0.5, 1.6].map(x => x * drumkitDelay),
    startPositions: [0],
    durs: ["8n"],
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
    console.log("looping:", config.name);
    console.log("player", config.player);
    const loop = new Tone.Loop((time) => {
        // triggered every eighth note.
        // console.log(time);

        const name = config.name;
        const player = config.player;
        // const delay = config.delays[ step % config.delays.length ] * Tone.Time("8n");
        const delay = linlin(config.delays[ step % config.delays.length ], 0, 1, 0, Tone.Time("8n").toSeconds());
        const start = config.startPositions[ step % config.startPositions.length ];
        const dur = config.durs[ step % config.durs.length ];
        const gate = config.pattern ? config.pattern[step % config.pattern.length] : 1;
        const volume = linexp(config.volume ? config.volume : 1 , 0, 1, -80, -0.001);
        if( gate == rest ) {
            player.volume.value = linlin(volume, -1, 1, -15, 15);
            player.start(time + delay, start, dur);
        }
        // player.volume.value = config.volume * config.pattern[step];

        // console.log(`${step}:${name} player:${config.filename} delay:${delay} start:${start} dur:${dur} vol:${config.volume}`);
        // console.log(`${i}:${name} config.delay:${config.delays[ step % config.delays.length ]} delay:${delay}`);
        // console.log(`${i} player:${player}`);

        console.log("name: ", name);
        console.log("player: ", config.filename);
        console.log("delay: ", delay);
        console.log("start: ", start);
        console.log("dur: ", dur);
        console.log("volume:", config.volume, " gain: ", player.volume.value);
        console.log("gate: ", gate);
        console.log("---");

        step = (step + 1) % Sequencer.numSteps;
    }, Tone.Time("8n").toSeconds()).start();

    return stop;
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

    const band = [bassConfig, leadConfig, kickConfig];
    // const band = [kickConfig];
    for( i = 0; i < band.length; i++ ) {
        console.log(i, ":", band[i].pattern);
        loop(band[i]);
    }

    // loop(bassConfig);

    Tone.Transport.start();
}

function stop() {
    Tone.Transport.stop();
}

