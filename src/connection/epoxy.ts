import { EpoxyIoStream } from "@mercuryworkshop/epoxy-tls";
import initEpoxy, {
	EpoxyClient,
	EpoxyClientOptions,
} from "@mercuryworkshop/epoxy-tls/minimal-epoxy-bundled";

export let wisp =
	new URLSearchParams(location.search).get("wisp") ||
	localStorage.getItem("wispcraft_wispurl") ||
	"ws://localhost:5001/";
let connectedwisp = "";

let initted = false;
let epoxy: EpoxyClient | null = null;

initEpoxy();
async function create() {
	if (!initted) {
		await initEpoxy();
		initted = true;
	}

	if (!epoxy || wisp != connectedwisp) {
		const options = new EpoxyClientOptions();
		options.wisp_v2 = false;
		options.udp_extension_required = false;
		connectedwisp = wisp;
		return (epoxy = new EpoxyClient(wisp, options));
	}
}

export async function epoxyFetch(url: string, opts?: any): Promise<Response> {
	await create();

	// create() inits epoxy
	return await epoxy!.fetch(url, opts);
}

export async function connect_tcp(socket: string): Promise<EpoxyIoStream> {
	await create();

	// create() inits epoxy
	return await epoxy!.connect_tcp(socket);
}

export function set_wisp_server(wisp_url: string) {
	wisp = wisp_url;
}

export async function reconnect() {
	await create();

	// create() inits epoxy
	await epoxy!.replace_stream_provider();
}
