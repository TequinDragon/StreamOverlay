<!-- Simple of Items -->
<script context="module" lang="ts">
	export type ListItem = {
		item: string;
		description?: string;
		selected?: boolean;
	};
</script>

<script lang="ts">
	export let items: ListItem[] = [];
</script>

<!-- <ul class="list-disc ms-4"> -->
<ul class="w-auto list-none">
	{#each items as item}
		<li>
			<input type="checkbox" checked={item.selected} />
			{item.item}
			{#if item.description != undefined}
				<div class="mx-7 text-sm">
					{item.description}
				</div>
			{/if}
		</li>
	{/each}
</ul>
