const sampler = new Tone.Sampler({
    urls: {
        A1: "abfilla-kick.wav",
    },
    baseUrl: "samples/ab-kicks/",
}).toDestination();


const bufa = new Tone.ToneAudioBuffer("samples/starters/honey-120bpm-with-shinobic.wav", () => {
    console.log("loaded");
});
const starter = new Tone.Player(bufa, () => {
    console.log(`buf: ${bufa.duration}`);
    starter.loop = true;
}).toDestination();

const kickdelays = [0.93, 0.73, 0.74, 1.7, 0.83, 0.97, 0.5, 1.6];
let kickindex = 0;
const synth = new Tone.Synth().toDestination();

function loop () {
    const loop = new Tone.Loop((time) => {
        // triggered every eighth note.
        // console.log(time);

        // synth.triggerAttackRelease("C2", "16n", time, 0.2);
        // synth.triggerAttackRelease("G2", "16n", time + 0.2, 0.2);
        // sampler.triggerAttackRelease("C1", "8n", time, 0.2);
        sampler.triggerAttackRelease("C1", "8n", time + (1-kickdelays[kickindex]) / 10, 0.2);
        kickindex = (kickindex + 1) % kickdelays.length;
        starter.start(time + 0.00, 1.25, "16n");
        starter.start(time + 0.25, 0, "16n");

        // console.log(`${kickindex}:${kickdelays[kickindex]}`);
    }, "4n").start();

    Tone.Transport.start();
}

