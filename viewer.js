import * as THREE from "three";

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  90,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.getElementById("canvas-container").appendChild(renderer.domElement);

camera.position.z = 5;

export function setGeometry(mesh, frame) {
  // removal existing geometry
  while (scene.children.length > 0) {
    let obj = scene.children[0];
    scene.remove(obj);
    // Dispose of geometry, material, and texture if they exist
    if (obj.geometry) obj.geometry.dispose();
    if (obj.material) obj.material.dispose();
    if (obj.texture) obj.texture.dispose();
  }

  const material = new THREE.LineBasicMaterial({ color: "white" });

  // add edges to the scene
  console.log("mesh edges", mesh.edges.length);
  mesh.edges.forEach((e) => {
    const points = [];
    points.push(
      new THREE.Vector3(e.n1.steps[frame][0], e.n1.steps[frame][1], 0)
    );
    points.push(
      new THREE.Vector3(e.n2.steps[frame][0], e.n2.steps[frame][1], 0)
    );
    const geometry = new THREE.BufferGeometry().setFromPoints(points);

    const line = new THREE.Line(geometry, material);
    scene.add(line);
  });
}

export function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}
