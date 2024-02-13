<script>
	import '../app.pcss';
	import { ModeWatcher } from 'mode-watcher';

	import { Button } from '$lib/components/ui/button';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import { Sun, Moon } from 'lucide-svelte';

	import { toggleMode } from 'mode-watcher';

	import { dev } from '$app/environment';
	import { inject } from '@vercel/analytics';
	import { connected, players, selectedPlayer } from '$lib/stats';
	import { updateScroll } from '$lib/webSocketLogic';

	inject({ mode: dev ? 'development' : 'production' });
</script>

<ModeWatcher />

<div class="absolute right-4 top-4">
	<Button on:click={toggleMode} variant="outline" size="icon" class="float-right">
		<Sun
			class="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0"
		/>
		<Moon
			class="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100"
		/>
		<span class="sr-only">Toggle theme</span>
	</Button>
	<div class="float-right mr-4">
		<DropdownMenu.Root>
			<DropdownMenu.Trigger asChild let:builder>
				<Button variant="outline" builders={[builder]}>Choose Player</Button>
			</DropdownMenu.Trigger>
			<DropdownMenu.Content class="w-56">
				<DropdownMenu.Label>Who do you want to track?</DropdownMenu.Label>
				<DropdownMenu.Separator />
				<DropdownMenu.RadioGroup bind:value={$selectedPlayer}>
					{#each players as player}
						<DropdownMenu.RadioItem
							value={player}
							disabled={!$connected[player]}
							on:click={() => updateScroll.update((i) => i + 1)}
						>
							{#if $connected[player]}
								<span>{player}</span>
							{:else}
								<span>{player} (Offline)</span>
							{/if}
						</DropdownMenu.RadioItem>
					{/each}
				</DropdownMenu.RadioGroup>
			</DropdownMenu.Content>
		</DropdownMenu.Root>
	</div>
</div>

<div class="flex h-screen flex-col items-center p-4">
	<h1 class="mb-8 mt-4 text-3xl">E05-Tracker</h1>
	<slot />
</div>
