/*
*  Of Mice And Men by Max Greenwald
 */
 
 
 
 
var moveTime = 1400; //wait time of Evil Red Light.... Change to 1000 to be slower, 400 to be faster

var decreaseConstant = 200; //milliseconds faster that Evil becomes after a multiple of cheeseLevel is reached

var cheeseLevel = 10; //Number of cheeses needed before Evil becomes faster
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
var connect_to_this_ip = '169.254.187.95' //was 127.0.0.1
var incomingPort = 3333; //was 8000
var outgoingPort = 8001; //was 8001

//according to lights
var moveArray = [12,11,10,9,8,14,13,17,7,6,19,15,16,18,21,1,2,3,4,5];
//collect 20 frames first
var start = 0;
var eloc = 15;
var gloc = 10;
var moveTime = 800;
//0 = xleft, 1 = yleft 2 = xright, 3 = yright
var currentLoc = [3,8];
var oldLoc = [0,0];
var FRAME_RATE = 10;
var BLOCK_WIDTH = 100;
var BLOCK_HEIGHT = 100;
var shoes;
var rotationAngleLeft = 10;
var currentFrameLeft = 0;
var correctShoe = false;
var power = 0;
var frameMove = false;
var oldTime;
var currentAveLeft = [0,0];
var lives = [];
var frameAverageLeft =[[0,0],[0,0],[0,0],[0,0],[0,0]];
var cutoff = 2;
var numSteps = moveTime/(FRAME_RATE*10);
var distToMove = BLOCK_HEIGHT/FRAME_RATE;
var stepCounter = 0;
var oldAveLeft = [0,0];
var numHits = 0;
var walkCount = 0;
var blink = false;
var startEnding = false;
var start = false;
var cheeseX = 300;
var cheeseY = 200;
var cheesePlace = 13;
var lifeValue = 100;
var cheeseCount = 0;
var startFinalEnd;
var startFinalEnding = true;


function initOsc() {

}
function preload() {


}

function setup() {

  
  setupOsc(incomingPort, outgoingPort, connect_to_this_ip); // sets up OSC by opening a connection to node
  console.log('Sending OSC: '+'/eos/newcmd/Chan/1/Thru/30/At/'+str(power)+'/Enter');
  sendOsc("/eos/newcmd",["Chan 1 Thru 30 Hue %1 Saturation %2 Brightness %3 Enter",0,0,0]);
  sendOsc('/eos/newcmd/Chan/1/Thru/30/At/'+str(0)+'/Enter');

  
  angleMode(DEGREES);
  oldTime = millis();
  frameRate(FRAME_RATE)
  createCanvas(700, 400);
  noFill();
  background('white');
  stroke('blue');
  strokeWeight(5);
  
  imageMode(CENTER);

  
evil = new badGuy();
evil.updateLocation(eloc);


pacMan = new goodGuy();
pacMan.move();
lives.push(new loadImage("shoes.png"));
lives.push(new loadImage("shoes.png"));
lives.push(new loadImage("shoes.png"));
lives.push(new loadImage("shoes.png"));
lives.push(new loadImage("shoes.png"));

left = loadImage("leftShoe.png");
right = loadImage("rightShoe.png");
cheese = loadImage("cheese.png");

 gameNoises = loadSound('gamesnoises.wav');
 getCheese = loadSound('success.wav');
 ending = loadSound('half-loop.wav');
 finalEnding = loadSound('time-up.wav');
 evilAttacking = loadSound('shoot-laser.wav');
 evilMove = loadSound('pickup.wav');


}



