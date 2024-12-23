import { Buffer } from "../buffer";
import { CFBEncryptor, CFBDecryptor } from "aes-ts";

function md5(inputString) {
	function rh(n) {
		var bytes: any = [];
		for (var j = 0; j <= 3; j++) {
			bytes.push((n >> (j * 8)) & 0xff);
		}
		return bytes;
	}
	function ad(x, y) {
		var l = (x & 0xffff) + (y & 0xffff);
		var m = (x >> 16) + (y >> 16) + (l >> 16);
		return (m << 16) | (l & 0xffff);
	}
	function rl(n, c) {
		return (n << c) | (n >>> (32 - c));
	}
	function cm(q, a, b, x, s, t) {
		return ad(rl(ad(ad(a, q), ad(x, t)), s), b);
	}
	function ff(a, b, c, d, x, s, t) {
		return cm((b & c) | (~b & d), a, b, x, s, t);
	}
	function gg(a, b, c, d, x, s, t) {
		return cm((b & d) | (c & ~d), a, b, x, s, t);
	}
	function hh(a, b, c, d, x, s, t) {
		return cm(b ^ c ^ d, a, b, x, s, t);
	}
	function ii(a, b, c, d, x, s, t) {
		return cm(c ^ (b | ~d), a, b, x, s, t);
	}
	function sb(x) {
		var i;
		var nblk = ((x.length + 8) >> 6) + 1;
		var blks = new Array(nblk * 16);
		for (i = 0; i < nblk * 16; i++) blks[i] = 0;
		for (i = 0; i < x.length; i++)
			blks[i >> 2] |= x.charCodeAt(i) << ((i % 4) * 8);
		blks[i >> 2] |= 0x80 << ((i % 4) * 8);
		blks[nblk * 16 - 2] = x.length * 8;
		return blks;
	}
	var i,
		x = sb("" + inputString),
		a = 1732584193,
		b = -271733879,
		c = -1732584194,
		d = 271733878,
		olda,
		oldb,
		oldc,
		oldd;
	for (i = 0; i < x.length; i += 16) {
		olda = a;
		oldb = b;
		oldc = c;
		oldd = d;
		a = ff(a, b, c, d, x[i + 0], 7, -680876936);
		d = ff(d, a, b, c, x[i + 1], 12, -389564586);
		c = ff(c, d, a, b, x[i + 2], 17, 606105819);
		b = ff(b, c, d, a, x[i + 3], 22, -1044525330);
		a = ff(a, b, c, d, x[i + 4], 7, -176418897);
		d = ff(d, a, b, c, x[i + 5], 12, 1200080426);
		c = ff(c, d, a, b, x[i + 6], 17, -1473231341);
		b = ff(b, c, d, a, x[i + 7], 22, -45705983);
		a = ff(a, b, c, d, x[i + 8], 7, 1770035416);
		d = ff(d, a, b, c, x[i + 9], 12, -1958414417);
		c = ff(c, d, a, b, x[i + 10], 17, -42063);
		b = ff(b, c, d, a, x[i + 11], 22, -1990404162);
		a = ff(a, b, c, d, x[i + 12], 7, 1804603682);
		d = ff(d, a, b, c, x[i + 13], 12, -40341101);
		c = ff(c, d, a, b, x[i + 14], 17, -1502002290);
		b = ff(b, c, d, a, x[i + 15], 22, 1236535329);
		a = gg(a, b, c, d, x[i + 1], 5, -165796510);
		d = gg(d, a, b, c, x[i + 6], 9, -1069501632);
		c = gg(c, d, a, b, x[i + 11], 14, 643717713);
		b = gg(b, c, d, a, x[i + 0], 20, -373897302);
		a = gg(a, b, c, d, x[i + 5], 5, -701558691);
		d = gg(d, a, b, c, x[i + 10], 9, 38016083);
		c = gg(c, d, a, b, x[i + 15], 14, -660478335);
		b = gg(b, c, d, a, x[i + 4], 20, -405537848);
		a = gg(a, b, c, d, x[i + 9], 5, 568446438);
		d = gg(d, a, b, c, x[i + 14], 9, -1019803690);
		c = gg(c, d, a, b, x[i + 3], 14, -187363961);
		b = gg(b, c, d, a, x[i + 8], 20, 1163531501);
		a = gg(a, b, c, d, x[i + 13], 5, -1444681467);
		d = gg(d, a, b, c, x[i + 2], 9, -51403784);
		c = gg(c, d, a, b, x[i + 7], 14, 1735328473);
		b = gg(b, c, d, a, x[i + 12], 20, -1926607734);
		a = hh(a, b, c, d, x[i + 5], 4, -378558);
		d = hh(d, a, b, c, x[i + 8], 11, -2022574463);
		c = hh(c, d, a, b, x[i + 11], 16, 1839030562);
		b = hh(b, c, d, a, x[i + 14], 23, -35309556);
		a = hh(a, b, c, d, x[i + 1], 4, -1530992060);
		d = hh(d, a, b, c, x[i + 4], 11, 1272893353);
		c = hh(c, d, a, b, x[i + 7], 16, -155497632);
		b = hh(b, c, d, a, x[i + 10], 23, -1094730640);
		a = hh(a, b, c, d, x[i + 13], 4, 681279174);
		d = hh(d, a, b, c, x[i + 0], 11, -358537222);
		c = hh(c, d, a, b, x[i + 3], 16, -722521979);
		b = hh(b, c, d, a, x[i + 6], 23, 76029189);
		a = hh(a, b, c, d, x[i + 9], 4, -640364487);
		d = hh(d, a, b, c, x[i + 12], 11, -421815835);
		c = hh(c, d, a, b, x[i + 15], 16, 530742520);
		b = hh(b, c, d, a, x[i + 2], 23, -995338651);
		a = ii(a, b, c, d, x[i + 0], 6, -198630844);
		d = ii(d, a, b, c, x[i + 7], 10, 1126891415);
		c = ii(c, d, a, b, x[i + 14], 15, -1416354905);
		b = ii(b, c, d, a, x[i + 5], 21, -57434055);
		a = ii(a, b, c, d, x[i + 12], 6, 1700485571);
		d = ii(d, a, b, c, x[i + 3], 10, -1894986606);
		c = ii(c, d, a, b, x[i + 10], 15, -1051523);
		b = ii(b, c, d, a, x[i + 1], 21, -2054922799);
		a = ii(a, b, c, d, x[i + 8], 6, 1873313359);
		d = ii(d, a, b, c, x[i + 15], 10, -30611744);
		c = ii(c, d, a, b, x[i + 6], 15, -1560198380);
		b = ii(b, c, d, a, x[i + 13], 21, 1309151649);
		a = ii(a, b, c, d, x[i + 4], 6, -145523070);
		d = ii(d, a, b, c, x[i + 11], 10, -1120210379);
		c = ii(c, d, a, b, x[i + 2], 15, 718787259);
		b = ii(b, c, d, a, x[i + 9], 21, -343485551);
		a = ad(a, olda);
		b = ad(b, oldb);
		c = ad(c, oldc);
		d = ad(d, oldd);
	}
	return [...rh(a), ...rh(b), ...rh(c), ...rh(d)];
}

