import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import { type ViteDevServer } from 'vite';
import { Server } from 'socket.io';

const webSocketServer = {
	name: 'webSocketServer',
	configureServer(server: ViteDevServer) {
		if (!server.httpServer) return;

		const io = new Server(server.httpServer);

		io.on('connection', (socket) => {
			socket.emit('eventFromServer', 'Hello, World 👋');
			console.log('id:', socket.id);
			socket.on('lapCompleted', (message) => {
				//console.log('data received:', message);
				io.emit('lapCompletedResponse', message);
			});

			socket.on('cpCompleted', (message) => {
				//console.log('data received:', message);
				io.emit('cpCompletedResponse', message);
			});
			socket.on('reset', () => {
				io.emit('resetResponse');
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