function draw() {
  //draw grid
    if(numHits >= 100){
      fill("white");
      stroke("red");
      rect(90,90, 320, 200);
      textSize(60);
      noFill();
      if(!(frameCount % 3 == 0)) text("You Win! ", 135, 200);
      textSize(12);
     
      if(startEnding != true) 
      {
        ending.play();
        startFinalEnd = millis();
      }
      startEnding = true;
      if((millis() - startFinalEnd) > 6500 && startFinalEnding){
        finalEnding.play();
        startFinalEnding = false;
      }

      
      //light show
    sendOsc("/eos/newcmd/Chan/" +str(moveArray[cheesePlace]) +  "/Green/0/Enter");
    sendOsc('/eos/newcmd/Chan/1/Thru/30/Red/0/Enter');
    sendOsc('/eos/newcmd/Chan/1/Thru/30/Blue/Full/Enter');
    if(!(frameCount % 2 == 0)) sendOsc('/eos/newcmd/Chan/1/Thru/30/At/Full/Enter');
    else sendOsc('/eos/newcmd/Chan/1/Thru/30/At/0/Enter');


    }
    else{

  for(var i = 0; i <20; i++){
  block(i);
  }
  rect(500,0,200,400);


  
  
  addFrameLeft(currentLoc);

  //draw evil
  evil.updateLocation(evil.loc);

 currentAveLeft = twentyFrameAveLeft(currentLoc);

//if you're moving find the direction for the rotation angle
  if(abs(currentAveLeft[1] - oldAveLeft[1])+abs(currentAveLeft[0] - oldAveLeft[0]) > cutoff){
      rotationAngleLeft = atan2(currentAveLeft[1] - oldAveLeft[1], currentAveLeft[0] - oldAveLeft[0]);
      walkCount = walkCount + 1;
  }
  
  
  //draw Mouse
  push();

  //figure out directionality
  translate(currentAveLeft[0],currentAveLeft[1]);
  rotate(rotationAngleLeft + 90);
  translate(-currentAveLeft[0],-currentAveLeft[1]);
  oldAveLeft = currentAveLeft;
  pacMan.updateLocation(currentAveLeft);
  

  //If under attack then update lives, blink lights and blink shoe visual
  if(evil.x1 == pacMan.x1 && evil.y1 == pacMan.y1) {
    evilAttacking.play();
    
    
    //lives left
    numHits = numHits+1;
    lifeValue = lifeValue - 1;
    
    //change green light power to the strength of your lives remaining. Low life = not powerful green light
    sendOsc("/eos/newcmd/Chan/" +str(moveArray[cheesePlace]) +  "/Green/Full/Enter");
    sendOsc("/eos/newcmd/Chan/" +str(moveArray[cheesePlace]) +  "/Red/0/Enter");
    sendOsc('/eos/newcmd/Chan/' +str(moveArray[cheesePlace]) + '/At/'+str(lifeValue)+'/Enter');
    
    //changes lives visual
    if(numHits%5 == 0) handleLives();
    
    blink = true;
    
    //blink if under attack
    if(!(frameCount % 3 == 0)) sendOsc('/eos/newcmd/Chan/' +str(moveArray[evil.loc]) + '/At/'+str(0)+'/Enter');
    else sendOsc('/eos/newcmd/Chan/' +str(moveArray[evil.loc]) + '/At/'+str(100)+'/Enter');
  }
  else {
    //if not under attack show current evil location normally
    sendOsc('/eos/newcmd/Chan/' +str(moveArray[evil.loc]) + '/At/'+str(100)+'/Enter');
  }
  
  //if under attack blink the shoes on screen
  if (blink){
    if(!(frameCount % 3 == 0)) {
      //sin and cos are to show the shoes walking back and forth
      image(left, currentAveLeft[0]-10, currentAveLeft[1] + 30*sin(walkCount*10)*sin(walkCount*10), 16, 46);
      image(right, currentAveLeft[0]+10, currentAveLeft[1]+ 30*cos(walkCount*10)*cos(walkCount*10), 16, 46);
    }
  }
  else {
    //if not under attack then show shows normally
    image(left, currentAveLeft[0]-10, currentAveLeft[1] + 30*sin(walkCount*10)*sin(walkCount*10), 16, 46);
    image(right, currentAveLeft[0]+10, currentAveLeft[1]+ 30*cos(walkCount*10)*cos(walkCount*10), 16, 46);
  
  }
  blink = false;

  pop();

//Show constra
noStroke();
fill('blue');
textSize(40);
text("Of Mice ", 505, 50);
text("  And Men ", 505, 90);
text(" _______ ", 505, 100);

fill('red');
textSize(14);
text("Rules: ", 505, 130);
textSize(12);
text("(1) Chase Mouse", 505, 146);
text("(2) Don't let Mouse get cheese", 505, 162);
text("(3) Win by hitting Mouse", 505, 178);
textSize(14);
text("Cheeses Acquired: " + cheeseCount, 505, 280);


//get cheese
if(cheeseCount > 0 && (cheeseCount % cheeseLevel) == 0 && moveTime > 0) {
  moveTime = moveTime - decreaseConstant;
  numHits = numHits - 20;
  lifeValue = lifeValue + 20;
  handleLives();
  
}



  if(((cheeseX+20) < currentAveLeft[0] && (cheeseX+80) > currentAveLeft[0]) 
  && ((cheeseY+20) < currentAveLeft[1] && (cheeseY+80) > currentAveLeft[1]))
  {
  
  cheeseCount = cheeseCount + 1;
  getCheese.play();
  sendOsc('/eos/newcmd/Chan/' +str(moveArray[cheesePlace]) + '/At/'+str(0)+'/Enter');
  sendOsc("/eos/newcmd/Chan/" +str(moveArray[cheesePlace]) +  "/Green/0/Enter");
  sendOsc("/eos/newcmd/Chan/" +str(moveArray[cheesePlace]) +  "/Red/Full/Enter");
  cheesePlace = floor(random(0,20));
  if(evil.loc == cheesePlace) floor(random(0,20));
  if(evil.loc == cheesePlace) floor(random(0,20));
  if(evil.loc == cheesePlace) floor(random(0,20));
  if(evil.loc == cheesePlace) floor(random(0,20));
  sendOsc("/eos/newcmd/Chan/" +str(moveArray[cheesePlace]) +  "/Green/Full/Enter");
  sendOsc("/eos/newcmd/Chan/" +str(moveArray[cheesePlace]) +  "/Red/0/Enter");
  sendOsc('/eos/newcmd/Chan/' +str(moveArray[cheesePlace]) + '/At/'+str(lifeValue)+'/Enter');

  cheeseX = positionX(cheesePlace);
  cheeseY = positionY(cheesePlace);
}
image(cheese, cheeseX + 50, cheeseY + 50, 35, 27);

if(!start) {
fill('orange');
textSize(40);
if(!(frameCount % 3 == 0)) text("Press \"Enter\" to play!  ", 50, 190);
}
else{
textSize(14);
fill('red');

for(var i = 0; i < lives.length; i++){
  image(lives[i], 520 + i*40, 228, 24, 27);
}

text("Number of Lives Remaining", 505, 210);
 textSize(40);
if(!canMoveText()){
  if(!(frameCount % 3 == 0)) text("wait...", 530, 340);
} 
else {
  fill('green');
  text("MOVE!", 530, 340);
}
}



  stroke('blue');
  strokeWeight(5);
  textSize(12);
}

}

