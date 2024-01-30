import { listenToSocket } from '$lib/webSocketLogic.js';
import {
	current_cp_count,
	current_cp_split,
	current_avg_lap,
	current_median_lap,
	est_pace,
	lap_splits,
	lap_times,
	trick_avg_diff,
	trick_diff,
	trick_median_diff
} from '$lib/webSocketLogic.js';
import { get } from 'svelte/store';

listenToSocket('server');

export function load() {
	return {
		current_cp_count: get(current_cp_count),
		current_cp_split: get(current_cp_split),
		current_avg_lap: get(current_avg_lap),
		current_median_lap: get(current_median_lap),
		est_pace: get(est_pace),
		lap_splits: get(lap_splits),
		lap_times: get(lap_times),
		trick_diff: get(trick_diff),
		trick_avg_diff: get(trick_avg_diff),
		trick_median_diff: get(trick_median_diff)
	};
}
