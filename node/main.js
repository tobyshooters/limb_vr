var Myo = require('myo');

Myo.connect('com.treehacks.Myanmar', require('ws'))

Myo.on('imu', (data) => {
  qt = data.orientation;
  roll = Math.atan2(2 * qt.y * qt.w - 2 * qt.x * qt.z, 1 - 2 * qt.y * qt.y - 2 * qt.z * qt.z);
  pitch = Math.atan2(2 * qt.x * qt.w - 2 * qt.y * qt.z, 1 - 2 * qt.x * qt.x - 2 * qt.z * qt.z);
  yaw = Math.asin(2 * qt.x * qt.y + 2 * qt.x * qt.w);

  console.clear();
  console.log(data.accelerometer);
  console.log("Roll:  ", roll, "\nPitch: ", pitch, "\nYaw:   ", yaw);
});
