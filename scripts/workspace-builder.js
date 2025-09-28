#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Plugin registry functions (copied from plugin-registry.ts)
const PLUGIN_ROUTES = {
	lobby: ['src/routes/lobby'],
	payment: ['src/routes/payment', 'src/routes/checkout'],
	analytics: ['src/routes/analytics', 'src/routes/reports']
};

function getConfigPath(client) {
	if (client) {
		return path.resolve(__dirname, `../clients/${client}/config.json`);
	}
	return path.resolve(__dirname, '../config.json');
}

function loadClientConfig(client) {
	const configPath = getConfigPath(client);
	
	// Default plugin configuration (all enabled for development)
	const defaultConfig = {
		plugins: {
			lobby: true,
			payment: true,
			analytics: true
		}
	};
	
	if (!fs.existsSync(configPath)) {
		if (!client) {
			// No client specified and no root config - use defaults
			console.log(`📝 Using default plugin configuration (all enabled)`);
			return defaultConfig;
		} else {
			console.warn(`Config file not found: ${configPath}`);
			return { plugins: {} };
		}
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

function copyDirectory(src, dest, options = {}) {
	const { exclude = [], transform = null } = options;
	
	if (!fs.existsSync(dest)) {
		fs.mkdirSync(dest, { recursive: true });
	}
	
	const items = fs.readdirSync(src);
	
	for (const item of items) {
		const srcPath = path.join(src, item);
		const destPath = path.join(dest, item);
		
		// Skip excluded items
		if (exclude.some(pattern => {
			if (typeof pattern === 'string') {
				return item === pattern;
			}
			return pattern.test(item);
		})) {
			continue;
		}
		
		const stat = fs.statSync(srcPath);
		
		if (stat.isDirectory()) {
			copyDirectory(srcPath, destPath, options);
		} else {
			let content = fs.readFileSync(srcPath, 'utf-8');
			
			// Apply transformation if provided
			if (transform && typeof transform === 'function') {
				content = transform(content, srcPath, destPath);
			}
			
			fs.writeFileSync(destPath, content);
		}
	}
}

function applyClientOverrides(tempDir, client) {
	if (!client || client === 'app') {
		return;
	}
	
	const clientOverridesDir = path.resolve(__dirname, `../clients/${client}/plugin`);
	
	if (!fs.existsSync(clientOverridesDir)) {
		return;
	}
	
	console.log(`📦 Applying client overrides for ${client}...`);
	
	// Copy all client overrides to temp directory
	// The override structure directly mirrors the project structure
	const pluginOverridesDir = path.join(tempDir, 'src', 'plugin');
	
	copyDirectory(clientOverridesDir, pluginOverridesDir, {
		exclude: [
			'node_modules', 
			'.git', 
			'dist', 
			'build'
		],
		transform: (content, srcPath, destPath) => {
			const relativePath = path.relative(clientOverridesDir, srcPath);
			console.log(`  ✓ Override: ${relativePath}`);
			return content;
		}
	});
}

function excludeDisabledRoutes(tempDir, disabledRoutes) {
	if (disabledRoutes.length === 0) {
		return;
	}
	
	console.log(`🚫 Excluding disabled routes:`, disabledRoutes);
	
	disabledRoutes.forEach(routePath => {
		const fullPath = path.resolve(tempDir, routePath);
		
		if (fs.existsSync(fullPath)) {
			try {
				fs.rmSync(fullPath, { recursive: true, force: true });
				console.log(`✓ Excluded route: ${routePath}`);
			} catch (error) {
				console.warn(`✗ Failed to exclude route ${routePath}:`, error.message);
			}
		}
	});
}

function createSymlinks(tempDir) {
	const rootNodeModules = path.resolve(__dirname, '../node_modules');
	const tempNodeModules = path.join(tempDir, 'node_modules');
	
	// Create symlink to parent node_modules if it exists
	if (fs.existsSync(rootNodeModules) && !fs.existsSync(tempNodeModules)) {
		try {
			fs.symlinkSync(rootNodeModules, tempNodeModules, 'dir');
			console.log(`🔗 Linked node_modules from root`);
		} catch (error) {
			console.warn(`⚠️  Failed to create node_modules symlink:`, error.message);
		}
	}
}

function createPackageJson(tempDir) {
	const rootPackageJsonPath = path.resolve(__dirname, '../package.json');
	const tempPackageJsonPath = path.resolve(tempDir, 'package.json');
	
	// Read the original package.json
	const packageJson = JSON.parse(fs.readFileSync(rootPackageJsonPath, 'utf-8'));
	
	// Replace all workspace-builder scripts with simple vite commands
	packageJson.scripts = {
		...packageJson.scripts,
		dev: 'vite dev',
		build: 'vite build',
		preview: 'vite preview',
		test: 'vitest run && playwright test'
	};
	
	// Write the modified package.json to temp directory
	fs.writeFileSync(tempPackageJsonPath, JSON.stringify(packageJson, null, '\t'));
	console.log(`📦 Created modified package.json for temp workspace`);
}

function copyEnvironmentFile(tempDir, env) {
	if (!env) {
		console.warn('⚠️  ENV not specified, skipping environment file copy');
		return;
	}

	const rootDir = path.resolve(__dirname, '..');
	const sourceEnvPath = path.resolve(rootDir, `.env.${env}`);
	const targetEnvPath = path.resolve(tempDir, '.env');

	if (!fs.existsSync(sourceEnvPath)) {
		console.warn(`⚠️  Environment file not found: ${sourceEnvPath}`);
		return;
	}

	try {
		fs.copyFileSync(sourceEnvPath, targetEnvPath);
		console.log(`📄 Copied .env.${env} to workspace`);
	} catch (error) {
		console.error(`❌ Failed to copy environment file:`, error);
	}
}

function buildWorkspace(client, env = 'dev') {
	const tempDir = path.resolve(__dirname, '../.temp');
	const rootDir = path.resolve(__dirname, '..');
	
	console.log(`\n🏗️  Building workspace for client: ${client || 'app'}, env: ${env}`);
	console.log(`📁 Temp directory: ${tempDir}`);
	
	// Clean and create temp directory (but keep for debugging if requested)
	if (fs.existsSync(tempDir)) {
		console.log(`🧹 Cleaning existing temp directory...`);
		fs.rmSync(tempDir, { recursive: true, force: true });
	}
	fs.mkdirSync(tempDir, { recursive: true });
	
	// Copy base project files (now everything is in root)
	console.log(`📋 Copying base project files...`);
	copyDirectory(rootDir, tempDir, {
		exclude: [
			'node_modules',
			'.svelte-kit',
			'build',
			'dist',
			'.git',
			'.temp',
			'clients', // Don't copy client configs
			'scripts', // Don't copy build scripts
			/pnpm-lock\.yaml$/,
			/README\.md$/
		],
		transform: (content, srcPath, destPath) => {
			// Fix tsconfig.json paths in modules
			if (path.basename(srcPath) === 'tsconfig.json' && (srcPath.includes('/plugin/') || srcPath.includes('/core/') || srcPath.includes('/shared/'))) {
				return content.replace(
					'"extends": "../../../app/tsconfig.json"',
					'"extends": "../../tsconfig.json"'
				);
			}
			return content;
		}
	});
	
	// Load client configuration
	const config = loadClientConfig(client);
	const disabledRoutes = getDisabledRoutes(config.plugins || {});
	
	// Apply client-specific overrides
	applyClientOverrides(tempDir, client);
	
	// Exclude disabled routes
	excludeDisabledRoutes(tempDir, disabledRoutes);
	
	// Create workspace-specific configs and symlinks
	createSymlinks(tempDir);
	createPackageJson(tempDir);
	copyEnvironmentFile(tempDir, env);
	
	console.log(`✅ Workspace ready at: ${tempDir}`);
	return tempDir;
}

function cleanWorkspace(keepForDebugging = false) {
	const tempDir = path.resolve(__dirname, '../.temp');
	
	if (fs.existsSync(tempDir)) {
		if (keepForDebugging) {
			console.log(`🐛 Keeping workspace for debugging: ${tempDir}`);
		} else {
			console.log(`🧹 Cleaning workspace: ${tempDir}`);
			fs.rmSync(tempDir, { recursive: true, force: true });
			console.log(`✅ Workspace cleaned`);
		}
	}
}

// Main execution
const command = process.argv[2]; // 'build' or 'clean'
const client = process.env.CLIENT;
const env = process.env.ENV || 'dev';
const keepForDebugging = process.argv.includes('--keep');

switch (command) {
	case 'build':
		buildWorkspace(client, env);
		break;
	case 'clean':
		cleanWorkspace(keepForDebugging);
		break;
	default:
		console.error('Usage: node workspace-builder.js [build|clean]');
		console.error('Environment variables: CLIENT, ENV');
		console.error('Options: --keep (preserve temp directory for debugging)');
		process.exit(1);
}
