export function median(values: number[]): number {
	if (values.length === 0) {
		throw new Error('Input array is empty');
	}

	// Sorting values, preventing original array
	// from being mutated.
	values = [...values].sort((a, b) => a - b);

	const half = Math.floor(values.length / 2);

	return values.length % 2 ? values[half] : (values[half - 1] + values[half]) / 2;
}

export const formatTime = (millis: number, hundredths = false) => {
	if (isNaN(millis)) return -1;
	let time = '';
	let hours = millis / (1e3 * 3600);
	let minutes = (hours % 1) * 60;
	let seconds = (minutes % 1) * 60;
	millis = millis % 1000;
	hours = Math.floor(hours);
	minutes = Math.floor(minutes);
	seconds = Math.floor(seconds);

	if (hours >= 1)
		time += `${hours.toString()}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
	else if (minutes >= 1) time += `${minutes.toString()}:${seconds.toString().padStart(2, '0')}`;
	else time += `${seconds.toString()}`;
	if (hundredths) time += `${(millis / 1000).toFixed(2).slice(1)}`;

	/* const t = new Date(1000 * millis);
	let time = '';
	if (t.getHours() >= 1)
		time += `${t.getHours().toString()}:${t.getMinutes().toString().padStart(2, '0')}:${t.getSeconds().toString().padStart(2, '0')}`;
	else if (t.getMinutes() >= 1)
		time += `${t.getMinutes().toString()}:${t.getSeconds().toString().padStart(2, '0')}`;
	else time += `${t.getSeconds().toString()}`;
	if (hundredths) time += `${(t.getMilliseconds() / 1000).toFixed(2).slice(1)}`; */
	return time;
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function scrollToBottom(node: HTMLElement, _dependency: unknown): { update: () => void } {
	const scroll = (): void => node.scroll({ top: node.scrollHeight, behavior: 'smooth' });
	scroll(); // only called once when node is created
	return { update: scroll };
}

export const deepClone = (obj: object) => JSON.parse(JSON.stringify(obj));

export const capitalize = (str: string) => str[0].toUpperCase() + str.slice(1);
