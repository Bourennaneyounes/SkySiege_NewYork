import * as THREE from 'three';

// --- 1. Scene & Renderer Setup ---
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x050508);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
document.body.appendChild(renderer.domElement);

// --- 2. Environment (The Big Box) ---
const cubeSize = 20;
const boxGeo = new THREE.BoxGeometry(cubeSize, cubeSize, cubeSize);
const boxMat = (color) => new THREE.MeshStandardMaterial({ 
    color, 
    side: THREE.BackSide, 
    roughness: 0.7, 
    metalness: 0.1 
});

const materials = [
    boxMat(0xff4444), boxMat(0x44ff44), boxMat(0x4444ff),
    boxMat(0xffff44), boxMat(0xff44ff), boxMat(0x44ffff)
];
const environment = new THREE.Mesh(boxGeo, materials);
scene.add(environment);

// Lights
const ambient = new THREE.AmbientLight(0xffffff, 0.6);
scene.add(ambient);
const sun = new THREE.PointLight(0xffffff, 1.2);
sun.position.set(5, 8, 5);
scene.add(sun);

// --- 3. Player Cube ---
const playerCube = new THREE.Mesh(
    new THREE.BoxGeometry(0.6, 0.6, 0.6),
    new THREE.MeshStandardMaterial({ color: 0xffaa44, emissive: 0x221100, metalness: 0.5 })
);
scene.add(playerCube);

// --- 4. Controls & State ---
let yaw = 0;   // Horizontal rotation
let pitch = 0; // Vertical rotation
let moveForward = false;
let moveBackward = false;

const speed = 8.0;
const sensitivity = 0.002;
const cameraDist = 4.0;
const smoothing = 0.1; // Camera follow speed (0 to 1)

// Pointer Lock (Click to start)
const canvas = renderer.domElement;
canvas.addEventListener('click', () => canvas.requestPointerLock());

document.addEventListener('mousemove', (e) => {
    if (document.pointerLockElement === canvas) {
        yaw -= e.movementX * sensitivity;
        
        // Pitch logic: e.movementY is negative when pushing mouse forward.
        // Adding it here makes "Mouse Forward = Look Up"
        pitch += e.movementY * sensitivity; 

        // Clamp pitch so you don't flip upside down
        pitch = Math.max(-Math.PI / 2.2, Math.min(Math.PI / 2.2, pitch));
    }
});

window.addEventListener('keydown', (e) => {
    const key = e.key.toLowerCase();
    if (key === 'z') moveForward = true;
    if (key === 's') moveBackward = true;
});

window.addEventListener('keyup', (e) => {
    const key = e.key.toLowerCase();
    if (key === 'z') moveForward = false;
    if (key === 's') moveBackward = false;
});

// --- 5. The Main Loop ---
const clock = new THREE.Clock();
const moveVec = new THREE.Vector3();

function update() {
    const delta = clock.getDelta();

    // A. Movement Logic (3D Directional)
    if (moveForward || moveBackward) {
        // Get the direction the camera is pointing
        camera.getWorldDirection(moveVec);
        
        const directionMultiplier = moveForward ? 1 : -1;
        playerCube.position.addScaledVector(moveVec, speed * directionMultiplier * delta);
        
        // Smoothly rotate the cube to face the movement direction
        playerCube.quaternion.slerp(camera.quaternion, 0.1);
    }

    // B. Collision (Keep inside the box)
    const limit = (cubeSize / 2) - 0.4;
    playerCube.position.clamp(
        new THREE.Vector3(-limit, -limit, -limit),
        new THREE.Vector3(limit, limit, limit)
    );

    // C. Camera Orbit Logic
    // We calculate where the camera SHOULD be based on yaw/pitch
    const targetOffset = new THREE.Vector3(
        cameraDist * Math.sin(yaw) * Math.cos(pitch),
        cameraDist * Math.sin(pitch),
        cameraDist * Math.cos(yaw) * Math.cos(pitch)
    );
    
    const targetCameraPos = playerCube.position.clone().add(targetOffset);
    
    // Smoothly LERP the camera to the target position
    camera.position.lerp(targetCameraPos, smoothing);
    
    // Always look at the player
    camera.lookAt(playerCube.position);
}

function animate() {
    requestAnimationFrame(animate);
    update();
    renderer.render(scene, camera);
}

animate();

// Handle Window Resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

