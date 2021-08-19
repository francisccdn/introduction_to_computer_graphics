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

  camera.position.set(0, 0, 5);
  camera.rotation.set(0, 0, 0);

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
  };
}

// 4.3
// Render 3 different stactic cubes, each with a different material
function spawn_many_cubes() {
  const many_cubes_scene = new THREE.Scene();

  // Creating 3 cubes of different materials
  const geometry = new THREE.BoxGeometry();
  const materials = [
    new THREE.MeshPhysicalMaterial({ color: 0x7fb069 }),
    new THREE.MeshToonMaterial({ color: 0xb540bf }),
    new THREE.MeshNormalMaterial(),
  ];
  const cubes = [
    new THREE.Mesh(geometry, materials[0]),
    new THREE.Mesh(geometry, materials[1]),
    new THREE.Mesh(geometry, materials[2]),
  ];

  // Adding cubes to scene and spacing them out
  for (let i = 0; i < cubes.length; i++) {
    many_cubes_scene.add(cubes[i]);
  }

  cubes[0].position.x = -5;
  cubes[1].position.x = 0;
  cubes[2].position.x = 5;

  // Setting up lighting
  const ambient_light = new THREE.AmbientLight(0x404040, 0.3); // soft white ambient light
  const directional_light = new THREE.DirectionalLight(0xffffff, 1); // white directional light

  directional_light.position.set(0, 2, 2);
  directional_light.castShadow = true;

  many_cubes_scene.add(ambient_light);
  many_cubes_scene.add(directional_light);

  // Setting up camera position to better show materials
  camera.position.set(2, 2, 5);
  camera.rotation.set(-0.2, 0.2, 0);

  return { many_cubes_scene, cubes };
}

function three_cubes() {
  const { many_cubes_scene } = spawn_many_cubes();
  scene = many_cubes_scene;
}

// Extra!
// Render 3 different rotating cubes, each with a different material
function three_rotating_cubes() {
  const { many_cubes_scene, cubes } = spawn_many_cubes();
  scene = many_cubes_scene;
  animation = () => {
    for (let i = 0; i < cubes.length; i++) {
      cubes[i].rotation.x += 0.01;
      cubes[i].rotation.y += 0.01;
    }
  };
}
