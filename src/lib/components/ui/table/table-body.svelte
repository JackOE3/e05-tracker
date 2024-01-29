<script lang="ts">
	import { cn } from '$lib/utils';
	import type { HTMLAttributes } from 'svelte/elements';

	type $$Props = HTMLAttributes<HTMLTableSectionElement>;

	let className: $$Props['class'] = undefined;
	export { className as class };
</script>

<tbody class={cn('h-48 [&_tr:last-child]:border-0', className)} {...$$restProps}>
	<slot />
</tbody>
