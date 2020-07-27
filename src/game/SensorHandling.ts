import { Rotation } from "./util/Rotation";
import { Vector3 } from "babylonjs";

export function convertDeviceOrientation(
	alpha: number,
	beta: number,
	gamma: number
) {
	let a = (alpha / 180) * Math.PI;
	let b = (beta / 180) * Math.PI;
	let g = (gamma / 180) * Math.PI;

	a -= Math.PI;
	a = a < 0 ? 2 * Math.PI + a : a;
	a = 2 * Math.PI - a;
	b = b < 0 ? 2 * Math.PI + b : b;
	g = g < 0 ? 2 * Math.PI + g : g;

	return new Rotation(a, b, g);
}

export function convertDeviceMotion(
	acceleration: DeviceMotionEventAcceleration | null
): Vector3 | null {
	if (acceleration && acceleration.x && acceleration.y && acceleration.z) {
		return new Vector3(-acceleration.x, acceleration.z, -acceleration.y);
	}
	return null;
}
