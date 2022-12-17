////////////////////////////////////////////////////////////////////////////////
// helpers
////////////////////////////////////////////////////////////////////////////////

/// \brief  create a score of SIZE * 3 items of PARTA, and SIZE items of PARTB
function createScore( size, partA, partB ) {
    let score = [];
    for (let i = 0; i < size * 3; i++) {
        console.debug("partA #", i, ": ", partA);
        score.push(partA);
    }
    for (let i = 0; i < size; i++) {
        console.debug("partB #", i, ": ", partB);
        score.push(partB);
    }
    console.debug("created score of %d bars", score.length);
    return score.flat();
}

function linlin(value, inmin, inmax, outmin, outmax) {
    return outmin + (outmax - outmin) * (value - inmin) / (inmax - inmin);
}

function linexp(value, inmin, inmax, outmin, outmax) {
    return Math.pow(outmax / outmin, (value - inmin) / (inmax - inmin)) * outmin;
}

/// \brief  Returns a random element from the list.
function choose(list) {
    return list[Math.floor(Math.random() * list.length)];
}

/// \brief  Returns an array of LENGTH elements from LIST
function choosen(list, length) {
    let choice = [];
    for( let i = 0; i < length; i++ ) {
        choice.push(choose(list));
    }

    console.debug("choosen: %o", choice);
    return choice;
}

/// \brief  returns a random number based on seed
/// wrote it to simplify syntax
function seedrand(seed) {
    const generator = new Math.seedrandom(seed);
    let rand = generator();
    console.debug(`random -- seed:${seed} rand:${rand}`);
    return rand;
}

/// \brief  scales sample dur to match bpm (assuming it is a
///         multiple of 4 bars)
function sampleStretchRatio( inSampleDur, inBpm ) {
    let sampleBeats = inSampleDur / 60 * inBpm;
    let sampleBars = sampleBeats / 4;
    let sampleBarsRounded = Math.round(sampleBars);
    let ratio = 1 / (sampleBars / Math.max(1, sampleBarsRounded));
    console.debug("sample dur", inSampleDur);
    console.debug("sample beats", sampleBeats);
    console.debug("sample bars", sampleBars);
    console.debug("sample bars rounded", sampleBarsRounded);
    console.debug("sample stretch ratio", ratio);
    return ratio;
}

function sampleStretchRatioAccordingToPau( inSampleDur, inBpm ) {
    return inSampleDur * (bpm/(bpm + 60))
}

/// \brief  divide the DURATION of a sample in a number of SLICES and return an array of STARTPOINTS
function chop(duration, slices) {
    console.debug("chop %d seconds in %d slices", duration, slices);
    let dur = duration / slices;
    startpoints = [];
    for (let i=0; i < slices; i++) {
        startpoints.push(duration * i / slices);
    }
    return startpoints;
}

function printPlayer( config ) {
    console.info("%s filename: ", config.name, config.filename);
    console.info("%s rate:", config.name, config.player.playbackRate);
    console.info("%s volume:", config.name, config.volume);
    console.info("%s delaytime:", config.name, config.delaytime);
    console.info("%s delayfb:", config.name, config.delayfb);
    console.info("%s cutoff:", config.name, config.cutoff);
    console.info("%s filter:", config.name, config.filter);
    console.info("%s pan:", config.name, config.pan);
    console.info("%s dur:", config.name, config.player.buffer.duration);
    console.info("-----");

}
