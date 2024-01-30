import { io } from '$lib/webSocketConnection.js';
import { get, writable } from 'svelte/store';
import { median } from './my-utils';
import { dev } from '$app/environment';

export const updateScroll = writable(0);

export const CPS_PER_LAP = 8;

export const lap_times = writable<number[]>([]);
export const lap_splits = writable<number[]>([]);
export const est_pace = writable<number[]>([]);
export const avg_lap_times = writable<number[]>([]);
export const current_avg_lap = writable(0);
export const current_median_lap = writable(0);
export const current_lap_split = writable(0);

export const current_cp_split = writable(0);
export const current_cp_count = writable(0);
const trick_start_time = writable(0);
export const trick_diff = writable<number[]>([]);
export const trick_avg_diff = writable(0);
export const trick_median_diff = writable(0);

export function listenToSocket(client: string) {
	if (io.connected) {
		console.log(`${client} already connected`);
		return;
	}
	io.on('loadData', (message) => {
		console.log(`loadData: ${message.current_cp_count}`);
	});

	io.on('cpCompletedResponse', (message) => {
		//console.log(`${client}: webSocketLogic cpCompletedResponse`);
		current_cp_split.set(message.current_cp_split);
		current_cp_count.set(message.current_cp_count);

		if (get(current_cp_count) % 8 === 5) trick_start_time.set(get(current_cp_split));
		if (get(current_cp_count) % 8 === 0) {
			const trickTime = get(current_cp_split) - get(trick_start_time);
			// "This sector without the trick is on average exactly 21 seconds long."
			const trickDiff = (trickTime - 21000) / 1000;
			trick_diff.update((arr) => [...arr, trickDiff]);
			//console.log('trick diff', trick_diff);
			const sum = get(trick_diff).reduce((a, b) => a + b, 0);
			trick_avg_diff.set(sum / get(trick_diff).length || 0);
			trick_median_diff.set(median(get(trick_diff)));
		}
	});
	io.on('lapCompletedResponse', (message) => {
		lap_times.update((times) => [...times, message.last_lap_time]);
		current_lap_split.update((split) => split + message.last_lap_time);
		lap_splits.update((splits) => [...splits, get(current_lap_split)]);

		// start at 2nd lap:
		if (get(current_cp_count) > CPS_PER_LAP) {
			const sum = get(lap_times).reduce((a, b) => a + b, 0);
			current_avg_lap.set(sum / get(lap_times).length || 0);
			avg_lap_times.update((times) => [...times, get(current_avg_lap)]);
			est_pace.update((pace) => [...pace, get(lap_times)[0] + 59 * get(current_avg_lap)]);
			current_median_lap.set(median(get(lap_times).slice(1))); //omit 1st lap
		}

		setTimeout(() => {
			updateScroll.update((i) => i + 1);
		}, 50);
	});
	io.on('resetResponse', () => {
		if (dev) console.log('RESET');
		current_cp_count.set(0);
		current_cp_split.set(0);
		lap_times.set([]);
		lap_splits.set([]);
		est_pace.set([]);
		avg_lap_times.set([]);
		current_avg_lap.set(0);
		current_median_lap.set(0);
		current_lap_split.set(0);
		current_cp_split.set(0);
		current_cp_count.set(0);
		trick_diff.set([]);
		trick_avg_diff.set(0);
		trick_median_diff.set(0);
	});
	io.on('connect', () => console.log('connected to socket'));
	io.on('disconnect', () => console.log('disconnected from socket'));
}
