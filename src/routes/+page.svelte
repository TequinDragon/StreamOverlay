<!-- This page is intentionally left blank -->
<!-- I really don't non-stream stuff to show up in OBS -->
<script lang="ts">
	import { onMount } from 'svelte';
	import { redirect } from '@sveltejs/kit';

	onMount(() => {
		if (window.obsstudio != undefined) {
			window.location.assign('/overlay');
		}
	});
</script>
