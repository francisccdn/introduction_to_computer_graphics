/*
Implementation by Francisco Cunha (francisccdn);
using code from:
Canvas class by ICG-UFPB on codepen.io - https://codepen.io/ICG-UFPB/pen/oNWaQjM
Graphics Pipeline Template by ICG-UFPB on codepen.io - https://codepen.io/ICG-UFPB/pen/bGWmQpN
*/


/*** GRAPHICS PIPELINE ***/

// Parameters

let cam_pos = new THREE.Vector3(0,0,1.0);         // Camera's position in universe space
let cam_look_at = new THREE.Vector3(0.0,0.0,0.0); // Camera's look-at point
let cam_up = new THREE.Vector3(0.0,1.0,0.0);      // Camera's up direction

function set_cam_pos(vec3) { cam_pos = new THREE.Vector3(vec3[0],vec3[1],vec3[2]); }
function set_cam_look_at(vec3) { cam_look_at = new THREE.Vector3(vec3[0],vec3[1],vec3[2]); }
function set_cam_up(vec3) { cam_up = new THREE.Vector3(vec3[0],vec3[1],vec3[2]); }

let dist_projection_plane = 1;
function set_dist_projection_plane(d) { dist_projection_plane = d; }

let viewport_x = 128;
let viewport_y = 128;
function set_viewport(vec2) {
  viewport_x = vec2[0];
  viewport_y = vec2[1];
}

// Pipeline

// Params: object space vertices; matrix of object transformations
// Returns: vertices in screen space.
function GraphicsPipeline(vertices, m_transf) {

  /*** Model Matrix: Object space --> Universe space ***/
  
  if (m_transf === undefined) {
    // Initialize transformations as identity if not set
    m_transf = new THREE.Matrix4();
  }

  // Same as initializing m_model as identity then doing m_model.multiply(m_transf)
  const m_model = m_transf;

  for (let i = 0; i < 8; ++i)
    vertices[i].applyMatrix4(m_model);

 
  /*** View Matrix: Universe space -> Camera space ***/
 
  // Derive camera space basis from camera parameters
 
  const cam_dir = new THREE.Vector3();
  cam_dir.subVectors(cam_look_at, cam_pos);                           // Get camera direction from look at

  const cam_basis_x = new THREE.Vector3();
  const cam_basis_y = new THREE.Vector3();
  const cam_basis_z = cam_dir.clone().multiplyScalar(-1).normalize(); // Z axis for camera basis
  cam_basis_x.crossVectors(cam_up, cam_basis_z).normalize();          // X axis for camera basis
  cam_basis_y.crossVectors(cam_basis_z, cam_basis_x).normalize();     // Y axis for camera basis

  // Make 'm_bt', inverse matrix of the camera basis
 
  const m_bt = new THREE.Matrix4();
 
  m_bt.set(cam_basis_x.x, cam_basis_x.y, cam_basis_x.z, 0.0,
           cam_basis_y.x, cam_basis_y.y, cam_basis_y.z, 0.0,
           cam_basis_z.x, cam_basis_z.y, cam_basis_z.z, 0.0,
           0.0,           0.0,           0.0,           1.0);
 
  // Make translation matrix 'm_t' to treat cases in which origins of camera and universe spaces do not coincide
 
  const m_t = new THREE.Matrix4();
 
  m_t.set(1.0, 0.0, 0.0, -cam_pos.x,
          0.0, 1.0, 0.0, -cam_pos.y,
          0.0, 0.0, 1.0, -cam_pos.z,
          0.0, 0.0, 0.0, 1.0);

  // Make view matrix 'm_view' as a product of 'm_bt' and 'm_t'
  const m_view = m_bt.clone().multiply(m_t);
 
  for (let i = 0; i < 8; ++i)
    vertices[i].applyMatrix4(m_view);
 
  /*** Projection Matrix: Camera space --> Clipping space ***/
 
  const m_projection = new THREE.Matrix4();
  const d = dist_projection_plane; // Just for a neater matrix

  m_projection.set(1.0, 0.0,    0.0, 0.0,
                   0.0, 1.0,    0.0, 0.0,
                   0.0, 0.0,    1.0,   d,
                   0.0, 0.0, -(1/d), 0.0);
 
  for (let i = 0; i < 8; ++i)
    vertices[i].applyMatrix4(m_projection);
 
  /*** Homogenization: Clipping space --> Normalized device coordinates (NDC) ***/
 
  for (let i = 0; i < 8; ++i)
    vertices[i].multiplyScalar(1 / vertices[i].w)
 
  /*** Viewport Matrix: NDC --> Screen space ***/
 
  // TODO
  let m_viewport = new THREE.Matrix4();

  m_viewport.set(1.0, 0.0, 0.0, 0.0,
                0.0, 1.0, 0.0, 0.0,
                0.0, 0.0, 1.0, 0.0,
                0.0, 0.0, 0.0, 1.0);

  for (let i = 0; i < 8; ++i)
    vertices[i].applyMatrix4(m_viewport);
}  
    
