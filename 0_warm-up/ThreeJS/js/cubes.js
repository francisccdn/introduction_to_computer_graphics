// Render dimensions
const render_width = window.innerWidth;
const render_height = window.innerHeight - 50; // Leaves room for buttons

// Create scene, camera, renderer, and add renderer to document
const camera = new THREE.PerspectiveCamera(
  75,
  render_width / render_height,
  0.1,
  1000
  );
let scene = new THREE.Scene(); // Scene can be replaced in functions
  
const renderer = new THREE.WebGLRenderer();
renderer.setSize(render_width, render_height);
document.body.appendChild(renderer.domElement);

// Animation will be called in animate() and can be replaced by any function
let animation = () => {}; 

function animate() {
  requestAnimationFrame(animate);
  animation();
  renderer.render(scene, camera);
}
animate();

// 4.1
// Render a static cube in the browser's window
function spawn_single_cube() {
  const single_cube_scene = new THREE.Scene();

  const geometry = new THREE.BoxGeometry();
  const material = new THREE.MeshBasicMaterial({ color: 0xffffff });
  const cube = new THREE.Mesh(geometry, material);
  single_cube_scene.add(cube);

  camera.position.z = 5;

  return { single_cube_scene, cube };
}

function static_cube() {
  const { single_cube_scene } = spawn_single_cube();
  scene = single_cube_scene;
}

// 4.2
// Render a rotating cube in the browser's window
function rotating_cube() {
  const { single_cube_scene, cube } = spawn_single_cube();
  scene = single_cube_scene;
  animation = () => {
    cube.rotation.x += 0.01;
    cube.rotation.y += 0.01;
  }
}
