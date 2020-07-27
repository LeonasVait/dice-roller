import { Scene, StandardMaterial, Color3 } from "babylonjs";
import { BoxFactory } from "./util/BoxFactory";

export function makeEntities(scene: Scene) {
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
		.withSize(0.02, 0.02, 0.02);

	boxFactory.make(0, 0, 1.0);
	boxFactory.withMaterial(matX).make(0.1, 0, 1.0);
	boxFactory.withMaterial(matY).make(0, 0.1, 1.0);
	boxFactory.withMaterial(matZ).make(0, 0, 1.1);

	boxFactory.withMaterial(scene.defaultMaterial).withSize(1, 0.1, 1);

	const ground0 = boxFactory.make(0, -0.05, 0);
	const ground5 = boxFactory.withMaterial(matTransp).make(0, 0.55, 0);
	ground5.parent = ground0;

	const ground1 = boxFactory
		.withMaterial(scene.defaultMaterial)
		.withSize(0.1, 0.7, 1.2)
		.make(0.55, 0.25, 0);

	ground1.parent = ground0;

	const ground2 = boxFactory.make(-0.55, 0.25, 0);
	ground2.parent = ground0;

	const ground3 = boxFactory.withSize(1, 0.7, 0.1).make(0, 0.25, 0.55);
	ground3.parent = ground0;

	const ground4 = boxFactory.make(0, 0.25, -0.55);
	ground4.parent = ground0;

	const dice1 = boxFactory
		.withPrefix("dice")
		.withMaterial(matX)
		.withSize(0.1, 0.1, 0.1)
		.withMass(1)
		.make(0.2, 0.1, 0.2);

	const dice2 = boxFactory.make(-0.2, 0.1, 0.2);

	const dice3 = boxFactory.make(-0.2, 0.1, -0.2);

	const dice4 = boxFactory.make(0.2, 0.1, -0.2);
}
