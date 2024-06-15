import { TwitchStuff } from '$lib/server/twitch';
import { redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async (_request) => {};

export const actions: Actions = {
	twitch_connect: async (_event) => {
		const authURL = TwitchStuff.getAuthURI();
		redirect(303, authURL);
	},
};
