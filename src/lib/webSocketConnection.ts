import ioClient from 'socket.io-client';
import { dev } from '$app/environment';

const ENDPOINT = 'https://e05-socket-server.adaptable.app';

let socket;
if (dev) socket = ioClient('http://localhost:5173');
else socket = ioClient(ENDPOINT);

export const io = socket;
