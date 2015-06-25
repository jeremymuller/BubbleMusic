/**** GLOBALS ****/
var FRAMES_P_SEC = 60;
var PADDING = 25;
var START_DIRECTION = 'RANDOM';
var CIRCLE_EDGE = '0.75';
var CIRCLE_FILL = '0.5';
var SPEED = 0.1;
var OCTAVE = 1; // 0 is original, 1 is 8va

var accelRate = 0.99;
var circles = [];
var numberOfCircles = 8;
var objectCollision = false;
var velocities = [0, 0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4];

// modes
var ionian = [60, 62, 64, 65, 67, 69, 71, 72];
var dorian = [60, 62, 63, 65, 67, 69, 70, 72];
var MODE = ionian;

var chord = [48, 50, 52, 53, 55, 57, 59, 60, 62, 64, 65, 67];
var recentPitches = [MODE[0], MODE[2], MODE[4]]; // TODO

var canvasMelody = new Canvas("melody");
var canvasHarmony = new Canvas("harmony");

/*********** Circle Class ***********/
function Circle(strokeStyle, fillStyle, size, canvas, type, initX) {

  this.canvas = canvas;

  // var x = Math.floor(Math.random() * canvas.width % canvas.width);
  // var y = Math.floor(Math.random() * this.canvas.height);
  var y = this.canvas.height/2;

  if (type == "melody") {
    console.log("X pos: " + initX);
  }
  if (initX <= PADDING) {
    this.posX = initX + PADDING;
  } else if ((canvas.width - initX) <= PADDING) {
    this.posX = initX - PADDING;
  } else {
    this.posX = initX;
  }

  if (y <= PADDING) {
    this.posY = y + PADDING;
  } else if ((canvas.height - y) <= PADDING) {
    this.posY = y - PADDING;
  } else {
    this.posY = y;
  }

  if (type == "melody") {
    this.pitch = (size+50)+(OCTAVE*12);
  } else if (type == "harmony") {
    this.pitch = (size+50)+(-12) + "h"; // plays multiple pitches
  } else if (type == "rhythm") {
    this.pitch = size;
  } else {
    console.log("Error: Illegal class type!");
  }

  this.type = type;
  this.strokeStyle = strokeStyle;
  this.fillStyle = fillStyle;
  this.size = 20;
  this.direction = {x:0, y:0};
  this.velocity = 1;
  this.drawCircle = function(ctx) {
    ctx.beginPath();
    ctx.arc(this.posX, this.posY, this.size, 0, 2*Math.PI);
    ctx.strokeStyle = this.strokeStyle;
    ctx.fillStyle = this.fillStyle;
    ctx.lineWidth = 2;
    ctx.fill();
    ctx.stroke();
  };
}

Circle.prototype.pos = function() {
  return [this.posX, this.posY];
};

Circle.prototype.move = function() {
  // detect edges
  if ((this.posX-this.size <= 0) || (this.posX+this.size >= this.canvas.width)) {
    this.direction.x *= -1;
    this.blink();
    if (this.type == "harmony") {
      this.playChord();
    } else {
      this.playSound();
    }
  }
  if ((this.posY-this.size <= 0) || (this.posY+this.size >= this.canvas.height)) {
    this.direction.y *= -1;
    this.blink();
    if (this.type == "harmony") {
      this.playChord();
    } else {
      this.playSound();
    }
  }
  this.posX += this.direction.x;
  this.posY += this.direction.y;
};

Circle.prototype.blink = function() {
  // blinks color change
  var color = colors();
  this.strokeStyle = color.stroke;
  this.fillStyle = color.fill;
  this.drawCircle(this.canvas.ctx);
};

Circle.prototype.playSound = function() {
  var sound = new Audio(this.pitch + ".mp3");
  sound.play();
};

Circle.prototype.playChord = function() {
  for (var i = 0; i < 4; i++) {
    var index = Math.floor(Math.random()*chord.length);
    var sound = new Audio(chord[index] + "h.mp3");
    sound.play();
  }
};

