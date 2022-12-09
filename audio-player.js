

// starters
let starterPlayer = null;
let starterSamplePath = "samples/starters/honey-120bpm-with-shinobic.wav";
let isStarterReady = false;
// drumkit
let kickPlayer = null;
let kickPath = "cave-kick.wav";
let kickPattern = [1,0,1,0,1,0,1,0];
const kickdelays = [0.93, 0.73, 0.74, 1.7, 0.83, 0.97, 0.5, 1.6];
let kickindex = 0;

function setupPlayer (filepath) {
    // console.log("starter path: ", filepath);
    const buf = new Tone.ToneAudioBuffer(filepath, () => {
        console.log("bufer loaded:", filepath);
    });

    let player = new Tone.Player(buf, () => {
        console.log("player ready:", filepath);
    });

    // player.toDestination();

    return player;
}

function loop () {
    const loop = new Tone.Loop((time) => {
        // triggered every eighth note.
        // console.log(time);

        // starter
        if( starterPlayer.loaded == false
          || kickPlayer.loaded == false) {
            console.log("waiting for players to be ready...");
            return;
        }
        starterPlayer.start(time + 0.00, kickdelays[kickindex], "16n");
        // starterSamplePLayer.start(time + 0.25, 1, "8n");


        // drums
        if( kickPattern[kickindex] ) {
            kickPlayer.start(time + kickdelays[kickindex], 0, "8n");
        }

        kickindex = (kickindex + 1) % kickdelays.length;
        // console.log(`${kickindex}:${kickdelays[kickindex]}`);
    }, "8n").start();

    Tone.Transport.start();
}

function play() {
    starterPlayer = setupPlayer(starterSamplePath);
    kickPlayer = setupPlayer("samples/ab-kicks/"+kickPath);

    starterPlayer
        .connect((new Tone.Panner(-1))
                 .connect((new Tone.OnePoleFilter(15000, "highpass")).toDestination()));
    kickPlayer
        .connect((new Tone.Panner(1))
                 .connect((new Tone.OnePoleFilter(50, "lowpass")).toDestination()));

    loop();
}
