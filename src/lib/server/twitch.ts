import { TWITCH_CLIENT_ID, TWITCH_CLIENT_SECRET } from '$env/static/private';
import { StaticAuthProvider } from '@twurple/auth';
import { IncomingMessage } from 'http';

import { promises as fs } from 'fs';

const tokens_file = 'tokens.json';

const userTokens = await fs
	.readFile(tokens_file, 'utf-8')
	.then((buffer) => {
		return JSON.parse(buffer);
	})
	.catch(() => {
		return {};
	});

const scopes = [
	'channel:manage:broadcast',
	'channel:read:polls',
	'channel:manage:polls',
	'channel:read:predictions',
	'channel:manage:predictions',
	'user:manage:whispers',
];

export async function updateAuthToken(code: string): Promise<void> {
	let newUserTokens = {
		auth: code,
	};

	await fs.writeFile(tokens_file, JSON.stringify(newUserTokens), 'utf-8');
}

export function getAuthURI(): string {
	return (
		`https://id.twitch.tv/oauth2/authorize` +
		`?client_id=${TWITCH_CLIENT_ID}` +
		`&redirect_uri=${encodeURI('http://localhost:5173/twitch_connect')}` +
		`&response_type=code` +
		`&scope=${encodeURI(scopes.join(' '))}`
	);
}

export function getAuthToken() {
	if (userTokens.auth == undefined) {
		console.warn(`Please navigate to ${getAuthURI()}`);
		return '';
	}

	return userTokens.auth;
}

const authToken = '';
