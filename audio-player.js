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
const numSteps = 8;
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
// kick
let kickBaseUrl = baseSamplesDirectoryUrl + "ab-kicks/";
let kickConfig = {
    name: "kick",
    filename: kickBaseUrl + choose(kicks), // 'kicks' is declared in kick-filenames.js
    pattern : [1,0,1,0,1,0,1,0],
    // delays : addDrumkitDelay([0.93, 0.73, 0.74, 1.7, 0.83, 0.97, 0.5, 1.6], drumkitDelay),
    delays : [0.93, 0.73, 0.74, 1.7, 0.83, 0.97, 0.5, 1.6].map(x => x * drumkitDelay),
    startPositions: [0],
    durs: ["8n"],
    volume: 1,
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

function loop (players) {
    let step = 0;
    const loop = new Tone.Loop((time) => {
        // triggered every eighth note.
        // console.log(time);

        for(let i = 0; i < players.length; i++) {
            const obj = players[i];
            const name = obj.name;
            const player = obj.player;
            const delay = obj.delays[ step % obj.delays.length ] * Tone.Time("8n");
            // const delay = linlin(obj.delays[ step % obj.delays.length ], 0, 1, 0, Tone.Time("8n").toSeconds());
            const start = obj.startPositions[ step % obj.startPositions.length ];
            const dur = obj.durs[ step % obj.durs.length ];
            player.start(time + delay, start, dur);
            player.volume.value = obj.volume;

            console.log(`${i}:${name} player:${players[i].filename} delay:${delay} start:${start} dur:${dur} vol:${obj.volume}`);
            // console.log(`${i}:${name} obj.delay:${obj.delays[ step % obj.delays.length ]} delay:${delay}`);
            // console.log(`${i} player:${player}`);
        }

        // // starter
        // if( bassPlayer.loaded == false
        //   || kickPlayer.loaded == false) {
        //     console.log("waiting for players to be ready...");
        //     return;
        // }
        // bassPlayer.start(time + 0.00, kickConfig.delays[step], "8n");
        // // starterSamplePLayer.start(time + 0.25, 1, "8n");


        // // drums
        // if( kickPattern[step] ) {
        //     kickPlayer.start(time + kickConfig.delays[step], 0, "8n");
        // }

        step = (step + 1) % numSteps;
        // console.log(`${step}:${kickConfig.delays[step]}`);
    }, Tone.Time("8n").toSeconds()).start();

    Tone.Transport.start();
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

    loop([bassConfig, leadConfig, kickConfig]);
}

function stop() {
    Tone.Transport.stop();
}

