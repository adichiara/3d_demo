Utility function to log messages on the page
function logMessage(message) {
  const logDiv = document.getElementById('log-output');
  logDiv.innerHTML += `<p>${message}</p>`;
}

// Initial confirmation that main.js is loaded
logMessage("main.js is loaded and running");

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0x20252f);
renderer.shadowMap.enabled = true;
document.getElementById("webgl-output").appendChild(renderer.domElement);

const nodes = [];
const nodeMap = {};

// Camera movement and rotation settings
camera.position.set(0, 0, 50);
const rotationSpeed = 0.0035;
let pitch = 0; // Track up/down rotation angle
let yaw = 0; // Track left/right rotation angle
let yawVelocity = 0;
let pitchVelocity = 0;
const movement = {
  forward: 0,
  backward: 0,
  rotateLeft: 0,
  rotateRight: 0,
  rotateUp: 0,
  rotateDown: 0,
};
const acceleration = 0.3;
const dampingFactor = 0.98;
const rotationAcceleration = 0.001; // Rotation acceleration for smoothness
const rotationDampingFactor = 0.95; // Damping for smooth rotation stop
let velocity = { x: 0, y: 0, z: 0 };

// Ambient light and point light setup
const ambientLight = new THREE.AmbientLight(0x404040, 1);
scene.add(ambientLight);
const pointLight = new THREE.PointLight(0xffffff, 1.5, 200);
pointLight.position.set(10, 10, 10);
pointLight.castShadow = true;
scene.add(pointLight);
logMessage("Lights added to scene");

// Load data and create nodes
fetch("./data.json")
  .then((response) => response.json())
  .then((data) => {
    logMessage("data.json parsed successfully");
    const { nodes: jsonNodes } = data;

    jsonNodes.forEach((nodeData) => {
      const geometry = new THREE.SphereGeometry(1, 32, 32);
      const material = new THREE.MeshStandardMaterial({
        color: 0x44aaff,
        roughness: 0.4,
        metalness: 0.1,
      });
      const sphere = new THREE.Mesh(geometry, material);

      sphere.position.set(
        Math.random() * 100 - 50,
        Math.random() * 100 - 50,
        Math.random() * 100 - 50
      );

      sphere.castShadow = true;
      sphere.receiveShadow = true;
      scene.add(sphere);
      nodes.push(sphere);
      nodeMap[nodeData.id] = sphere;
    });

    logMessage(`${nodes.length} nodes added to the scene`);
    animate(); // Start the animation loop after loading data
  })
  .catch((error) => logMessage(`Error loading data.json: ${error.message}`));

// Smooth rotation and movement logic remains the same as before
function applyRotation() {
  const quaternionX = new THREE.Quaternion();
  const quaternionY = new THREE.Quaternion();

  if (movement.rotateLeft) yawVelocity += rotationAcceleration;
  if (movement.rotateRight) yawVelocity -= rotationAcceleration;
  if (movement.rotateUp) pitchVelocity += rotationAcceleration;
  if (movement.rotateDown) pitchVelocity -= rotationAcceleration;

  yawVelocity *= rotationDampingFactor;
  pitchVelocity *= rotationDampingFactor;

  yaw += yawVelocity;
  pitch = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, pitch + pitchVelocity));

  quaternionY.setFromAxisAngle(new THREE.Vector3(0, 1, 0), yaw);
  quaternionX.setFromAxisAngle(new THREE.Vector3(1, 0, 0), pitch);

  camera.quaternion.copy(quaternionY.multiply(quaternionX));
}

// Adjust node brightness and size based on distance
function adjustVisualsBasedOnDistance() {
  nodes.forEach((node) => {
    const distance = camera.position.distanceTo(node.position);
    const brightness = Math.max(0.3, 1 - distance / 100);
    node.material.color.setHSL(0.6, 1, brightness);

    const scale = Math.max(0.5, 3 - distance / 50);
    node.scale.set(scale, scale, scale);
  });
}

// Animation loop with forward/backward movement
function animate() {
  requestAnimationFrame(animate);

  applyRotation();

  const forward = new THREE.Vector3();
  camera.getWorldDirection(forward);

  if (movement.forward) velocity.z = acceleration;
  if (movement.backward) velocity.z = -acceleration;

  velocity.z *= dampingFactor;
  camera.position.addScaledVector(forward, velocity.z);

  adjustVisualsBasedOnDistance();
  renderer.render(scene, camera);
}

// Event listeners for camera rotation and movement controls
document
  .querySelector(".rotate-up")
  .addEventListener("mousedown", () => (movement.rotateUp = 1));
document
  .querySelector(".rotate-up")
  .addEventListener("mouseup", () => (movement.rotateUp = 0));
document
  .querySelector(".rotate-up")
  .addEventListener("touchstart", () => (movement.rotateUp = 1));
document
  .querySelector(".rotate-up")
  .addEventListener("touchend", () => (movement.rotateUp = 0));

document
  .querySelector(".rotate-down")
  .addEventListener("mousedown", () => (movement.rotateDown = 1));
document
  .querySelector(".rotate-down")
  .addEventListener("mouseup", () => (movement.rotateDown = 0));
document
  .querySelector(".rotate-down")
  .addEventListener("touchstart", () => (movement.rotateDown = 1));
document
  .querySelector(".rotate-down")
  .addEventListener("touchend", () => (movement.rotateDown = 0));

document
  .querySelector(".rotate-left")
  .addEventListener("mousedown", () => (movement.rotateLeft = 1));
document
  .querySelector(".rotate-left")
  .addEventListener("mouseup", () => (movement.rotateLeft = 0));
document
  .querySelector(".rotate-left")
  .addEventListener("touchstart", () => (movement.rotateLeft = 1));
document
  .querySelector(".rotate-left")
  .addEventListener("touchend", () => (movement.rotateLeft = 0));

document
  .querySelector(".rotate-right")
  .addEventListener("mousedown", () => (movement.rotateRight = 1));
document
  .querySelector(".rotate-right")
  .addEventListener("mouseup", () => (movement.rotateRight = 0));
document
  .querySelector(".rotate-right")
  .addEventListener("touchstart", () => (movement.rotateRight = 1));
document
  .querySelector(".rotate-right")
  .addEventListener("touchend", () => (movement.rotateRight = 0));

document
  .querySelector(".move-forward")
  .addEventListener("mousedown", () => (movement.forward = 1));
document
  .querySelector(".move-forward")
  .addEventListener("mouseup", () => (movement.forward = 0));
document
  .querySelector(".move-forward")
  .addEventListener("touchstart", () => (movement.forward = 1));
document
  .querySelector(".move-forward")
  .addEventListener("touchend", () => (movement.forward = 0));

document
  .querySelector(".move-backward")
  .addEventListener("mousedown", () => (movement.backward = 1));
document
  .querySelector(".move-backward")
  .addEventListener("mouseup", () => (movement.backward = 0));
document
  .querySelector(".move-backward")
  .addEventListener("touchstart", () => (movement.backward = 1));
document
  .querySelector(".move-backward")
  .addEventListener("touchend", () => (movement.backward = 0));

logMessage("Animation loop initialized");