export function offlineUUID(name: string): number[] {
	const hash = md5("OfflinePlayer:" + name);
	hash[6] = (hash[6] & 0x0f) | 0x30;
	hash[8] = (hash[8] & 0x3f) | 0x80;

	return hash;
}

export function bytesToUuid(byteArray: number[]) {
	let hexString = "";
	for (let i = 0; i < 16; i++) {
		const hex = byteArray[i].toString(16).padStart(2, "0");
		hexString += hex;
	}

	const uuid = `${hexString.slice(0, 8)}-${hexString.slice(8, 12)}-${hexString.slice(12, 16)}-${hexString.slice(16, 20)}-${hexString.slice(20)}`;

	return uuid;
}

function gfmult(a: number, b: number) {
	let result = 0;
	let shiftEscapesField = 0;

	for (let i = 0; i < 8; i++) {
		if (b & 1) {
			result ^= a;
		}

		shiftEscapesField = a & 0x80;
		a <<= 1;

		if (shiftEscapesField) {
			a ^= 0x11b;
		}

		b >>= 1;
	}

	return result;
}

let sbox = [
	0x63, 0x7c, 0x77, 0x7b, 0xf2, 0x6b, 0x6f, 0xc5, 0x30, 0x01, 0x67, 0x2b, 0xfe,
	0xd7, 0xab, 0x76, 0xca, 0x82, 0xc9, 0x7d, 0xfa, 0x59, 0x47, 0xf0, 0xad, 0xd4,
	0xa2, 0xaf, 0x9c, 0xa4, 0x72, 0xc0, 0xb7, 0xfd, 0x93, 0x26, 0x36, 0x3f, 0xf7,
	0xcc, 0x34, 0xa5, 0xe5, 0xf1, 0x71, 0xd8, 0x31, 0x15, 0x04, 0xc7, 0x23, 0xc3,
	0x18, 0x96, 0x05, 0x9a, 0x07, 0x12, 0x80, 0xe2, 0xeb, 0x27, 0xb2, 0x75, 0x09,
	0x83, 0x2c, 0x1a, 0x1b, 0x6e, 0x5a, 0xa0, 0x52, 0x3b, 0xd6, 0xb3, 0x29, 0xe3,
	0x2f, 0x84, 0x53, 0xd1, 0x00, 0xed, 0x20, 0xfc, 0xb1, 0x5b, 0x6a, 0xcb, 0xbe,
	0x39, 0x4a, 0x4c, 0x58, 0xcf, 0xd0, 0xef, 0xaa, 0xfb, 0x43, 0x4d, 0x33, 0x85,
	0x45, 0xf9, 0x02, 0x7f, 0x50, 0x3c, 0x9f, 0xa8, 0x51, 0xa3, 0x40, 0x8f, 0x92,
	0x9d, 0x38, 0xf5, 0xbc, 0xb6, 0xda, 0x21, 0x10, 0xff, 0xf3, 0xd2, 0xcd, 0x0c,
	0x13, 0xec, 0x5f, 0x97, 0x44, 0x17, 0xc4, 0xa7, 0x7e, 0x3d, 0x64, 0x5d, 0x19,
	0x73, 0x60, 0x81, 0x4f, 0xdc, 0x22, 0x2a, 0x90, 0x88, 0x46, 0xee, 0xb8, 0x14,
	0xde, 0x5e, 0x0b, 0xdb, 0xe0, 0x32, 0x3a, 0x0a, 0x49, 0x06, 0x24, 0x5c, 0xc2,
	0xd3, 0xac, 0x62, 0x91, 0x95, 0xe4, 0x79, 0xe7, 0xc8, 0x37, 0x6d, 0x8d, 0xd5,
	0x4e, 0xa9, 0x6c, 0x56, 0xf4, 0xea, 0x65, 0x7a, 0xae, 0x08, 0xba, 0x78, 0x25,
	0x2e, 0x1c, 0xa6, 0xb4, 0xc6, 0xe8, 0xdd, 0x74, 0x1f, 0x4b, 0xbd, 0x8b, 0x8a,
	0x70, 0x3e, 0xb5, 0x66, 0x48, 0x03, 0xf6, 0x0e, 0x61, 0x35, 0x57, 0xb9, 0x86,
	0xc1, 0x1d, 0x9e, 0xe1, 0xf8, 0x98, 0x11, 0x69, 0xd9, 0x8e, 0x94, 0x9b, 0x1e,
	0x87, 0xe9, 0xce, 0x55, 0x28, 0xdf, 0x8c, 0xa1, 0x89, 0x0d, 0xbf, 0xe6, 0x42,
	0x68, 0x41, 0x99, 0x2d, 0x0f, 0xb0, 0x54, 0xbb, 0x16,
];

