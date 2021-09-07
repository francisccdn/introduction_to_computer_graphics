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

function Totoro() {
  const grey = [93, 90, 88];
  const beige = [78, 72, 58];
  const blue_light = [24, 22, 131];
  const blue_dark = [8, 10, 52];
  const green_light = [23, 30, 19];
  const green_dark = [11, 20, 14];
  const white = [205, 205, 205];

  const y_offset = 128;

  DrawTriangle(54, 2, 75, 1, 42, 26, grey, grey, grey);
  MidPointLineAlgorithm(42, y_offset - 102, 42, y_offset - 78, grey, grey);
  DrawTriangle(
    42,
    y_offset - 79,
    45,
    y_offset - 65,
    50,
    y_offset - 65,
    grey,
    grey,
    grey
  );
  MidPointLineAlgorithm(50, y_offset - 65, 65, y_offset - 55, grey, grey);
  MidPointLineAlgorithm(65, y_offset - 55, 84, y_offset - 54, grey, grey);
  DrawTriangle(
    84,
    y_offset - 54,
    105,
    y_offset - 55,
    108,
    y_offset - 79,
    grey,
    grey,
    grey
  );
  MidPointLineAlgorithm(107, y_offset - 56, 112, y_offset - 74, grey, grey);
  MidPointLineAlgorithm(112, y_offset - 74, 112, y_offset - 105, grey, grey);
  MidPointLineAlgorithm(112, y_offset - 105, 98, y_offset - 127, grey, grey);
  MidPointLineAlgorithm(76, y_offset - 126, 98, y_offset - 127, grey, grey);
  MidPointLineAlgorithm(107, y_offset - 56, 97, y_offset - 33, grey, grey);
  MidPointLineAlgorithm(91, y_offset - 27, 97, y_offset - 33, grey, grey);
  DrawTriangle(
    93,
    y_offset - 26,
    87,
    y_offset - 25,
    91,
    y_offset - 16,
    grey,
    grey,
    grey
  );
  DrawTriangle(
    86,
    y_offset - 26,
    79,
    y_offset - 31,
    68,
    y_offset - 25,
    green_dark,
    green_dark,
    green_light
  );
  DrawTriangle(
    66,
    y_offset - 24,
    61,
    y_offset - 14,
    58,
    y_offset - 25,
    grey,
    grey,
    grey
  );
  MidPointLineAlgorithm(58, y_offset - 25, 61, y_offset - 28, grey, grey);
  MidPointLineAlgorithm(61, y_offset - 28, 56, y_offset - 33, grey, grey);
  MidPointLineAlgorithm(56, y_offset - 33, 46, y_offset - 50, grey, grey);
  MidPointLineAlgorithm(46, y_offset - 50, 34, y_offset - 78, grey, grey);
  MidPointLineAlgorithm(34, y_offset - 78, 33, y_offset - 89, grey, grey);
  MidPointLineAlgorithm(33, y_offset - 89, 39, y_offset - 99, grey, grey);
  MidPointLineAlgorithm(33, y_offset - 99, 41, y_offset - 79, grey, grey);
  MidPointLineAlgorithm(41, y_offset - 79, 44, y_offset - 64, grey, grey);
  MidPointLineAlgorithm(44, y_offset - 64, 42, y_offset - 80, grey, grey);
  DrawTriangle(
    57,
    y_offset - 62,
    53,
    y_offset - 66,
    60,
    y_offset - 65,
    grey,
    beige,
    beige
  );
  DrawTriangle(
    70,
    y_offset - 58,
    66,
    y_offset - 62,
    75,
    y_offset - 62,
    grey,
    beige,
    beige
  );
  DrawTriangle(
    46,
    y_offset - 80,
    48,
    y_offset - 75,
    53,
    y_offset - 78,
    grey,
    beige,
    beige
  );
  DrawTriangle(
    60,
    y_offset - 77,
    62,
    y_offset - 71,
    67,
    y_offset - 77,
    grey,
    beige,
    beige
  );
  DrawTriangle(
    75,
    y_offset - 74,
    78,
    y_offset - 70,
    84,
    y_offset - 74,
    grey,
    beige,
    beige
  );
  DrawTriangle(
    88,
    y_offset - 75,
    93,
    y_offset - 71,
    97,
    y_offset - 74,
    grey,
    beige,
    beige
  );
  MidPointLineAlgorithm(83, y_offset - 57, 83, y_offset - 15, white, white);
  DrawTriangle(
    51,
    y_offset - 16,
    83,
    y_offset - 2,
    115,
    y_offset - 17,
    blue_light,
    blue_light,
    blue_dark
  );
  MidPointLineAlgorithm(42, y_offset - 41, 56, y_offset - 43, white, white);
  MidPointLineAlgorithm(56, y_offset - 47, 38, y_offset - 47, white, white);
  MidPointLineAlgorithm(42, y_offset - 53, 58, y_offset - 49, white, white);
  MidPointLineAlgorithm(95, y_offset - 43, 111, y_offset - 40, white, white);
  MidPointLineAlgorithm(99, y_offset - 46, 116, y_offset - 46, white, white);
  MidPointLineAlgorithm(97, y_offset - 49, 112, y_offset - 51, white, white);
}

// Function calls

Totoro();
