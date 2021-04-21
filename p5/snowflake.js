var angleOffset = 54; // half inner angle = (180-(360/numSides))*.5
var radius = 1 + 200;
var canvasWidth = 640;
var canvasHeight = 480;
var centerX = canvasWidth/2;
var centerY = canvasHeight/2;
var numSides = 5;
var fps = 120;
var branchDelaySeconds = 0;

function clearScreen() {
  background(0);
}

function setup() { //called once
  createCanvas(canvasWidth, canvasHeight);
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
  if (frameCount < fps*branchDelaySeconds)
  {
    return;
  }
  
  let branchOrigins = [ 1/3, 1/2, 3/4 ]; // Dist along main branch
  for (var j = 0; j < branchOrigins.length; j++)
  {
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
    if (lerpFactor > 0)
    {
      let pointWidth = 7;
      let pointHeight = pointWidth + 2;
      fill(255, 2);
      ellipse(branchPolarX, branchPolarY, pointWidth/2, pointHeight/2);
      ellipse(branchPolarMirX, branchPolarMirY, pointWidth/2, pointHeight/2);
    }
  }
}


function draw() { //called per frame
  for (let i = 0; i < numSides; i++)
  {
    buildParentBranch(i);
  }
  //angleOffset += 1;
}