let invsbox = [
	0x52, 0x09, 0x6a, 0xd5, 0x30, 0x36, 0xa5, 0x38, 0xbf, 0x40, 0xa3, 0x9e, 0x81,
	0xf3, 0xd7, 0xfb, 0x7c, 0xe3, 0x39, 0x82, 0x9b, 0x2f, 0xff, 0x87, 0x34, 0x8e,
	0x43, 0x44, 0xc4, 0xde, 0xe9, 0xcb, 0x54, 0x7b, 0x94, 0x32, 0xa6, 0xc2, 0x23,
	0x3d, 0xee, 0x4c, 0x95, 0x0b, 0x42, 0xfa, 0xc3, 0x4e, 0x08, 0x2e, 0xa1, 0x66,
	0x28, 0xd9, 0x24, 0xb2, 0x76, 0x5b, 0xa2, 0x49, 0x6d, 0x8b, 0xd1, 0x25, 0x72,
	0xf8, 0xf6, 0x64, 0x86, 0x68, 0x98, 0x16, 0xd4, 0xa4, 0x5c, 0xcc, 0x5d, 0x65,
	0xb6, 0x92, 0x6c, 0x70, 0x48, 0x50, 0xfd, 0xed, 0xb9, 0xda, 0x5e, 0x15, 0x46,
	0x57, 0xa7, 0x8d, 0x9d, 0x84, 0x90, 0xd8, 0xab, 0x00, 0x8c, 0xbc, 0xd3, 0x0a,
	0xf7, 0xe4, 0x58, 0x05, 0xb8, 0xb3, 0x45, 0x06, 0xd0, 0x2c, 0x1e, 0x8f, 0xca,
	0x3f, 0x0f, 0x02, 0xc1, 0xaf, 0xbd, 0x03, 0x01, 0x13, 0x8a, 0x6b, 0x3a, 0x91,
	0x11, 0x41, 0x4f, 0x67, 0xdc, 0xea, 0x97, 0xf2, 0xcf, 0xce, 0xf0, 0xb4, 0xe6,
	0x73, 0x96, 0xac, 0x74, 0x22, 0xe7, 0xad, 0x35, 0x85, 0xe2, 0xf9, 0x37, 0xe8,
	0x1c, 0x75, 0xdf, 0x6e, 0x47, 0xf1, 0x1a, 0x71, 0x1d, 0x29, 0xc5, 0x89, 0x6f,
	0xb7, 0x62, 0x0e, 0xaa, 0x18, 0xbe, 0x1b, 0xfc, 0x56, 0x3e, 0x4b, 0xc6, 0xd2,
	0x79, 0x20, 0x9a, 0xdb, 0xc0, 0xfe, 0x78, 0xcd, 0x5a, 0xf4, 0x1f, 0xdd, 0xa8,
	0x33, 0x88, 0x07, 0xc7, 0x31, 0xb1, 0x12, 0x10, 0x59, 0x27, 0x80, 0xec, 0x5f,
	0x60, 0x51, 0x7f, 0xa9, 0x19, 0xb5, 0x4a, 0x0d, 0x2d, 0xe5, 0x7a, 0x9f, 0x93,
	0xc9, 0x9c, 0xef, 0xa0, 0xe0, 0x3b, 0x4d, 0xae, 0x2a, 0xf5, 0xb0, 0xc8, 0xeb,
	0xbb, 0x3c, 0x83, 0x53, 0x99, 0x61, 0x17, 0x2b, 0x04, 0x7e, 0xba, 0x77, 0xd6,
	0x26, 0xe1, 0x69, 0x14, 0x63, 0x55, 0x21, 0x0c, 0x7d,
];

