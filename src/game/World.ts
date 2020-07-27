import {
	Engine,
	Scene,
	ArcRotateCamera,
	Vector3,
	PointLight,
	CannonJSPlugin,
	Quaternion,
} from "babylonjs";

import {
	AdvancedDynamicTexture,
	TextBlock,
	Control,
	Button,
} from "babylonjs-gui";

import * as CANNON from "cannon";

import { Rotation, getRotationSubSteps } from "./util/Rotation";
import { makeEntities } from "./EntitySetup";
import {
	convertDeviceOrientation,
	convertDeviceMotion,
} from "./SensorHandling";

function initializeScene(scene: Scene) {
	scene.enablePhysics(initialGravity, new CannonJSPlugin());

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

const initialGravity = new Vector3(0, -1, 0);

let simRotation: Rotation = new Rotation(0, 0, 0);
let deviceRotation: Rotation = new Rotation(0, 0, 0);
let deviceMotion: Vector3 = new Vector3(0, 0, 0);

function linkSensors(scene: Scene) {
	window.addEventListener("deviceorientation", ({ alpha, beta, gamma }) => {
		if (alpha && beta && gamma) {
			deviceRotation = convertDeviceOrientation(alpha, beta, gamma);
		}
	});

	window.addEventListener("devicemotion", ({ acceleration }) => {
		const deviceMotion = convertDeviceMotion(acceleration);
	});
}

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
			this.updateWorldRotation();
		});

		this.engine.runRenderLoop(() => {
			this.scene.render();
		});
	}

	private updateWorldRotation() {
		const ground = this.scene.meshes[4];

		const subdRotation = getRotationSubSteps(0.03, simRotation, deviceRotation);

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

		this.scene
			.getPhysicsEngine()
			?.setGravity(
				deviceMotion
					.rotateByQuaternionToRef(
						Quaternion.RotationYawPitchRoll(
							deviceRotation.alpha,
							deviceRotation.beta,
							deviceRotation.gamma
						),
						Vector3.Zero()
					)
					.add(initialGravity)
			);
	}
}
