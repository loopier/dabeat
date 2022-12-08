//--//--//--//--//--//--DRUM KIT//--//--//--//--//--//--

//Array de samples
let kicks = ["kick1", "kick2", "kick3", "kick4"];
let snares = ["snare1", "snare2", "snare3", "snare4"];
let hats = ["hat1", "hat2", "hat3", "hat4"];

//Elecció samples
let whichKick = kicks[Math.floor(Math.random() * kicks.length)];
let whichsnare = snares[Math.floor(Math.random() * kicks.length)];
let whichHat = hats[Math.floor(Math.random() * kicks.length)];

let kckpat = [1, 0, 1, 0, 1, 0, 1, 0]
let sdpat = [0, 1, 0, 1, 0, 1, 0, 1]
let hhpat = [1, 1, 1, 1, 1, 1, 1, 1]


//console.log("elkick:", whichKick)

//Funcions relacionades amb el lleuger desplaçament en el temps dels silencis entre els esdeveniments dels patterns al drumkit


let arrayDelaysKck = [];
let arrayDelaySnare = [];
let arrayDelayHat = [];
let arrayPreviKck = [0.93, 0.73, 0.74, 1.7, 0.83, 0.97, 0.5, 1.6]; //Suma 8. Son els delays predefinits pel Pau
let arrayPreviSnare = [1.02, 2, 0.85, 1.15, 2, 0.85, 0.13];
let arrayPreviHat = [0.52, 0.48, 0.52, 0.48]

let seed1 = 2; // seed és una variable que hem definit previament. Poso 2 per posar algun valor
let ck = seed1 * 4;
let seed2 = 3;
let cs = seed2 * 4;
let cx = seed1 * 6
let factorRandomKick = getRandomArbitrary(-0.01, 0.01) * ck;
let factorRandomSnare = getRandomArbitrary(-0.02, 0.02) * cs;
let factorRandomHat = getRandomArbitrary(0, 0.03) * cx;

//Funció per determinar valors dels silencis de qualsevol array. Reb un array i el factor de randomització i retorna un array nou

function valorsSleep(array, factor) {
    nouArray = array.map(function (num, i) {
        if (i % 2 === 0) { num = num + factor } else { num = num - factor }
        return num
    })
    return nouArray;
}

// arrayDelaysKck = valorsSleep(arrayPreviKck, factorRandomKick);
// console.log(arrayDelaysKck);
// arrayDelaysHats = valorsSleep(arrayPreviHat, factorRandomHat);


//Funció per obtenir valors random entre dues xifres.
function getRandomArbitrary(min, max) {
    return Math.random() * (max - min) + min;
}

//Test valors array sumen 8. Compte, fan 7.9999999999
let total = arrayDelaysKck.reduce((a, b) => a + b, 0);

console.log(total);