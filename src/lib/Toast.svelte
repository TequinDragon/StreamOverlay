<script lang="ts" context="module">
	export interface ToastMessage {
		message: string;
		duration: number;
		time?: number;
	}
</script>

<script lang="ts">
	import { fade } from 'svelte/transition';
</script>

<div class="p-4 bg-fuchsia-400 inline-block mx-auto" transition:fade>
	<slot></slot>
</div>
