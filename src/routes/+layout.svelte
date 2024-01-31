<script>
	import '../app.pcss';
	import { ModeWatcher } from 'mode-watcher';

	import { Button } from '$lib/components/ui/button';
	import { Sun, Moon } from 'lucide-svelte';

	import { toggleMode } from 'mode-watcher';

	import { dev } from '$app/environment';
	import { inject } from '@vercel/analytics';

	inject({ mode: dev ? 'development' : 'production' });
</script>

<ModeWatcher />
<Button on:click={toggleMode} variant="outline" size="icon" class="float-right m-4">
	<Sun
		class="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0"
	/>
	<Moon
		class="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100"
	/>
	<span class="sr-only">Toggle theme</span>
</Button>

<div class="flex h-screen flex-col items-center p-4">
	<h1 class="mb-8 mt-4 text-3xl">E05-Tracker</h1>

	<slot />
</div>
