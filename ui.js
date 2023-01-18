//  //attach a click listener to a play button
// document.querySelector('button#start')?.addEventListener('click', async () => {
//     await Tone.start();
//     console.log('audio is ready');
//     play();
// });

// document.querySelector('button#stop')?.addEventListener('click',  () => {
//     stop();
// });

// document.querySelector('input#slices')?.addEventListener('input',  (event) => {
//     console.log("slices:", event.target.value);
//     startpoints = chop(player.buffer.duration, parseInt(event.target.value));
//     // sample();
// });

// document.querySelector('input#seed1')?.addEventListener('input',  (event) => {
//     let value = event.target.value;
//     seedrand1 = seedrand(value);
// });

// document.querySelector('input#seed2')?.addEventListener('input',  (event) => {
//     let value = event.target.value;
//     seedrands = seedrand(value);
// });

// document.querySelector('input#seed3')?.addEventListener('input',  (event) => {
//     let value = event.target.value;
//     seedrand3 = seedrand(value);
// });

// document.querySelector('input#leadon')?.addEventListener('input',  (event) => {
//     let value = event.target.checked;
//     lead.isPlaying = value;
// });

// // grab sample filename from input field
// const fileinput = document.querySelector('input#fileinput');
// fileinput.addEventListener('change', () => {
//     if(fileinput.files.length > 0) {
//         dabeat(fileinput.files[0]);
//     };
// });

//--//--//--//-//--//--//--//-//--//--//--//-//--//--//--//-//--//--//--//-//--//--//--//-


var knob1, knob2, knob3, startButton, stopButton;
var valuesSeeds = [0, 0, 0];
var pointerCursor = false; // referenced in knobMaker

function setup() {
  createCanvas(600, 600);
  background(50);

  //--Seed buttons--//
  knob1 = new MakeKnob("images/knob4grey.png", 100, 150, 150, 0, 1000, 0, 0, "SEED");
  knob2 = new MakeKnob("images/knob4grey.png", 100, 300, 150, 0, 5, 0, 0, "CS");
  knob3 = new MakeKnob("images/knob4grey.png", 100, 450, 150, 0, 5, 0, 0, "CB");

  knob1.textColor = "green";
  knob1.textPt = 30;
  knob2.textColor = "green";
  knob2.textPt = 30;
  knob3.textColor = "green";
  knob3.textPt = 30;
  knob1.moveRange = 1000;
  knob2.moveRange = 5;
  knob3.moveRange = 5;

  //--Start Stop Buttons--//
  startButton = new Clickable(150, 400);

  startButton.cornerRadius = 0;
  startButton.textScaled = true;
  startButton.text = "START";

  startButton.onOutside = function () {
    this.color = "#FFFFFF";
    this.text = "START";
    this.textColor = "#000000";
  }
  startButton.onHover = function () {
    this.color = "#AAAAFF";
    this.textColor = "#FFFFFF";
    this.text = "Comencem?";
  }

  startButton.onRelease = function () {
    //Funció que agafa els 3 valors del seed i els passa a daBeat fent que s'engegui. Només funciona quan 
    //ha estat apretat el botó. Fora del botó, no va
      console.log(`Estas pitjant start. Els valors dels seeds son: ${valuesSeeds}`);
      Tone.start();
      console.log('audio is ready');
      play();
  }

  stopButton = new Clickable(350, 400);
  stopButton.text = "STOP";

  stopButton.onRelease = function () {
    //Funció que fa que daBeat.js s'aturi.
      stop();
    console.log("Has apretat Stop");
  }

}
// ----------------------------------------------
function draw() {
  background(50);
  pointerCursor = false;
  knob1.update();
  knob2.update();
  knob3.update();
  startButton.draw();
  stopButton.draw();

  value1 = knob1.knobValue;
  value1 = Math.trunc(value1);
  //console.log(value1);
  value2 = knob2.knobValue;
  value2 = Math.trunc(value2);
  //console.log(value2);
  value3 = knob3.knobValue;
  value3 = Math.trunc(value3);
  //console.log(value3)
}

// ----------------------------------------------

function mousePressed() {
  knob1.active();
  knob2.active();
  knob3.active();
}

//endinyar-ho en una altra func
function mouseReleased() {
  knob1.inactive();
  knob2.inactive();
  knob3.inactive();
  valuesSeeds.push(value1, value2, value3);
  valuesSeeds = valuesSeeds.slice(valuesSeeds.length - 3);
  console.log(`Seed values: ${valuesSeeds}`)
  //console.log(cl_mouseWasPressed, cl_clickables, cl_lastHovered)

}





