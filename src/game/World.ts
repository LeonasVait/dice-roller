import {
  Engine,
  Scene,
  ArcRotateCamera,
  TargetCamera,
  Vector3,
  BoxBuilder,
  PointLight,
  CannonJSPlugin,
  PhysicsImpostor,
  Quaternion,
  PhysicsJoint,
  Mesh,
  StandardMaterial,
  Color3,
} from "babylonjs";
import {
  AdvancedDynamicTexture,
  TextBlock,
  Control,
  Button,
} from "babylonjs-gui";

import * as CANNON from "cannon";
import { groupEnd } from "console";

import { BoxFactory } from "./util/BoxFactory";
import { Rotation } from "./util/Rotation";

function initializeScene(scene: Scene) {
  scene.enablePhysics(new Vector3(0, -10, 0), new CannonJSPlugin());

  const physicsEngine = scene.getPhysicsEngine();

  const camera = new ArcRotateCamera(
    "PlayerCamera",
    Math.PI / 2,
    0,
    3,
    new Vector3(0, 0, 0),
    scene
  );
  camera.fov = 0.8;

  const light = new PointLight("l1", camera.position, scene);
}

function makeEntities(scene: Scene) {
  const matX = new StandardMaterial("MaterialXAxis", scene);
  matX.diffuseColor = new Color3(1, 0, 0);
  const matY = new StandardMaterial("MaterialYAxis", scene);
  matY.diffuseColor = new Color3(0, 1, 0);
  const matZ = new StandardMaterial("MaterialZAxis", scene);
  matZ.diffuseColor = new Color3(0, 0, 1);
  const matTransp = new StandardMaterial("MaterialTransparent", scene);
  matTransp.diffuseColor = new Color3(1, 1, 1);
  matTransp.alpha = 0;

  const boxFactory = new BoxFactory(scene)
    .withPrefix("ground")
    .withMass(0)
    .withSize(new Vector3(0.02, 0.02, 0.02));

  boxFactory.make(new Vector3(0, 0, 1.0));
  boxFactory.withMaterial(matX).make(new Vector3(0.1, 0, 1.0));
  boxFactory.withMaterial(matY).make(new Vector3(0, 0.1, 1.0));
  boxFactory.withMaterial(matZ).make(new Vector3(0, 0, 1.1));

  boxFactory
    .withMaterial(scene.defaultMaterial)
    .withSize(new Vector3(1, 0.1, 1));

  const ground0 = boxFactory.make(new Vector3(0, -0.05, 0));
  const ground5 = boxFactory
    .withMaterial(matTransp)
    .make(new Vector3(0, 0.55, 0));
  ground5.parent = ground0;

  const ground1 = boxFactory
    .withMaterial(scene.defaultMaterial)
    .withSize(new Vector3(0.1, 0.7, 1.2))
    .make(new Vector3(0.55, 0.25, 0));

  ground1.parent = ground0;

  const ground2 = boxFactory.make(new Vector3(-0.55, 0.25, 0));
  ground2.parent = ground0;

  const ground3 = boxFactory
    .withSize(new Vector3(1, 0.7, 0.1))
    .make(new Vector3(0, 0.25, 0.55));
  ground3.parent = ground0;

  const ground4 = boxFactory.make(new Vector3(0, 0.25, -0.55));
  ground4.parent = ground0;

  const dice1 = boxFactory
    .withPrefix("dice")
    .withSize(new Vector3(0.1, 0.1, 0.1))
    .withMass(1)
    .make(new Vector3(0.2, 0.1, 0));
}

function makeUi(scene: Scene) {
  const advancedTexture = AdvancedDynamicTexture.CreateFullscreenUI(
    "UI",
    true,
    scene
  );

  const button = Button.CreateSimpleButton("but", "Apply Impulse");
  button.width = 0.2;
  button.height = "40px";
  button.color = "white";
  button.verticalAlignment = Control.VERTICAL_ALIGNMENT_BOTTOM;
  button.background = "#1388AF";
  button.top = "-10px";
  advancedTexture.addControl(button);

  const text1 = new TextBlock();
  text1.text = "no Data";
  text1.color = "white";
  text1.fontSize = 10;
  text1.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
  text1.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
  text1.textVerticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
  text1.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
  text1.paddingLeft = 10;
  text1.paddingTop = 10;
  advancedTexture.addControl(text1);

  return [button, text1];
}

