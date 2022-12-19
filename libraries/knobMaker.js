// Miles DeCoster - codeforartists.com
// MakeKnob function to create rotating knobs which return different number ranges
// Version 4.2.1 October 4, 2019

// 4.2.1
// Added displayValue update to update method
// 4.2
// Added textColor and textPt properties. (textPt is type size) defauts are 18 and black
// These properties are not initialized in the MakeButton function but may be set for 
// individual instances via instanceName.textColor and instanceName.textPt

// These are the 9 parameters that need to be passed to the MakeKnob function:

// imgSrc - Set the image source in the first parameter. example: "knob.png" or "images/knob.png"
// diameter - Set knob size. Just a number (but refers to pixels)
// locx, locy - Set the location on the canvas horizontal and vertical pixel coordinates.
// lowNum, hiNum - Set the range of values returned. Floating point numbers.
// defaultNum - Sets the default value of the knob. DO NOT set a frequency knob to 0. Amplitude can be 0.
// numPlaces - Refers to the displayed value below the knob. Sets the number of decimal places to display. 
//  - Does not affect the actual value returned.
// label - the text to display below the knob. example: "Frequency"

// NOTES:
// To retrieve the current value use instanceName.knobValue. This is how you access the returned value 
// and use it to actually do something.
// Example: myfreq = freqKnob.knobValue; osc.freq(myfreq);
// Each instance knob also needs to be attached to mouse actions with the active and inactive methods:
// example:
// function mousePressed() {
//    instancename.active();
// }
// function mouseReleased() {
//    instancename.inactive();
// }
function MakeKnob(imgSrc, diameter, locx, locy, lowNum, hiNum, defaultNum, numPlaces, label) {
  this.pos = createVector(0,0);
  this.pos.x = locx;
  this.pos.y = locy;
  this.lowNum = lowNum;
  this.hiNum = hiNum;
  this.rotateMe = map(defaultNum, lowNum, hiNum, 0, -280);
  this.currentRot = map(defaultNum, lowNum, hiNum, 0, -280);
  this.diameter = diameter;
  this.knobValue = defaultNum;
  this.displayValue=0;
  this.isClickedOn = false;
  this.mouseOver = false;
  this.myY=mouseY;
  this.label=label;
  this.numPlaces = numPlaces;
  // this.img = loadImage('knob.svg');
  this.img = loadImage(imgSrc);
  this.textColor = [0,0,0];
  this.textPt = 18;
  
  // the update function will be called in the main program draw function
  this.update = function() {
    push(); // store the coordinate matrix ------------------------------------
    
    // move the origin to the pivot point
    translate(this.pos.x, this.pos.y);

  	// rotate the grid around the pivot point by a
  	// number of degrees based on drag on button
    if (dist(this.pos.x, this.pos.y, mouseX, mouseY) < this.diameter/2) {
      this.mouseOver = true;
    } else {
      this.mouseOver = false;
    }
  	if (mouseIsPressed && this.isClickedOn) { 
      this.rotateMe=this.currentRot+map(mouseY, this.myY, 300, 0, 280);
  	  this.rotateMe=int(this.rotateMe);
  	  if (this.rotateMe <  -280) { this.rotateMe = -280; }
  	  if (this.rotateMe > 0) { this.rotateMe = 0; }
  	  rotate(radians(-this.rotateMe)); 	// change degrees to radians
  	} else {
  	  rotate(radians(-this.rotateMe));
  	}
  
    if (!mouseIsPressed ) {
      this.currentRot=this.rotateMe;
      this.isClickedOn = false;
    } 
    // now we actually draw the knob to the screen ----------------------------
    imageMode(CENTER);
    image(this.img,0,0,this.diameter,this.diameter);
  	pop(); // restore coordinate matrix
  
  	rotate(0);
  
   // add the display value and label
  	textAlign(CENTER);
  	this.knobValue=map(this.rotateMe, -280, 0, hiNum, lowNum);
  	textSize(this.textPt);
  	fill(this.textColor);
    this.displayValue = nfc(this.knobValue, numPlaces); // added in version 4.2.1
  	text(this.displayValue, this.pos.x, this.pos.y+this.diameter/2+15+this.textPt); // display value to 2 decimal places
  	fill(this.textColor);
  	text(this.label, this.pos.x, this.pos.y+this.diameter/2+20+2.4*this.textPt);
    // set the cursor
    if (this.mouseOver || this.isClickedOn) { pointerCursor = true; }
  }; // end update method
  
  this.active = function() {
    if (this.mouseOver){
      this.isClickedOn = true; 
      this.myY=mouseY;  
      cursor('pointer');
    } else {
      this.isClickedOn = false;
    }
  }
  
  this.inactive = function() {
    this.currentRot=this.rotateMe;
    this.isClickedOn = false;
    cursor('default');
  }

} // end KnobMaker
