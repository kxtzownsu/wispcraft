import { Buffer } from "../buffer";

export type BytesReader = ReadableStreamDefaultReader<Buffer>;
export type BytesWriter = WritableStreamDefaultWriter<Buffer>;

export function writeTransform<I, O>(
	writer: WritableStreamDefaultWriter<I>,
	transformer: (val: O) => I | Promise<I>
): WritableStream<O> {
	return new WritableStream({
		async write(val, _) {
			writer.write(await transformer(val));
		},
		close() {
			writer.close();
		},
	});
}

async function compress(buf: Buffer): Promise<Buffer> {
	const compressor = new CompressionStream("deflate");

	const writer = compressor.writable.getWriter();
	writer.write(buf.inner);
	writer.close();

	const data = Buffer.new();

	const reader = compressor.readable.getReader();
	while (true) {
		const { done, value } = await reader.read();
		if (done || !value) break;

		data.extend(new Buffer(value));
	}

	return data;
}

async function decompress(buf: Buffer): Promise<Buffer> {
	const compressor = new DecompressionStream("deflate");

	let writer = compressor.writable.getWriter();
	writer.write(buf.inner);
	writer.close();

	const data = Buffer.new();

	const reader = compressor.readable.getReader();
	while (true) {
		const { done, value } = await reader.read();
		if (done || !value) break;

		data.extend(new Buffer(value));
	}

	return data;
}

export function bufferTransformer(): TransformStream<Uint8Array, Buffer> {
	return new TransformStream({
		transform(chunk, controller) {
			controller.enqueue(new Buffer(chunk));
		},
	});
}

export function bufferWriter(
	write: WritableStreamDefaultWriter<Uint8Array>
): WritableStream<Buffer> {
	return writeTransform(write, (x) => x.inner);
}

export function lengthTransformer(): TransformStream<Buffer> {
	let currentPacket = Buffer.new();
	let currentSize = -1;
	return new TransformStream({
		transform(chunk, controller) {
			currentPacket.extend(chunk);
			while (true) {
				if (currentSize === -1) {
					let size: number;
					try {
						size = currentPacket.readVarInt();
					} catch (err) {
						break;
					}
					currentSize = size;
				}

				if (currentPacket.length < currentSize) {
					// too small, don't do anything
					break;
				}

				const pkt = currentPacket.take(currentSize);
				controller.enqueue(pkt);
				currentSize = -1;
			}
		},
	});
}

export class Decompressor {
	compressionThresh: number = -1;
	transform: TransformStream<Buffer>;

	constructor() {
		const self = this;
		this.transform = new TransformStream({
			async transform(chunk, controller) {
				if (self.compressionThresh === -1) {
					controller.enqueue(chunk);
					return;
				}

				const len = chunk.readVarInt();

				if (len >= self.compressionThresh) {
					controller.enqueue(await decompress(chunk));
				} else if (len == 0) {
					controller.enqueue(chunk);
				} else {
					throw new Error(
						"Decompressor: server sent compressed packet below threshold"
					);
				}
			},
		});
	}
}

export class Compressor {
	compressionThresh: number = -1;

	async transform(chunk: Buffer): Promise<Buffer> {
		if (this.compressionThresh === -1) {
			return chunk;
		}

		const packet = Buffer.new();
		// TODO: avoid the copies here
		if (chunk.length < this.compressionThresh) {
			packet.writeVarInt(0);
			packet.extend(chunk);
		} else {
			const compressed = await compress(chunk);
			packet.writeVarInt(chunk.length);
			packet.extend(compressed);
		}

		return packet;
	}
}

export function eagerlyPoll<T>(
	stream: ReadableStream<T>,
	buffer: number
): ReadableStream<T> {
	return new ReadableStream(
		{
			async start(controller) {
				const reader = stream.getReader();
				while (true) {
					const { done, value } = await reader.read();
					if (done || !value) break;
					controller.enqueue(value);
				}
				controller.close();
			},
		},
		new CountQueuingStrategy({ highWaterMark: buffer })
	);
}
