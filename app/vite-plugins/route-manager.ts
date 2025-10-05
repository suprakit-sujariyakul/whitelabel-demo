import { existsSync, readFileSync, writeFileSync, mkdirSync, renameSync, rmSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import type { Plugin } from 'vite';

interface RouteConfig {
	[plugin: string]: boolean;
}

interface ClientConfig {
	plugins?: RouteConfig;
}

// Plugin routes mapping
const PLUGIN_ROUTES = {
	lobby: ['src/routes/lobby'],
	payment: ['src/routes/payment', 'src/routes/checkout'],
	analytics: ['src/routes/analytics', 'src/routes/reports']
} as const;

function getConfigPath(client?: string): string {
	const projectRoot = process.cwd().endsWith('/app') ? resolve(process.cwd(), '..') : process.cwd();
	
	if (client && client !== 'app') {
		return resolve(projectRoot, `clients/${client}/config.json`);
	}
	return resolve(projectRoot, 'app/config.json');
}

function loadClientConfig(client?: string): ClientConfig {
	const configPath = getConfigPath(client);
	
	if (!existsSync(configPath)) {
		console.warn(`[routeManager] Config file not found: ${configPath}`);
		return { plugins: {} };
	}

	try {
		const config = JSON.parse(readFileSync(configPath, 'utf-8'));
		return config;
	} catch (error) {
		console.error(`[routeManager] Failed to parse config file ${configPath}:`, error);
		return { plugins: {} };
	}
}

function getDisabledRoutes(pluginConfig: RouteConfig): string[] {
	const disabledRoutes: string[] = [];
	
	Object.entries(pluginConfig).forEach(([plugin, isEnabled]) => {
		if (!isEnabled && PLUGIN_ROUTES[plugin as keyof typeof PLUGIN_ROUTES]) {
			disabledRoutes.push(...PLUGIN_ROUTES[plugin as keyof typeof PLUGIN_ROUTES]);
		}
	});
	
	return disabledRoutes;
}

function getBackupDir(): string {
	const projectRoot = process.cwd().endsWith('/app') ? resolve(process.cwd(), '..') : process.cwd();
	return resolve(projectRoot, '.route-backups');
}

function hideRoutes(disabledRoutes: string[]): void {
	const appDir = process.cwd().endsWith('/app') ? process.cwd() : resolve(process.cwd(), 'app');
	const backupDir = getBackupDir();
	
	// Create backup directory if it doesn't exist
	if (!existsSync(backupDir)) {
		mkdirSync(backupDir, { recursive: true });
	}
	
	disabledRoutes.forEach(routePath => {
		const fullPath = resolve(appDir, routePath);
		const routeName = routePath.replace('src/routes/', '').replace(/\//g, '_');
		const backupPath = resolve(backupDir, routeName);
		
		// If route exists and no backup, create backup
		if (existsSync(fullPath) && !existsSync(backupPath)) {
			try {
				// Move to backup location completely outside of app directory
				renameSync(fullPath, backupPath);
			} catch (error) {
				console.warn(`[routeManager] Failed to backup route ${routePath}:`, (error as Error).message);
			}
		}
	});
}

function restoreRoutes(disabledRoutes: string[]): void {
	const appDir = process.cwd().endsWith('/app') ? process.cwd() : resolve(process.cwd(), 'app');
	const backupDir = getBackupDir();
	
	disabledRoutes.forEach(routePath => {
		const fullPath = resolve(appDir, routePath);
		const routeName = routePath.replace('src/routes/', '').replace(/\//g, '_');
		const backupPath = resolve(backupDir, routeName);
		
		// Only restore if route is missing and backup exists
		if (!existsSync(fullPath) && existsSync(backupPath)) {
			try {
				// Ensure parent directory exists
				const parentDir = dirname(fullPath);
				if (!existsSync(parentDir)) {
					mkdirSync(parentDir, { recursive: true });
				}

				renameSync(backupPath, fullPath);
			} catch (error) {
				console.warn(`[routeManager] Failed to restore route ${routePath}:`, (error as Error).message);
			}
		}
	});
	
	// Clean up backup directory if empty
	try {
		if (existsSync(backupDir)) {
			const files = require('fs').readdirSync(backupDir);
			if (files.length === 0) {
				rmSync(backupDir, { recursive: true });
			}
		}
	} catch (error) {
		// Ignore cleanup errors
	}
}

/**
 * Vite plugin that manages routes based on client configuration.
 * 
 * This plugin automatically hides/shows routes based on the client's plugin configuration.
 * It works for both development and build modes.
 */
export function routeManager(client?: string): Plugin {
	if (!client || client === 'app') {
		return { name: 'vite-plugin-route-manager-noop' };
	}

	const config = loadClientConfig(client);
	const disabledRoutes = getDisabledRoutes(config.plugins || {});

	if (disabledRoutes.length === 0) {
		return { name: 'vite-plugin-route-manager-noop' };
	}

	// Only log if there are disabled routes to manage
	if (disabledRoutes.length > 0) {
		console.log(`[routeManager] Managing routes for client ${client}: ${disabledRoutes.join(', ')}`);
	}

	// Hide routes immediately when plugin is created, before any scanning happens
	hideRoutes(disabledRoutes);

	return {
		name: 'vite-plugin-route-manager',
		enforce: 'pre', // Ensure this runs before other plugins that might rely on routes
		
		buildStart() {
			// Ensure routes are still hidden at build start
			hideRoutes(disabledRoutes);
		},

		load(id: string) {
			// Check if this is a disabled route file
			for (const routePath of disabledRoutes) {
				if (id.includes(routePath) && id.endsWith('+page.svelte')) {
					// Return a component that throws a 404 error
					return `<script>
	import { error } from '@sveltejs/kit';
	
	// This route is disabled for this client - throw 404
	throw error(404, 'Page not found');
</script>`;
				}
			}
			return null;
		},

		writeBundle() {
			// Restore routes after build is complete
			restoreRoutes(disabledRoutes);
		},

		configureServer(server) {
			const originalClose = server.close.bind(server);
			server.close = async () => {
				// Clean up any backup files when dev server shuts down
				restoreRoutes(disabledRoutes);
				return originalClose();
			};
		}
	};
}
