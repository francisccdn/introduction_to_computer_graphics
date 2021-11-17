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
//   origem: Ponto de origem do raio (THREE.Vector3).
//   direcao: Vetor unitario que indica a direcao do raio (THREE.Vector3).
class Raio {
  constructor(origem, direcao) {
    this.origem = origem;
    this.direcao = direcao;
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

    let origem = new THREE.Vector3(0.0, 0.0, 0.0);
    let direcao = p.normalize();

    return new Raio(origem, direcao);
  }
}

// Classe que representa um ponto de interseccao entre o raio e uma primitiva.
// Construtor:
//   Sem parametros. As propriedades de um objeto desta classe sao preenchidas
//   assim que uma interseccao raio-primitiva e detectada.
class Interseccao {
  constructor() {
    this.t = Infinity; // distancia entre a origem do rio e o ponto de intersecao.
    this.posicao = new THREE.Vector3(0.0, 0.0, 0.0); // Coordenadas do ponto de interseccao.
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
  interseccionar(raio, interseccao) {
    let a = raio.direcao.clone().dot(raio.direcao);
    let o_c = raio.origem.clone().sub(this.centro);
    let b = 2.0 * raio.direcao.clone().dot(o_c);
    let c = o_c.clone().dot(o_c) - this.raio * this.raio;

    let disc = b * b - 4.0 * a * c;

    if (disc > 0.0) {
      let t1 = (-b + Math.sqrt(disc)) / (2.0 * a);
      let t2 = (-b - Math.sqrt(disc)) / (2.0 * a);

      interseccao.t = t1;

      if (t2 > 0.001 && t2 < t1) interseccao.t = t2;

      if (interseccao.t > 0.001) {
        interseccao.posicao = raio.origem
          .clone()
          .add(raio.direcao.clone().multiplyScalar(interseccao.t));
        interseccao.normal = interseccao.posicao
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

// Classe que representa uma fonte de luz pontual.
// Construtor:
//   posicao: Posicao da fonte de luz pontual no espaco (THREE.Vector3).
//   cor: Cor da fonte de luz no formato RGB (THREE.Vector3).
class Luz {
  constructor(posicao, cor) {
    this.posicao = posicao;
    this.cor = cor;
  }
}

// Funcao que renderiza a cena utilizando ray tracing.
function Render() {
  const camera = new Camera();
  const objects = [];

  objects.push(
    new Esfera(
      new THREE.Vector3(0.0, 0.0, -3.0),
      1.0,
      new THREE.Vector3(1, 0, 0),
      new THREE.Vector3(1, 0, 0),
      new THREE.Vector3(1, 1, 1),
      32
    )
  );

  const Ip = new Luz(
    new THREE.Vector3(-10.0, 10.0, 4.0),
    new THREE.Vector3(0.8, 0.8, 0.8)
  );
  const Ia = new THREE.Vector3(0.2, 0.2, 0.2); // Intensidade da luz ambiente.

  // Lacos que percorrem os pixels do sensor.
  for (let y = 0; y < 512; ++y)
    for (let x = 0; x < 512; ++x) {
      let raio = camera.raio(x, y); // Construcao do raio primario que passa pelo centro do pixel de coordenadas (x,y).
      let interseccao = new Interseccao();

      for (obj of objects) {
        if (obj.interseccionar(raio, interseccao)) {
          // Se houver interseccao entao...
          const ambient_term = Ia.clone().multiply(obj.ka); // Calculo do termo ambiente do modelo local de iluminacao.
          const L = Ip.posicao.clone().sub(interseccao.posicao).normalize(); // Vetor que aponta para a fonte e luz pontual.

          // Calculo do termo difuso do modelo local de iluminacao.
          const diffuse_term = Ip.cor
            .clone()
            .multiply(obj.kd)
            .multiplyScalar(Math.max(0.0, interseccao.normal.dot(L)));

          // Specular term for local illumination model
          const V = interseccao.posicao.clone().normalize().multiplyScalar(-1); // Direction from point to camera
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
        } else {
          // Senao houver interseccao entao...
          PutPixel(x, y, new THREE.Vector3(0.0, 0.0, 0.0)); // Pinta o pixel com a cor de fundo.
        }
      }
    }
}

Render(); // Invoca o ray tracer.
