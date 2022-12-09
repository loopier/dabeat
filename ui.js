//attach a click listener to a play button
document.querySelector('button#start')?.addEventListener('click', async () => {
    await Tone.start();
    console.log('audio is ready');
    play();
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