/*********** Circle Class END***********/

/*********** Canvas Class ***********/
function Canvas(id) {
  this.element = document.getElementById(id);
  this.ctx = this.element.getContext("2d");
  this.posX = this.element.offsetLeft;
  this.posY = this.element.offsetTop;
  this.width = this.element.width;
  this.height = this.element.height;
}
/*********** Canvas Class END***********/

// pitch circles
var grid = createCols(canvasMelody.width);
for (var i = 0; i < numberOfCircles; i++) {
  var size = MODE[i]-50;
  // var circle = new Circle('rgba(0, 255, 128, 0.75)', 'rgba(0, 255, 128, 0.5)', size);
  var c = colors();
  var circle = new Circle(c.stroke, c.fill, size, canvasMelody, "melody", grid[i]);
  circles[i] = circle;
}

var col = colors();
var harmony = new Circle(col.stroke, col.fill, 20, canvasHarmony, "harmony", canvasHarmony.width/2);

var col1 = colors();
var col2 = colors();

for (var i in circles) {
  var j = parseInt(i) + 1;
  // console.log("circle" + j + ": " + circles[i].pitch);
}

document.body.onload = function() { draw();};

// move button
document.getElementById("move").onclick = function() {
    var inputElement = document.getElementsByClassName("checkbox");

    if (inputElement[0].checked) {
        for (var i in circles) {
        // circles[i].direction.x = Math.random() * SPEED + 1;
        // circles[i].direction.y = Math.random() * (SPEED + 1); // velocity of each circles
        var x = Math.floor(Math.random() * velocities.length);
        var y = Math.floor(Math.random() * velocities.length);
        circles[i].direction.x = velocities[x]
        circles[i].direction.y = velocities[y];
        //circles[i].direction.y = velocities[i] % velocities.length;
        }
    } else {
        for (var i in circles) {
        // circles[i].direction.x = Math.random() * SPEED + 1;
        // circles[i].direction.y = Math.random() * (SPEED + 1); // velocity of each circles
        var y = Math.floor(Math.random() * velocities.length);
        circles[i].direction.y = velocities[y];
        //circles[i].direction.y = velocities[i] % velocities.length;
        }
    }

    var x = (Math.random() * 2 - 1) * 0.25;
    var y = (Math.random() * 2 - 1) * 0.25;
    harmony.direction.x = x;
    harmony.direction.y = y;

    /*
    circles[0].direction.y = velocities[2];
    circles[1].direction.y = velocities[1];
    circles[2].direction.y = velocities[0] * SPEED;
    circles[3].direction.y = velocities[5];
    circles[4].direction.y = velocities[0] * SPEED;
    circles[5].direction.y = velocities[0];
    circles[6].direction.y = velocities[3];
    circles[7].direction.y = velocities[8];
    */

    //circle1.direction[0] = Math.random() * 2 + 1;
    //circle1.direction[1] = Math.random() * 2 + 1;
    //circle2.direction[0] = Math.random() * 2 + 1;
    //circle2.direction[1] = Math.random() * 2 + 1;
};

document.getElementById("reset").onclick = function() {
    for (var i in circles) {
        var y = canvasMelody.height/2;
        circles[i].posX = grid[i];
        circles[i].posY = y;
    }
};

document.getElementById("stop").onclick = function() {
    for (var i in circles) {
        circles[i].direction.x = velocities[0];
        circles[i].direction.y = velocities[0];
    }
    harmony.direction.x = 0;
    harmony.direction.y = 0;
};


