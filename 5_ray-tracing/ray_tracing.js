/*
Base code from:
Ray Tracer Template by ICG-UFPB on codepen.io - https://codepen.io/ICG-UFPB/pen/BaRqvpR
Specular lights, triangle primitives, scene and some improvements by Francisco Cunha (francisccdn);
*/

// Funcao que desenha um pixel colorido no canvas.
// Entrada:
//   x, y: Coordenadas de tela do pixel.
//   color: Cor do pixel no formato RGB (THREE.Vector3).
function PutPixel(x, y, color) {
  let c = document.getElementById("canvas");
  let ctx = c.getContext("2d");
  let r = Math.min(255, Math.max(0, Math.round(color.x * 255)));
  let g = Math.min(255, Math.max(0, Math.round(color.y * 255)));
  let b = Math.min(255, Math.max(0, Math.round(color.z * 255)));
  ctx.fillStyle = "rgb(" + r + "," + g + "," + b + ")";
  ctx.fillRect(x, y, 1, 2);
}

// Classe que representa um raio de luz.
// Construtor:
//   origin: Ponto de origem do raio (THREE.Vector3).
//   direction: Vetor unitario que indica a direcao do raio (THREE.Vector3).
class Raio {
  constructor(origin, direction) {
    this.origin = origin;
    this.direction = direction;
  }
}

// Classe que representa a camera.
// Construtor:
//   Sem parametros. Os atributos da camera estao 'hard coded' no construtor.
class Camera {
  constructor() {
    this.resolucaoX = 512; // Resolucao do sensor em X.
    this.resolucaoY = 512; // Resolucao do sensor em Y.
    this.d = 1.0; // Distancia do sensor em relacao a posicao da camera.
    this.xMin = -1.0; // Extremidade esquerda do sensor.
    this.xMax = 1.0; // Extremidade direita do sensor.
    this.yMin = -1.0; // Extremidade inferior do sensor.
    this.yMax = 1.0; // Extremidade superior do sensor.
    this.k = new THREE.Vector3(this.xMin, this.yMax, -this.d); // Canto superior esquerdo do sensor.
    this.a = new THREE.Vector3(this.xMax - this.xMin, 0.0, 0.0); // Vetor para calculo de um ponto sobre o sensor.
    this.b = new THREE.Vector3(0.0, this.yMin - this.yMax, 0.0); // Vetor para calculo de um ponto sobre o sensor.
  }

  // Metodo que converte coordenadas (x,y) de tela para um raio
  // primario que passa pelo centro do pixel no espaco do universo.
  // Entrada:
  //   x, y: Coordenadas de tela do pixel.
  // Retorno:
  //   Um objeto do tipo Raio.
  raio(x, y) {
    let u = (x + 0.5) / this.resolucaoX;
    let v = (y - 0.5) / this.resolucaoY;
    let p = this.a
      .clone()
      .multiplyScalar(u)
      .add(this.b.clone().multiplyScalar(v))
      .add(this.k);

    let origin = new THREE.Vector3(0.0, 0.0, 0.0);
    let direction = p.normalize();

    return new Raio(origin, direction);
  }
}

// Classe que representa um ponto de interseccao entre o raio e uma primitiva.
// Construtor:
//   Sem parametros. As propriedades de um objeto desta classe sao preenchidas
//   assim que uma interseccao raio-primitiva e detectada.
class Interseccao {
  constructor() {
    this.t = Infinity; // distancia entre a origem do rio e o ponto de intersecao.
    this.position = new THREE.Vector3(0.0, 0.0, 0.0); // Coordenadas do ponto de interseccao.
    this.normal = new THREE.Vector3(0.0, 0.0, 0.0); // Vetor normal no ponto de interseccao.
  }
}

// Classe que representa uma primitiva do tipo esfera.
// Construtor:
//   centro: Coordenadas do centro da esfera no espaco do universo (THREE.Vector3).
//   raio: Raio da esfera.
//   kd: Coeficiente de reflectancia difusa da esfera.
//   ka: Coeficiente de reflectancia ambiente da esfera.
//   ks: Coeficiente de reflectancia especular da esfera.
//   n_highlight: Expoente n de reflectancia especular.
class Esfera {
  constructor(centro, raio, kd, ka, ks, n_highlight) {
    this.centro = centro;
    this.raio = raio;
    this.kd = kd;
    this.ka = ka;
    this.ks = ks;
    this.n_highlight = n_highlight;
  }

