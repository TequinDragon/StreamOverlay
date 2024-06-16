import path from 'path';
import { promises as fs } from 'fs';
import { platform } from 'node:process';

import { APPDATA as windows_APPDATA, HOME } from '$env/static/private';

// Store credentials in the user's %APPDATA% or ~/.config/ paths (depending if you're running this on Windows or not).
const configPath =
	platform == 'win32'
		? path.resolve(windows_APPDATA, 'stream-overlay')
		: path.resolve(HOME, '.config', 'stream-overlay');

// Ensure the configuration directory exists by making it (using recursive helps make errors go away).
await fs.mkdir(configPath, { recursive: true });

// Secrets secrets, many secrets.
export const kTokensFile = path.resolve(configPath, 'config.json');

interface TwitchAuth {
	userId: number;
	user: string;
	accessToken: string;
	refreshToken: string | null;
	expires: Date;
	obtained: Date;
}

interface config {
	twitch?: TwitchAuth;
}

class Configuration {
	public data: config;
	constructor(private readonly path: string) {
		this.data = {};
	}

	public async commit (): Promise<void> {
		const payload = JSON.stringify(this.data)
		// console.debug(`Writing config to ${this.path}`, this.data, payload)
		await fs.writeFile(this.path, JSON.stringify(this.data), 'utf-8');
	}

	public load = async (): Promise<void> => {
		this.data = await this.read();
		if (this.data === null)
			this.data = {}
	};

	private async read(): Promise<config> {
		const payload = await fs.readFile(this.path, 'utf-8')
		const data = JSON.parse(payload, (_key, value) => {
			if (typeof(value) !== "string")
				return value

			const date = Date.parse(value);
			if (!isNaN(date))
				return new Date(date);

			return value;
		})

		// console.debug(`Loaded data from ${this.path}`, payload, data)
		return data;
	}
}

export const config = new Configuration(kTokensFile);
await config.load();
