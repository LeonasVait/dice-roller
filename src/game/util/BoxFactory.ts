import {
  Scene,
  Vector3,
  BoxBuilder,
  PhysicsImpostor,
  Material,
  StandardMaterial,
} from "babylonjs";

export class BoxFactory {
  private counter: number;
  private prefix: string;
  private mass: number;
  private size: Vector3;
  private material: Material;
  private readonly scene: Scene;
  constructor(scene: Scene) {
    this.scene = scene;
    this.counter = 0;
    this.prefix = "";
    this.mass = 0;
    this.size = new Vector3(0, 0, 0);
    this.material = this.scene.defaultMaterial;
  }

  withSize(size: Vector3) {
    this.size = size;
    return this;
  }
  withPrefix(prefix: string) {
    this.prefix = prefix;
    return this;
  }

  withMaterial(material: Material) {
    this.material = material;
    return this;
  }

  withMass(mass: number) {
    this.mass = mass;
    return this;
  }

  make(position: Vector3) {
    const box = BoxBuilder.CreateBox(
      `${this.prefix}${this.counter}`,
      { width: this.size.x, depth: this.size.z, height: this.size.y },
      this.scene
    );
    this.counter++;

    box.position = position;

    box.physicsImpostor = new PhysicsImpostor(
      box,
      PhysicsImpostor.BoxImpostor,
      { mass: this.mass, restitution: 0.9, friction: 0.02 },
      this.scene
    );

    box.material = this.material;

    return box;
  }
}
