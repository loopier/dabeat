
// import('audio-player')

function addSeed() {

    seed = document.getElementById('seed1').value;
    cb = document.getElementById('cb').value;
    cs = document.getElementById('cs').value;
    console.log('Els seed son' + ', ' + seed + ', ' + cb + ', ' + cs);
}

//attach a click listener to a play button
document.querySelector('button#start').addEventListener('click', async () => {
    await Tone.start();
    addSeed();
    console.log('audio is ready');
    // viewArrayInput()
    play();

});

document.querySelector('button#stop').addEventListener('click', () => {
    stop();
});


