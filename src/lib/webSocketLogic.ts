import { io } from '$lib/webSocketConnection.js';
import { writable } from 'svelte/store';
import { dev } from '$app/environment';
import { type Player, type PlayerStats, statsInit, isPlayer, stats } from '$lib/stats';

export const updateScroll = writable(0);

export function listenToSocket(client: string) {
	if (io.connected) {
		console.log(`${client} already connected`);
		return;
	}
	io.on('loadData', (message: PlayerStats) => {
		if (dev) console.log('loadData', message);
		stats.set(message);
	});

	io.on('cpCompletedResponse', (message) => {
		if (dev) console.log('cpCompletedResponse');
		const player = message.player as Player;
		if (!isPlayer(player)) return;

		//console.log(`${client}: webSocketLogic cpCompletedResponse`);
		stats.update(($stats) => {
			$stats[player].current_cp_split = message.current_cp_split;
			$stats[player].current_cp_count = message.current_cp_count;
			return $stats;
		});
	});

	io.on('lapStats', (message) => {
		if (dev) console.log('lapStats');
		const player = message.player as Player;
		if (!isPlayer(player)) return;

		stats.update(($stats) => {
			$stats[player].lap_times.push(message.current_lap_time);
			$stats[player].lap_splits.push(message.current_lap_split);
			$stats[player].trick_diff.push(message.current_trick_diff);
			$stats[player].trick_avg_diff = message.trick_avg_diff;
			$stats[player].trick_median_diff = message.trick_median_diff;
			return $stats;
		});

		setTimeout(() => {
			updateScroll.update((i) => i + 1);
		}, 50);
	});

	io.on('lapStatsExtra', (message) => {
		if (dev) console.log('lapStatsExtra');
		const player = message.player as Player;
		if (!isPlayer(player)) return;

		stats.update(($stats) => {
			$stats[player].current_avg_lap = message.current_avg_lap;
			$stats[player].current_median_lap = message.current_median_lap;
			$stats[player].est_pace.push(message.current_est_pace);
			return $stats;
		});
	});

	io.on('resetResponse', (message) => {
		if (dev) console.log('resetResponse');
		const player = message.player as Player;
		if (!isPlayer(player)) return;

		stats.update(($stats) => {
			$stats[player] = { ...statsInit };
			return $stats;
		});
	});

	io.on('connect', () => console.log('connected to socket'));

	io.on('disconnect', (reason) => {
		console.log('disconnected from socket. reason:', reason);
	});
}
