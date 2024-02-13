import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import { type ViteDevServer } from 'vite';
import { Server } from 'socket.io';

export const CPS_PER_LAP = 8;
let trick_start_time = 0;

type Stats = {
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

export const players = ['Rollin', 'JaV', 'Demon'] as const;
export type Player = (typeof players)[number];
export type PlayerStats = {
	[key in Player]: Stats;
};
const deepClone = (obj: object) => JSON.parse(JSON.stringify(obj));
export const playerStats: PlayerStats = {
	Rollin: deepClone(statsInit),
	JaV: deepClone(statsInit),
	Demon: deepClone(statsInit)
};
const connected: { [key in Player]: boolean } = {
	Rollin: false,
	Demon: false,
	JaV: false
};

function median(values: number[]): number {
	if (values.length === 0) {
		throw new Error('Input array is empty');
	}
	// Sorting values, preventing original array
	// from being mutated.
	values = [...values].sort((a, b) => a - b);

	const half = Math.floor(values.length / 2);

	return values.length % 2 ? values[half] : (values[half - 1] + values[half]) / 2;
}

const player = players[1];

const webSocketServer = {
	name: 'webSocketServer',
	configureServer(server: ViteDevServer) {
		if (!server.httpServer) return;

		const io = new Server(server.httpServer);

		io.on('connection', (socket) => {
			console.log('id:', socket.id);
			socket.emit('loadData', { playerStats, connected });

			if (socket.handshake.auth.token !== 'rollin') {
				console.log('no emit authentication for socket id:', socket.id);
				return;
			}

			connected[player] = true;
			io.emit('playerConnected', player);

			socket.on('disconnect', () => {
				connected[player] = false;
				io.emit('playerDisconnected', player);
			});

			socket.on('cpCompleted', (message) => {
				io.emit('cpCompletedResponse', { player, ...message });
				const stats = playerStats[player];

				stats.current_cp_count = message.current_cp_count;
				stats.current_cp_split = message.current_cp_split;
				if (stats.current_cp_count % CPS_PER_LAP === 5) trick_start_time = stats.current_cp_split!;
				if (stats.current_cp_count > 0 && stats.current_cp_count % CPS_PER_LAP === 0) {
					const trickTime = stats.current_cp_split! - trick_start_time;
					// "This sector without the trick is on average exactly 21 seconds long."
					const trickDiff = (trickTime - 21000) / 1000;
					stats.trick_diff.push(trickDiff);

					const sum = stats.trick_diff.reduce((a, b) => a + b, 0);
					stats.trick_avg_diff = sum / stats.trick_diff.length || 0;
					stats.trick_median_diff = median(stats.trick_diff);

					stats.current_lap = 1 + Math.floor(stats.current_cp_count / CPS_PER_LAP);

					const previous_lap_split = stats.lap_splits[stats.lap_splits.length - 1];
					const current_lap_time =
						stats.current_cp_split! - (previous_lap_split ? previous_lap_split : 0);

					stats.lap_times.push(current_lap_time);
					stats.lap_splits.push(stats.current_cp_split!);

					io.emit('lapStats', {
						player,
						current_lap: stats.current_lap,
						current_lap_time,
						current_lap_split: stats.current_cp_split,
						current_trick_diff: trickDiff,
						trick_avg_diff: stats.trick_avg_diff,
						trick_median_diff: stats.trick_median_diff
					});
					// start at 2nd lap:
					if (stats.current_cp_count > CPS_PER_LAP) {
						const sum = stats.lap_times.reduce((a, b) => a + b, 0);
						stats.current_avg_lap = sum / stats.lap_times.length || 0;
						stats.avg_lap_times.push(stats.current_avg_lap);
						const current_est_pace = stats.lap_times[0] + 59 * stats.current_avg_lap;
						stats.est_pace.push(current_est_pace);
						if (stats.lap_times.length >= 3)
							stats.current_median_lap = median(stats.lap_times.slice(1));

						io.emit('lapStatsExtra', {
							player,
							current_avg_lap: stats.current_avg_lap,
							current_median_lap: stats.current_median_lap,
							//avg_lap_times,
							current_est_pace: current_est_pace
						});
					}
				}
			});

			socket.on('reset', () => {
				io.emit('resetResponse', { player });
				playerStats[player] = deepClone(statsInit);
			});
		});
	}
};

export default defineConfig({
	plugins: [sveltekit(), webSocketServer],
	server: {
		port: 5173
	}
});
