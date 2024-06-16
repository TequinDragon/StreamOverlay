import { emitter } from '$lib/server/events';
import { TwitchStuff } from '$lib/server/twitch';

import { redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async (_request) => {
	const api = TwitchStuff.getAPI();
	const userId = TwitchStuff.getUserId()!;
	return {
		twitch: {
			user: TwitchStuff.getUser() ?? '(unknown)',
			stream: {
				title: (await api.channels.getChannelInfoById(userId))?.title ?? '',
			},
		},
	};
};

export const actions: Actions = {
	twitch_connect: async (_event) => {
		const authURL = TwitchStuff.getAuthURI();
		redirect(303, authURL);
	},
	twitch_update: async (request) => {
		const data = await request.request.formData();
		const twitch = TwitchStuff.getAPI();
		twitch.channels.updateChannelInfo(TwitchStuff.getUserId()!, {
			title: data.get('title')?.toString(),
		});
		// twitch.channels.
	},
	toast: async (request) => {
		const data = await request.request.formData();
		emitter.emit('toast', {
			time: Date.now(),
			duration: 5000,
			message: data.get('toast_message')!.toString(),
		});
	},
};
