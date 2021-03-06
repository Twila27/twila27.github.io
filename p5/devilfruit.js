var angle = 0;
var radius = 1;
var canvasWidth = 640;
var canvasHeight = 480;
function clearScreen() {
  background(0);
}
function setup() { //called once
  createCanvas(canvasWidth, canvasHeight);
  fill(255); //not lines
  stroke(127); //lines and borders
  clearScreen();
}
function drawSpiral(centerX, centerY) {
  // x = r * cos(t); y = r * sin(t)
  // future goal: r = a*e^(b*angle) -- a logarithmic spiral
  // so x = ae^bt * cos(t); y = ae^bt * sin(t)
  var polarX = radius * cos(radians(angle)) + centerX;
  var polarY = radius * sin(radians(angle)) + centerY;
  line(centerX, centerY, polarX, polarY);
  ellipse(polarX, polarY, 4, 6);   
}
function draw() { //called per frame
  var centerX = canvasWidth/2;
  var centerY = canvasHeight/2;      

  drawSpiral(centerX, centerY);      
  drawSpiral(centerX + width/4, centerY);
  drawSpiral(centerX - width/4, centerY);

  drawSpiral(centerX, centerY - width/4);      
  drawSpiral(centerX + width/4, centerY - width/4);
  drawSpiral(centerX - width/4, centerY - width/4);

  drawSpiral(centerX, centerY + width/4);      
  drawSpiral(centerX + width/4, centerY + width/4);
  drawSpiral(centerX - width/4, centerY + width/4);

  angle += 1;
  radius += .1;
}
