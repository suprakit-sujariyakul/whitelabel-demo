import { paraglideVitePlugin } from '@inlang/paraglide-js';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

// Generate client-specific defines based on environment variables
const generateDefines = async () => {
	const defines = {};
	
	// Default to all plugins enabled if no client specified
	const defaultPlugins = {
		lobby: true,
		payment: true,
		analytics: true
	};
	
	// Try to read client config if CLIENT env var is set
	let plugins = defaultPlugins;
	if (process.env.CLIENT) {
		try {
			const fs = await import('fs');
			const path = await import('path');
			const configPath = path.resolve(process.cwd(), `clients/${process.env.CLIENT}/config.json`);
			if (fs.existsSync(configPath)) {
				const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
				plugins = config.plugins || defaultPlugins;
			}
		} catch (error) {
			console.warn('Failed to load client config, using defaults');
		}
	}
	
	// Generate defines
	Object.entries(plugins).forEach(([plugin, enabled]) => {
		const key = `__IS_${plugin.toUpperCase()}_ENABLED__`;
		defines[key] = enabled;
	});
	
	return defines;
};

export default defineConfig(async () => ({
	plugins: [
		sveltekit(),
		paraglideVitePlugin({
			project: './project.inlang',
			outdir: './src/lib/paraglide',
			strategy: ['url', 'baseLocale']
		})
	],
	define: await generateDefines(),
	server: {
		fs: {
			allow: ['..']
		}
	},
	test: {
		expect: { requireAssertions: true },
		projects: [
			{
				extends: './vite.config.ts',
				test: {
					name: 'client',
					environment: 'browser',
					browser: {
						enabled: true,
						provider: 'playwright',
						instances: [{ browser: 'chromium' }]
					},
					include: ['src/**/*.svelte.{test,spec}.{js,ts}'],
					exclude: ['src/lib/server/**'],
					setupFiles: ['./vitest-setup-client.ts']
				}
			},
			{
				extends: './vite.config.ts',
				test: {
					name: 'server',
					environment: 'node',
					include: ['src/**/*.{test,spec}.{js,ts}'],
					exclude: ['src/**/*.svelte.{test,spec}.{js,ts}']
				}
			}
		]
	}
}));
