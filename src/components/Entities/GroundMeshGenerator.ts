import { Mesh, Scene, StandardMaterial, Color3, VertexData } from "babylonjs";

export function generateGroundMesh(scene: Scene) {
  const groundMat = new StandardMaterial("GroundMaterial", scene);
  groundMat.diffuseColor = new Color3(0.5, 1, 0.5);
  groundMat.emissiveColor = new Color3(0.1, 0.1, 0.1);

  const groundMesh = new Mesh("GroundMesh", scene);

  const vertexData = generateVertexData();

  vertexData.applyToMesh(groundMesh);

  groundMesh.material = groundMat;
  groundMesh.checkCollisions = true;

  return groundMesh;
}

function generateVertexData() {
  const data = new VertexData();
  const positions: number[] = [];

  positions.push(...generateGrid(-8, -8));

  data.positions = positions;
  data.indices = positions
    .filter((value, index) => index % 3 === 0)
    .map((value, index) => index);
  return data;
}

function generateGrid(posX: number, posZ: number) {
  const gridScale = 2;
  const data: number[] = [];

  for (let i = 0; i < grid.length; i++) {
    for (let j = 0; j < grid[i].length; j++) {
      if (grid[i][j] === 1) {
        data.push(
          ...generateCube(
            posX + i * gridScale,
            0,
            posZ + j * gridScale,
            gridScale,
            1,
            gridScale
          )
        );
      }
    }
  }
  return data;
}

function generateCube(
  posX: number = 0,
  posY: number = 0,
  posZ: number = 0,
  scaleX: number = 1,
  scaleY: number = 1,
  scaleZ: number = 1
) {
  const data: number[] = [];
  cube.t.forEach(face => {
    data.splice(
      data.length,
      0,
      ...generateFace(face, posX, posY, posZ, scaleX, scaleY, scaleZ)
    );
  });
  return data;
}

function generateFace(
  face: number[],
  posX: number,
  posY: number,
  posZ: number,
  scaleX: number,
  scaleY: number,
  scaleZ: number
) {
  const data: number[] = [];
  face.forEach(vIndex => {
    data.push(
      cube.v[vIndex].x * scaleX + posX,
      cube.v[vIndex].y * scaleY + posY,
      cube.v[vIndex].z * scaleZ + posZ
    );
  });
  return data;
}

const grid = [
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 1, 0, 0, 0, 0, 1, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 1, 0, 0, 1, 1, 1, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
];

const cube = {
  t: [
    [4, 5, 6],
    [4, 6, 7],
    [0, 4, 7],
    [0, 7, 3],
    [0, 5, 4],
    [0, 1, 5],
    [0, 1, 5],
    [1, 6, 5],
    [1, 2, 6],
    [1, 2, 6],
    [2, 7, 6],
    [2, 3, 7],
    [2, 3, 7],
    [0, 3, 2],
    [0, 2, 1]
  ],
  v: [
    { x: -0.5, y: -0.5, z: -0.5 },
    { x: 0.5, y: -0.5, z: -0.5 },
    { x: 0.5, y: -0.5, z: 0.5 },
    { x: -0.5, y: -0.5, z: 0.5 },
    { x: -0.5, y: 0.5, z: -0.5 },
    { x: 0.5, y: 0.5, z: -0.5 },
    { x: 0.5, y: 0.5, z: 0.5 },
    { x: -0.5, y: 0.5, z: 0.5 }
  ]
};
