import { json } from '@sveltejs/kit';

const dataServer: object[] = [];

export async function PUT({ request }): Promise<Response> {
	const data = await request.json();
	console.log(data);
	dataServer.push(data);
	return json(data);
}

export function GET(): Response {
	return json(dataServer);
}