/*** RASTERIZATION ***/

// HTML canvas handler
class Canvas {
  constructor(canvas_id) {
    this.canvas = document.getElementById(canvas_id);
    this.context = this.canvas.getContext("2d");
    this.clear_color = "rgba(0,0,0,255)";
  }

  clear() {
    this.context.fillStyle = this.clear_color;
    this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }

  putPixel(x, y, color) {
    this.context.fillStyle =
      "rgb(" + color[0] + "," + color[1] + "," + color[2] + ")";
    this.context.fillRect(x, this.canvas.height - 1 - y, 1, 1);
  }
}

// Get canvas
const color_buffer = new Canvas("canvas");
color_buffer.clear();

// Line rasterization
function MidPointLineAlgorithm(x0, y0, x1, y1, color0, color1) {
  // Set variables according to octant

  if (x1 < x0) {
    // Left-side octants

    // Invert colors
    const color_aux = color0;
    color0 = color1;
    color1 = color_aux;

    // Invert first and final coords
    const x_aux = x0;
    x0 = x1;
    x1 = x_aux;

    const y_aux = y0;
    y0 = y1;
    y1 = y_aux;
  }

  // p is the coordinate that is always in/decremented
  // q is the coordinate that changes based on the decision variable
  let p_start = x0,
    q_start = y0,
    p_end = x1,
    q_end = y1;

  let p_mod = 1;
  let q_mod = 1;

  let tall = false;

  if (Math.abs(x1 - x0) > Math.abs(y1 - y0)) {
    // 1st and 8th octants (or left-side equivalents)
    if (y1 < y0) {
      // 8th
      q_mod = -1;
    }
  } else {
    // 2nd and 7th octants (or left-side equivalents)

    // Set Y as coordinate that always in/decreases
    tall = true;

    p_start = y0;
    p_end = y1;
    q_start = x0;
    q_end = x1;

    if (y1 < y0) {
      // 7th
      p_mod = -1;
    }
  }

  // Set line equation alpha and beta values
  const alpha = (q_end - q_start) * q_mod;
  const beta = -(p_end - p_start) * p_mod;

  // Declare first decision variable
  let decision = 2 * alpha + beta;
  let draw_p = p_start,
    draw_q = q_start;

  while (draw_p != p_end) {
    // Set color of next pixel
    let color = [];
    const color_alpha =
      (((color1[3] - color0[3]) * (draw_p - p_start)) / (p_end - p_start) + color0[3]) / 255;
    for (let i = 0; i < 3; i++) {
      color.push(
        color_alpha *
          (((color1[i] - color0[i]) * (draw_p - p_start)) / (p_end - p_start) + color0[i])
      );
    }

    // Draw a pixel at current coordinates
    if (!tall) {
      color_buffer.putPixel(draw_p, draw_q, color);
    } else {
      color_buffer.putPixel(draw_q, draw_p, color);
    }

    if (decision >= 0) {
      draw_q += q_mod;

      decision += 2 * (alpha + beta);
    } else {
      decision += 2 * alpha;
    }
    draw_p += p_mod;
  }
  // Draw last pixel
  const color = [
    color1[0] * (color1[3] / 255),
    color1[1] * (color1[3] / 255),
    color1[2] * (color1[3] / 255),
  ];
  color_buffer.putPixel(x1, y1, color);
}

/*** RENDERING GEOMETRY ***/

// TODO

/*** DEMO ***/

// Vertices of a default cube centered in its object space
//                                          X     Y     Z    W (coord. homogênea)
const cube_vertices = [new THREE.Vector4(-1.0, -1.0, -1.0, 1.0),
                       new THREE.Vector4( 1.0, -1.0, -1.0, 1.0),
                       new THREE.Vector4( 1.0, -1.0,  1.0, 1.0),
                       new THREE.Vector4(-1.0, -1.0,  1.0, 1.0),
                       new THREE.Vector4(-1.0,  1.0, -1.0, 1.0),
                       new THREE.Vector4( 1.0,  1.0, -1.0, 1.0),
                       new THREE.Vector4( 1.0,  1.0,  1.0, 1.0),
                       new THREE.Vector4(-1.0,  1.0,  1.0, 1.0)];

// Default cube's 12 edges, indicated by the indexes of their vertices
let cube_edges = [[0,1], [1,2], [2,3], [3,0], [4,5], [5,6], [6,7], [7,4], [0,4], [1,5], [2,6], [3,7]];

// Demo camera position
set_cam_pos([1.3,1.7,2.0]);     
set_cam_look_at([0.0,0.0,0.0]); 
set_cam_up([0.0,1.0,0.0]);      

// TODO
console.log("hey!");