type Column = [number, number, number, number];
type Block = [Column, Column, Column, Column];

function mixcolumns(block: Block, inverse: boolean = false): Block {
	block = structuredClone(block) as Block;
	let temp = Array(4) as Column;
	for (let col = 0; col < 4; col++) {
		temp[0] =
			gfmult(block[col][0], 2) ^
			gfmult(block[col][1], 3) ^
			block[col][2] ^
			block[col][3];
		temp[1] =
			block[col][0] ^
			gfmult(block[col][1], 2) ^
			gfmult(block[col][2], 3) ^
			block[col][3];
		temp[2] =
			block[col][0] ^
			block[col][1] ^
			gfmult(block[col][2], 2) ^
			gfmult(block[col][3], 3);
		temp[3] =
			gfmult(block[col][0], 3) ^
			block[col][1] ^
			block[col][2] ^
			gfmult(block[col][3], 2);

		block[col] = structuredClone(temp) as Column;
	}
	return block;
}

function shiftrows(block: Block): Block {
	let res = [Array(4), Array(4), Array(4), Array(4)] as Block;
	for (let row = 0; row < 4; row++) {
		for (let col = 0; col < 4; col++) {
			res[col][row] = block[(col + row) % 4][row];
		}
	}
	return res;
}

function subwords(block: Block): Block {
	let res = [Array(4), Array(4), Array(4), Array(4)] as Block;

	for (let row = 0; row < 4; row++) {
		for (let col = 0; col < 4; col++) {
			res[col][row] = sbox[block[col][row]];
		}
	}

	return res;
}

function addroundkey(block: Block, key: Block): Block {
	block = structuredClone(block) as Block;
	for (let row = 0; row < 4; row++) {
		for (let col = 0; col < 4; col++) {
			block[col][row] ^= key[col][row];
		}
	}
	return block;
}

function wordAdd(a: Column, b: Column): Column {
	return [a[0] ^ b[0], a[1] ^ b[1], a[2] ^ b[2], a[3] ^ b[3]];
}

