import BN from "bignumber.js";
import hash from "hash.js";

export function getModulo(bigNumber, modulo) {
	if (bigNumber.isGreaterThanOrEqualTo(0)) {
		return bigNumber.modulo(modulo);
	}

	return getBN(modulo)
		.minus(bigNumber.multipliedBy(-1).mod(modulo))
		.mod(modulo);
}

export function findInverse(number, modulo) {
	const xgcdBN = (a, b) => {
		if (b.isEqualTo(0)) {
			return [getBN(1), getBN(0)];
		}

		const [x, y] = xgcdBN(
			b,
			a.minus(a.dividedBy(b).integerValue(BN.ROUND_FLOOR).multipliedBy(b))
		);

		return [
			y,
			x.minus(
				y.multipliedBy(a.dividedBy(b).integerValue(BN.ROUND_FLOOR))
			),
		];
	};

	const [result] = xgcdBN(getBN(number), getBN(modulo));

	return result;
}

export function getLargeRandom() {
	//return [0, 0, 0, 0].map(() => Math.floor(Math.random() * 10e15)).join("");
	return BN.random().multipliedBy(getBN("100000000000000000000"));
}

export function getSha256(text) {
	return "0x" + hash.sha256().update(text).digest("hex");
}

export function getBN(number) {
	return new BN(number);
}

export function toBin(n) {
	let arr = [];
	n = getBN(n);
	while (!n.isZero()) {
		arr.unshift(getModulo(n, getBN(2)).toNumber());
		n = n.dividedBy(2).integerValue(BN.ROUND_FLOOR);
	}
	return arr;
}


