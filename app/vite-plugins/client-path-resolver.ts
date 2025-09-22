import { existsSync, readFileSync } from 'node:fs';
import { resolve, relative, isAbsolute, dirname } from 'node:path';
import type { Plugin } from 'vite';

interface PathConfig {
	projectRoot: string;
	appSrcPath: string;
	clientSrcPath: string;
	modulesPath: string;
}

function createPathConfig(client: string): PathConfig {
	const currentDir = process.cwd();
	// If we're in the app directory, go up one level to get the project root
	const projectRoot = currentDir.endsWith('/app') ? resolve(currentDir, '..') : currentDir;
	
	return {
		projectRoot,
		appSrcPath: resolve(projectRoot, 'app/src'),
		clientSrcPath: resolve(projectRoot, 'clients', client, 'src'),
		modulesPath: resolve(projectRoot, 'modules')
	};
}

function shouldSkipResolution(id: string, importer?: string): boolean {
	return (
		!importer ||
		id.startsWith('virtual:') ||
		isAbsolute(id) ||
		id.startsWith('\0') ||
		id.includes('node_modules')
	);
}

function resolveImportPath(id: string, importer: string): string {
	const importerDir = dirname(importer);
	return resolve(importerDir, id);
}

function isModuleImport(resolvedPath: string, modulesPath: string): boolean {
	return resolvedPath.startsWith(modulesPath);
}

function isAppImport(resolvedPath: string, appSrcPath: string): boolean {
	const relativeFromAppSrc = relative(appSrcPath, resolvedPath);
	return !relativeFromAppSrc.startsWith('..');
}

function findClientOverrideForModule(resolvedPath: string, pathConfig: PathConfig): string | null {
	const relativeFromModules = relative(pathConfig.modulesPath, resolvedPath);
	const clientOverridePath = resolve(pathConfig.clientSrcPath, 'lib', relativeFromModules);
	
	return existsSync(clientOverridePath) ? clientOverridePath : null;
}

function findClientOverrideForApp(resolvedPath: string, pathConfig: PathConfig): string | null {
	const relativeFromAppSrc = relative(pathConfig.appSrcPath, resolvedPath);
	const clientOverridePath = resolve(pathConfig.clientSrcPath, relativeFromAppSrc);
	
	return existsSync(clientOverridePath) ? clientOverridePath : null;
}

function resolveClientOverride(id: string, importer: string, pathConfig: PathConfig): string | null {
	const resolvedPath = resolveImportPath(id, importer);

	if (isModuleImport(resolvedPath, pathConfig.modulesPath)) {
		const clientOverride = findClientOverrideForModule(resolvedPath, pathConfig);
		return clientOverride || resolvedPath;
	}

	if (isAppImport(resolvedPath, pathConfig.appSrcPath)) {
		const clientOverride = findClientOverrideForApp(resolvedPath, pathConfig);
		return clientOverride || null;
	}

	return null;
}

function isCssFile(id: string): boolean {
	return id.endsWith('.css');
}

function mergeCssFiles(basePath: string, overridePath: string): string {
	const baseCss = readFileSync(basePath, 'utf-8');
	const overrideCss = readFileSync(overridePath, 'utf-8');
	return `${baseCss}\n${overrideCss}`;
}

function loadCssWithClientOverride(id: string, pathConfig: PathConfig): string | null {
	if (!isCssFile(id) || !isModuleImport(id, pathConfig.modulesPath)) {
		return null;
	}

	const clientOverridePath = findClientOverrideForModule(id, pathConfig);
	return clientOverridePath ? mergeCssFiles(id, clientOverridePath) : null;
}

/**
 * Vite plugin that resolves import paths with client-specific overrides.
 *
 * Resolution priority:
 * 1. clients/{client}/src/{file} (client specific)
 * 2. app/src/{file} (app fallback)
 */
export function clientPathResolver(client?: string): Plugin {
	if (!client || client === 'app') {
		return { name: 'vite-plugin-client-path-resolver-noop' };
	}

	const pathConfig = createPathConfig(client);

	return {
		name: 'vite-plugin-client-path-resolver',

		async resolveId(id: string, importer?: string, options?: { ssr?: boolean }): Promise<string | null> {
			if (shouldSkipResolution(id, importer)) {
				return null;
			}

			const isSSR = options?.ssr;
			const context = isSSR ? 'SSR' : 'CLIENT';

			// Special handling for LobbyPage imports from the plugin
			if (id === './pages/LobbyPage.svelte' && importer && importer.includes('modules/plugin/lobby/dist/index.js')) {
				const clientOverridePath = resolve(pathConfig.clientSrcPath, 'lib/plugin/lobby/src/lib/pages/LobbyPage.svelte');
				if (existsSync(clientOverridePath)) {
					return clientOverridePath;
				}
			}

			return resolveClientOverride(id, importer!, pathConfig);
		},

		load(id: string) {
			// Remove query parameters for clean path checking
			const cleanId = id.split('?')[0];
			
			// Check if this is the original LobbyPage and we have a client override
			if (cleanId.includes('modules/plugin/lobby/dist/pages/LobbyPage.svelte') || 
			    cleanId.includes('modules/plugin/lobby/src/lib/pages/LobbyPage.svelte')) {
				const clientOverridePath = resolve(pathConfig.clientSrcPath, 'lib/plugin/lobby/src/lib/pages/LobbyPage.svelte');
				
				if (existsSync(clientOverridePath)) {
					return readFileSync(clientOverridePath, 'utf-8');
				}
			}
			
			return loadCssWithClientOverride(id, pathConfig);
		}
	};
}