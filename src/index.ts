import { getProfile, UserInfo } from "./auth";
import { epoxyFetch } from "./connection/epoxy";
import { makeFakeWebSocket } from "./connection/fakewebsocket";

const nativeFetch = fetch;
type AuthStore = {
	user: UserInfo | null;
	yggToken: string;
	yggRefresh: string;
};

export let authstore: AuthStore;
export const getProfileFinished: Promise<void> = checkAuth();

async function checkAuth() {
	authstore = {
		user: null,
		yggToken: localStorage["yggToken"],
		yggRefresh: localStorage["yggRefresh"],
	};
	if (!authstore.yggToken) return;

	try {
		authstore.user = await getProfile(authstore.yggToken);
	} catch (e) {}
}

// replace websocket with our own
window.WebSocket = makeFakeWebSocket();

// eagler will fetch texture packs, will fail if cors isn't set
// should really fix this but whatever
window.fetch = async function (url: RequestInfo | URL, init?: RequestInit) {
	try {
		return await nativeFetch(url, init);
	} catch (e) {
		return await epoxyFetch("" + url, init);
	}
};

type EaglerXOptions = any;
let eagoptions: EaglerXOptions;
// append settings to the server list
const settings = { addr: "settings", name: "Wispcraft Settings" };
Object.defineProperty(window, "eaglercraftXOpts", {
	get() {
		if (eagoptions) {
			return eagoptions;
		}
		return { servers: [settings] };
	},
	set(v) {
		eagoptions = v;
		if (eagoptions?.servers) {
			eagoptions.servers.unshift(settings);
		} else {
			eagoptions.servers = [settings];
		}
	},
});
