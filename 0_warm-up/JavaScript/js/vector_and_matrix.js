// 3.4
// Create a class for 3 element vectors and for 3x3 matrixes

const Vector3 = class {
  constructor(x, y, z) {
    this.x = x;
    this.y = y;
    this.z = z;
  }

  get module() {
    return this.calcModule();
  }

  toHtml() {
    return `
    ${this.x} <br>
    ${this.y} <br>
    ${this.z} <br>
    `;
  }

  calcModule() {
    return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
  }

  static cross(a, b) {
    const x = a.y * b.z - a.z * b.y;
    const y = a.z * b.x - a.x * b.z;
    const z = a.x * b.y - a.y * b.x;
    return new Vector3(x, y, z);
  }

  static dot(a, b) {
    return a.x * b.x + a.y * b.y + a.z * b.z;
  }
};

const Matrix3x3 = class {
  constructor(col0, col1, col2) {
    this.el = [
      [col0.x, col1.x, col2.x],
      [col0.y, col1.y, col2.y],
      [col0.z, col1.z, col2.z],
    ];
  }

  toHtml() {
    return `
    ${this.el[0][0]}   ${this.el[0][1]}   ${this.el[0][2]} <br>
    ${this.el[1][0]}   ${this.el[1][1]}   ${this.el[1][2]} <br>
    ${this.el[2][0]}   ${this.el[2][1]}   ${this.el[2][2]} <br>
    `;
  }

  col(n) {
    return new Vector3(this.el[0][n], this.el[1][n], this.el[2][n]);
  }

  get determinant() {
    return this.calcDeterminant();
  }

  get transpose() {
    return Matrix3x3.transpose(this);
  }

  calcDeterminant() {
    const a = this.el[0][0];
    const b = this.el[0][1];
    const c = this.el[0][2];
    const d = this.el[1][0];
    const e = this.el[1][1];
    const f = this.el[1][2];
    const g = this.el[2][0];
    const h = this.el[2][1];
    const i = this.el[2][2];

    return (
      a * e * i - a * f * h - b * d * i + b * f * g + c * d * h - c * e * g
    );
  }

  static transpose(mat) {
    return new Matrix3x3(
      new Vector3(mat.el[0][0], mat.el[0][1], mat.el[0][2]),
      new Vector3(mat.el[1][0], mat.el[1][1], mat.el[1][2]),
      new Vector3(mat.el[2][0], mat.el[2][1], mat.el[2][2])
    );
  }

  static mult_matrix_vec(mat, vec) {
    let v = [];

    for (let i = 0; i < 3; i++) {
      v.push(
        vec.x * mat.el[i][0] + vec.y * mat.el[i][1] + vec.z * mat.el[i][2]
      );
    }

    return new Vector3(v[0], v[1], v[2]);
  }

  static mult_matrix(a, b) {
    const col = [];
    for (let i = 0; i < 3; i++) {
      col.push(Matrix3x3.mult_matrix_vec(a, b.col(i)));
    }
    return new Matrix3x3(col[0], col[1], col[2]);
  }
};

// Handling user interaction

const get_html_matrix = function (a_or_b) {
  const cols = [];

  for (let i = 0; i < 3; i++) {
    cols.push(
      new Vector3(
        document.getElementById(`m-${a_or_b}-0${i}`).value,
        document.getElementById(`m-${a_or_b}-1${i}`).value,
        document.getElementById(`m-${a_or_b}-2${i}`).value
      )
    );
  }

  return new Matrix3x3(cols[0], cols[1], cols[2]);
};

const get_html_vector = function (a_or_b) {
  return new Vector3(
    document.getElementById(`v-${a_or_b}-0`).value,
    document.getElementById(`v-${a_or_b}-1`).value,
    document.getElementById(`v-${a_or_b}-2`).value
  );
};

const write_answer = function (string) {
  document.getElementById("problem-4-answer").innerHTML = string;
};

const module_vec_a = function () {
  write_answer(get_html_vector("a").module.toString());
};

const cross_vec_a_b = function () {
  const a = get_html_vector("a");
  const b = get_html_vector("b");
  const cross = Vector3.cross(a, b);
  write_answer(cross.toHtml());
};

const dot_vec_a_b = function () {
  const a = get_html_vector("a");
  const b = get_html_vector("b");
  const dot = Vector3.dot(a, b);
  write_answer(dot.toString());
};

const vec_mat = function () {
  const vec = get_html_vector("a");
  const mat = get_html_matrix("a");
  const res = Matrix3x3.mult_matrix_vec(mat, vec);
  write_answer(res.toHtml());
};

const mat_mat = function () {
  const a = get_html_matrix("a");
  const b = get_html_matrix("b");
  const res = Matrix3x3.mult_matrix(a, b);
  write_answer(res.toHtml());
};

const determinant_mat_a = function () {
  write_answer(get_html_matrix("a").determinant.toString());
};

const transpose_mat_a = function () {
  write_answer(get_html_matrix("a").transpose.toHtml());
};
