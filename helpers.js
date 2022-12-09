////////////////////////////////////////////////////////////////////////////////
// helpers
////////////////////////////////////////////////////////////////////////////////

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

/// \brief  Returns a random element from the list.
function choose(list) {
    return list[Math.floor(Math.random() * list.length)];
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
