import { derived, writable } from 'svelte/store';
import { deepClone } from './my-utils';

export const lapTimes: { [key: string]: Array<number> } = {
	tween: [
		56.99, 53.29, 53.39, 53.34, 53.25, 53.42, 54.49, 53.32, 53.04, 53.24, 53.3, 53.26, 53.02, 53.29,
		53.36, 53.36, 53.22, 53.44, 53.44, 54.06, 53.36, 53.16, 53.18, 53.08, 53.21, 53.14, 53.44,
		53.34, 53.3, 52.95, 53.33, 53.23, 53.21, 53.4, 53.37, 53.26, 53.65, 53.39, 53.45, 53.27, 53.21,
		53.2, 53.41, 53.5, 53.23, 53.29, 53.34, 53.31, 53.32, 53.21, 53.61, 53.11, 55.39, 53.31, 53.22,
		53.16, 53.19, 53.24, 53.37, 53.42
	],
	demon: [
		57.11, 53.17, 53.19, 53.58, 53.28, 53.19, 53.35, 53.33, 53.1, 53.19, 53.1, 53.28, 53.19, 53.27,
		53.3, 54.17, 53.31, 53.63, 53.37, 53.24, 53.34, 53.06, 53.16, 53.3, 53.42, 53.87, 53.55, 53.39,
		53.54, 53.29, 53.46, 53.5, 53.4, 53.18, 53.28, 53.34, 53.24, 53.2, 53.35, 53.39, 53.51, 53.25,
		53.27, 53.3, 53.38, 53.46, 53.32, 53.37, 53.21, 53.42, 53.4, 53.5, 53.5, 53.39, 53.37, 53.38,
		53.53, 53.33, 53.64, 53.41
	],
	rollin: [
		57.26, 53.27, 53.4, 53.41, 53.15, 53.37, 53.44, 53.31, 53.42, 53.3, 53.53, 53.42, 53.38, 53.84,
		53.3, 53.65, 53.75, 53.49, 53.4, 53.51, 53.42, 53.44, 53.19, 53.38, 53.32, 53.41, 53.38, 53.32,
		53.52, 53.48, 53.58, 53.39, 53.65, 53.45, 53.53, 53.37, 53.84, 53.44, 53.48, 53.44, 53.44,
		53.51, 54.1, 53.7, 53.43, 53.56, 53.72, 53.7, 53.47, 53.56, 53.76, 53.59, 53.35, 53.48, 53.35,
		53.47, 53.26, 53.52, 53.66, 53.61
	]
} as const;

export const lapSplits: { [key: string]: Array<number> } = {
	tween: lapTimes.tween.map(
		(
			(sum) => (value) =>
				(sum += value)
		)(0)
	),
	demon: lapTimes.demon.map(
		(
			(sum) => (value) =>
				(sum += value)
		)(0)
	),
	rollin: lapTimes.rollin.map(
		(
			(sum) => (value) =>
				(sum += value)
		)(0)
	)
};

export const CPS_PER_LAP = 8;

type Stats = {
	connected: boolean;
	current_lap: number;
	lap_times: number[];
	lap_splits: number[];
	est_pace: (number | undefined)[];
	avg_lap_times: number[];
	current_avg_lap: number | undefined;
	current_median_lap: number | undefined;

	current_cp_split: number | undefined;
	current_cp_count: number;
	trick_diff: number[];
	trick_avg_diff: number | undefined;
	trick_median_diff: number | undefined;
};
export const statsInit: Stats = {
	connected: false,
	current_lap: 1,
	lap_times: [],
	lap_splits: [],
	est_pace: [undefined],
	avg_lap_times: [],
	current_avg_lap: undefined,
	current_median_lap: undefined,

	current_cp_split: undefined,
	current_cp_count: 0,
	trick_diff: [],
	trick_avg_diff: undefined,
	trick_median_diff: undefined
};

export const players = ['Rollin', 'Demon', 'JaV', 'RotakeR'] as const;
export type Player = (typeof players)[number];
export type PlayerStats = {
	[key in Player]: Stats;
};
export const playerStats: PlayerStats = {
	Rollin: deepClone(statsInit),
	JaV: deepClone(statsInit),
	Demon: deepClone(statsInit),
	RotakeR: deepClone(statsInit)
};
export const connected = writable<{ [key in Player]: boolean }>({
	Rollin: false,
	Demon: false,
	JaV: false,
	RotakeR: false
});

export function isPlayer(player: string): boolean {
	if (players.includes(player as Player)) return true;
	console.log('Error: player not found:', player);
	return false;
}

export const selectedPlayer = writable<Player>('Rollin');

export const stats = writable<PlayerStats>(deepClone(playerStats));

export const current_lap = derived(
	[stats, selectedPlayer],
	([$stats, $selectedPlayer]) => $stats[$selectedPlayer].current_lap
);

export const lap_times = derived(
	[stats, selectedPlayer],
	([$stats, $selectedPlayer]) => $stats[$selectedPlayer].lap_times
);

export const lap_splits = derived(
	[stats, selectedPlayer],
	([$stats, $selectedPlayer]) => $stats[$selectedPlayer].lap_splits
);

export const est_pace = derived(
	[stats, selectedPlayer],
	([$stats, $selectedPlayer]) => $stats[$selectedPlayer].est_pace
);

export const current_est_pace = derived(est_pace, ($est_pace) => $est_pace[$est_pace.length - 1]);

export const avg_lap_times = derived(
	[stats, selectedPlayer],
	([$stats, $selectedPlayer]) => $stats[$selectedPlayer].avg_lap_times
);

export const current_avg_lap = derived(
	[stats, selectedPlayer],
	([$stats, $selectedPlayer]) => $stats[$selectedPlayer].current_avg_lap
);

export const current_median_lap = derived(
	[stats, selectedPlayer],
	([$stats, $selectedPlayer]) => $stats[$selectedPlayer].current_median_lap
);

export const current_cp_split = derived(
	[stats, selectedPlayer],
	([$stats, $selectedPlayer]) => $stats[$selectedPlayer].current_cp_split
);

export const current_cp_count = derived(
	[stats, selectedPlayer],
	([$stats, $selectedPlayer]) => $stats[$selectedPlayer].current_cp_count
);

export const trick_diff = derived(
	[stats, selectedPlayer],
	([$stats, $selectedPlayer]) => $stats[$selectedPlayer].trick_diff
);

export const trick_avg_diff = derived(
	[stats, selectedPlayer],
	([$stats, $selectedPlayer]) => $stats[$selectedPlayer].trick_avg_diff
);

export const trick_median_diff = derived(
	[stats, selectedPlayer],
	([$stats, $selectedPlayer]) => $stats[$selectedPlayer].trick_median_diff
);