function wordRot(a: Column): Column {
	return [a[1], a[2], a[3], a[0]];
}

function wordSub(a: Column): Column {
	return [sbox[a[0]], sbox[a[1]], sbox[a[2]], sbox[a[3]]];
}

let rcon: Column[] = [
	[0x01, 0x00, 0x00, 0x00],
	[0x02, 0x00, 0x00, 0x00],
	[0x04, 0x00, 0x00, 0x00],
	[0x08, 0x00, 0x00, 0x00],
	[0x10, 0x00, 0x00, 0x00],
	[0x20, 0x00, 0x00, 0x00],
	[0x40, 0x00, 0x00, 0x00],
	[0x80, 0x00, 0x00, 0x00],
	[0x1b, 0x00, 0x00, 0x00],
	[0x36, 0x00, 0x00, 0x00],
];

function keygen(iv: Uint8Array): Block[] {
	let key = arrayToBlock(iv);
	let keys = [key];

	let col3 = structuredClone(key[3]) as Column;

	for (let i = 0; i < 10; i++) {
		col3 = wordRot(col3);
		col3 = wordSub(col3);
		col3 = wordAdd(col3, rcon[i]);

		let nextKey = arrayToBlock(new Uint8Array(16));
		nextKey[0] = wordAdd(key[0], col3);
		nextKey[1] = wordAdd(key[1], nextKey[0]);
		nextKey[2] = wordAdd(key[2], nextKey[1]);
		nextKey[3] = wordAdd(key[3], nextKey[2]);

		col3 = structuredClone(nextKey[3]) as Column;
		keys.push(nextKey);
		key = nextKey;
	}
	return keys;
}

function encryptBlock(block: Block, roundKeys: Block[]): Block {
	let newblock = addroundkey(block, roundKeys[0]);
	for (let i = 1; i < 10; i++) {
		newblock = subwords(newblock);
		newblock = shiftrows(newblock);
		newblock = mixcolumns(newblock);
		newblock = addroundkey(newblock, roundKeys[i]);
	}
	newblock = subwords(newblock);
	newblock = shiftrows(newblock);
	newblock = addroundkey(newblock, roundKeys[10]);

	return newblock;
}

function arrayToBlock(array: Uint8Array): Block {
	let block = [Array(4), Array(4), Array(4), Array(4)] as Block;
	for (let i = 0; i < 16; i++) {
		block[Math.floor(i / 4)][i % 4] = array[i];
	}
	return block;
}

// using cfb-8 mode
let feedback;
function encrypt(iv: Uint8Array, data: Uint8Array): Uint8Array {
	// iv is 128 bits
	let roundkeys = keygen(iv);
	let out: number[] = [];

	for (let i = 0; i < data.length; i++) {
		let block = arrayToBlock(feedback);
		block = encryptBlock(block, roundkeys);

		let ciphertextByte = data[i] ^ block[0][0];
		out.push(ciphertextByte);

		// shift feedback
		feedback = new Uint8Array([...[...feedback].slice(1), ciphertextByte]);
	}

	return new Uint8Array(out);
}
let roundkeys2;
let feedback2;
function encrypt2(iv: Uint8Array, data: Uint8Array): Uint8Array {
	// iv is 128 bits
	let out: number[] = [];

	for (let i = 0; i < data.length; i++) {
		let block = arrayToBlock(feedback2);
		block = encryptBlock(block, roundkeys2);

		let ciphertextByte = data[i] ^ block[0][0];
		out.push(ciphertextByte);

		// shift feedback
		feedback2 = new Uint8Array([...[...feedback2].slice(1), data[i]]);
	}

	return new Uint8Array(out);
}

export class Decryptor {
	// private feedback: Uint8Array | null = null;
	// private roundkeys: Block[] | null = null;
	private aesCfb: CFBDecryptor | null = null;
	transform: TransformStream<Buffer>;

	seed(iv: Uint8Array) {
		// this.roundkeys = keygen(iv);
		// this.feedback = new Uint8Array(iv);
		this.aesCfb = new CFBDecryptor(iv, iv, 1);
	}

	constructor() {
		this.transform = new TransformStream<Buffer>({
			transform: (chunk, controller) => {
				// if (!this.feedback || !this.roundkeys) {
				// 	controller.enqueue(chunk);
				// 	return;
				// }
				// feedback2 = this.feedback;
				// roundkeys2 = this.roundkeys;
				//
				// controller.enqueue(new Buffer(encrypt2(this.feedback, chunk.inner)));
				if (!this.aesCfb) {
					controller.enqueue(chunk);
					return;
				}
				controller.enqueue(new Buffer(this.aesCfb.decrypt(chunk.inner)));
			},
		});
	}
}

