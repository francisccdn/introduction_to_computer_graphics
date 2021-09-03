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
function MidPointLineAlgorithm(x0, y0, x1, y1, color_0, color_1) {
  const x_start = x0,
    x_end = x1,
    y_start = y0,
    y_end = y1;

  // Set line equation alpha and beta values
  const alpha = y_end - y_start;
  const beta = -(x_end - x_start);
  
  // Declare first decision variable
  let decision = 2 * alpha + beta;
  
  for (let draw_x = x_start, draw_y = y_start; draw_x <= x_end; draw_x++) {
    // Draw a pixel current (draw_x, draw_y)
    color_buffer.putPixel(draw_x, draw_y, color_0);
    
    if (decision >= 0) {
      /* Northeast */
      draw_y++;
      
      decision += 2 * (alpha + beta);
    } else {
      /* East */
      decision += 2 * alpha;
    }
  }
}

// Draws a red pixel on start and end of line
function DebugLine(x0, y0, x1, y1) {
  color_buffer.putPixel(x0, y0, [255,0,0]);
  color_buffer.putPixel(x1, y1, [255,0,0]);
}

function DrawTriangle(x0, y0, x1, y1, x2, y2, color_0, color_1, color_2) {
  // TODO
}

// Function calls
MidPointLineAlgorithm(20, 10, 90, 30, [255, 255, 255]);
DebugLine(20, 10, 90, 30);
