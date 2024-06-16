<script lang="ts">
	import ListItem from '$lib/List.svelte';
	import List from '$lib/List.svelte';
	import Panel from '$lib/Panel.svelte';
	import Toast from '$lib/Toast.svelte';
	import { type ToastMessage } from '$lib/Toast.svelte';
	import { onMount } from 'svelte';
	import { source } from 'sveltekit-sse';

	import { writable } from 'svelte/store';
	import { flip } from 'svelte/animate';
	import { fade } from 'svelte/transition';

	const todos = [
		{ item: 'Build a working To Do list', selected: true, description: 'Test' },
		{ item: 'Check off this item' },
	];

	let obs = '(OBS is not available)';
	onMount(() => {
		if (window.obsstudio != undefined) {
			obs = window.obsstudio.pluginVersion;
		}
	});
	const backendEvents = source('overlay/events');

	interface ToastNotification {
		id: number;
		content: string;
		created: number;
		expires: number;
	}

	const toasts = writable<ToastNotification[]>([]);
	let toastIds = 0;
	const toastMessage = backendEvents.select('toast').json();
	$: {
		const toast: ToastMessage | null = $toastMessage;

		if (toast && toast.message != '') {
			if (toast.time == null) toast.time == Date.now();
			console.log(`got a toast at ${$toastMessage.time}: ${$toastMessage.message}`);
			toasts.update((a) => [
				...a,
				{
					id: toastIds++,
					content: `<p>${toast.message}</p>`,
					created: Date.now(),
					expires: Date.now() + toast.duration,
				},
			]);
		}
	}

	toasts.subscribe((t) => {
		const now = Date.now();
		const earliest = t.sort((a, b) => a.expires - b.expires)[t.length - 1];
		if (earliest == undefined) return;
		setTimeout(() => {
			const now = Date.now();
			toasts.update((t) => t.filter((t) => t.expires > now));
		}, earliest.expires - now);
	});
</script>

<List items={todos} />
<Panel />

<div class="absolute bottom-0 w-screen text-center">
	<h1 class="mb-2 text-6xl font-bold uppercase" style="-webkit-text-stroke: 0.04em black">
		There is where the stream overlay would go
	</h1>
		<img
			class="mx-auto"
			src="https://media1.tenor.com/m/N2hV1al2rjcAAAAC/if-i-had-one-angry.gif"
			alt=""
		/>
</div>

<div class="grid grid-cols-1 absolute top-10 w-screen content-center">
	{#each $toasts as toast (toast.id)}
		<div
			animate:flip={{ duration: 250, delay: 250 }}
			transition:fade={{ duration: 250 }}
			class="inline-block mx-auto"
		>
			<Toast>
				{@html toast.content}
			</Toast>
		</div>
	{/each}
</div>

<style>
	:global(body) {
		color: #fff;
	}
</style>
