export class Rotation {
	public readonly alpha: number;
	public readonly beta: number;
	public readonly gamma: number;
	constructor(alpha: number = 0, beta: number = 0, gamma: number = 0) {
		this.alpha = alpha;
		this.beta = beta;
		this.gamma = gamma;
	}

	private operate(
		rotation: Rotation,
		func: (a: number, b: number) => number
	): Rotation {
		return new Rotation(
			func(this.alpha, rotation.alpha),
			func(this.beta, rotation.beta),
			func(this.gamma, rotation.gamma)
		);
	}
	private operateScalar(func: (a: number) => number): Rotation {
		return new Rotation(func(this.alpha), func(this.beta), func(this.gamma));
	}

	normalize(): Rotation {
		return this.operateScalar(
			(a) => (a < 0 ? Math.PI * 2 + a : a) % (2 * Math.PI)
		);
	}

	mult(rotation: Rotation) {
		return this.operate(rotation, (a, b) => a * b);
	}
	add(rotation: Rotation) {
		return this.operate(rotation, (a, b) => a + b);
	}
	sub(rotation: Rotation) {
		return this.operate(rotation, (a, b) => a - b);
	}
	div(rotation: Rotation) {
		return this.operate(rotation, (a, b) => a / b);
	}

	multScalar(value: number) {
		return this.operateScalar((a) => a * value);
	}
	addScalar(value: number) {
		return this.operateScalar((a) => a + value);
	}
	subScalar(value: number) {
		return this.operateScalar((a) => a - value);
	}
	divScalar(value: number) {
		return this.operateScalar((a) => a / value);
	}

	magSum(): number {
		return Math.abs(this.alpha) + Math.abs(this.beta) + Math.abs(this.gamma);
	}

	dist(rotA: Rotation): Rotation {
		return this.operate(rotA, (a, b) => {
			if (a - b > Math.PI && a > b) {
				return 2 * Math.PI - a + b;
			}
			if (b - a > Math.PI && a <= b) {
				return b - 2 * Math.PI - a;
			}
			return b - a;
		});
	}
}

export function getRotationSubSteps(
	limitDelta: number,
	rotA: Rotation,
	rotB: Rotation
): Rotation[] {
	const deltaRotation = rotA.dist(rotB);

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
