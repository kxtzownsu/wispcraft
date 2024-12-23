import { Buffer } from "./buffer";
import { epoxyFetch } from "./connection/epoxy";
import { bytesToUuid } from "./connection/crypto";

const urlCache = {};

let fetchMode = false;
let fetchMode2 = false;

interface TexUrls {
	skin: string;
	cape: string;
	slim: boolean;
}

interface Tex {
	skin: Buffer;
	cape: Buffer;
	slim: boolean;
}

async function getTextureDataByProfileResponse(
	resp: Response
): Promise<TexUrls> {
	const response = await resp.json();
	const parsed = JSON.parse(atob(response.properties[0].value));
	return {
		skin: parsed.textures.SKIN.url,
		cape: parsed.textures.CAPE?.url,
		slim: parsed.metadata?.model == "slim",
	};
}

async function funkyFetch(
	uuid: string,
	fallbackUrl: string,
	isCape: boolean
): Promise<Response> {
	if (!uuid || fetchMode2) {
		try {
			return await epoxyFetch(fallbackUrl);
		} catch (e) {
			return new Response();
		}
	}
	try {
		return window.fetch(
			"https://crafthead.net/" + (isCape ? "cape" : "skin") + "/" + uuid
		);
	} catch (e) {
		fetchMode2 = true;
		return await funkyFetch(uuid, fallbackUrl, isCape);
	}
}

async function funnyFetch(url: string): Promise<Tex> {
	let cape = "";
	let slim = false;
	let uuid = "";
	try {
		if (url.startsWith("profile://")) {
			uuid = url.slice(10);
			const prefix =
				fetchMode
					? "https://sessionserver.mojang.com/session/minecraft/profile/"
					: "https://crafthead.net/profile/";
			const texData = await getTextureDataByProfileResponse(await window.fetch(prefix + uuid));
			url = texData.skin;
			cape = texData.cape;
			slim = texData.slim;
		}
		return {
			skin: await responseToSkin(await funkyFetch(uuid, url, false)),
			cape: cape
				? await responseToCape(await funkyFetch(uuid, cape, true))
				: Buffer.new(),
			slim,
		};
	} catch (e) {
		if (fetchMode) {
			return {
				skin: Buffer.new(),
				cape: Buffer.new(),
				slim: false,
			};
		}
		fetchMode = true;
		return await funnyFetch(url);
	}
}

function makeImageData(width: number, height: number): ImageData {
	const canvas = document.createElement("canvas");
	canvas.width = width;
	canvas.height = height;
	return (canvas.getContext("2d") as CanvasRenderingContext2D).getImageData(
		0,
		0,
		width,
		height
	);
}

async function blobToImageData(blob: Blob): Promise<ImageData> {
	return await new Promise((r) => {
		const canvas = document.createElement("canvas");
		const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
		const image = new Image();
		image.onload = function () {
			canvas.width = image.width;
			canvas.height = image.height;
			ctx.drawImage(image, 0, 0);
			r(ctx.getImageData(0, 0, canvas.width, canvas.height));
		};
		image.src = URL.createObjectURL(blob);
	});
}

function copyRawPixels(
	imageIn,
	imageOut,
	dx1,
	dy1,
	dx2,
	dy2,
	sx1,
	sy1,
	sx2,
	sy2
) {
	let srcX = dx1,
		srcY = sy1,
		dstX = dx2,
		dstY = dy1,
		width = sx2 - sx1,
		height = sy2 - sy1,
		imgSrcWidth = imageIn.width,
		imgDstWidth = imageOut.width,
		flip = dx1 > dx2;

	for (let y = 0; y < height; y++) {
		for (let x = 0; x < width; x++) {
			let srcIndex = (srcY + y) * imgSrcWidth + srcX + x;

			if (flip) {
				srcIndex = (srcY + y) * imgSrcWidth + srcX + (width - x - 1);
			}

			const i = srcIndex * 4;

			const r = imageIn.data[i],
				g = imageIn.data[i + 1],
				b = imageIn.data[i + 2],
				a = imageIn.data[i + 3];

			const di = ((dstY + y) * imgDstWidth + dstX + x) * 4;
			imageOut.data[di] = r;
			imageOut.data[di + 1] = g;
			imageOut.data[di + 2] = b;
			imageOut.data[di + 3] = a;
		}
	}

	return imageOut;
}

