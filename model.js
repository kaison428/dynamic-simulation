class Node {
  constructor(x, y) {
    this.x = [x, y];
    this.v = [0, 0];
    this.f = [0, 0];

    this.xi = [x, y];
    this.dof = [0, 0]; // each node has 2DOF in 2D case. this connects the dof to the disp vector in the structural matrix

    this.steps = [x, y];
  }
}

export { Node };
