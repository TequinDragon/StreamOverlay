import { TWITCH_CLIENT_ID, TWITCH_CLIENT_SECRET, TWITCH_USER_NAME } from '$env/static/private';
import {
	RefreshingAuthProvider,
	exchangeCode,
	getTokenInfo,
	type AuthProvider,
} from '@twurple/auth';
import { ApiClient } from '@twurple/api';
import { EventSubWsListener } from '@twurple/eventsub-ws';
import { EventSubChannelFollowEvent } from '@twurple/eventsub-base';

import WebSocket from 'ws';
import { config, kTokensFile } from './config';
import { EventEmitter } from 'events';

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

interface TwitchEventMap {
	onChannelFollow: [EventSubChannelFollowEvent];
}

export type TwitchEventEmitter = EventEmitter<TwitchEventMap>;

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

	public static getUser(): string | null {
		return config.data.twitch?.user ?? null;
	}

	public static getUserId(): number | null {
		return config.data.twitch?.userId ?? null;
	}

	private static _auth: AuthProvider | null = null;
	public static getAuth(): AuthProvider {
		if (this._auth != null) return this._auth;

		const auth = new RefreshingAuthProvider({
			clientId: TWITCH_CLIENT_ID,
			clientSecret: TWITCH_CLIENT_SECRET,
		});
		const twitch = config.data.twitch;
		if (twitch == null) throw new Error('missing credentials');
		auth.addUserForToken({
			accessToken: twitch.accessToken,
			refreshToken: twitch.refreshToken,
			expiresIn: (twitch.expires.getTime() - twitch.obtained.getTime()) / 1000,
			obtainmentTimestamp: twitch.obtained.getTime(),
		});

		auth.onRefresh(async (userId, token) => {
			const obtained = new Date(token.obtainmentTimestamp);
			const expires = new Date(token.obtainmentTimestamp + token.expiresIn! * 1000);
			config.data.twitch = {
				...twitch,
				accessToken: token.accessToken,
				refreshToken: token.refreshToken,
				obtained,
				expires,
			};
			await config.commit();
		});

		auth.onRefreshFailure(async (_userId, error) => {
			console.error('There was a problem while refreshing the Twitch access token', error);

			// Clear the saves user tokens in case they're really invalid and need to start over.
			config.data.twitch = undefined;
			await config.commit();
		});

		return (this._auth = auth);
	}

	private static _apiClient: ApiClient | null = null;
	public static getAPI(): ApiClient {
		if (this._apiClient != null) return this._apiClient;

		return (this._apiClient = new ApiClient({ authProvider: this.getAuth() }));
	}

	private static _eventSubListener: EventSubWsListener | null = null;
	private static async _getEventSubListener(): Promise<EventSubWsListener> {
		if (this._eventSubListener != null) return this._eventSubListener;

		const twitchApi = new ApiClient({ authProvider: this.getAuth() });
		//const user = await twitchApi.users.getUserByName(config.data.twitch!.user);

		this._eventSubListener = new EventSubWsListener({
			apiClient: twitchApi,
			url: kTwitchWSEndpoint,
			// logger: {
			// 	minLevel: 'debug',
			// }
		});

		this._eventSubListener.start();

		return this._eventSubListener;
	}

	private static _emitter: TwitchEventEmitter | null = null;

	public static async getEventSubListener(): Promise<TwitchEventEmitter> {
		if (this._emitter != null) return this._emitter;

		const eventSub = await this._getEventSubListener();
		const twitchApi = new ApiClient({ authProvider: TwitchStuff.getAuth() });
		const user = await twitchApi.users.getUserByName(config.data.twitch!.user);

		// Each EventSubListener.on<Event> will create a new subscription request to Twitch
		// Which isn't suitable for multiple listeners...
		// So we need to create a single subscription, and re-emit them in our own EventEmitter
		// to allow multiple listeners to the same event.
		const emitter = (this._emitter = new EventEmitter<TwitchEventMap>());
		// TODO: Instead of hardcoding each event. Somehow subscribe to each event we want automatically.
		eventSub.onChannelFollow(user!, user!, (event) => emitter.emit('onChannelFollow', event));

		return emitter;
	}
}