function detectCollision() {
  // get all objects' positions and test if any are colliding
  if (!objectCollision)
    return;

  var length = circles.length;
  for (var i = 0; i < length; i++) {
    var c1 = circles[i];
    if (i+1 != length) {
      for (var j = i+1; j < length; j++) {
        // detect edges
        var c2 = circles[j];
        var dx = (c1.posX + c1.size) - (c2.posX + c2.size);
        var dy = (c1.posY + c1.size) - (c2.posY + c2.size);
        var distance = Math.sqrt(dx*dx + dy*dy);
        if (distance < (c1.size+c2.size)) {
          c1.blink();
          c2.blink();
          c1.playSound();
          c2.playSound();
          var c1newX = (c1.direction.x * (c1.size-c2.size) + (2*c2.size*c2.direction.x)) / (c1.size + c2.size);
          var c1newY = (c1.direction.y * (c1.size-c2.size) + (2*c2.size*c2.direction.y)) / (c1.size + c2.size);
          var c2newX = (c2.direction.x * (c2.size-c1.size) + (2*c1.size*c1.direction.x)) / (c2.size + c1.size);
          var c2newY = (c2.direction.y * (c2.size-c1.size) + (2*c1.size*c1.direction.y)) / (c2.size + c1.size);
          c1.direction.x = c1newX;
          c1.direction.y = c1newY;
          c2.direction.x = c2newX;
          c2.direction.y = c2newY;
        }
      }
    }
  }
}

function colors() {
  // 'rgba(255, 255, 255, 1)'
  var r = Math.floor(Math.random() * 255);
  var g = Math.floor(Math.random() * 255);
  var b = Math.floor(Math.random() * 255);
  var alpha = {stroke:'0.8', fill:'0.5'};
  var stroke = "rgba(" + r.toString() + "," + g.toString() + "," + b.toString() + "," + alpha.stroke + ")";
  var fill = "rgba(" + r.toString() + "," + g.toString() + "," + b.toString() + "," + alpha.fill + ")";
  return {stroke:stroke, fill:fill};
}

// Creates columns for the melody bubbles to live in
function createCols(length) {
  var columnWidth = length / numberOfCircles;
  var centerCol = 0;
  var grid = [];
  for (var i = 0; i < numberOfCircles; i++) {
    centerCol = ((i+1) * columnWidth) - (columnWidth/2);
    grid[i] = centerCol;
  }
  return grid;
}

/** OLD?!?!?! **/
function mouseLoc(event) {
  var pos = {x:0, y:0};
  pos.x = event.clientX-canvas.posX;
  pos.y = event.clientY-canvas.posY;
  return pos;
}

function redraw() {
  canvasMelody.ctx.clearRect(0, 0, canvasMelody.width, canvasMelody.height);
  canvasHarmony.ctx.clearRect(0, 0, canvasMelody.width, canvasMelody.height);
}

// animation handling
function draw() {
  setTimeout(function() {
    requestAnimationFrame(draw);

    // drawing code goes here
    redraw();

    harmony.drawCircle(canvasHarmony.ctx);
    harmony.move();
    for (var i in circles) {
      circles[i].drawCircle(canvasMelody.ctx);
      circles[i].move();
    }

    detectCollision();
  }, 1000 / FRAMES_P_SEC);
}

// http://paulirish.com/2011/requestanimationframe-for-smart-animating/
// http://my.opera.com/emoller/blog/2011/12/20/requestanimationframe-for-smart-er-animating
// requestAnimationFrame polyfill by Erik Möller
// fixes from Paul Irish and Tino Zijdel
(function() {
  var lastTime = 0;
  var vendors = ['ms', 'moz', 'webkit', 'o'];
  for(var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
    window.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame'];
    window.cancelAnimationFrame = window[vendors[x]+'CancelAnimationFrame']
    || window[vendors[x]+'CancelRequestAnimationFrame'];
  }

  if (!window.requestAnimationFrame)
  window.requestAnimationFrame = function(callback, element) {
    var currTime = new Date().getTime();
    var timeToCall = Math.max(0, 16 - (currTime - lastTime));
    var id = window.setTimeout(function() { callback(currTime + timeToCall); },
    timeToCall);
    lastTime = currTime + timeToCall;
    return id;
  };

  if (!window.cancelAnimationFrame)
  window.cancelAnimationFrame = function(id) {
    clearTimeout(id);
  };
}());
