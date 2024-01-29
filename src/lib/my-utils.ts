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

export const formatTime = (seconds: number, hundredths = false) => {
	if (isNaN(seconds)) return 0;
	const t = new Date(1000 * seconds);
	let time = `${t.getMinutes().toString().padStart(2, '0')}:${t.getSeconds().toString().padStart(2, '0')}`;
	if (hundredths) time += `${(t.getMilliseconds() / 1000).toFixed(2).slice(1)}`;
	return time;
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function scrollToBottom(node: HTMLElement, _dependency: unknown): { update: () => void } {
	const scroll = (): void => node.scroll({ top: node.scrollHeight, behavior: 'smooth' });
	scroll(); // only called once when node is created
	return { update: scroll };
}
