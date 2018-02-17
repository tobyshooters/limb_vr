Myo.connect('com.treehacks.Myanmar');

var currentZero = new THREE.Vector3(0, 0, 0);
var currentOne = new THREE.Vector3(0, 0, 0);

function eulerFromQt(qt) {
  let qt3 = new THREE.Quaternion().set(qt.w, qt.x, qt.y, qt.z);
  let euler = new THREE.Euler(0, 0, 0).setFromQuaternion(qt3.normalize());
  return euler.toVector3().normalize();
}

Myo.on('imu', (data) => { 
  console.log(data);
  if (data.myo == 0) 
    currentZero = eulerFromQt(data.orientation);
  else 
    currentOne = eulerFromQt(data.orientation);
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
  var arrowZero = new THREE.ArrowHelper(currentZero, origin, 1, 0xffff00);
  scene.add(arrowZero);

  var arrowOne = new THREE.ArrowHelper(currentOne, origin, 1, 0xff00ff);
  scene.add(arrowOne);

  // Reference Arrows
  var xdir = new THREE.Vector3(1, 0, 0);
  var xarrow = new THREE.ArrowHelper(xdir, origin, 0.2, 0xff0000);
  scene.add(xarrow);

  var ydir = new THREE.Vector3(0, 1, 0);
  var yarrow = new THREE.ArrowHelper(ydir, origin, 0.2, 0x00ff00);
  scene.add(yarrow);

  var zdir = new THREE.Vector3(0, 0, 1);
  var zarrow = new THREE.ArrowHelper(zdir, origin, 0.2, 0x0000ff);
  scene.add(zarrow);

  function updateScene() {
    arrowZero.setDirection(currentZero);
    arrowOne.position.copy(currentZero);
    arrowOne.setDirection(currentOne);
  }

  function animate() {
    requestAnimationFrame(animate);
    updateScene();
    renderer.render(scene, camera);
  }

  animate();
});
