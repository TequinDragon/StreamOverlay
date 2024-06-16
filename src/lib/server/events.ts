import EventEmitter from 'events';
import type { ToastMessage } from '$lib/Toast.svelte';

interface OverlayEventMap {
	toast: [ToastMessage];
}

// Singleton of an event emitter to receive events from the dashboard and be consumed by the overlay SSE.
// TODO (TequinDragon): create Typescript Typed events we want to support.
export const emitter = new EventEmitter<OverlayEventMap>();