export class Encryptor {
	// private feedback: Uint8Array | null = null;
	// private roundkeys: Block[] | null = null;
	private aesCfb: CFBEncryptor | null = null;
	constructor() {}

	seed(iv: Uint8Array) {
		// this.roundkeys = keygen(iv);
		// this.feedback = new Uint8Array(iv);
		this.aesCfb = new CFBEncryptor(iv, iv, 1);
	}

	transform(chunk: Buffer): Buffer {
		// if (!this.feedback || !this.roundkeys) return chunk;
		//
		// feedback = this.feedback;
		// let out = encrypt(this.feedback, chunk.inner);
		//
		// return new Buffer(out);
		if (!this.aesCfb) return chunk;
		return new Buffer(this.aesCfb.encrypt(chunk.inner));
	}
}

export function makeSharedSecret(): Uint8Array {
	const array = new Uint8Array(16);
	crypto.getRandomValues(array);
	return array;
}

// returns `n` and `e` as bigints given a public key
export async function loadKey(keyBytes: Uint8Array): Promise<[bigint, bigint]> {
	let key = await crypto.subtle.importKey(
		"spki",
		new Uint8Array(keyBytes).buffer,
		{
			name: "RSA-OAEP",
			hash: "SHA-256",
		},
		true,
		["encrypt"],
	);
	// jwk provides the magics as json
	let jwk = await crypto.subtle.exportKey("jwk", key);

	// random stackoverflow function to get the bigints
	function base64urlToBigInt(base64url: string) {
		const base64 = base64url.replace(/-/g, "+").replace(/_/g, "/");
		const padding = "=".repeat((4 - (base64.length % 4)) % 4);
		const base64Padded = base64 + padding;
		const binaryString = atob(base64Padded);
		let bigint = 0n;
		for (let i = 0; i < binaryString.length; i++) {
			bigint = (bigint << 8n) + BigInt(binaryString.charCodeAt(i));
		}
		return bigint;
	}

	return [base64urlToBigInt(jwk.n!), base64urlToBigInt(jwk.e!)];
}
export function encryptRSA(data: Uint8Array, n: bigint, e: bigint): Uint8Array {
	const modExp = (base, exp, mod) => {
		let result = 1n;
		base = base % mod;
		while (exp > 0n) {
			if (exp % 2n === 1n) {
				result = (result * base) % mod;
			}
			exp = exp >> 1n;
			base = (base * base) % mod;
		}
		return result;
	};
	// thank you jippity
	const pkcs1v15Pad = (messageBytes: Uint8Array, n: bigint) => {
		const messageLength = messageBytes.length;
		const nBytes = Math.ceil(n.toString(16).length / 2);

		if (messageLength > nBytes - 11) {
			throw new Error("Message too long for RSA encryption");
		}

		const paddingLength = nBytes - messageLength - 3;
		const padding = Array(paddingLength).fill(0xff);

		return BigInt(
			"0x" +
				[
					"00",
					"02",
					...padding.map((byte) => byte.toString(16).padStart(2, "0")),
					"00",
					...Array.from(messageBytes).map((byte: any) =>
						byte.toString(16).padStart(2, "0"),
					),
				].join(""),
		);
	};
	const paddedMessage = pkcs1v15Pad(data, n);
	let int = modExp(paddedMessage, e, n);

	let hex = int.toString(16);
	if (hex.length % 2) {
		hex = "0" + hex;
	}

	// ????
	return new Uint8Array(
		Array.from(hex.match(/.{2}/g) || []).map((byte) => parseInt(byte, 16)),
	);
}

export async function mchash(input: Uint8Array) {
	let buf = new Uint8Array(await crypto.subtle.digest("sha-1", input));
	let out = "";

	if ((buf[0] & 0x80) == 128) {
		for (let i = 0; i < buf.length; i++) {
			buf[i] ^= 0xff;
			if (i + 1 == buf.length) buf[i] += 1; // two's compliment or whatever
		}
		out += "-";
	}

	for (let i = 0; i < buf.length; i++) {
		let c = buf[i].toString(16);
		if (c.length == 1) c = "0" + c;
		out += c;
	}
	return out;
}
