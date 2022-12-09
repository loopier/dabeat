// Meta code
// 1. load a sample
// 2. chop twice in 8 or 16 chunks
// 3. choose chunks favouring those that are closer to each other, determined with
//  'seedrand1': one for high-pitch, one for low-pitch
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

// enums
const ScoreStructure = {
    AAAB: 1,
    AAAAAABB: 2,
};

//
let samplesPath = "http://localhost:8000/samples/starters-renamed/";

// random seeds
let seedrand1 = 0;
let seedrand2 = 0;
let seedrand3 = 0;

// tempo
let bpm = linlin(Math.random(), 0, 1, 86,98);
// chopping the sample
let startpoints = [];
// number of slices per part A and B
const numSlices = 8;
// define structure to be used
const scoreStructure = ScoreStructure.AAAB;
// const scoreStructure = ScoreStructure.AAAAAABB;
// beat stretch proportional to sample duration
let rate = 1;
// pitch transposition
let ratio = 1;
// high-low frequency separation
let cutoff = 1587.98; // midi note 91
// low freq sample
let lowSample = null;
// high freq sample
let highSample = null;
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
let bassPlayer = null;
let leadPlayer = null;

// sampler attributes
const lead = {};
lead.isPlaying = false,
lead.rate = 2.0;
lead.amp = 0.7 / 2;
lead.delay = Math.random(0.02, 0.07);
lead.pan = [-0.5, 0.5][Math.floor(Math.random() * 2)]; // 2 is array length
lead.sliceDur = Math.random(0.6,0.8);
lead.cutoff = linexp(Math.random(80,90), 0, 140, 20, 20000);

const bass = {};
bass.rate = 1.0;
bass.amp = 1.2 / 2;
bass.delay = Math.random(0.06, 0.12);
bass.pan = Math.random(-0.09, 0);
bass.sliceDur = Math.random(0.6,0.8);
// cutoff Hz for bass when there's NO LEAD
bass.soloCutoff = linexp(100, 0, 140, 20, 20000);
// cutoff Hz for bass when there's lead
bass.cutoff = linexp(80, 0, 140, 20, 20000); // to Hz

//attach a click listener to a play button
document.querySelector('button#start')?.addEventListener('click', async () => {
    await Tone.start();
    console.log('audio is ready');
    start();
});

document.querySelector('button#stop')?.addEventListener('click',  () => {
    stop();
});

document.querySelector('input#slices')?.addEventListener('input',  (event) => {
    console.log("slices:", event.target.value);
    startpoints = chop(player.buffer.duration, parseInt(event.target.value));
    // sample();
});

document.querySelector('input#seed1')?.addEventListener('input',  (event) => {
    let value = event.target.value;
    seedrand1 = seedrand(value);
});

document.querySelector('input#seed2')?.addEventListener('input',  (event) => {
    let value = event.target.value;
    seedrands = seedrand(value);
});

document.querySelector('input#seed3')?.addEventListener('input',  (event) => {
    let value = event.target.value;
    seedrand3 = seedrand(value);
});

document.querySelector('input#leadon')?.addEventListener('input',  (event) => {
    let value = event.target.checked;
    lead.isPlaying = value;
});

// grab sample filename from input field
const fileinput = document.querySelector('input#fileinput');
fileinput.addEventListener('change', () => {
    if(fileinput.files.length > 0) {
        dabeat(fileinput.files[0]);
    };
});

function dabeat(file) {
    console.log("loading: ", file.name);
    // console.log("dabeat:", file);
    //////////////////////////////////////////////////// TODO: change to stream loader (not file path finder)
    ////////////////////////////////////////////////////        see top of file (fabian's code)
    // let audioFile = "http://localhost:8000/asound.wav";
    // let audioFile = "http://localhost:8000/" + file.name;
    let audioFile = samplesPath + file.name;
    ////////////////// WARNING: the 'onload' callback function IS SHIT!!! It hides errors outputting nothing.
    //////////////////          if you find awkward and random behaviour, chances are that there's an error
    //////////////////          inside this function. Try it outside to solve it.
    //////////////////          Code needs to be inside because it uses the buffer duration, which is only
    //////////////////          available 'on load'...
    //////////////////          I haven't found a way to make it work elsewhere.

    Tone.Transport.bpm.value = bpm;
    console.log("bpm:", Tone.Transport.bpm.value);

    ///////////////////////////////////////////////////////// TODO: move to abstraction (same for bass and lead)
    bassPlayer = new Tone.Player(audioFile, () => {
        let sampleDur = bassPlayer.buffer.duration;
        let chunks = chop(sampleDur, 16); // 16 slices
        let bassA = choosen(chunks, numSlices);
        let bassB = choosen(chunks, numSlices);
        let bassScore = createScore(scoreStructure, bassA, bassB);

        let ratio = sampleStretchRatio( sampleDur, bpm );
        let index = [0,1][lead.isPlaying ? 0 : 1];
        bass.amp = [bass.amp, linlin(bass.amp + lead.amp, 0,2, 0,1)][index];
        bass.rate = bass.rate * ratio;
        bass.cutoff = [bass.cutoff, bass.soloCutoff][index];

        console.log("bass new rate: ", bass.rate);
        console.log("chunks:", chunks);
        console.log("bassA:", bassA);
        console.log("bassB:", bassB);
        console.log("score structure:", scoreStructure);
        console.log("bass score:", bassScore);
        play(bassPlayer, bassScore, bass);
    })
        .connect((new Tone.Delay(bass.delay)).toDestination())
        .connect((new Tone.Panner(bass.pan)).toDestination())
        .connect((new Tone.OnePoleFilter(bass.cutoff, "lowpass")).toDestination())
        .toDestination();

    if (lead.isPlaying == false) {
        return;
    }

    leadPlayer = new Tone.Player(audioFile, () => {
        let sampleDur = leadPlayer.buffer.duration;
        let chunks = chop(sampleDur, 16); // 16 slices
        let leadA = choosen(chunks, numSlices);
        let leadB = choosen(chunks, numSlices);
        let leadScore = createScore(scoreStructure, leadA, leadB);

        let ratio = sampleStretchRatio( sampleDur, bpm );
        lead.rate = lead.rate * ratio;

        console.log("lead new rate: ", lead.rate);
        console.log("leadA:", leadA);
        console.log("leadB:", leadB);
        console.log("lead score:", leadScore);
        play(leadPlayer, leadScore, lead);
    })
        .connect((new Tone.Delay(lead.delay)).toDestination())
        .connect((new Tone.Panner(lead.pan)).toDestination())
        .connect((new Tone.OnePoleFilter(lead.cutoff, "highpass")).toDestination())
        .toDestination();

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
    bassPlayer.start();
    leadPlayer.start();
    // alto.start();
}

