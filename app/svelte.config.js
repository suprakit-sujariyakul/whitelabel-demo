import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

function createClientSpecificBuildPath() {
	const client = process.env.CLIENT;
	const buildIdentifier = client || 'app';
	return `../build/${buildIdentifier}`;
}

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://svelte.dev/docs/kit/integrations
	// for more information about preprocessors
	preprocess: vitePreprocess(),
	kit: { 
		adapter: adapter({
			out: createClientSpecificBuildPath(),
			pages: createClientSpecificBuildPath(),
			assets: createClientSpecificBuildPath(),
			strict: false
		})
	}
};

export default config;