function keyPressed() {
  if (keyCode === ENTER){
      start = true;
      sendOsc('/eos/newcmd/Chan/1/Thru/30/At/'+str(0)+'/Enter');
      sendOsc("/eos/newcmd/Chan/1/Thru/30/Blue/0/Enter");
      sendOsc("/eos/newcmd/Chan/1/Thru/30/Green/0/Enter");
      sendOsc("/eos/newcmd/Chan/1/Thru/30/Red/Full/Enter");
      
      sendOsc("/eos/newcmd/Chan/" +str(moveArray[cheesePlace]) +  "/Green/"+ str(lifeValue) +"/Enter");
      sendOsc("/eos/newcmd/Chan/" +str(moveArray[cheesePlace]) +  "/Red/0/Enter");
      sendOsc('/eos/newcmd/Chan/' +str(moveArray[cheesePlace]) + '/At/'+str(100)+'/Enter');

  }
  
  
  if ((keyCode === LEFT_ARROW) && canMove() && ((evil.loc-1) != cheesePlace)) {
    if((evil.loc%5) !== 0){
    block(evil.loc)
    frameMove = true;
    evilMove.play();
    sendOsc('/eos/newcmd/Chan/' +str(moveArray[evil.loc]) + '/At/'+str(0)+'/Enter');
    evil.updateLocation(evil.loc-1);
    sendOsc('/eos/newcmd/Chan/' +str(moveArray[evil.loc]) + '/At/'+str(100)+'/Enter');
    
    }

  } else if ((keyCode === RIGHT_ARROW)  && canMove() && ((evil.loc+1) != cheesePlace)) {
    if((evil.loc%5) != 4){
    block(evil.loc)
    sendOsc('/eos/newcmd/Chan/' +str(moveArray[evil.loc]) + '/At/'+str(0)+'/Enter');
    evil.updateLocation(evil.loc+1);
    sendOsc('/eos/newcmd/Chan/' +str(moveArray[evil.loc]) + '/At/'+str(100)+'/Enter');
          frameMove = true;
    evilMove.play();
    }
  }
  else if ((keyCode === UP_ARROW) && canMove() && ((evil.loc-5) != cheesePlace)) {
    if(evil.loc > 4){
    block(evil.loc)
    sendOsc('/eos/newcmd/Chan/' +str(moveArray[evil.loc]) + '/At/'+str(0)+'/Enter');
    evil.updateLocation(evil.loc-5);
    sendOsc('/eos/newcmd/Chan/' +str(moveArray[evil.loc]) + '/At/'+str(100)+'/Enter');
          frameMove = true;
          evilMove.play();
    }
  }
  else if ((keyCode === DOWN_ARROW) && canMove() && ((evil.loc+5) != cheesePlace)) {
    if(evil.loc < 15){
    block(evil.loc)
    sendOsc('/eos/newcmd/Chan/' +str(moveArray[evil.loc]) + '/At/'+str(0)+'/Enter');
    evil.updateLocation(evil.loc+5);
    sendOsc('/eos/newcmd/Chan/' +str(moveArray[evil.loc]) + '/At/'+str(100)+'/Enter');
          frameMove = true;
          evilMove.play();

    }
  }
}
  
  // Bad Guy
