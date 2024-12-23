import nodeResolve from "@rollup/plugin-node-resolve";
import replace from "@rollup/plugin-replace";
import terser from "@rollup/plugin-terser";
import typescript from "rollup-plugin-typescript2";

import { execSync } from "node:child_process";
import { readFile } from "node:fs/promises";
import dataUri from "@rollup/plugin-data-uri";
import url from "@rollup/plugin-url";

const pkg = JSON.parse(await readFile("package.json"));

const commonPlugins = () => [
	typescript(),
	dataUri(),
	url({ limit: 9999999999999999 }),
	terser(),
	nodeResolve({
		browser: true,
	}),
	replace({
		"self.VERSION": JSON.stringify(pkg.version),
		"self.COMMITHASH": (() => {
			try {
				let hash = JSON.stringify(
					execSync("git rev-parse --short HEAD", {
						encoding: "utf-8",
					}).replace(/\r?\n|\r/g, "")
				);

				return hash;
			} catch (e) {
				return "unknown";
			}
		})(),
	}),
];

const configs = [
	{
		input: "./src/index.ts",
		output: {
			file: "dist/index.js",
			format: "umd",
			name: "wispcraft",
			sourcemap: true,
			exports: "named",
		},
		plugins: commonPlugins(),
	},
];

export default configs;
