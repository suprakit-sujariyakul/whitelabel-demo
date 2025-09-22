import { paraglideVitePlugin } from '@inlang/paraglide-js';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import { clientPathResolver } from './vite-plugins/client-path-resolver';
import { clientModuleToggler } from './vite-plugins/client-module-toggler';
import { envLoader } from './vite-plugins/env-loader';

export default defineConfig({
	plugins: [
		envLoader(),
		clientModuleToggler(process.env.CLIENT),
		clientPathResolver(process.env.CLIENT),
		sveltekit(),
		paraglideVitePlugin({
			project: './project.inlang',
			outdir: './src/lib/paraglide',
			strategy: ['url', 'baseLocale']
		})
	],
	optimizeDeps: {
		// Force pre-bundling of these dependencies to avoid scanning issues
		include: ['svelte/store', '@shared/ui', '@core/auth', '@plugin/lobby'],
		// Exclude problematic dependencies from pre-bundling
		exclude: ['@inlang/paraglide-js']
	},
	server: {
		// Disable HMR to prevent multiple module loads that cause flicker
		hmr: false,
		
		// Reduce file watching to prevent restart loops
		watch: {
			ignored: ['**/node_modules/**', '**/.git/**', '**/dist/**', '**/build/**']
		},
		
		// Increase timeout for dependency scanning
		warmup: {
			clientFiles: ['./src/routes/+layout.svelte', './src/routes/+page.svelte']
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
});
