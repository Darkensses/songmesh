import './style.css'
import * as THREE from 'three';

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

/**
 * Animate
 */
const clock = new THREE.Clock();
const matrixAnim = new THREE.Matrix4();
function animate(){
  analyser.getByteFrequencyData(dataArray);
  //console.log(dataArray)

  for(let i=0, pad=0.5; i<bufferLength; i++) {
    const y = 10*dataArray[i]/128.0
    matrixAnim.makeScale(1,y,1);
    matrixAnim.setPosition(i-(count/2) + pad,y/4,0);
    instancedMesh.setMatrixAt(i,matrixAnim);
  }

  instancedMesh.instanceMatrix.needsUpdate = true;

  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}
animate();