let simRotation: Rotation = new Rotation(0, 0, 0);
let deviceRotation: Rotation = new Rotation(0, 0, 0);

function linkSensors(scene: Scene) {
  window.addEventListener("deviceorientation", (event) => {
    if (event.alpha && event.beta && event.gamma) {
      let alpha = (event.alpha / 180) * Math.PI;
      let beta = (event.beta / 180) * Math.PI;
      let gamma = (event.gamma / 180) * Math.PI;

      alpha -= Math.PI;
      alpha = alpha < 0 ? 2 * Math.PI + alpha : alpha;
      alpha = 2 * Math.PI - alpha;
      beta = beta < 0 ? 2 * Math.PI + beta : beta;
      gamma = gamma < 0 ? 2 * Math.PI + gamma : gamma;

      deviceRotation = new Rotation(alpha, beta, gamma);
    }
  });
}

function getRotationSubSteps(rotA: Rotation, rotB: Rotation): Rotation[] {
  const deltaRotation = rotA.dist(rotB);

  const limitDelta = 0.04;
  const deltaSum = deltaRotation.magSum();
  const subStepsCount = Math.floor(deltaSum / limitDelta) + 1;
  const step = deltaRotation.divScalar(subStepsCount);

  const rotationSteps: Rotation[] = [];
  for (let i = 1; i < subStepsCount; i++) {
    rotationSteps.push(step.multScalar(i).add(rotA).normalize());
  }
  rotationSteps.push(rotB);
  return rotationSteps;
}

function JSONFloatPrec2(key: any, val: any) {
  return val.toFixed ? Number(val.toFixed(2)) : val;
}

let rotMaxSteps = 0;

export class World {
  public readonly engine: Engine;
  private readonly canvas: HTMLCanvasElement;
  private readonly scene: Scene;
  private readonly ui: Control[];

  constructor(canvas: HTMLCanvasElement) {
    window.CANNON = CANNON;
    this.canvas = canvas;
    this.engine = new Engine(this.canvas);
    this.scene = new Scene(this.engine);
    this.ui = makeUi(this.scene);

    initializeScene(this.scene);

    makeEntities(this.scene);

    linkSensors(this.scene);

    window.addEventListener("resize", this.engine.resize.bind(this.engine));

    const ground = this.scene.meshes[4];
    this.scene.cameras[0].parent = ground;

    this.scene.registerBeforeRender(() => {
      /* while (
        Math.abs(betaStep) < Math.abs(rotD.beta - 0.08) &&
        Math.abs(rotD.beta) > 0.08
      ) {
        betaStep += rotD.beta > 0 ? limitDelta : -limitDelta;
        BetaSteps++

        
      } */

      const subdRotation = getRotationSubSteps(simRotation, deviceRotation);

      for (let i = 0; i < subdRotation.length; i++) {
        const subR = subdRotation[i];
        ground.rotationQuaternion = Quaternion.RotationYawPitchRoll(
          subR.alpha,
          subR.beta,
          subR.gamma
        );
        if (i !== subdRotation.length - 1) {
          this.scene._advancePhysicsEngineStep(0);
        }
      }

      simRotation = deviceRotation;

      const textBlock = this.ui[1] as TextBlock;
      textBlock.color = "green";
      textBlock.text = `
      ${JSON.stringify(deviceRotation, JSONFloatPrec2)}
      ${JSON.stringify(simRotation.dist(deviceRotation), JSONFloatPrec2)}
      DeltaSum: ${simRotation.dist(deviceRotation).magSum()}
      RotationStepsCount: ${subdRotation.length}
      ${subdRotation.map((r) => r.alpha.toFixed(2)).join("\n")}
      `;
    });

    this.engine.runRenderLoop(() => {
      this.scene.render();
    });
  }
}

