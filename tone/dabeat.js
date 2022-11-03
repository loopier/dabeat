// Meta code
// 1. load a sample
// 2. chop twice in 8 or 16 chunks
// 3. choose chunks favouring those that are closer to each other, determined with
//  's1': one for high-pitch, one for low-pitch
// 4. use step #3 to create structure: A=3+1||6+2, B=3+1||6+2
//    setp #3 must be used 4 times: 2 times for A (3+1), 2 times for B (3+1) so we
//    end up with 4 different sets of chunks
// 5. create sequence [A,A,B]

// might need this to read sound files from remote server
// file_input.onchange = function() {
// if (!this.files.length) return;
//
// var reader = new FileReader();
//
// reader.onload = function() {
// const data = d3.csvParseRows(reader.result, d => ({
// "v": null,
// "i": [parseFloat(d[0]), parseFloat(d[1])],
// }));
//
// trigger({ "points": async _ => data });
// };
//
// reader.readAsText(this.files[0]);
// };

// const player = new Tone.Player("asound.wav").toDestination();
// const player = null;

// random seeds
let s1 = 0;
let s2 = 0;
let s3 = 0;
// chopping the sample
let startpoints = [];
// beat stretch proportional to sample duration
let rate = 1;
// pitch transposition
let ratio = 1;
// high-low frequency separation
let cutoff = 1587.98; // midi note 91
// low freq sample
let lowSamp = null;
// high freq sample
let highSamp = null;
// different beat stretch for high and low-pitched samples
let lowBeatStretch = rate + ratio;
let highBeatStretch = lowBeatStretch * 2; // one octave higher
// HPF for the high-pitched sample
let hpf = cutoff;
// LPF for the low-pitched sample
// if there's a high-pitched sample playing, cutoff is the same as HPF
// if the low-pitched sample is soloing, rise the filter freq a bit
let lpfAdd = 0;

// player for starters samples
let starterPlayer = null;

// startpoints
let bass = null;
let alto = null;

//attach a click listener to a play button
document.querySelector('button#start')?.addEventListener('click', async () => {
    await Tone.start()
    console.log('audio is ready')
    start();
});

document.querySelector('button#stop')?.addEventListener('click', async () => {
    stop();
});

document.querySelector('input#slices')?.addEventListener('input', async (event) => {
    console.log("slices:", event.target.value);
    startpoints = chop(player.buffer.duration, parseInt(event.target.value));
    // sample();
});

document.querySelector('input#seeda')?.addEventListener('input', async (event) => {
    console.log("seed:", event.target.value);
    const generator = new Math.seedrandom(event.target.value);
    s1 = generator();
    // console.log("rand:", s1);
    player.loopStart = startpoints[Math.floor(startpoints.length * s1)];
    player.loopEnd = player.loopStart + (player.buffer.duration / startpoints.length);
    // player.loopEnd = 1;
    console.log("start:", player.loopStart);
    console.log("end:", player.loopEnd);
    // sample();
});

// grab sample filename from input field
const fileinput = document.querySelector('input#fileinput');
fileinput.addEventListener('change', async () => {
    if(fileinput.files.length > 0) {
        dabeat(fileinput.files[0]);
    };
});

function dabeat(file) {
    console.log("loading: ", file.name);
    // console.log("dabeat:", file);
    //////////////////////////////////////////////////// TODO: change to stream loader (not file path finder)
    ////////////////////////////////////////////////////        see top of file (fabian's code)
    starterPlayer = new Tone.Player("samples/starters/" + file.name, () => {
        let bassChunks = chop(starterPlayer.buffer.duration, 16); // 16 slices
        let xufle = choosen(bassChunks, 16);
        console.log("chunks:", bassChunks);
        // play(starterPlayer, bassChunks);
    }).toDestination();
}

// function blip() {
//     console.log("alo blip")

//     const synth = new Tone.Synth().toDestination();
//     synth.triggerAttackRelease("C4", "8n");
// }

// function loop() {
//     const osc = new Tone.Oscillator().toDestination();
//     Tone.Transport.scheduleRepeat((time) => {
//         osc.start(time).stop(time + 0.1);
//     }, "8n", 0, 4);

//     Tone.Transport.start();
// }

function start() {
    Tone.Transport.start();
    bass.start();
    // alto.start();
}

function stop() {
    Tone.Transport.stop();
    bass.stop();
    // alto.start();
}

// function sample(player) {
//     // const player = new Tone.Player("https://tonejs.github.io/audio/berklee/Analogsynth_octaves_highmid.mp3");
//     // player = new Tone.Player(audioBuffer).toDestination();
//     player.loop = false;
//     player.stop();

//     Tone.loaded().then(() => {
//         player.loop = true;
//         // player.loopStart = 0.0;
//         // player.loopEnd = 1.0;
//         player.start();
//         console.log("dur:", player.buffer);
//     });

//     console.log("sampling");
// }

/// \brief  play a sequence of a sample chunks
/// \param  player  Tone.Player     Sample to play
/// \param  seq     Array           List of start points
function play(player, seq) {
    console.log(player);
    console.log(seq);

    let seqindex = 0;
    const loop = new Tone.Loop((time) => {
        // console.log(time);
        console.log(seqindex, ":", seq[seqindex]);
        seqindex = (seqindex + 1) % seq.length;
        player.start(0, seq[seqindex]);
    }, "8n").start(0);

    Tone.Transport.start();
}

/// \brief  divide the DURATION of a sample in a number of SLICES and return an array of STARTPOINTS
function chop(duration, slices) {
    let dur = duration / slices;
    startpoints = [];
    for (let i=0; i < slices; i++) {
        startpoints.push(duration * i / slices);
    }
    return startpoints;
}

/// \brief  choose N the elements of a LIST prioritizing those that are closer to each other
function choosen( list, size ) {
    // const probabilites = [-2,-1,0,1,2];
    const probabilites = [-2, -1, 0, 1, 2];
    let result = new Array(size);
    let index = Math.floor(Math.random() * list.length);

    console.log(index);
    for (let i = 0; i < size; i++) {
        // console.log(index);
        result[i] = list[index];
        let rnd = probabilites[Math.floor(Math.random() * probabilites.length)];
        if( index >= list.length ) {
            rnd = -abs(rnd);
        } else if( index <= 0 ) {
            rnd = abs(rnd);
        }
        /////////////////////////////////////////////////////////////////// TODO: fix random (needs refresh to get a different value)
        console.log(index, ":", rnd);
        index = index + rnd;
        // console.log(i, ":", index, ":", result[i]);
    }
    console.log(result);
}

/// \brief  play a sequence of chunks of a sample
function pseq(list, repeats) {
    const seq = new Tone.Part((time, startpos) => {
        // get duration from number of chunks / sample duration
        player.start(startpos, dur);
    });
}
