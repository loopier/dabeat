////////////////////////////////////////////////////////////////////////////////
// helpers
////////////////////////////////////////////////////////////////////////////////

/// \brief  create a score with an AAAB structure with PARTA and PARTB
function createScore( partA, partB ) {
    let score = [];
    for (let i = 0; i < 3; i++) {
        // console.debug("partA #", i, ": ", partA);
        score.push(partA);
    }
    // console.debug("partB #", i, ": ", partB);
    score.push(partB);
    // console.debug("created score of %d bars", score.length);
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

/// \brief  Returns a seeded random element from the list.
function seedChoose(seed, list){
    return list[Math.floor(seedrand(seed) * list.length)];
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

/// \brief  Returns an array of LENGTH elements, randomly chosen from LIST. Distance between
///         chosen indices is determined by DELTA.
/// \description
///     This works like choosen(...) but instead of choosing elements at random it
///     chooses them taking into account the last chosen item. Every new item is
///     at a distance from the previous one in either direction. The distance is
///     a random value between 1 and DELTA. The higher the DELTA, the further appart
///     will be the next element.
///     For example, in a list [0,1,2,3,4,5,6,7] with DELTA 0: if the first element is
///     3, the next one will be 2 or 4. If DELTA is 2, the next element after 3 would be
///     either 1,2,4 or 5.
function perlinChoosen(list, length, delta) {
    let choice = [];
    const rnd = Math.abs(delta) + 1;
    let index = Math.floor(linlin(Math.random(), 0,1, 0, list.length-1));
    for( let i = 0; i < length; i++ ) {
        choice.push(list[index]);
        const rnd = Math.floor(linlin(Math.random(), 0,1, 0,delta)) + 1; ///< minimum is 1
        const sign = choose([-1,1]);
        index = Math.abs(((sign * rnd) + index) % list.length);
        console.log("rnd", rnd);
    }
    return choice;
}

/// \brief  Returns an array of LENGTH with element from the list randomly chosen with a SEED
function seedChoosen(seed, list, length){
    let choice = [];
    for( let i = 0; i < length; i++ ) {
        choice.push(seedChoose(seed, list));
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
