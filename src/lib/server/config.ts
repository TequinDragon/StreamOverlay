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

	public commit = async (): Promise<void> =>
		fs.writeFile(this.path, JSON.stringify(this.data), 'utf-8');

	public load = async (): Promise<void> => {
		this.data = await this.read();
	};

	private read = (): Promise<config> =>
		fs
			.readFile(this.path, 'utf-8')
			.then((data) =>
				JSON.parse(data, (_key, value) => {
					const date = Date.parse(value);
					if (date !== Number.NaN) return new Date(date);
					return value;
				}),
			)
			.catch((_e) => {
				return {};
			});
}

export const config = new Configuration(kTokensFile);
await config.load();
