// Canvas class by ICG-UFPB on codepen.io - https://codepen.io/ICG-UFPB/pen/oNWaQjM
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

// Midpoint Line Algorithm with color interpolation
function MidPointLineAlgorithm(x0, y0, x1, y1, color0, color1) {
  // Get octant of line
  let octant = 1;

  if (Math.abs(x1 - x0) > Math.abs(y1 - y0)) {
    if (x1 > x0) {
      if (y1 > y0) {
        octant = 1;
      } else {
        octant = 8;
      }
    } else {
      if (y1 > y0) {
        octant = 4;
      } else {
        octant = 5;
      }
    }
  } else {
    if (x1 > x0) {
      if (y1 > y0) {
        octant = 2;
      } else {
        octant = 7;
      }
    } else {
      if (y1 > y0) {
        octant = 3;
      } else {
        octant = 6;
      }
    }
  }

  // Set variables according to octant

  // a is the coordinate that is always in/decremented
  // b is the coordinate that changes based on the decision variable
  let a_start = x0,
    a_end = x1,
    b_start = y0,
    b_end = y1;

  let b_mod = 1;
  let a_mod = 1;
  let tall = false;

  if (octant == 2 || octant == 3 || octant == 6 || octant == 7) {
    tall = true;
  }
  if (octant == 3 || octant == 4 || octant == 5 || octant == 6) {
    const aux = color0;
    color0 = color1;
    color1 = aux;
  }
  if (octant == 4 || octant == 8) {
    b_mod = -1;
  }
  if (octant == 3 || octant == 7) {
    a_mod = -1;
  }
  if (octant == 2 || octant == 7) {
    a_start = y0;
    a_end = y1;
    b_start = x0;
    b_end = x1;
  }
  if (octant == 3 || octant == 6) {
    a_start = y1;
    a_end = y0;
    b_start = x1;
    b_end = x0;
  }
  if (octant == 4 || octant == 5) {
    a_start = x1;
    a_end = x0;
    b_start = y1;
    b_end = y0;
  }

  // Set line equation alpha and beta values
  const alpha = (b_end - b_start) * b_mod;
  const beta = -(a_end - a_start) * a_mod;

  // Declare first decision variable
  let decision = 2 * alpha + beta;
  let draw_a = a_start,
    draw_b = b_start;

  while (draw_a != a_end) {
    // Set color of next pixel
    let color = [];
    for (let i = 0; i < 3; i++) {
      color.push(
        ((color1[i] - color0[i]) * (draw_a - a_start)) / (a_end - a_start) +
          color0[i]
      );
    }

    // Draw a pixel at current coordinates
    if (!tall) {
      color_buffer.putPixel(draw_a, draw_b, color);
    } else {
      color_buffer.putPixel(draw_b, draw_a, color);
    }

    if (decision >= 0) {
      draw_b += b_mod;

      decision += 2 * (alpha + beta);
    } else {
      decision += 2 * alpha;
    }
    draw_a += a_mod;
  }
  // Draw last pixel
  color_buffer.putPixel(x1, y1, color1);
}

// Draws a red pixel on start and end of line
function DebugLine(x0, y0, x1, y1) {
  color_buffer.putPixel(x0, y0, [255, 0, 0]);
  color_buffer.putPixel(x1, y1, [255, 0, 0]);
}

// Draws a tringle with Midpoint Line Algorithm
function DrawTriangle(x0, y0, x1, y1, x2, y2, color0, color1, color2) {
  MidPointLineAlgorithm(x0, y0, x1, y1, color0, color1);
  MidPointLineAlgorithm(x1, y1, x2, y2, color1, color2);
  MidPointLineAlgorithm(x2, y2, x0, y0, color2, color0);
}

// Function calls

DrawTriangle(25, 30, 50, 100, 100, 15, [255,0,0,255], [0,0,255,255], [0,255,0,255]);