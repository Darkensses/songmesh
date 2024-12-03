import {Noise} from 'noisejs';
import './style.css'
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

// Set up audio context
const audioContext = new AudioContext();
const audio = new Audio('./song.mp3');

const audioSource = audioContext.createMediaElementSource(audio);

audioSource.connect(audioContext.destination);

const analyser = audioContext.createAnalyser();
analyser.fftSize = 64;

const bufferLength = analyser.frequencyBinCount;
const dataArray = new Uint8Array(bufferLength);

// Connect the source to be analyzed
audioSource.connect(analyser);

let isPlay = false;
const btnTest = document.querySelector('#controls>button')
btnTest.addEventListener('click', () => {
  if(isPlay === true) {
    audio.pause();
    audio.currentTime = 0;
    isPlay = false;
  } else {
    audio.play();
    isPlay = true;
  }
})

/**
 * Setup
 */
const canvas = document.querySelector('canvas#webgl');
const sizes = {width: canvas.parentElement.clientWidth, height: 720};
const renderer = new THREE.WebGLRenderer({canvas: canvas});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
const camera = new THREE.PerspectiveCamera(70, sizes.width/sizes.height);
camera.position.set(0,0,20);
const scene = new THREE.Scene();
scene.add(camera);

// Controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

window.addEventListener('resize', () => {
  // Update sizes
  sizes.width = canvas.parentElement.clientWidth;
  sizes.height = 720;

  // Update camera
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  // Update renderer
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

/**
 * Geometries
 */
const geometry = new THREE.BoxGeometry(0.5,0.5,0.5);
const material = new THREE.MeshBasicMaterial({color: 'red'});
const count = 32;
const instancedMesh = new THREE.InstancedMesh(geometry,material,count);
scene.add(instancedMesh);


const planeGeo = new THREE.PlaneGeometry(16,16,32,32)
const planeMesh = new THREE.Mesh(planeGeo, new THREE.MeshBasicMaterial({color: 'blue', wireframe: true}));
scene.add(planeMesh);

planeGeo.attributes.position.array[2] = 5;
planeGeo.attributes.position.array[98] = 5;
planeGeo.attributes.position.array[3266] = 5;

const test_array = [
  1.67, 1.89, 1.85, 1.63, 1.48, 1.39, 1.21, 1.28,
  1.29, 1.32, 1.26, 1.00, 1.10, 1.13, 1.01, 0.91,
  0.67, 0.85, 0.89, 0.77, 0.65, 0.54, 0.31, 0.00,
  0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00
]

for(let i=0; i<test_array.length; i++) {
  planeGeo.attributes.position.array[i*3+2] = test_array[i];
}

console.log(planeGeo.attributes.position.array)

/**
 * Animate
 */
const clock = new THREE.Clock();
const matrixAnim = new THREE.Matrix4();
//planeGeo.rotateZ(270 * Math.PI / 180);
let delta = 0;
let currentIndex = 2;
// Review:
// https://github.com/bigmstone/terrain/blob/master/src/index.js
function animate(){
  analyser.getByteFrequencyData(dataArray);

  for(let i=0, pad=0.5; i<bufferLength; i++) {
    const y = 10*dataArray[i]/128.0
    matrixAnim.makeScale(1,y,1);
    matrixAnim.setPosition(i-(count/2) + pad,y/4,0);
    instancedMesh.setMatrixAt(i,matrixAnim);
  }
  instancedMesh.instanceMatrix.needsUpdate = true;


  //planeGeo.attributes.position.array[currentIndex] = 0;
  test_array.forEach((value,index) => {
    planeGeo.attributes.position.array[currentIndex+(3*index)] = 0;
  })

  let nextRow = Math.floor((clock.getElapsedTime()*1000) / 3 / 33) + 1;
  currentIndex = (nextRow % 33) * 33 * 3 + 2;
  //planeGeo.attributes.position.array[currentIndex] = test_array[0];
  test_array.forEach((value,index) => {
    planeGeo.attributes.position.array[currentIndex+(3*index)] = value;
  })

  planeGeo.attributes.position.needsUpdate = true;


  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}
animate();