// Modification of The "Vehicle" class
// The Nature of Code
// Daniel Shiffman
// http://natureofcode.com


function Vehicle(x,y,v,w) {
  this.angularVelocity = 0;
  this.angle = random(2*PI);
  this.position = createVector(x,y);
  this.speed = v;
  this.velocity = createVector(this.speed*cos(this.angle),this.speed*sin(this.angle));
  this.curvature = w;
  this.vehicleSize = 6;   // scales up the vehicle size (in visualizer)

  // Integrate acceleration
  this.update = function() {
    this.angle += this.angularVelocity;
    this.angle %= (2*PI);
    this.velocity = createVector(this.speed*cos(this.angle),this.speed*sin(this.angle));
    this.position.add(this.velocity);
    this.angularVelocity = 0;   // Reset angularVelocity to 0 each cycle
  }

  this.steer = function(target,k1,synchronyParameter) {
    var positionError = p5.Vector.sub(this.position,target);  // A vector pointing from the location to the target
    this.angularVelocity = this.curvature*(1 + k1*p5.Vector.dot(positionError,this.velocity));
    this.angularVelocity += synchronyParameter;
  }
      
  this.display = function() {
    // Draw a triangle rotated in the direction of velocity
    fill("red");
    stroke(176,23,31);
    strokeWeight(1);
    
    push();
    translate(this.position.x,this.position.y);
    rotate(this.angle + PI/2);
    beginShape();
    vertex(0, -this.vehicleSize*2);
    vertex(-this.vehicleSize, this.vehicleSize*2);
    vertex(this.vehicleSize, this.vehicleSize*2);
    endShape(CLOSE);
    pop();
  }
    
}