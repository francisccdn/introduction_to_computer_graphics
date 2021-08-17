// 3.5
// Use HTML canvas to draw shapes using javascript

const get_canvas_ctx = function () {
  const canvas = document.getElementById("problem-5-canvas");
  return canvas.getContext("2d");
};

const clear_canvas = function () {
  const canvas = document.getElementById("problem-5-canvas");
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, canvas.width, canvas.height);
};

const draw_smiley = function () {
  console.log(":)");
  const ctx = get_canvas_ctx();

  const base_x = 50;
  const base_y = 50;

  ctx.beginPath();
  // Left eye
  ctx.moveTo(base_x + 30, base_y + 10);
  ctx.lineTo(base_x + 30, base_y + 50);
  // Right eye
  ctx.moveTo(base_x + 60, base_y + 10);
  ctx.lineTo(base_x + 60, base_y + 50);
  // Mouth
  ctx.moveTo(base_x + 85, base_y + 55);
  ctx.arc(base_x + 45, base_y + 55, 40, 0, Math.PI, false);

  ctx.stroke();
};

const draw_colors = function () {
  const ctx = get_canvas_ctx();

  const base_x = 50;
  const base_y = 50;

  ctx.fillStyle = "rgb(243, 210, 76)"; // Yellow
  ctx.fillRect(base_x, base_y, 50, 50); // Square

  ctx.fillStyle = "rgba(0, 128, 255, 0.7)"; // Blue
  // Triangle
  ctx.beginPath();
  ctx.moveTo(base_x + 30, base_y + 15);
  ctx.lineTo(base_x + 95, base_y + 15);
  ctx.lineTo(base_x + 30, base_y + 85);
  ctx.fill();
};

const draw_soft = function () {
  const ctx = get_canvas_ctx();

  ctx.fillStyle = "rgba(0, 0, 0, 0.02)";
  ctx.fillRect(75, 75, 100, 100); // Square
}
