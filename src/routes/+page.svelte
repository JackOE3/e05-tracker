<script lang="ts">
	import { io } from '$lib/webSocketConnection.js';
	import * as Table from '$lib/components/ui/table';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import { Button } from '$lib/components/ui/button';
	import { lapSplits } from '$lib/stats';
	import { Badge } from '$lib/components/ui/badge';
	import {
		ChevronUp,
		ChevronDown,
		Clock,
		Diff,
		TrendingUp,
		Timer,
		Zap,
		Radio
	} from 'lucide-svelte';
	import * as Card from '$lib/components/ui/card';
	import { formatTime, median, scrollToBottom } from '$lib/my-utils';

	let updateScroll = 0;

	const CPS_PER_LAP = 8;
	let lap_times: number[] = [];
	let lap_splits: number[] = [];
	let est_pace: number[] = [0];
	let avg_lap_times: number[] = [];
	let current_avg_lap = 0;
	let current_median_lap = 0;
	let current_lap_split = 0;
	io.on('lapCompletedResponse', (message) => {
		lap_times = [...lap_times, message.last_lap_time];
		current_lap_split += message.last_lap_time;
		lap_splits = [...lap_splits, current_lap_split];

		// start at 2nd lap:
		if (currentCPCount > CPS_PER_LAP) {
			const sum = lap_times.reduce((a, b) => a + b, 0);
			current_avg_lap = sum / lap_times.length || 0;
			avg_lap_times = [...avg_lap_times, current_avg_lap];
			est_pace = [...est_pace, lap_times[0] + 59 * current_avg_lap];
			current_median_lap = median(lap_times.slice(1)); //omit 1st lap
		}

		setTimeout(() => {
			updateScroll++;
		}, 50);
	});

	let currentCPSplit = 0;
	let currentCPCount = 0;
	let trickStartTime = 0;
	let trick_diff: number[] = [];
	let trick_avg_diff = 0;
	let trick_median_diff = 0;
	io.on('cpCompletedResponse', (message) => {
		currentCPSplit = message.current_cp_split;
		currentCPCount = message.current_cp_count;

		if (currentCPCount % 8 === 5) trickStartTime = currentCPSplit;
		if (currentCPCount % 8 === 0) {
			const trickTime = currentCPSplit - trickStartTime;
			// "This sector without the trick is on average exactly 21 seconds long."
			const trickDiff = (trickTime - 21000) / 1000;
			trick_diff.push(trickDiff);
			console.log('trick diff', trick_diff);
			const sum = trick_diff.reduce((a, b) => a + b, 0);
			trick_avg_diff = sum / trick_diff.length || 0;
			trick_median_diff = median(trick_diff);
		}
	});

	io.on('resetResponse', () => {
		lap_times = [];
		lap_splits = [];
		est_pace = [];
		avg_lap_times = [];
		current_avg_lap = 0;
		current_median_lap = 0;
		current_lap_split = 0;
		currentCPSplit = 0;
		currentCPCount = 0;
		trick_diff = [];
		trick_avg_diff = 0;
		trick_median_diff = 0;
	});

	io.on('eventFromServer', () => console.log('browser: socket connected to server'));

	let placeholder = [
		56890, 53400, 53690, 53810, 53210, 53000, 54150, 53400, 53690, 53810, 53210, 53000, 54150,
		53400, 53690, 53810, 53210, 53000, 54150, 53400, 53690, 53810, 53210, 53000, 54150, 53400,
		53690, 53810, 53210, 53000, 54150, 53400, 53690, 53810, 53210, 53000, 54150, 53400, 53690,
		53810, 53210, 53000, 54150, 53400, 53690, 53810, 53210, 53000, 54150, 53400, 53690, 53810,
		53210, 53000, 54150, 53400, 53690, 53810, 53210, 53000
	];

	let placeholder_splits = placeholder.map(
		(
			(sum) => (value) =>
				(sum += value)
		)(0)
	);
	let test = false;
	$: display_times = test ? placeholder : lap_times;
	$: display_splits = test ? placeholder_splits : lap_splits;

	let comparison = 'tween';
</script>