function stop() {
    Tone.Transport.stop();
    bassPlayer.stop();
    leadPlayer.stop();
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
/// \param  obj     Object          Sampler attributes
function play(player, seq, obj) {
    console.log(player);
    console.log("sequence: ", seq);

    let seqindex = 0;
    const loop = new Tone.Loop((time) => {
        seqindex = (seqindex + 1) % seq.length;
        let start = seq[seqindex];
        player.set({
            playbackRate: obj.rate,
            loopEnd: obj.sliceDur,
        }).start(
            time,
            start,
            // obj.sliceDur,
        );
        // console.log("time:", time);
        // console.log(seqindex, ":", start);
        // console.log("obj:", obj);
        // console.log("delay: ", obj.delay);
        // console.log("rate:", obj.sliceDur);
        // console.log("dur:", obj.sliceDur);
    }, "8n").start();

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

/// \brief  choose SIZE elements of a LIST prioritizing those that are closer to each other
function choosen( list, size ) {
    const probabilites = [-2, -1, 0, 1, 2];
    let result = new Array(size);
    let index = Math.floor(Math.random() * list.length);

    // console.log("index: ", index);
    for (let i = 0; i < size; i++) {
        // console.log(index);
        result[i] = list[index];
        let rnd = probabilites[Math.floor(Math.random() * probabilites.length)];
        if( index >= list.length ) {
            rnd = -Math.abs(rnd);
        } else if( index <= 0 ) {
            rnd = Math.abs(rnd);
        }
        /////////////////////////////////////////////////////////////////// TODO: fix random (needs refresh to get a different value)
        // console.log(index, ":", rnd);
        index = index + rnd;
        // console.log(i, ":", index, ":", result[i]);
    }
    // console.log(result);
    return result
}

/// \brief  play a sequence of chunks of a sample
function pseq(list, repeats) {
    const seq = new Tone.Part((time, startpos) => {
        // get duration from number of chunks / sample duration
        player.start(startpos, dur);
    });
}

/// \brief  create a score of SIZE * 3 items of PARTA, and SIZE items of PARTB
function createScore( size, partA, partB ) {
    let score = [];
    for (let i = 0; i < size * 3; i++) {
        console.log("partA #", i, ": ", partA);
        score.push(partA);
    }
    for (let i = 0; i < size; i++) {
        score.push(partB);
    }
    return score.flat();
}

function linlin(value, inmin, inmax, outmin, outmax) {
    return outmin + (outmax - outmin) * (value - inmin) / (inmax - inmin);
}

function linexp(value, inmin, inmax, outmin, outmax) {
    return Math.pow(outmax / outmin, (value - inmin) / (inmax - inmin)) * outmin;
}

/// \brief  returns a random number based on seed
/// wrote it to simplify syntax
function seedrand(seed) {
    const generator = new Math.seedrandom(seed);
    let rand = generator();
    console.log(`seed:${seed} rand:${rand}`);
    return rand;
}

/// \brief  scales sample dur to match bpm (assuming it is a
///         multiple of 4 bars)
function sampleStretchRatio( inSampleDur, inBpm ) {
    let sampleBeats = inSampleDur / 60 * inBpm;
    let sampleBars = sampleBeats / 4;
    let sampleBarsRounded = Math.round(sampleBars);
    let ratio = 1 / (sampleBars / Math.max(1, sampleBarsRounded));
    console.log(`sample dur: ${inSampleDur}`);
    console.log(`sample beats: ${sampleBeats}`);
    console.log(`sample bars: ${sampleBars}`);
    console.log(`sample bars rounded: ${sampleBarsRounded}`);
    console.log(`sample stretch ratio: ${ratio}`);
    return ratio;
}
