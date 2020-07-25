import { Mesh, Vector3 } from "babylonjs";

export abstract class Entity {
  protected mesh: Mesh;
  protected position: Vector3;
  protected rotation: Vector3;

  constructor(
    mesh: Mesh,
    position: Vector3 = Vector3.Zero(),
    rotation: Vector3 = Vector3.Zero()
  ) {
    this.mesh = mesh;
    this.mesh.position = position;
    this.mesh.rotation = rotation;
    this.position = this.mesh.position;
    this.rotation = this.mesh.position;
  }

  public getMesh() {
    return this.mesh;
  }

  protected updateMeshPosition() {
    this.position = this.mesh.position;
    this.rotation = this.mesh.position;
  }

  public tick() {
    this.updateMeshPosition();
  }
}
