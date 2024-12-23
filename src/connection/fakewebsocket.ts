import { Connection } from ".";
import { Buffer } from "../buffer";
import { showUI } from "../ui";
// @ts-ignore typescript sucks
import wispcraft from "./wispcraft.png";

class WispWS extends EventTarget {
	inner: Connection;
	url: string;

	constructor(uri: string) {
		super();

		this.url = uri;
		this.inner = new Connection(uri);
	}

	start() {
		this.inner.forward(() => {
			this.dispatchEvent(new Event("open"));
		});
		(async () => {
			try {
				while (true) {
					const { done, value } = await this.inner.eaglerOut.read();
					if (done || !value) break;

					this.dispatchEvent(
						new MessageEvent("message", {
							data: typeof value === "string" ? value : value.inner,
						})
					);
				}
				this.dispatchEvent(new Event("close"));
			} catch (err) {
				console.error(err);
				this.dispatchEvent(new Event("error"));
			}
		})();
	}

	send(chunk: Uint8Array | ArrayBuffer | string) {
		let buf: Buffer;
		if (typeof chunk == "string") {
			if (chunk.toLowerCase() == "accept: motd") {
				this.inner.ping();
			}
			return;
		} else if (chunk instanceof ArrayBuffer) {
			buf = new Buffer(new Uint8Array(chunk), true);
		} else {
			buf = new Buffer(chunk, true);
		}
		this.inner.eaglerIn.write(buf);
	}

	close() {
		try {
			this.inner.eaglerIn.close();
		} catch (err) {}
	}
}
class SettingsWS extends EventTarget {
	constructor() {
		super();
		setTimeout(() => {
			this.dispatchEvent(new Event("open"));
		});
	}
	send(chunk: Uint8Array | ArrayBuffer | string) {
		if (typeof chunk === "string" && chunk.toLowerCase() === "accept: motd") {
			this.dispatchEvent(
				new MessageEvent("message", {
					data: JSON.stringify({
						name: "Settings",
						brand: "mercuryworkshop",
						vers: "wispcraft/1.0",
						cracked: true,
						time: Date.now(),
						uuid: "00000000-0000-0000-0000-000000000000",
						type: "motd",
						data: {
							cache: false,
							icon: true,
							online: 0,
							max: 0,
							players: [],
							motd: ["Sign in with Microsoft", "Configure Proxy URL"],
						},
					}),
				})
			);
			let image = new Image();
			image.src = wispcraft;
			image.onload = () => {
				let canvas = document.createElement("canvas");
				canvas.width = image.width;
				canvas.height = image.height;
				let ctx = canvas.getContext("2d")!;
				ctx.drawImage(image, 0, 0);
				let pixels = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
				this.dispatchEvent(
					new MessageEvent("message", { data: new Uint8Array(pixels) })
				);
			};
		} else {
			showUI(null);
			this.dispatchEvent(new CloseEvent("close"));
		}
	}
	close() {}
}

const NativeWebSocket = WebSocket;
export function makeFakeWebSocket(): typeof WebSocket {
	return new Proxy(WebSocket, {
		construct(_target, [uri, protos]) {
			let url = new URL(uri);
			if (url.host == "java") {
				const ws = new WispWS(uri);
				ws.start();
				return ws;
			} else if (url.host == "settings") {
				return new SettingsWS();
			} else {
				return new NativeWebSocket(uri, protos);
			}
		},
	});
}