async function toEaglerSkin(blob: Blob): Promise<Uint8Array<ArrayBuffer>> {
	let jimpImage = await blobToImageData(blob),
		height = jimpImage.height;
	if (height != 64) {
		// assume 32 height skin
		let imageOut = makeImageData(64, 64);

		for (let i = 0; i < jimpImage.data.length; i++) {
			imageOut.data[i] = jimpImage.data[i];
		}

		imageOut = await copyRawPixels(
			jimpImage,
			imageOut,
			24,
			48,
			20,
			52,
			4,
			16,
			8,
			20
		);
		imageOut = await copyRawPixels(
			jimpImage,
			imageOut,
			28,
			48,
			24,
			52,
			8,
			16,
			12,
			20
		);
		imageOut = await copyRawPixels(
			jimpImage,
			imageOut,
			20,
			52,
			16,
			64,
			8,
			20,
			12,
			32
		);
		imageOut = await copyRawPixels(
			jimpImage,
			imageOut,
			24,
			52,
			20,
			64,
			4,
			20,
			8,
			32
		);
		imageOut = await copyRawPixels(
			jimpImage,
			imageOut,
			28,
			52,
			24,
			64,
			0,
			20,
			4,
			32
		);
		imageOut = await copyRawPixels(
			jimpImage,
			imageOut,
			32,
			52,
			28,
			64,
			12,
			20,
			16,
			32
		);
		imageOut = await copyRawPixels(
			jimpImage,
			imageOut,
			40,
			48,
			36,
			52,
			44,
			16,
			48,
			20
		);
		imageOut = await copyRawPixels(
			jimpImage,
			imageOut,
			44,
			48,
			40,
			52,
			48,
			16,
			52,
			20
		);
		imageOut = await copyRawPixels(
			jimpImage,
			imageOut,
			36,
			52,
			32,
			64,
			48,
			20,
			52,
			32
		);
		imageOut = await copyRawPixels(
			jimpImage,
			imageOut,
			40,
			52,
			36,
			64,
			44,
			20,
			48,
			32
		);
		imageOut = await copyRawPixels(
			jimpImage,
			imageOut,
			44,
			52,
			40,
			64,
			40,
			20,
			44,
			32
		);
		imageOut = await copyRawPixels(
			jimpImage,
			imageOut,
			48,
			52,
			44,
			64,
			52,
			20,
			56,
			32
		);

		jimpImage = imageOut;
	}

	const newBuff = new Uint8Array(16384);
	const bitmap = jimpImage.data;
	for (let i = 1; i < 64 ** 2; i++) {
		const bytePos = i * 4;
		// red, green, blue, alpha => alpha, blue, green, red
		newBuff[bytePos] = bitmap[bytePos + 3];
		newBuff[bytePos + 1] = bitmap[bytePos + 2];
		newBuff[bytePos + 2] = bitmap[bytePos + 1];
		newBuff[bytePos + 3] = bitmap[bytePos];
	}
	return newBuff;
}

async function responseToSkin(response: Response): Promise<Buffer> {
	return new Buffer(await toEaglerSkin(await response.blob()));
}

async function toEaglerCape(blob: Blob): Promise<Uint8Array<ArrayBuffer>> {
	const skinOut = new Uint8Array(1173);
	const skinIn = (await blobToImageData(blob)).data;
	let i, j;
	for (let y = 0; y < 17; ++y) {
		for (let x = 0; x < 22; ++x) {
			i = (y * 32 + x) << 2;
			j = (y * 23 + x) * 3;
			skinOut[j] = skinIn[i + 1];
			skinOut[j + 1] = skinIn[i + 2];
			skinOut[j + 2] = skinIn[i + 3];
		}
	}
	for (let y = 0; y < 11; ++y) {
		i = ((y + 11) * 32 + 22) << 2;
		j = ((y + 6) * 23 + 22) * 3;
		skinOut[j] = skinIn[i + 1];
		skinOut[j + 1] = skinIn[i + 2];
		skinOut[j + 2] = skinIn[i + 3];
	}
	return skinOut;
}

async function responseToCape(response: Response): Promise<Buffer> {
	return new Buffer(await toEaglerCape(await response.blob()));
}

async function lookUpInCache(url: string): Promise<Tex> {
	const value = urlCache[url];
	if (!value) {
		const v = await funnyFetch(url);
		if (v.skin.length == 0) {
			return v;
		}
		urlCache[url] = v;
	}
	return urlCache[url];
}

export async function handleSkinCape(
	isCapeNotSkin: boolean,
	packet: Buffer
): Promise<Buffer> {
	const id = packet.take(1).get(0);
	if (!isCapeNotSkin) {
		if (id == 0x03) {
			const part = packet.take(16);
			const uuid = bytesToUuid(part.toArray());
			const out = await lookUpInCache("profile://" + uuid);
			const slim = out.slim;
			const skinData = out.skin;
			if (skinData.length == 0) {
				return Buffer.new();
			}
			const res = Buffer.new();
			res.writeBytes([0x05]);
			res.extend(part);
			res.writeBytes([slim ? 1 : 0]);
			res.extend(skinData);
			return res;
		} else if (id == 0x06) {
			const part = packet.take(16);
			const url = new TextDecoder().decode(
				packet.take(
					packet.take(2).readUShort()
				).inner
			);
			if (new URL(url).hostname != "textures.minecraft.net") {
				return Buffer.new();
			}
			const out = await lookUpInCache(url);
			const slim = false;
			const skinData = out.skin;
			if (skinData.length == 0) {
				return Buffer.new();
			}
			const res = Buffer.new();
			res.writeBytes([0x05]);
			res.extend(part);
			res.writeBytes([slim ? 1 : 0]);
			res.extend(skinData);
			return res;
		}
	} else if (id == 0x03) {
		const part = packet.take(16);
		const uuid = bytesToUuid(part.toArray());
		const capeData = (await lookUpInCache("profile://" + uuid)).cape;
		if (capeData.length == 0) {
			return Buffer.new();
		}
		const res = Buffer.new();
		res.writeBytes([0x05]);
		res.extend(part);
		res.extend(capeData);
		return res;
	}
	return Buffer.new();
}
