import ioClient from 'socket.io-client';
const ENDPOINT = 'https://socket-server-e05-tracker.adaptable.app';

const socket = ioClient(ENDPOINT);

export const io = socket;
