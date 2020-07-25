import { Mesh, Vector3, Scene } from "babylonjs";
import { Entity } from "./Entity";

export abstract class MovableEntity extends Entity {
  protected maxSpeed: number;
  protected maxAcceleration: number;
  protected maxSpeedAng: number;
  protected speed: Vector3;
  protected acceleration: Vector3;

  constructor(
    mesh: Mesh,
    maxSpeed: number = 0,
    maxSpeedAng: number = 0,
    maxAcceleration: number = 0,
    position: Vector3 = Vector3.Zero(),
    rotation: Vector3 = Vector3.Zero()
  ) {
    super(mesh, position, rotation);

    this.maxSpeed = maxSpeed;
    this.maxSpeedAng = maxSpeedAng;
    this.maxAcceleration = maxAcceleration;
    this.speed = Vector3.Zero();
    this.acceleration = Vector3.Zero();
  }

  private getFrictionVector() {
    const res = this.speed.normalizeToNew().scale(-this.maxAcceleration / 2);
    if (Math.abs(res.x) > Math.abs(this.speed.x)) {
      res.x = -this.speed.x;
    }
    if (Math.abs(res.y) > Math.abs(this.speed.y)) {
      res.y = -this.speed.y;
    }
    if (Math.abs(res.z) > Math.abs(this.speed.z)) {
      res.z = -this.speed.z;
    }
    return res;
  }

  private move() {
    if (this.speed.length() + this.acceleration.length() <= this.maxSpeed) {
      this.speed.addInPlace(this.acceleration);
    }
    this.speed.addInPlace(this.getFrictionVector());

    if (this.speed.length() > 0.001) {
      this.mesh.moveWithCollisions(this.speed);
    }
  }

  public tick() {
    this.move();
    /*if (this.acceleration.length() > 0.001) {
      let accelDir = Math.PI - Math.acos(this.acceleration.normalizeToNew().x);
      accelDir = this.acceleration.z < 0 ? 2 * Math.PI - accelDir : accelDir;

      if (Math.abs(accelDir - this.rotation.y) > this.maxSpeedAng * 1.5) {
        let dir = 1;

        if (this.rotation.y >= accelDir) {
          dir = -1;
          if (this.rotation.y - accelDir > Math.PI) {
            dir = 1;
          }
        } else {
          dir = 1;
          if (accelDir - this.rotation.y > Math.PI) {
            dir = -1;
          }
        }
        this.rotation.y += this.maxSpeedAng * dir;
        this.rotation.y %= Math.PI * 2;
        this.rotation.y += this.rotation.y < 0 ? Math.PI * 2 : 0;
      } else {
        this.rotation.y = accelDir;
      }
    }*/
    super.tick();
  }

  public applyAcceleration(acceleration: Vector3) {
    this.acceleration = acceleration.normalize().scale(this.maxAcceleration);
  }
}

//Entity rotation code
