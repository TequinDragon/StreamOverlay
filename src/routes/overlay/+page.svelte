<script lang="ts">
	import ListItem from '$lib/List.svelte';
	import List from '$lib/List.svelte';
	import Panel from '$lib/Panel.svelte';
	import { onMount } from 'svelte';

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

<style>
	:global(body) {
		color: #fff;
	}
</style>
