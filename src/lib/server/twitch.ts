import { TWITCH_CLIENT_ID, TWITCH_CLIENT_SECRET, TWITCH_USER_NAME } from '$env/static/private';
import {
	RefreshingAuthProvider,
	StaticAuthProvider,
	TokenInfo,
	exchangeCode,
	getAppToken,
	getTokenInfo,
	type AuthProvider,
} from '@twurple/auth';
import { ApiClient } from '@twurple/api';
import { EventSubWsListener } from '@twurple/eventsub-ws';
import { IncomingMessage } from 'http';

import WebSocket from 'ws';
import { config, kTokensFile } from './config';

const kTwitchWSEndpoint = 'wss://eventsub.wss.twitch.tv/ws';

const scopes = [
	'channel:manage:broadcast',
	'channel:read:polls',
	'channel:manage:polls',
	'channel:read:predictions',
	'channel:manage:predictions',
	'moderator:read:followers',
	'user:manage:whispers',
];

export class TwitchStuff {
	public static async fetchUserAccessToken(token: string): Promise<void> {
		const accessToken = await exchangeCode(
			TWITCH_CLIENT_ID,
			TWITCH_CLIENT_SECRET,
			token,
			'http://localhost:5173/twitch_connect',
		);
		const tokenInfo = await getTokenInfo(accessToken.accessToken, TWITCH_CLIENT_ID);

		config.data.twitch = {
			expires: tokenInfo.expiryDate ?? new Date(0),
			accessToken: accessToken.accessToken,
			refreshToken: accessToken.refreshToken,
			user: tokenInfo.userName ?? '',
			obtained: new Date(accessToken.obtainmentTimestamp),
		};

		await config.commit();
	}

	public static getAuthURI(): string {
		return (
			`https://id.twitch.tv/oauth2/authorize` +
			`?client_id=${TWITCH_CLIENT_ID}` +
			`&redirect_uri=${encodeURI('http://localhost:5173/twitch_connect')}` +
			`&response_type=code` +
			`&scope=${encodeURI(scopes.join(' '))}`
		);
	}

	public static isTokenExpired(): boolean {
		const expires = config.data.twitch?.expires ?? new Date(0);
		return expires < new Date();
	}

	public static isTokenValid = (): Promise<boolean> =>
		Promise.resolve(config.data.twitch?.accessToken ?? null)
			.then((t) => (t != null ? getTokenInfo(t, TWITCH_CLIENT_ID) : null))
			.then((ti) => ti instanceof TokenInfo)
			.catch((_e) => false);

	public static getAuthToken() {
		if (this.isTokenExpired()) {
			console.warn(`Please navigate to ${this.getAuthURI()}`);
			return '';
		}

		return config.data.twitch!.accessToken;
	}

	private static _auth: AuthProvider | null = null;
	public static getAuth(): AuthProvider {
		if (this._auth != null) return this._auth;

		const auth = new RefreshingAuthProvider({
			clientId: TWITCH_CLIENT_ID,
			clientSecret: TWITCH_CLIENT_SECRET,
		});
		const token = config.data.twitch;
		if (token == null) throw new Error('missing credentials');
		auth.addUserForToken({
			accessToken: token.accessToken,
			refreshToken: token.refreshToken,
			expiresIn: (token.expires.getTime() - token.obtained.getTime()) / 1000,
			obtainmentTimestamp: token.obtained.getTime(),
		});

		return (this._auth = auth);
	}

	private static _eventSubListener: EventSubWsListener | null = null;
	public static async createEventSubConnection(): Promise<EventSubWsListener> {
		if (this._eventSubListener != null) return this._eventSubListener;

		const twitchApi = new ApiClient({ authProvider: this.getAuth() });
		//const user = await twitchApi.users.getUserByName(config.data.twitch!.user);

		this._eventSubListener = new EventSubWsListener({
			apiClient: twitchApi,
			url: kTwitchWSEndpoint,
		});

		return this._eventSubListener;
	}
}
