<script lang="ts">
	import { io } from '$lib/webSocketConnection.js';
	import * as Table from '$lib/components/ui/table';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import { Button } from '$lib/components/ui/button';
	import { lapTimes, lapSplits } from '$lib/stats';
	import { ChevronUp, ChevronDown, Clock, Diff, TrendingUp, Hash, Timer } from 'lucide-svelte';

	let lap_times: number[] = [];
	let lap_splits: number[] = [];
	let est_pace: number[] = [];
	let avg_lap_times: number[] = [];
	let current_avg_lap = 0;
	let current_lap_split = 0;
	io.on('lapCompletedResponse', (message) => {
		lap_times = [...lap_times, message.last_lap_time];
		current_lap_split += message.last_lap_time;
		lap_splits = [...lap_splits, current_lap_split];

		const sum = lap_times.reduce((a, b) => a + b, 0);
		current_avg_lap = sum / lap_times.length || 0;
		avg_lap_times = [...avg_lap_times, current_avg_lap];
		est_pace = [...est_pace, lap_times[0] + 59 * current_avg_lap];
	});

	let currentCPSplit = 0;
	let currentCPCount = 0;
	io.on('cpCompletedResponse', (message) => {
		currentCPSplit = message.current_cp_split;
		currentCPCount = message.current_cp_count;
	});

	io.on('resetResponse', () => {
		lap_times = [];
		lap_splits = [];
		est_pace = [];
		avg_lap_times = [];
		current_avg_lap = 0;
		current_lap_split = 0;
	});

	let test = [56890, 53400, 53690, 53810, 53210, 53000, 54150];

	let test_splits = test.map(
		(
			(sum) => (value) =>
				(sum += value)
		)(0)
	);
	let comparison = 'tween';

	const formatTime = (seconds: number) => {
		if (isNaN(seconds)) return 0;
		return new Date(1000 * Math.floor(seconds)).toISOString().substring(14, 19);
	};
</script>

<DropdownMenu.Root>
	<DropdownMenu.Trigger asChild let:builder>
		<Button variant="outline" builders={[builder]}>Change Comparison</Button>
	</DropdownMenu.Trigger>
	<DropdownMenu.Content class="w-56">
		<DropdownMenu.Label>Comparing against:</DropdownMenu.Label>
		<DropdownMenu.Separator />
		<DropdownMenu.RadioGroup bind:value={comparison}>
			<DropdownMenu.RadioItem value="tween">Tween (WR)</DropdownMenu.RadioItem>
			<DropdownMenu.RadioItem value="demon">Demon</DropdownMenu.RadioItem>
			<DropdownMenu.RadioItem value="rollin">Rollin</DropdownMenu.RadioItem>
		</DropdownMenu.RadioGroup>
	</DropdownMenu.Content>
</DropdownMenu.Root>

<div>Current Run: {formatTime(currentCPSplit / 1000)} (CP {currentCPCount})</div>

<div class="min-w-max">
	<Table.Root>
		<Table.Header>
			<Table.Row>
				<Table.Head class="w-[75px]">
					<span class="flex flex-row items-center gap-1"><Hash size="1rem" />Lap</span>
				</Table.Head>
				<Table.Head>
					<span class="flex flex-row items-center gap-1"><Timer size="1rem" />Split</span>
				</Table.Head>
				<Table.Head>
					<span class="flex flex-row items-center gap-1"><Clock size="1rem" />Race Time</span>
				</Table.Head>
				<Table.Head>
					<span class="flex flex-row items-center gap-1"><Diff size="1rem" />Diff</span>
				</Table.Head>
				<Table.Head class="text-right">
					<span class="flex flex-row items-center gap-1"><TrendingUp size="1rem" />Est. Pace</span>
				</Table.Head>
			</Table.Row>
		</Table.Header>
		<Table.Body>
			{#each lap_times as lap_time, i}
				<Table.Row>
					<Table.Cell class="font-medium">{i}</Table.Cell>
					<Table.Cell>{(lap_time / 1000).toFixed(2)}</Table.Cell>
					<Table.Cell>{formatTime(lap_splits[i] / 1000)}</Table.Cell>
					<Table.Cell>
						<div class="flex flex-row items-center justify-start gap-1">
							<span
								class={lap_splits[i] / 1000 - lapSplits[comparison][i] > 0
									? 'text-red-600'
									: 'text-blue-500'}
							>
								{`${lap_splits[i] / 1000 - lapSplits[comparison][i] > 0 ? '+' : ''}${(lap_splits[i] / 1000 - lapSplits[comparison][i]).toFixed(2)}`}
							</span>
							{#if lap_splits[i] / 1000 - lapSplits[comparison][i] > lap_splits[i - 1] / 1000 - lapSplits[comparison][i - 1]}
								<ChevronUp color="rgb(249 115 22)" size="1rem" />
							{:else}
								<ChevronDown color="rgb(34 197 94)" size="1rem" />
							{/if}
						</div>
					</Table.Cell>
					<Table.Cell class="text-right">{formatTime(est_pace[i] / 1000)}</Table.Cell>
				</Table.Row>
			{/each}
		</Table.Body>
	</Table.Root>
</div>
