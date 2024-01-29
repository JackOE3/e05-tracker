import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';

import { handler } from '../build/handler.js';

const port = 3000;
const app = express();
const server = createServer(app);

const io = new Server(server);

io.on('connection', (socket) => {
	socket.emit('eventFromServer', 'Hello, World 👋');
	console.log('connected');

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

// SvelteKit should handle everything else using Express middleware
// https://github.com/sveltejs/kit/tree/master/packages/adapter-node#custom-server
app.use(handler);

server.listen(port);
