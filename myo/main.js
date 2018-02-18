Myo.connect('com.treehacks.Myanmar');

/////////////////////////////////////////
// CSV Time Series Exporting ////////////
/////////////////////////////////////////

time_series = { "0": [{"a": 1}], "1": [{"b": 4}] } 

function clearTimeSeries() {
  time_series["0"] = [];
  time_series["1"] = [];
}

function downloadCSVs() {
  downloadCSV(time_series["0"]);
  downloadCSV(time_series["1"]);
}

/////////////////////////////////////////
// Vector Infrastructure ////////////////
/////////////////////////////////////////

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
  // let euler = new THREE.Euler().setFromQuaternion(qt3);
  // return new THREE.Vector3(0, 1, 0).applyEuler(euler);
  let vec = new THREE.Vector3(0, 1, 0).applyQuaternion(qt3);
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
      setTimeout(() => { 
        this.calibrated = true; 
        clearTimeSeries();
      }, 1000);
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
      let vector = math.matrix(input.toArray());
      let result =  math.multiply(this.calibrationMatrix, vector).toArray();
      let position = new THREE.Vector3(result[0], result[1], result[2]);
      return position;
    }
  }
}

/////////////////////////////////////////
// Run Time Code ////////////////////////
/////////////////////////////////////////

zeroMyo = new MyoFactory("0");
let positionVectorZero = new THREE.Vector3(0, 0, 0);

oneMyo = new MyoFactory("1");
let positionVectorOne = new THREE.Vector3(0, 0, 0);

Myo.on('imu', (data) => { 
  newInput = vecFromQt(data.orientation);

  if (data.myo == 0) {
    time_series["0"].push(data);

    if (zeroMyo.calibrated) 
      positionVectorZero = zeroMyo.transformVec(newInput);
    else
      zeroMyo.processInput(newInput);
  }

  if (data.myo == 1) {
    time_series["1"].push(data);

    if (oneMyo.calibrated) 
      positionVectorOne = zeroMyo.transformVec(newInput);
    else
      oneMyo.processInput(newInput);
  }
});

$(document).ready(() => {
  let width = window.innerWidth;
  let height = window.innerHeight;

  let scene = new THREE.Scene();
  let camera = new THREE.PerspectiveCamera(90, width / height, 0.1, 1000);
  let renderer = new THREE.WebGLRenderer({ alpha: true });
  renderer.setSize(width, height);
  document.body.appendChild(renderer.domElement);

  let origin = new THREE.Vector3(0, 0, 0);
  camera.position.z = 1.5;
  camera.position.y = 1.5;
  camera.position.x = 0.75;
  camera.rotation.x = 45 * Math.PI / 180;
  camera.lookAt(origin);

  // My Arrows
  let arrowZero = new THREE.ArrowHelper(positionVectorZero, origin, 1, 0xffff00);
  let arrowOne = new THREE.ArrowHelper(positionVectorOne, origin, 1, 0xff00ff);
  scene.add(arrowZero, arrowOne);

  let boxZero = new THREE.BoxHelper(arrowZero, 0xffff00);
  let boxOne = new THREE.BoxHelper(arrowOne, 0xffff00);
  scene.add(boxZero, boxOne);

  var geo = new THREE.PlaneBufferGeometry(25, 25);
  var mat = new THREE.MeshBasicMaterial({ color: 0xd3d3d3, side: THREE.DoubleSide });
  var plane = new THREE.Mesh(geo, mat);
  plane.rotateX( - Math.PI / 2);
  plane.position.y = -5;
  scene.add(plane);

  // Reference Arrows
  let xdir = new THREE.Vector3(1, 0, 0);
  let xarrow = new THREE.ArrowHelper(xdir, origin, 0.2, 0xff0000);
  let ydir = new THREE.Vector3(0, 1, 0);
  let yarrow = new THREE.ArrowHelper(ydir, origin, 0.2, 0x00ff00);
  let zdir = new THREE.Vector3(0, 0, 1);
  let zarrow = new THREE.ArrowHelper(zdir, origin, 0.2, 0x0000ff);
  scene.add(xarrow, yarrow, zarrow);

  (function animate() {
    requestAnimationFrame(animate);

    arrowZero.setDirection(positionVectorZero);
    arrowOne.position.copy(positionVectorZero);
    arrowOne.setDirection(positionVectorOne);
    boxZero.update();
    boxOne.update();

    renderer.render(scene, camera);
  })();
});
