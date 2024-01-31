import { io } from '$lib/webSocketConnection.js';
import { derived, writable } from 'svelte/store';
import { dev } from '$app/environment';

export const updateScroll = writable(0);

export const CPS_PER_LAP = 8;

export const lap_times = writable<number[]>([]);
export const lap_splits = writable<number[]>([]);
export const est_pace = writable<(undefined | number)[]>([undefined]);
export const current_est_pace = derived(est_pace, ($est_pace) => $est_pace[$est_pace.length - 1]);
export const avg_lap_times = writable<number[]>([]);
export const current_avg_lap = writable<undefined | number>(undefined);
export const current_median_lap = writable<undefined | number>(undefined);

export const current_cp_split = writable<undefined | number>(undefined);
export const current_cp_count = writable(0);
export const trick_diff = writable<number[]>([]);
export const trick_avg_diff = writable<undefined | number>(undefined);
export const trick_median_diff = writable<undefined | number>(undefined);

export function listenToSocket(client: string) {
	if (io.connected) {
		console.log(`${client} already connected`);
		return;
	}
	io.on('loadData', (message) => {
		if (dev) console.log('loadData', message);
		lap_times.set(message.lap_times);
		lap_splits.set(message.lap_splits);
		est_pace.set(message.est_pace);
		avg_lap_times.set(message.avg_lap_times);
		current_avg_lap.set(message.current_avg_lap);
		current_median_lap.set(message.current_median_lap);
		current_cp_split.set(message.current_cp_split);
		current_cp_count.set(message.current_cp_count);
		trick_diff.set(message.trick_diff);
		trick_avg_diff.set(message.trick_avg_diff);
		trick_median_diff.set(message.trick_median_diff);
	});

	io.on('cpCompletedResponse', (message) => {
		if (dev) console.log('cpCompletedResponse');
		//console.log(`${client}: webSocketLogic cpCompletedResponse`);
		current_cp_split.set(message.current_cp_split);
		current_cp_count.set(message.current_cp_count);
	});

	io.on('lapStats', (message) => {
		if (dev) console.log('lapStats');
		lap_times.update((times) => [...times, message.current_lap_time]);
		lap_splits.update((splits) => [...splits, message.current_lap_split]);
		trick_diff.update((arr) => [...arr, message.current_trick_diff]);
		trick_avg_diff.set(message.trick_avg_diff);
		trick_median_diff.set(message.trick_median_diff);

		setTimeout(() => {
			updateScroll.update((i) => i + 1);
		}, 50);
	});

	io.on('lapStatsExtra', (message) => {
		if (dev) console.log('lapStatsExtra');
		current_avg_lap.set(message.current_avg_lap);
		current_median_lap.set(message.current_median_lap);
		est_pace.update((pace) => [...pace, message.current_est_pace]);
	});

	io.on('resetResponse', () => {
		if (dev) console.log('resetResponse');
		current_cp_count.set(0);
		current_cp_split.set(undefined);
		lap_times.set([]);
		lap_splits.set([]);
		est_pace.set([undefined]);
		avg_lap_times.set([]);
		current_avg_lap.set(undefined);
		current_median_lap.set(undefined);
		trick_diff.set([]);
		trick_avg_diff.set(undefined);
		trick_median_diff.set(undefined);
	});
	io.on('connect', () => console.log('connected to socket'));
	io.on('disconnect', (reason) => {
		console.log('disconnected from socket. reason:', reason);
	});
}
