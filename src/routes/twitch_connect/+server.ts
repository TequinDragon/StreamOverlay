import { TwitchStuff } from '$lib/server/twitch';
import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async (params) => {
	const token = params.url.searchParams.get('code');
	if (token != null) {
		TwitchStuff.fetchUserAccessToken(token);
		redirect(307, '/');
	} else {
		console.log(TwitchStuff.getAuthURI());
		redirect(307, TwitchStuff.getAuthURI());
	}
};