function badGuy() {

  this.updateLocation = function(newLoc) {
    this.loc = newLoc;
    this.x1 = positionX(this.loc);
    this.y1 = positionY(this.loc);
    width1 = BLOCK_WIDTH;
    height1 = BLOCK_HEIGHT;
    fill('red');
    rect(this.x1, this.y1, width1, height1);

  };
  
}

//Good Guy
function goodGuy() {
  this.x1 = 100;
  this.y1 = 100;
  
  
  this.updateLocation = function(currentLoc) {
    var curX = currentLoc[0];
    var curY = currentLoc[1];
    
    this.x1 = curX - (curX%100);
    this.y1 = curY - (curY%100);

  };
  this.move = function() {
    this.oldx = this.x1;
    this.oldy = this.y1;
    
    width1 = 10;
    height1 = 10;
    strokeWeight(0);
    fill('blue');
    strokeWeight(5);
  };
}

function block(numBlock) {
  width1 = BLOCK_WIDTH;
  height1 = BLOCK_HEIGHT;
  fill('white');

  x = ((numBlock%5)*100);
  y = (floor(numBlock/5)*100);

  rect(x,y,width1,height1);
  text(numBlock,x +50, y+50);
}

function positionX(block) {
  x = ((block%5)*100);
  return x;
}
function positionY(block) {
  y = (floor(block/5)*100);
  return y;
}


function addFrameLeft(location) {
  
  frameAverageLeft[currentFrameLeft][0] = location[0];
  frameAverageLeft[currentFrameLeft][1] = location[1];
  currentFrameLeft = currentFrameLeft + 1;
  if(currentFrameLeft >= 5 ) currentFrameLeft = 0;
}

//average of last 20 frames
function twentyFrameAveLeft(location) {
  
  //refactor later
  var xTotal = 0;
  var yTotal = 0;
  for(var i = 0; i<5; i++){
    xTotal = xTotal + frameAverageLeft[i][0];
    yTotal = yTotal + frameAverageLeft[i][1];
  }
  
  var average = [xTotal/5,yTotal/5];
  
  return average;
}


function playFinal() {
  finalEnding.play();
}
//recieve see if can change from wait to move
function canMoveText() {
  newTime = millis();
  timeSinceMove = newTime - oldTime;
  //print(timeSinceMove);
  
  if(timeSinceMove > moveTime){
      return true;
  }
  return false
}

//recieve X from motion capture from currentLoc array
function canMove() {
  newTime = millis();
  timeSinceMove = newTime - oldTime;

  if(timeSinceMove > moveTime){
      oldTime = newTime;
      return true;
  }
  return false;
}

//recieve shows shoe visual
function handleLives() {
  lives.pop();
  
  //5 is 3/4
  //10 is 1/2
  //15 is 1/4
  if((cheeseCount != 0 && cheeseCount%cheeseLevel == 0) || numHits == 5 || numHits == 25 || numHits == 45 || numHits == 65 || numHits == 85){
    lives.push(new loadImage("shoes1.png"));
  }
  else if (numHits == 10 || numHits == 30 || numHits == 50 || numHits == 70 || numHits == 90) {
    lives.push(new loadImage("shoes2.png"));
  }
  else if (numHits == 15 || numHits == 35 || numHits == 55 || numHits == 75 || numHits == 95) {
    lives.push(new loadImage("shoes3.png"));
  }
}

//Grid. Top left = 3200,-2700, Top right = -3600, -2700, Bottom Right = -3600, 2200, Bottom left = 3200, 2200
function mapCoords(motionArray){
  if(abs(motionArray[0]) > 5 && abs(motionArray[1]) > 5) {
  oldLoc[0] = currentLoc [0];
  oldLoc[1] = currentLoc [1];
  
  currentLoc[0] = map(motionArray[0], 3200, -3900,0, 500)+8;
  currentLoc[1] = map(motionArray[1], -2700, 2800,0, height)+23;
  }
}
//xleft, yleft, xright,yright
function receiveOsc(address, value) {
	if (address == '/MaxProject') {
	  mapCoords(value);
	}
}
