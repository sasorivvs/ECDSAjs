import BN from "bignumber.js";
import sha256 from "hash.js";
import { getModulo, findInverse, getBN, toBin } from "./Utils.js";
import { curveConfig, generatorPoint } from "./secp256k1.js";

export default class ECPoint {
	x = null;
	y = null;
	EC = null;

	/**
	 *
	 * @param x {number|BigNumber|string}
	 * @param y {number|BigNumber|string}
	 * @param EC {{a: BigNumber, b: BigNumber, p: BigNumber}}
	 */

	constructor(x, y, EC = curveConfig) {
		this.x = getBN(x);
		this.y = getBN(y);

		const y2 = this.y.pow(2);
		this.EC = EC;
		const x3 = this.x.pow(3);
		const PaxPb = this.x.multipliedBy(this.EC.a).plus(this.EC.b);
		const x3PaxPb = x3.plus(PaxPb);
		if (
			!getModulo(y2, this.EC.p).isEqualTo(getModulo(x3PaxPb, this.EC.p))
		) {
			throw new Error("The point is not on the curve!");
		}
	}

	isEqual(point) {
		return point.x.isEqualTo(this.x) && point.y.isEqualTo(this.y);
	}

	add(point) {
		let slope = this.isEqual(point)
			? getModulo(
					findInverse(this.y.multipliedBy(2), this.EC.p).multipliedBy(
						this.x.pow(2).multipliedBy(3).plus(this.EC.a)
					),
					this.EC.p
			  )
			: getModulo(
					point.y
						.minus(this.y)
						.multipliedBy(
							findInverse(
								getModulo(point.x.minus(this.x), this.EC.p),
								this.EC.p
							)
						),
					this.EC.p
			  );
		let cx = getModulo(
			slope.pow(2).minus(this.x).minus(point.x),
			this.EC.p
		);
		let cy = getModulo(
			slope.multipliedBy(this.x.minus(cx)).minus(this.y),
			this.EC.p
		);
		return new ECPoint(cx, cy, this.EC);
	}

	multiply(n) {
		let binArray = toBin(n);
		let currentPoint = new ECPoint(this.x, this.y, this.EC);
		let usedPoints = [];

		for (let i = 0; i <= binArray.length - 1; i++) {
			if (binArray[binArray.length - 1 - i] != 0) {
				usedPoints.push(currentPoint);
			}
			currentPoint = currentPoint.add(currentPoint);
		}
		for (let i = 0; i < usedPoints.length - 1; i++) {
			usedPoints[usedPoints.length - 1] = usedPoints[
				usedPoints.length - 1
			].add(usedPoints[i]);
		}
		return usedPoints[usedPoints.length - 1];
	}
}

function getSecp256k1Point(x, y) {
	return new ECPoint(x, y);
}

const GPoint = getSecp256k1Point(generatorPoint.x, generatorPoint.y);
function log2(x) {
	x = getBN(x);
	let result = new BN(0);
	let one = new BN(1);
	let two = new BN(2);

	// Проверка, что число больше нуля
	if (x.isZero() || x.isNegative()) {
		throw new Error(
			"Невозможно вычислить логарифм по основанию 2 для отрицательных чисел или нуля."
		);
	}

	while (x.gte(two)) {
		x = x.dividedBy(two);
		result = result.plus(one);
	}

	return result;
}
