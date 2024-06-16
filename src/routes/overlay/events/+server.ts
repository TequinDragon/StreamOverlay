import type { RequestHandler } from './$types';
import { TwitchStuff, type TwitchEventEmitter } from '$lib/server/twitch';
import { emitter } from '$lib/server/events';

import { EventSubChannelFollowEvent } from '@twurple/eventsub-base'
import { produce } from 'sveltekit-sse';

import type { ToastMessage } from '$lib/Toast.svelte';

export const POST: RequestHandler = (request) => {
	return produce(async ({ emit, lock }) => {
		console.log('Starting new overlay SSE session')

		const onChannelFollow = (event: EventSubChannelFollowEvent) => {
			console.log(`Got a follow from ${event.userDisplayName}!`)
			const message: ToastMessage = {
				duration: 10_000,
				message: `New follow from ${event.userDisplayName}!`,
				time: Date.now()
			}
			emit('toast', JSON.stringify(message))
		}
		const toastListener = (message: ToastMessage) => {
			emit('toast', JSON.stringify(message));
		}

		let eventSub: TwitchEventEmitter | null = null;
		try{
			emitter.on('toast', toastListener);

			eventSub = await TwitchStuff.getEventSubListener()
			eventSub.on('onChannelFollow', onChannelFollow)
		}catch(e) {
			console.error("There was error with getting the EventSub")
			// Allow the SSE to close by unlocking it
			lock.set(false)
		}
		finally {
			return (stream) => {
				console.log('Stopping overlay SSE session')

				emitter.off('toast', toastListener)
				eventSub?.off('onChannelFollow', onChannelFollow)
			}
		}
	});
};