  // Metodo que testa a interseccao entre o raio e a esfera.
  // Entrada:
  //   raio: Objeto do tipo Raio cuja a interseccao com a esfera se quer verificar.
  //   interseccao: Objeto do tipo Interseccao que armazena os dados da interseccao caso esta ocorra.
  // Retorno:
  //   Um valor booleano: 'true' caso haja interseccao; ou 'false' caso contrario.
  intersect(raio, interseccao) {
    let a = raio.direction.clone().dot(raio.direction);
    let o_c = raio.origin.clone().sub(this.centro);
    let b = 2.0 * raio.direction.clone().dot(o_c);
    let c = o_c.clone().dot(o_c) - this.raio * this.raio;

    let disc = b * b - 4.0 * a * c;

    if (disc > 0.0) {
      let t1 = (-b + Math.sqrt(disc)) / (2.0 * a);
      let t2 = (-b - Math.sqrt(disc)) / (2.0 * a);

      interseccao.t = t1;

      if (t2 > 0.001 && t2 < t1) interseccao.t = t2;

      if (interseccao.t > 0.001) {
        interseccao.position = raio.origin
          .clone()
          .add(raio.direction.clone().multiplyScalar(interseccao.t));
        interseccao.normal = interseccao.position
          .clone()
          .sub(this.centro)
          .normalize();
        return true;
      }

      return false;
    }

    return false;
  }
}

// Triangle primitive class
//   a, b, c: Triangle vertices
//   kd, ka, ks, n_highlight: Material/lighting variables
class Triangle {
  constructor(a, b, c, kd, ka, ks, n_highlight) {
    this.a = a;
    this.b = b;
    this.c = c;

    this.kd = kd;
    this.ka = ka;
    this.ks = ks;
    this.n_highlight = n_highlight;
  }

  intersect(ray, intersection) {
    // Axis of "triangle space"/tuv-space
    const T = new THREE.Vector3().subVectors(ray.origin, this.a);
    const E1 = new THREE.Vector3().subVectors(this.b, this.a);
    const E2 = new THREE.Vector3().subVectors(this.c, this.a);

    // Triangle normal
    const normal = new THREE.Vector3().crossVectors(E2, E1);

    // Pre-computing part 1
    const triple_product = ray.direction.dot(normal);

    // Backface culling (done as early as possible to save on processing)
    if (triple_product >= -0.001) return false;

    // Pre-computing part 2
    const DxE2 = new THREE.Vector3().crossVectors(ray.direction, E2);
    const TxE1 = new THREE.Vector3().crossVectors(T, E1);

    // Calculate u
    const u = DxE2.dot(T) / triple_product;

    // If ray doesn't intersect
    if (u < 0 || u > 1) return false;

    // Calculate v
    const v = TxE1.dot(ray.direction) / triple_product;

    // If ray doesn't intersect
    if (v < 0 || v > 1 || u + v > 1) return false;

    // Calculate intersection data
    intersection.t = TxE1.dot(E2) / triple_product;
    intersection.normal = normal.normalize(); // Normalized normal for lighting
    intersection.position = this.a
      .clone()
      .add(E1.multiplyScalar(u))
      .add(E2.multiplyScalar(v)); // Barycentric coords

    // If previous checks failed, ray intercepts triangle
    return true;
  }
}

// Classe que representa uma fonte de luz pontual.
// Construtor:
//   position: Posicao da fonte de luz pontual no espaco (THREE.Vector3).
//   cor: Cor da fonte de luz no formato RGB (THREE.Vector3).
class Luz {
  constructor(position, cor) {
    this.position = position;
    this.cor = cor;
  }
}

