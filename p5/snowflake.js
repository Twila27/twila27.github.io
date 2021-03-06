var angleOffset = 54; // half inner angle = (180-(360/numSides))*.5
var radius = 1 + 200;
var centerX;
var centerY;
var numSides = 5;
var fps = 120;
var branchDelaySeconds = 2;
var glowSize = 48;
var bgColor

function clearScreen() {
  background(bgColor);
}

function setup() { //called once
  createCanvas(windowWidth, windowHeight);
  centerX = windowWidth/2;
  centerY = windowHeight/2;
  clearScreen();
  frameRate(120);  
}

function buildParentBranch(sideIndex) {
  let angle = 360 * (sideIndex / numSides) + angleOffset;
  let sd = 0.425; // How far out to let the star get
  let mean = 0.625;
  let lerpFactor = (randomGaussian() * sd + mean);
  let lerpedRadius = radius * lerpFactor;
  let polarX = lerpedRadius * cos(radians(angle)) + centerX;
  let polarY = lerpedRadius * sin(radians(angle)) + centerY;

  noStroke();
  fill(255, 10);
  let pointWidth = (lerpFactor > 0) ? 12 : 4;
  let pointHeight = pointWidth + 2;
  ellipse(polarX, polarY, pointWidth*(1-lerpFactor), pointHeight*(1-lerpFactor));

  buildChildBranches(angle, lerpFactor);
}

function buildChildBranches(parentAngle, lerpFactor) {
  if (frameCount < fps*branchDelaySeconds) {
    return;
  }

  let branchOrigins = [ 1/3, 1/2, 3/4 ]; // Dist along main branch
  for (var j = 0; j < branchOrigins.length; j++) {
    let branchSize = 0.75; // Relative to full radius
    let radiusFrac = radius * branchOrigins[j];
    reverseJ = branchOrigins.length-j;
    let branchRadius = radiusFrac * (lerpFactor*branchSize) * (reverseJ/branchOrigins.length);
    let branchParentSplit = 15*(reverseJ+1);
    let branchAngle = parentAngle + branchParentSplit;
    let branchMirAngle = parentAngle - branchParentSplit;
    let branchRootPolarX = centerX + radiusFrac*cos(radians(parentAngle));
    let branchRootPolarY = centerY + radiusFrac*sin(radians(parentAngle));
    let branchPolarX = branchRadius * cos(radians(branchAngle)) + branchRootPolarX;
    let branchPolarY = branchRadius * sin(radians(branchAngle)) + branchRootPolarY;
    let branchPolarMirX = branchRadius * cos(radians(branchMirAngle)) + branchRootPolarX;
    let branchPolarMirY = branchRadius * sin(radians(branchMirAngle)) + branchRootPolarY;
    if (lerpFactor > 0) {
      let pointWidth = 7;
      let pointHeight = pointWidth + 2;
      fill(255, 2);
      ellipse(branchPolarX, branchPolarY, pointWidth/2, pointHeight/2);
      ellipse(branchPolarMirX, branchPolarMirY, pointWidth/2, pointHeight/2);
    }
  }
}

function isMouseInRange(pointX, pointY) {
  return abs(dist(mouseX, mouseY, pointX, pointY)) < 50;
}

function drawAndCheckLinks(sideIndex) {
  let angle = 360 * (sideIndex / numSides) + angleOffset;
  let polarX = radius * cos(radians(angle)) + centerX;
  let polarY = radius * sin(radians(angle)) + centerY;
  hover = isMouseInRange(polarX, polarY);
  tint = [1, 1, (hover ? 255 : 1), 1]; //Think math through to cancel out yellow.
  icon = '❔';
  switch (sideIndex)
  {
    case 0: icon = '🎶'; break;
    case 1: icon = '✍'; break;
    case 2: icon = '💘'; break;
    case 3: icon = '🎮'; break;
    case 4: icon = '🎨'; break;
    default: break;
  }
  drawGlowingText(icon, polarX, polarY, glowSize, tint);
}


function getLerpFactor(rate) {
  let looper = frameCount % (255*rate); //"t".
  return (looper > (127*rate)) ? looper : (255*rate)-looper;
}

function drawGlowingText(s, x, y, dGlow, tint) {
  let dMax = dGlow; //Diameter.

  noStroke();
  fill(bgColor); //Clear ONLY below screen region.
  ellipse(x, y, dMax, dMax);

  let looper = getLerpFactor(1.0);
  let normedL = looper / 255;

  let normedBabyL = getLerpFactor(0.20) / (255*0.20);
  let normedMidL = getLerpFactor(0.65) / (255*0.65);
  let dTiny = dMax * normedBabyL * normedBabyL * 0.475;
  let dMid = dMax * normedMidL * normedMidL * 0.75;
  dMax *= normedL * normedL;  

  let lum = 192; // Glow luminosity.
  fill(lum*tint[0], lum*tint[1], lum*tint[2], looper*0.325*tint[3]); //Inmost white color.
  circle(x, y, dTiny);
  fill(lum*tint[0], lum*tint[1], 1*tint[2], looper*0.375*tint[3]); //B=1 to allow tint.
  circle(x, y, dMid);
  fill(lum*tint[0], lum*tint[1], 1*tint[2], looper*0.6375*tint[3]); //B=1 to allow tint.
  circle(x, y, dMax); //Exp curve = anim's bounce.

  textSize(16);
  textAlign(CENTER);
  fill(0, 102, 153, 101);
  text(s, x, y+6);
}

function draw() { //called per frame
  for (let i = 0; i < numSides; i++) {
    buildParentBranch(i);
    drawAndCheckLinks(i);  
  }
  //angleOffset += 1;
}

function activateHyperlink(linkId) {
  window.open(`https://twila27.github.io/p5/assets/firefly${linkId+1}.html`);
}

function mouseClicked() {
  for (let i = 0; i < numSides; i++) {
    let angle = 360 * (i / numSides) + angleOffset;
    let polarX = radius * cos(radians(angle)) + centerX;
    let polarY = radius * sin(radians(angle)) + centerY;
    if (isMouseInRange(polarX, polarY)) {
      activateHyperlink(i);
    }
  } 
}
