import { emitter } from '$lib/server/events';
import { TwitchStuff } from '$lib/server/twitch';

import { redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async (_request) => {
	return {
		twitch: {
			user: TwitchStuff.getUser() ?? '(unknown)'
		}
	}
};

export const actions: Actions = {
	twitch_connect: async (_event) => {
		const authURL = TwitchStuff.getAuthURI();
		redirect(303, authURL);
	},
	toast: async(request) => {
		const data = await request.request.formData()
		emitter.emit('toast', {
			time: Date.now(),
			duration: 5000,
			message: data.get('toast_message')!.toString(),
		});
	}
};