/*const ground = makeGround(scene);

    const dice = makeDice(
      [
        new Vector3(0, 1, 0),
        //new Vector3(0, 0.2, 0),
        //new Vector3(0, 0.3, 0),
        //new Vector3(0, 0.4, 0),
        //new Vector3(0, 0.5, 0),
        // new Vector3(0, 0.6, 0),
      ],
      scene
    );*/

/*const advancedTexture = AdvancedDynamicTexture.CreateFullscreenUI(
      "UI",
      true,
      this.scene
    );*/

/*function makeGround(scene: Scene) {


  const joint = new PhysicsJoint(PhysicsJoint.BallAndSocketJoint,{mainPivot:,connectedPivot:})
  .addJoint(ground, joint);
  return [ground];
}

function makeDice(positions: Vector3[], scene: Scene) {
  return positions.map((position, index) => {
    const box = BoxBuilder.CreateBox(`dice${index}`, { size: 0.02 }, scene);
    box.position = position;
    box.physicsImpostor = new PhysicsImpostor(
      box,
      PhysicsImpostor.BoxImpostor,
      { mass: 0.01, restitution: 0.9, friction: 0.05 },
      scene
    );
    return box;
  });
}*/

/*const text1 = new TextBlock();
    text1.text = "Hello GUI";
    text1.color = "blue";
    text1.fontSize = 12;
    advancedTexture.addControl(text1);
    text1.text = "No data";*/

/*var button = Button.CreateSimpleButton("but", "Apply Impulse");
    button.width = 0.2;
    button.height = "40px";
    button.color = "white";
    button.verticalAlignment = Control.VERTICAL_ALIGNMENT_BOTTOM;
    button.background = "#1388AF";
    button.top = "-10px";

    button.onPointerClickObservable.add(() => {
      console.log("imp");
    });
    advancedTexture.addControl(button);*/

/*const origin = new Vector3(0, 0, 0);
    const axisX = new Vector3(1, 0, 0);
    const axisY = new Vector3(0, 1, 0);
    const axisZ = new Vector3(0, 1, 0);*/

/**/

/* let g = new Vector3(0, -10, 0).rotateByQuaternionToRef(
          new Quaternion(Math.cos(gamma / 2), Math.sin(gamma / 2), 0, 0),
          new Vector3(0, 0, 0)
        );

        g = g.rotateByQuaternionToRef(
          new Quaternion(Math.cos(alpha / 2), 0, Math.sin(alpha / 2), 0),
          new Vector3(0, 0, 0)
        );

        g = g.rotateByQuaternionToRef(
          new Quaternion(Math.cos(beta / 2), 0, 0, Math.sin(beta / 2)),
          new Vector3(0, 0, 0)
        );

        g = g.multiplyByFloats(-1);

        this.scene.getPhysicsEngine()?.setGravity(g);
    */

/*const text2 = new TextBlock();
    text2.text = "Hello GUI";
    text2.color = "green";
    text2.fontSize = 12;
    text2.paddingTop = 70;
    advancedTexture.addControl(text2);
    text2.text = "No data";

    if (window.DeviceMotionEvent) {
      text2.text = "Supported";
    }*/

/*window.addEventListener(
      "devicemotion",
      (event) => {
        if (
          event.accelerationIncludingGravity &&
          event.accelerationIncludingGravity.x &&
          event.accelerationIncludingGravity.y &&
          event.accelerationIncludingGravity.z &&
          event.rotationRate &&
          event.rotationRate.alpha &&
          event.rotationRate.beta &&
          event.rotationRate.gamma
        ) {
          const acc = new Vector3(
            0,
            100,
            0
            //event.accelerationIncludingGravity.x,
            //event.accelerationIncludingGravity.y,
            //event.accelerationIncludingGravity.z
          );

          const rotVel = new Vector3(
            -event.rotationRate.alpha,
            event.rotationRate.gamma,
            event.rotationRate.beta
          );

          for (const obj of dice) {
            obj.applyImpulse(acc, obj.position);
          }

          text2.text = `
          x:${acc.x.toFixed(2)}\n
          y:${acc.y.toFixed(2)}\n
          z:${acc.z.toFixed(2)}
          `;
        }
      },
      true
    );*/
