<script lang="ts">
	//import { io } from '$lib/webSocketConnection.js';
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
	import { formatTime, scrollToBottom } from '$lib/my-utils';
	import { onMount } from 'svelte';
	import {
		CPS_PER_LAP,
		current_cp_count,
		current_cp_split,
		current_avg_lap,
		current_median_lap,
		est_pace,
		lap_splits,
		lap_times,
		listenToSocket,
		trick_avg_diff,
		trick_diff,
		trick_median_diff,
		updateScroll,
		current_est_pace
	} from '$lib/webSocketLogic.js';
	import { slide } from 'svelte/transition';

	onMount(() => {
		listenToSocket('browser');
	});

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
	$: display_times = test ? placeholder : $lap_times;
	$: display_splits = test ? placeholder_splits : $lap_splits;

	let comparison = 'tween';
	let showMore = false;
</script>

<div class="flex flex-col gap-12 lg:flex-row">
	<div
		class="relative mt-[48px] h-[369px] min-w-max overflow-y-scroll"
		use:scrollToBottom={$updateScroll}
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
							{#if $trick_diff[i]}
								<span class={$trick_diff[i] > 0 ? 'text-red-600' : 'text-blue-500'}>
									{`${$trick_diff[i] > 0 ? '+' : ''}${$trick_diff[i].toFixed(2)}`}
								</span>
							{/if}
						</Table.Cell>
						<Table.Cell class="w-[120px] p-2 text-right">
							{$est_pace[i] ? formatTime($est_pace[i] / 1000, false) : '-'}
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

	<div class="order-first min-w-max self-center lg:order-last lg:self-start">
		<Card.Root class="w-[350px]">
			<Card.Header>
				<Card.Title class="flex flex-row place-content-between items-center">
					<span class="flex flex-row content-center items-center gap-2">
						<Radio color="rgb(220 38 38)" />
						Current Run
					</span>

					<Badge>
						Lap {1 + Math.floor($current_cp_count / CPS_PER_LAP)} | CP {$current_cp_count %
							CPS_PER_LAP}
					</Badge>
				</Card.Title>
				<Card.Description>See various stats about the current run.</Card.Description>
			</Card.Header>
			<Card.Content>
				<div>
					<span>Current Split</span>
					<span class="float-right font-mono">
						{$current_cp_split ? formatTime($current_cp_split / 1000, true) : '-'}
					</span>
				</div>
				<div>
					<span>Current Pace</span>
					<span class="float-right font-mono">
						{$current_est_pace ? formatTime($current_est_pace / 1000, true) : '-'}
					</span>
				</div>
				<div>
					<span>Average Lap</span>
					<span class="float-right font-mono">
						{$current_avg_lap ? ($current_avg_lap / 1000).toFixed(2) : '-'}
					</span>
				</div>

				{#if showMore}
					<div transition:slide={{ duration: 500 }}>
						<div>
							<span>Median Lap</span>
							<span class="float-right font-mono">
								{$current_median_lap ? ($current_median_lap / 1000).toFixed(2) : '-'}
							</span>
						</div>
						<div>
							<span>Average Trick Save</span>
							<span class="float-right font-mono">
								{$trick_avg_diff ? $trick_avg_diff.toFixed(2) : '-'}
							</span>
						</div>
						<div>
							<span>Median Trick Save</span>
							<span class="float-right font-mono">
								{$trick_median_diff ? $trick_median_diff.toFixed(2) : '-'}
							</span>
						</div>
					</div>
				{/if}
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
				<Button on:click={() => (showMore = !showMore)}>
					{#if showMore}
						Show Less
					{:else}
						Show More
					{/if}
				</Button>
			</Card.Footer>
		</Card.Root>
	</div>
</div>
