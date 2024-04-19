import ECPoint from "./ECPoint.js";
import {
	findInverse,
	getModulo,
	getLargeRandom,
	getSha256,
	getBN,
} from "./Utils.js";
import { generatorPoint } from "./secp256k1.js";

function getSecp256k1Point(x, y) {
	return new ECPoint(x, y);
}

export const GPoint = getSecp256k1Point(generatorPoint.x, generatorPoint.y);

export function signMessage(message, privateKey) {
	let k;
	let r;
	message = getSha256(String(message));
	do {
		k = getLargeRandom();
		const R = GPoint.multiply(k);
		r = getModulo(R.x, generatorPoint.orderN);
	} while (r.isEqualTo(0));

	const kInverse = getModulo(
		findInverse(k, generatorPoint.orderN),
		generatorPoint.orderN
	);

	const s = getModulo(
		kInverse.multipliedBy(getBN(message).plus(r.multipliedBy(privateKey))),
		generatorPoint.orderN
	);

	return { s, r };
}

export function verifySignature(message, { r, s }, publicKey) {
	const sInverse = findInverse(s, generatorPoint.orderN);
	message = getSha256(String(message));
	const u1 = getModulo(
		getBN(message).multipliedBy(sInverse),
		generatorPoint.orderN
	);

	const u2 = getModulo(
		getBN(r).multipliedBy(sInverse),
		generatorPoint.orderN
	);

	const c = GPoint.multiply(u1).add(publicKey.multiply(u2));

	return r.isEqualTo(c.x);
}
