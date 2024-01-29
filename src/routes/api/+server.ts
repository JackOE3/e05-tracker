import { json } from '@sveltejs/kit';

const dataServer: object[] = [];

export async function PUT({ request }): Promise<Response> {
	if (request.headers.get('Authorization') === 'secret_token_lol') {
		const data = await request.json();
		console.log(data);
		dataServer.push(data);
		return json(data);
	}
	return json('');
}

export function POST(): Response {
	return json(dataServer);
}
