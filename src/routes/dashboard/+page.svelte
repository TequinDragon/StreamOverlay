<script lang="ts">
	import { enhance } from '$app/forms';
	import type { PageData } from './$types';
	import { Button, Card, Input, Label } from 'flowbite-svelte';

	import twitchlLogo from '$lib/assets/twitch-logo.png';
	import obsLogo from '$lib/assets/obs-logo.png';

	export let data: PageData;

	interface ApiStatus {
		name: string;
		icon: string;
		status: string;
		actions: Record<string, string>;
	}

	// TODO: This needs to be served from +page.server.ts
	let apiStatus: ApiStatus[] = [
		{
			name: 'Twitch',
			icon: twitchlLogo,
			status: data.twitch.user ?? '(unknown)',
			actions: {
				Connect: '?/twitch_connect',
			},
		},
		{
			name: 'OBS Studio',
			icon: obsLogo,
			status: '(unknown)',
			actions: {},
		},
	];
</script>

<div class="m-2 flex gap-2">
	<Card>
		<h5 class="text-2xl">API Status</h5>
		<ul class="divide-y divide-gray-200 dark:divide-gray-700 dark:bg-gray-800">
			{#each apiStatus as connection}
				<li class="pt-1">
					<div class="flex flex-row justify-between">
						<div class="flex-none min-w-0 items-center">
							<img src={connection.icon} alt="Twitch" class="w-10 h-10" />
						</div>
						<div class="flex-1">
							<div class="ml-3">
								<p class="truncate font-medium text-grey-900">
									{connection.name}
								</p>
								<div><i>{connection.status}</i></div>
							</div>
						</div>
						<div class="flex-none items-center text-base font-semibold text-gray-900">
							<form method="post">
								{#each Object.keys(connection.actions) as action}
									<Button type="submit" formaction={connection.actions[action]}>{action}</Button>
								{/each}
							</form>
						</div>
					</div>
				</li>
			{/each}
		</ul>
	</Card>

	<Card>
		<form
			action="?/twitch_update"
			method="post"
			use:enhance={() => {
				return ({ update }) => {
					update({ reset: false });
				};
			}}
		>
			<h5 class="text-2xl mb-2">Stream Settings</h5>
			<div class="grid gap-2 mb-2">
				<div>
					<Label for="stream-title">Stream Title</Label>
					<Input
						id="stream-title"
						name="title"
						type="text"
						placeholder="Licking 9V Batteries"
						value={data.twitch.stream.title}
					/>
				</div>
			</div>
			<Button type="submit" class="w-fit">Update</Button>
		</form>
	</Card>

	<Card>
		<form action="?/toast" method="post" use:enhance>
			<h5 class="text-2xl mb-2">Toast Notification</h5>
			<div class="grid gap-6 mb-2">
				<Input id="toast_message" name="toast_message" type="text" placeholder="Message" />
			</div>
			<Button class="w-fit" type="submit">Send Toast</Button>
		</form>
	</Card>
</div>
