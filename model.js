import * as math from "mathjs";

export class Node {
  constructor(x, y) {
    this.x = [x, y];
    this.v = [0, 0];
    this.f = [0, 0];
    this.m = [0, 0];
    this.dof = [0, 0]; // each node has 2DOF in 2D case. this connects the dof to the disp vector in the structural matrix
    this.fixed = [false, false];

    this.xi = [x, y];

    this.steps = [[x, y]];
  }

  set mass(m) {
    this.m = [m, m];
  }

  set constraints(c) {
    this.fixed = c;
  }

  get constraints() {
    return this.fixed;
  }
}

export class Edge {
  constructor(n1, n2) {
    this.n1 = n1;
    this.n2 = n2;
    this.k = 1;
  }

  set stiffness(k) {
    this.k = k;
  }

  // rotation matrix
  static findT(x1, x2) {
    const d = math.subtract(x2, x1);
    const i = [1, 0];
    const j = [0, 1];

    const cos = math.dot(d, i) / math.norm(d);
    const sin = math.dot(d, j) / math.norm(d);

    return [
      [cos, sin],
      [-sin, cos],
    ];
  }
}

export class Element {
  constructor(e1, e2, e3) {
    this.e1 = e1;
    this.e2 = e2;
    this.e3 = e3;

    this.n1 = e1.n1;
    this.n2 = e1.n2;
    this.n3 = e2.n2;
  }
}

export class Mesh {
  constructor(nodes, edges, elements) {
    this.nodes = nodes;
    this.edges = edges;
    this.elements = elements;
  }
}

export function F(x, mesh, m) {
  let f = Array(mesh.nodes.length * 2).fill(0);

  // external force
  const G = 9.81;
  let f_ext = Array(mesh.nodes.length * 2).fill(0);
  mesh.nodes.forEach((n) => (f_ext[n.dof[1]] += -m[n.dof[1]] * G)); // assign gravity
  f = math.add(f, f_ext);

  // elastic force
  mesh.edges.forEach((e) => {
    const x_n1 = math.subset(x, math.index(e.n1.dof));
    const x_n2 = math.subset(x, math.index(e.n2.dof));

    const T = Edge.findT(x_n1, x_n2);
    const Ti = Edge.findT(e.n1.xi, e.n2.xi);

    const r = math.multiply(Ti, e.n2.xi)[0] - math.multiply(Ti, e.n1.xi)[0];

    const d1 = math.multiply(T, x_n1)[0] - math.multiply(Ti, e.n1.xi)[0];
    const d2 = math.multiply(T, x_n2)[0] - math.multiply(Ti, e.n2.xi)[0];

    const f1 = (e.k * (d2 - d1)) / r;
    const f_element = math.multiply(math.transpose(T), [f1, 0]);

    e.n1.dof.forEach((dof, i) => (f[dof] += f_element[i]));
    e.n2.dof.forEach((dof, i) => (f[dof] -= f_element[i]));
  });

  return f;
}

export function forwardEuler(t, dt, mesh) {
  const numSteps = parseInt(t / dt);
  let newMesh = structuredClone(mesh);

  console.log(newMesh);

  // Convert to vectors
  let x = newMesh.nodes.map((n) => n.x).flat();
  let v = newMesh.nodes.map((n) => n.v).flat();
  let m = newMesh.nodes.map((n) => n.m).flat();

  for (let i = 0; i < numSteps; i++) {
    // forward euler formulation
    let xn = x;
    let y = math.chain(x).add(math.multiply(v, dt)).done();

    x = math.add(
      y,
      math
        .chain(F(x, newMesh, m))
        .dotDivide(m)
        .multiply(dt ** 2)
        .done()
    );
    v = math.chain(x).subtract(xn).divide(dt).done();

    // enforce constraints
    newMesh.nodes.forEach((n) => {
      for (let i = 0; i < n.dof.length; i++) {
        if (n.fixed[i]) {
          x[n.dof[i]] = n.xi[i];
        }
      }
    });

    // store
    newMesh.nodes.forEach((n) => {
      n.steps.push(math.subset(x, math.index(n.dof)));
    });
  }

  return newMesh;
}
