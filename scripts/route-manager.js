#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Import plugin registry functions
const PLUGIN_ROUTES = {
	lobby: ['src/routes/lobby'],
	payment: ['src/routes/payment', 'src/routes/checkout'],
	analytics: ['src/routes/analytics', 'src/routes/reports']
};

function getConfigPath(client) {
	if (client) {
		return path.resolve(__dirname, `../clients/${client}/config.json`);
	}
	return path.resolve(__dirname, '../app/config.json');
}

function loadClientConfig(client) {
	const configPath = getConfigPath(client);
	
	if (!fs.existsSync(configPath)) {
		console.warn(`Config file not found: ${configPath}`);
		return { plugins: {} };
	}

	try {
		const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
		return config;
	} catch (error) {
		console.error(`Failed to parse config file ${configPath}:`, error);
		return { plugins: {} };
	}
}

function getDisabledRoutes(pluginConfig) {
	const disabledRoutes = [];
	
	Object.entries(pluginConfig).forEach(([plugin, isEnabled]) => {
		if (!isEnabled && PLUGIN_ROUTES[plugin]) {
			disabledRoutes.push(...PLUGIN_ROUTES[plugin]);
		}
	});
	
	return disabledRoutes;
}

function hideRoutes(disabledRoutes) {
	const appDir = path.resolve(__dirname, '../app');
	const backupDir = path.resolve(__dirname, '../.route-backups');
	
	// Create backup directory if it doesn't exist
	if (!fs.existsSync(backupDir)) {
		fs.mkdirSync(backupDir, { recursive: true });
	}
	
	disabledRoutes.forEach(routePath => {
		const fullPath = path.resolve(appDir, routePath);
		const routeName = routePath.replace('src/routes/', '').replace(/\//g, '_');
		const backupPath = path.resolve(backupDir, routeName);
		
		if (fs.existsSync(fullPath) && !fs.existsSync(backupPath)) {
			try {
				// Move to backup location completely outside of app directory
				fs.renameSync(fullPath, backupPath);
				console.log(`✓ Backed up route: ${routePath} -> .route-backups/${routeName}`);
			} catch (error) {
				console.warn(`✗ Failed to backup route ${routePath}:`, error.message);
			}
		}
	});
}

function restoreRoutes(disabledRoutes) {
	const appDir = path.resolve(__dirname, '../app');
	const backupDir = path.resolve(__dirname, '../.route-backups');
	
	disabledRoutes.forEach(routePath => {
		const fullPath = path.resolve(appDir, routePath);
		const routeName = routePath.replace('src/routes/', '').replace(/\//g, '_');
		const backupPath = path.resolve(backupDir, routeName);
		
		if (!fs.existsSync(fullPath) && fs.existsSync(backupPath)) {
			try {
				// Ensure parent directory exists
				const parentDir = path.dirname(fullPath);
				if (!fs.existsSync(parentDir)) {
					fs.mkdirSync(parentDir, { recursive: true });
				}
				
				fs.renameSync(backupPath, fullPath);
				console.log(`✓ Restored route: .route-backups/${routeName} -> ${routePath}`);
			} catch (error) {
				console.warn(`✗ Failed to restore route ${routePath}:`, error.message);
			}
		}
	});
	
	// Clean up backup directory if empty
	try {
		if (fs.existsSync(backupDir) && fs.readdirSync(backupDir).length === 0) {
			fs.rmdirSync(backupDir);
		}
	} catch (error) {
		// Ignore cleanup errors
	}
}

// Main execution
const command = process.argv[2]; // 'hide' or 'restore'
const client = process.env.CLIENT;

if (!client || client === 'app') {
	console.log('No client specified or using default app, no routes to manage.');
	process.exit(0);
}

const config = loadClientConfig(client);
const disabledRoutes = getDisabledRoutes(config.plugins || {});

if (disabledRoutes.length === 0) {
	console.log(`No routes to manage for client ${client}.`);
	process.exit(0);
}

console.log(`\n🔧 Managing routes for client ${client}...`);
console.log(`Disabled routes:`, disabledRoutes);

switch (command) {
	case 'hide':
		hideRoutes(disabledRoutes);
		break;
	case 'restore':
		restoreRoutes(disabledRoutes);
		break;
	default:
		console.error('Usage: node route-manager.js [hide|restore]');
		console.error('Environment variable CLIENT must be set.');
		process.exit(1);
}
