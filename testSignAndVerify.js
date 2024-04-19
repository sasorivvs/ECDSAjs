import { getLargeRandom, getSha256 } from "./Utils.js";
import { signMessage, verifySignature, GPoint } from "./ecdsa.js";

let PrivateKey = getLargeRandom();
let PublicKey = GPoint.multiply(PrivateKey);

let address = getSha256(PublicKey.x.toString());
let mess = getLargeRandom();
let { s, r } = signMessage(mess, PrivateKey);
console.log({ s, r });
console.log(verifySignature(mess, { r, s }, PublicKey));
console.log(`PrivateKey: 0x${PrivateKey.toString(16).padStart(64, "0")}`);
console.log(`PublicKey: ${PublicKey.x}`);
console.log(`Address: ${"0x" + address.slice(-40)}`);