<div class="flex flex-row gap-8">
	<div
		class="relative mt-[48px] max-h-[369px] min-w-max overflow-y-scroll"
		use:scrollToBottom={updateScroll}
	>
		<Table.Root>
			<Table.Header class="fixed -translate-y-[48px]">
				<Table.Row>
					<Table.Head class="w-16 p-2">
						<span class="flex flex-row items-center gap-1">Lap</span>
					</Table.Head>
					<Table.Head class="w-24 p-2">
						<span class="flex flex-row items-center gap-1"><Timer size="1rem" />Split</span>
					</Table.Head>
					<Table.Head class="w-24 p-2">
						<span class="flex flex-row items-center gap-1"><Clock size="1rem" />RTA</span>
					</Table.Head>
					<Table.Head class="w-24 p-2">
						<span class="flex flex-row items-center gap-1"><Diff size="1rem" />Diff</span>
					</Table.Head>
					<Table.Head class="w-24 p-2">
						<span class="flex flex-row items-center gap-1"><Zap size="1rem" />Trick</span>
					</Table.Head>
					<Table.Head class="w-[120px] p-2 text-right">
						<span class="flex flex-row items-center gap-1"><TrendingUp size="1rem" />Est. Pace</span
						>
					</Table.Head>
				</Table.Row>
			</Table.Header>
			<Table.Body class="h-0 font-mono">
				{#each display_times as lap_time, i}
					<Table.Row>
						<Table.Cell class="w-16 p-2 font-medium">{i + 1}</Table.Cell>
						<Table.Cell class="w-24 p-2">{(lap_time / 1000).toFixed(2)}</Table.Cell>
						<Table.Cell class="w-24 p-2">{formatTime(display_splits[i] / 1000)}</Table.Cell>
						<Table.Cell class="w-24 p-2">
							<div class="flex flex-row items-center justify-start gap-1">
								<span
									class={display_splits[i] / 1000 - lapSplits[comparison][i] > 0
										? 'text-red-600'
										: 'text-blue-500'}
								>
									{`${display_splits[i] / 1000 - lapSplits[comparison][i] > 0 ? '+' : ''}${(display_splits[i] / 1000 - lapSplits[comparison][i]).toFixed(2)}`}
								</span>
								{#if i > 0 && display_splits[i] / 1000 - lapSplits[comparison][i] > display_splits[i - 1] / 1000 - lapSplits[comparison][i - 1]}
									<ChevronUp color="rgb(249 115 22)" size="1rem" />
								{:else if i > 0}
									<ChevronDown color="rgb(34 197 94)" size="1rem" />
								{/if}
							</div>
						</Table.Cell>
						<Table.Cell class="w-24 p-2">
							{#if trick_diff[i]}
								<span class={trick_diff[i] > 0 ? 'text-red-600' : 'text-blue-500'}>
									{`${trick_diff[i] > 0 ? '+' : ''}${trick_diff[i].toFixed(2)}`}
								</span>
							{/if}
						</Table.Cell>
						<Table.Cell class="w-[120px] p-2 text-right">
							{est_pace[i] > 0 ? formatTime(est_pace[i] / 1000, false) : '-'}
						</Table.Cell>
					</Table.Row>
				{:else}
					<Table.Row>
						<Table.Cell class="w-16 p-2 font-medium">1</Table.Cell>
						<Table.Cell class="w-24 p-2">-</Table.Cell>
						<Table.Cell class="w-24 p-2">-</Table.Cell>
						<Table.Cell class="w-24 p-2">-</Table.Cell>
						<Table.Cell class="w-24 p-2">-</Table.Cell>
						<Table.Cell class="w-[120px] p-2 text-right">-</Table.Cell>
					</Table.Row>
				{/each}
			</Table.Body>
		</Table.Root>
	</div>

	<div class="min-w-max self-center">
		<Card.Root class="w-[350px]">
			<Card.Header>
				<Card.Title class="flex flex-row place-content-between items-center">
					<span class="flex flex-row content-center items-center gap-2">
						<Radio color="rgb(220 38 38)" />
						Current Run
					</span>

					<Badge>
						Lap {1 + Math.floor(currentCPCount / CPS_PER_LAP)} | CP {currentCPCount % CPS_PER_LAP}
					</Badge>
				</Card.Title>
				<Card.Description>See various stats about the current run.</Card.Description>
			</Card.Header>
			<Card.Content>
				<div>
					<span>Current Split</span>
					<span class="float-right">
						{currentCPSplit > 0 ? formatTime(currentCPSplit / 1000, true) : '-'}
					</span>
				</div>
				<div>
					<span>Current Pace</span>
					<span class="float-right">
						{est_pace.length > 0 && est_pace[est_pace.length - 1]
							? formatTime(est_pace[est_pace.length - 1] / 1000, true)
							: '-'}
					</span>
				</div>
				<div>
					<span>Average Lap</span>
					<span class="float-right">
						{current_avg_lap > 0 ? (current_avg_lap / 1000).toFixed(2) : '-'}
					</span>
				</div>
				<div>
					<span>Median Lap</span>
					<span class="float-right">
						{current_median_lap > 0 ? (current_median_lap / 1000).toFixed(2) : '-'}
					</span>
				</div>
				<div>
					<span>Average Trick Save</span>
					<span class="float-right">
						{trick_avg_diff > 0 ? trick_avg_diff.toFixed(2) : '-'}
					</span>
				</div>
				<div>
					<span>Median Trick Save</span>
					<span class="float-right">
						{trick_median_diff > 0 ? trick_median_diff.toFixed(2) : '-'}
					</span>
				</div>
			</Card.Content>
			<Card.Footer class="flex justify-between">
				<DropdownMenu.Root>
					<DropdownMenu.Trigger asChild let:builder>
						<Button variant="outline" builders={[builder]}>Change Comparison</Button>
					</DropdownMenu.Trigger>
					<DropdownMenu.Content class="w-56">
						<DropdownMenu.Label>Comparing against</DropdownMenu.Label>
						<DropdownMenu.Separator />
						<DropdownMenu.RadioGroup bind:value={comparison}>
							<DropdownMenu.RadioItem value="tween">Tween (WR)</DropdownMenu.RadioItem>
							<DropdownMenu.RadioItem value="demon">Demon</DropdownMenu.RadioItem>
							<DropdownMenu.RadioItem value="rollin">Rollin</DropdownMenu.RadioItem>
						</DropdownMenu.RadioGroup>
					</DropdownMenu.Content>
				</DropdownMenu.Root>
				<Button>Show More</Button>
			</Card.Footer>
		</Card.Root>
	</div>
</div>
