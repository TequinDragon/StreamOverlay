<!-- This page is intentionally left blank -->
<!-- I really don't need non-stream stuff to show up in OBS -->
<script lang="ts">
	import { onMount } from 'svelte';

	onMount(() => {
		if (window.obsstudio != undefined) {
			window.location.assign('/overlay');
		}
	});
</script>
