Myo.connect('com.treehacks.Myanmar');

function Calibrator(name) {
  this.name             = name;
  this.calibrated       = false;
  this.numVectors       = 1;
  this.average          = new THREE.Vector3(0, 0, 0);
  this.consistentFrames = 0;
  this.reference        = null;

  this.addVector = function(vec) {
    this.average = this.average
      .multiplyScalar(this.numVectors)
      .add(vec)
      .divideScalar(this.numVectors + 1);

    if (this.average.dot(vec) > 0.95) this.consistentFrames += 1;
    else this.consistentFrames = 0;

    this.numVectors = Math.min(this.numVectors + 1, 50);
  }

  this.isStable = function() {
    return (this.consistentFrames > 80);
  }

  this.setReference = function() {
    this.reference = this.average;
  }

  this.process = function(vec) {
    this.addVector(vec);
    if (this.isStable()) {
      this.calibrated = true;
      this.setReference();
      console.log("Calibrated: ", name);
    }
  }
}

function vecFromQt(qt) {
  let qt3 = new THREE.Quaternion().set(qt.x, qt.y, qt.z, qt.w);
  let vec = new THREE.Vector3(0, 0, 1).applyQuaternion(qt3);
  return vec;
}

function proj(u, v) {
  let dot = math.dot(u, v);
  return math.dotMultiply(dot, u);
}

function MyoFactory(id_str) {
  this.id = id_str;
  this.calibrated = false;
  this.calibratorX = new Calibrator(id_str + " X");
  this.calibratorY = new Calibrator(id_str + " Y");
  this.calibrationMatrix = null;

  this.processInput = function(vec) {
    if (!this.calibratorX.calibrated)
      this.calibratorX.process(vec);
    else if (!this.calibratorY.calibrated)
      this.calibratorY.process(vec);
    else {
      this.setCalibrationMatrix();
      this.calibrated = true;
    }
  }

  this.setCalibrationMatrix = function() {
    let calX = math.matrix(this.calibratorX.reference.normalize().toArray());
    let calY = math.matrix(this.calibratorY.reference.normalize().toArray());

    calY = math.subtract(calY, proj(calX, calY))
    calY = math.divide(calY, math.norm(calY));
    calZ = math.cross(calX, calY);

    let m = math.matrix([calX, calY, calZ]);
    let inverse = math.inv(m);
    this.calibrationMatrix = inverse;
  }

  this.transformVec = function(input) {
    if (this.calibrationMatrix == null) 
      throw Error();
    else {
      // console.log(input.toArray());
      let vector = math.matrix(input.toArray());
      let result =  math.multiply(this.calibrationMatrix, vector).toArray();
      let position = new THREE.Vector3(result[0], result[1], result[2]);
      return position;
    }
  }
}

zeroMyo = new MyoFactory("0");
var positionVectorZero = new THREE.Vector3(0, 0, 0);

oneMyo = new MyoFactory("1");
var positionVectorOne = new THREE.Vector3(0, 0, 0);

Myo.on('imu', (data) => { 
  newInput = vecFromQt(data.orientation);
  if (data.myo == 0) {
    if (zeroMyo.calibrated) 
      positionVectorZero = zeroMyo.transformVec(newInput);
    else
      zeroMyo.processInput(newInput);
  }
  if (data.myo == 1) {
    if (oneMyo.calibrated) 
      positionVectorOne = zeroMyo.transformVec(newInput);
    else
      oneMyo.processInput(newInput);
  }
});

$(document).ready(() => {
  var width = window.innerWidth;
  var height = window.innerHeight;

  var scene = new THREE.Scene();
  var camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
  var renderer = new THREE.WebGLRenderer();
  renderer.setSize(width, height);
  document.body.appendChild(renderer.domElement);

  // camera.position.set(1, 1, 2);
  camera.position.z = 3;
  var origin = new THREE.Vector3(0, 0, 0);

  // My Arrows
  var arrowZero = new THREE.ArrowHelper(positionVectorZero, origin, 1, 0xffff00);
  var arrowOne = new THREE.ArrowHelper(positionVectorOne, origin, 1, 0xff00ff);
  scene.add(arrowZero, arrowOne);

  // Reference Arrows
  var xdir = new THREE.Vector3(1, 0, 0);
  var xarrow = new THREE.ArrowHelper(xdir, origin, 0.2, 0xff0000);
  var ydir = new THREE.Vector3(0, 1, 0);
  var yarrow = new THREE.ArrowHelper(ydir, origin, 0.2, 0x00ff00);
  var zdir = new THREE.Vector3(0, 0, 1);
  var zarrow = new THREE.ArrowHelper(zdir, origin, 0.2, 0x0000ff);
  scene.add(xarrow, yarrow, zarrow);

  (function animate() {
    requestAnimationFrame(animate);

    arrowZero.setDirection(positionVectorZero);
    arrowOne.position.copy(positionVectorZero);
    arrowOne.setDirection(positionVectorOne);

    renderer.render(scene, camera);
  })();
});
