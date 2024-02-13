import { io } from '$lib/webSocketConnection.js';
import { get, writable } from 'svelte/store';
import { dev } from '$app/environment';
import { type Player, statsInit, isPlayer, stats, selectedPlayer, connected } from '$lib/stats';
import { deepClone } from './my-utils';

export const updateScroll = writable(0);

export const connectedPlayers = writable<Player[]>([]);

export function listenToSocket(client: string) {
	if (io.connected) {
		console.log(`${client} already connected`);
		return;
	}
	io.on('loadData', (message) => {
		if (dev) console.log('loadData', message);
		stats.set(message.playerStats);
		connected.set(message.connected);
		// automatically choose a connected player:
		if (get(connected).Rollin) selectedPlayer.set('Rollin');
		else if (get(connected).Demon) selectedPlayer.set('Demon');
		else if (get(connected).JaV) selectedPlayer.set('JaV');
	});
	io.on('playerConnected', (player: Player) => {
		connected.update(($connected) => {
			$connected[player] = true;
			return $connected;
		});
	});
	io.on('playerDisconnected', (player: Player) => {
		connected.update(($connected) => {
			$connected[player] = false;
			return $connected;
		});
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
			$stats[player].current_lap = message.current_lap;
			$stats[player].lap_times.push(message.current_lap_time);
			$stats[player].lap_splits.push(message.current_lap_split);
			$stats[player].trick_diff.push(message.current_trick_diff);
			$stats[player].trick_avg_diff = message.trick_avg_diff;
			$stats[player].trick_median_diff = message.trick_median_diff;
			return $stats;
		});

		setTimeout(() => {
			if (get(selectedPlayer) === player) updateScroll.update((i) => i + 1);
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
			$stats[player] = deepClone(statsInit);
			return $stats;
		});
	});

	io.on('connect', () => console.log('connected to socket'));

	io.on('disconnect', (reason) => {
		console.log('disconnected from socket. reason:', reason);
	});

	io.on('playerConnected', (player) => {
		console.log('player connected:', player);
		if (!isPlayer(player)) return;
		connectedPlayers.update(($players) => [player, ...$players]);
	});
	io.on('playerDisconnected', (player) => {
		console.log('player disconnected:', player);
		if (!isPlayer(player)) return;
	});
}