// Funcao que renderiza a cena utilizando ray tracing.
function Render() {
  const camera = new Camera();
  const objects = [];

  // SCENE

  const Vector3 = (a, b, c) => {
    return new THREE.Vector3(a, b, c);
  };

  // Cherry
  objects.push(
    new Esfera(
      new THREE.Vector3(0, 1.8, -3),
      0.2,
      Vector3(1, 0, 0),
      Vector3(1, 0, 0),
      Vector3(1, 1, 1),
      32
    )
  );

  // Ice cream
  objects.push(
    new Esfera(
      new THREE.Vector3(0, 1, -3),
      0.6,
      Vector3(0.8, 0.8, 1),
      Vector3(0, 0, 0.9),
      Vector3(0.4, 0.4, 0.4),
      16
    )
  );
  objects.push(
    new Esfera(
      new THREE.Vector3(0, 0.2, -3),
      0.85,
      Vector3(1, 1, 1),
      Vector3(1, 1, 0.3),
      Vector3(0.3, 0.3, 0.3),
      16
    )
  );

  // Cone
  const cone_kd = Vector3(1, 0.5, 0.1);
  const cone_ka = Vector3(0.8, 0.6, 0.2);
  const cone_ks = Vector3(0.4, 0.4, 0.4);
  const cone_n = 0.8;

  objects.push(
    new Triangle(
      Vector3(-0.9, 0, -3),
      Vector3(-0.6, 0, -2.3),
      Vector3(0.0, -2.4, -3),
      cone_kd,
      cone_ka,
      cone_ks,
      cone_n
    )
  );
  objects.push(
    new Triangle(
      Vector3(-0.6, 0, -2.3),
      Vector3(-0.2, 0, -2),
      Vector3(0.0, -2.4, -3),
      cone_kd,
      cone_ka,
      cone_ks,
      cone_n
    )
  );
  objects.push(
    new Triangle(
      Vector3(-0.2, 0, -2),
      Vector3(0, 0, -2),
      Vector3(0.0, -2.4, -3),
      cone_kd,
      cone_ka,
      cone_ks,
      cone_n
    )
  );
  objects.push(
    new Triangle(
      Vector3(0.6, 0, -2.3),
      Vector3(0.9, 0, -3),
      Vector3(0.0, -2.4, -3),
      cone_kd,
      cone_ka,
      cone_ks,
      cone_n
    )
  );
  objects.push(
    new Triangle(
      Vector3(0.2, 0, -2),
      Vector3(0.6, 0, -2.3),
      Vector3(0.0, -2.4, -3),
      cone_kd,
      cone_ka,
      cone_ks,
      cone_n
    )
  );
  objects.push(
    new Triangle(
      Vector3(0, 0, -2),
      Vector3(0.2, 0, -2),
      Vector3(0.0, -2.4, -3),
      cone_kd,
      cone_ka,
      cone_ks,
      cone_n
    )
  );

  const Ip = new Luz(
    new THREE.Vector3(8.0, 9.0, 3.0),
    new THREE.Vector3(0.8, 0.8, 0.8)
  );
  const Ia = new THREE.Vector3(0.2, 0.2, 0.2); // Intensidade da luz ambiente.

  // Lacos que percorrem os pixels do sensor.
  for (let y = 0; y < 512; ++y)
    for (let x = 0; x < 512; ++x) {
      let raio = camera.raio(x, y); // Construcao do raio primario que passa pelo centro do pixel de coordenadas (x,y).
      let interseccao = new Interseccao();

      for (obj of objects) {
        if (obj.intersect(raio, interseccao)) {
          // Se houver interseccao entao...
          const ambient_term = Ia.clone().multiply(obj.ka); // Calculo do termo ambiente do modelo local de iluminacao.
          const L = Ip.position.clone().sub(interseccao.position).normalize(); // Vetor que aponta para a fonte e luz pontual.

          // Calculo do termo difuso do modelo local de iluminacao.
          const diffuse_term = Ip.cor
            .clone()
            .multiply(obj.kd)
            .multiplyScalar(Math.max(0.0, interseccao.normal.dot(L)));

          // Specular term for local illumination model
          const V = interseccao.position.clone().normalize().multiplyScalar(-1); // Direction from point to camera
          const R = L.clone().reflect(interseccao.normal).multiplyScalar(-1); // Reflected L (points from point to light source) along normal

          const specular_term = Ip.cor
            .clone()
            .multiply(obj.ks)
            .multiplyScalar(Math.pow(Math.max(0, R.dot(V)), obj.n_highlight));

          // Final color fragment will assume
          const fragment_color = diffuse_term
            .add(ambient_term)
            .add(specular_term);

          PutPixel(x, y, fragment_color);
        }
      }
    }
}

Render(); // Invoca o ray tracer.
