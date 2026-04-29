import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x000000);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
document.body.appendChild(renderer.domElement);

const rightMaterial = new THREE.MeshStandardMaterial({ color: 0xff3333, side: THREE.BackSide, emissive: 0x220000, roughness: 0.4, metalness: 0.1 });
const leftMaterial = new THREE.MeshStandardMaterial({ color: 0x33ff33, side: THREE.BackSide, emissive: 0x002200, roughness: 0.4, metalness: 0.1 });
const upMaterial = new THREE.MeshStandardMaterial({ color: 0x3399ff, side: THREE.BackSide, emissive: 0x001133, roughness: 0.4, metalness: 0.1 });
const downMaterial = new THREE.MeshStandardMaterial({ color: 0xffaa33, side: THREE.BackSide, emissive: 0x331a00, roughness: 0.6, metalness: 0.2 });
const frontMaterial = new THREE.MeshStandardMaterial({ color: 0xff33ff, side: THREE.BackSide, emissive: 0x220022, roughness: 0.4, metalness: 0.1 });
const backMaterial = new THREE.MeshStandardMaterial({ color: 0x33ffff, side: THREE.BackSide, emissive: 0x002222, roughness: 0.4, metalness: 0.1 });

const cubeMaterials = [
    rightMaterial,
    leftMaterial,
    upMaterial,
    downMaterial,
    frontMaterial,
    backMaterial
];

const cubeSize = 10;
const geometry = new THREE.BoxGeometry(cubeSize, cubeSize, cubeSize);
const environmentCube = new THREE.Mesh(geometry, cubeMaterials);
scene.add(environmentCube);

const edgesGeo = new THREE.EdgesGeometry(geometry);
const edgesMat = new THREE.LineBasicMaterial({ color: 0xffffff });
const wireframe = new THREE.LineSegments(edgesGeo, edgesMat);
scene.add(wireframe);

const ambientLight = new THREE.AmbientLight(0x404060, 0.7);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1.2);
directionalLight.position.set(2, 5, 3);
scene.add(directionalLight);

const fillLight = new THREE.PointLight(0x88aaff, 0.4);
fillLight.position.set(0, -3, 0);
scene.add(fillLight);

const camLight = new THREE.PointLight(0xffaa66, 0.3);
camera.add(camLight);
scene.add(camera);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableZoom = true;
controls.enablePan = false;
controls.zoomSpeed = 0.8;
controls.rotateSpeed = 1.0;
controls.target.set(0, 0, 0);

camera.position.set(0, 0, 1.5);
camera.lookAt(0, 0, 0);
controls.update();

const centerMarkerMat = new THREE.MeshStandardMaterial({ color: 0xffaa55, emissive: 0x442200 });
const centerSphere = new THREE.Mesh(new THREE.SphereGeometry(0.08, 8, 8), centerMarkerMat);
scene.add(centerSphere);

let time = 0;

function animate() {
    time += 0.01;
    fillLight.intensity = 0.4 + Math.sin(time * 1.5) * 0.1;
    controls.update();
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
}

animate();

window.addEventListener('resize', onWindowResize, false);
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}