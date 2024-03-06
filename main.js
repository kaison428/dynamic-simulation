import { Node, Edge, Mesh, forwardEuler } from "/model.js";
import { setGeometry, animate } from "/viewer.js";

// Define mesh
let n1 = new Node(0, 0);
let n2 = new Node(2, 0);
let n3 = new Node(4, 0);

let e1 = new Edge(n1, n2);
let e2 = new Edge(n2, n3);

n1.dof = [0, 1];
n2.dof = [2, 3];
n3.dof = [4, 5];

n1.constraints = [true, true];

n2.mass = 2;
n3.mass = 2;

e1.stiffness = 10000;
e2.stiffness = 10000;

let mesh = new Mesh([n1, n2, n3], [e1, e2], []);

const t = 5;
const dt = 0.001;
const numFrames = parseInt(t / dt);
const meshWithSteps = forwardEuler(t, dt, mesh);

// slider ---------------------------------------------------------------
var slider = document.getElementById("playerBar");
var output = document.getElementById("frame");

output.innerHTML = slider.value; // Display the default slider value
setGeometry(meshWithSteps, slider.value);

slider.setAttribute("max", numFrames);

function updateViewer() {
  output.innerHTML = slider.value;
  setGeometry(meshWithSteps, slider.value);
}

// Update the current slider value (each time you drag the slider handle)
slider.oninput = updateViewer;

// button --------------------------------------------------------------
const player = document.querySelector(".player-button");
// Use requestAnimationFrame for smoother animation handling
const fps = 40;
const updateRate = parseInt(1000 * 1 / fps); // Convert dt to milliseconds for comparison
const frameIncrement = parseInt(1 / dt / fps);
let lastFrameTime = 0;
let isPlayed = false;

function animatePlayer(time) {
  if (!isPlayed) return; // Stop the animation loop if not in play mode
  
  const timeSinceLastFrame = time - lastFrameTime;
  if (timeSinceLastFrame > updateRate) {
    if (slider.value < numFrames) {
      slider.value = parseInt(slider.value) + frameIncrement;
      updateViewer();
      lastFrameTime = time;
    } else {
      // stop looping the animation when reaching the end
      togglePlay(); // Assume togglePlay handles stopping and starting the play mode
    }
  }

  requestAnimationFrame(animatePlayer);
}

function togglePlay() {
  const buttons = Array.from(player.children);
  buttons.forEach((button) => button.classList.toggle("hidden"));
  isPlayed = !isPlayed;

  if (isPlayed) requestAnimationFrame(animatePlayer);
  if (slider.value >= numFrames) slider.value = 0;
}

player.addEventListener("click", togglePlay);

animate();
