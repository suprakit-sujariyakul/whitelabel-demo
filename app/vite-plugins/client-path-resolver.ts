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
		id.includes('node_modules') ||
		id.startsWith('svelte/') ||
		id.includes('/svelte/') ||
		id.startsWith('$') // SvelteKit special imports
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

function isWorkspacePackageImport(id: string): boolean {
	// Only intercept our workspace packages, not external ones like @sveltejs
	const workspacePackages = ['@plugin/', '@shared/', '@core/'];
	return workspacePackages.some(pkg => id.startsWith(pkg));
}

function getPackageNameFromImport(id: string): string {
	// Extract package name from imports like @plugin/lobby, @shared/ui, @core/auth
	return id;
}

function createClientPackageOverride(packageName: string, pathConfig: PathConfig): string | null {
	// Convert package name to file path
	// @plugin/lobby -> plugin/lobby
	// @shared/ui -> shared/ui  
	// @core/auth -> core/auth
	const packagePath = packageName.replace('@', '');
	
	// Check if client has overrides for this package
	const clientPackagePath = resolve(pathConfig.clientSrcPath, 'lib', packagePath);
	const clientIndexPath = resolve(clientPackagePath, 'src/lib/index.ts');
	
	if (existsSync(clientIndexPath)) {
		// Client has a complete override for this package
		return `export * from '${clientIndexPath}';`;
	}
	
	// Check for partial overrides - look for individual component overrides
	const originalPackagePath = resolve(pathConfig.modulesPath, packagePath, 'src/lib/index.ts');
	if (!existsSync(originalPackagePath)) {
		return null;
	}
	
	// Read the original package exports and check for client overrides
	try {
		const originalContent = readFileSync(originalPackagePath, 'utf-8');
		const exports = extractExportsFromContent(originalContent);
		
		let overrideContent = '';
		let hasOverrides = false;
		
		for (const exportItem of exports) {
			const clientOverridePath = findClientOverrideForExport(exportItem, packagePath, pathConfig);
			if (clientOverridePath) {
				overrideContent += `export ${exportItem.exportClause} from '${clientOverridePath}';\n`;
				hasOverrides = true;
			} else {
				// Use original export
				const originalExportPath = resolve(pathConfig.modulesPath, packagePath, 'src/lib', exportItem.relativePath);
				overrideContent += `export ${exportItem.exportClause} from '${originalExportPath}';\n`;
			}
		}
		
		return hasOverrides ? overrideContent : null;
	} catch (error) {
		console.warn(`[clientPathResolver] Failed to process package ${packageName}:`, error);
		return null;
	}
}

interface ExportItem {
	exportClause: string;
	relativePath: string;
}

function extractExportsFromContent(content: string): ExportItem[] {
	const exports: ExportItem[] = [];
	
	// Match export statements like:
	// export { default as LobbyPage } from './pages/LobbyPage.svelte';
	// export { Button } from './Button.svelte';
	// export * from './components';
	const exportRegex = /export\s+({[^}]+}|\*)\s+from\s+['"]([^'"]+)['"]/g;
	
	let match;
	while ((match = exportRegex.exec(content)) !== null) {
		const exportClause = match[1];
		const relativePath = match[2];
		exports.push({ exportClause, relativePath });
	}
	
	return exports;
}

function findClientOverrideForExport(exportItem: ExportItem, packagePath: string, pathConfig: PathConfig): string | null {
	// Convert relative path to absolute client override path
	const clientOverridePath = resolve(pathConfig.clientSrcPath, 'lib', packagePath, 'src/lib', exportItem.relativePath);
	
	// Handle different file extensions
	const possibleExtensions = ['', '.svelte', '.ts', '.js'];
	
	for (const ext of possibleExtensions) {
		const fullPath = clientOverridePath + ext;
		if (existsSync(fullPath)) {
			return fullPath;
		}
	}
	
	return null;
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
		enforce: 'pre', // Run before Vite's built-in resolution

		async resolveId(id: string, importer?: string, options?: { ssr?: boolean }): Promise<string | null> {
			if (shouldSkipResolution(id, importer)) {
				return null;
			}

			// Debug: Only log workspace package imports
			// if (importer && !importer.includes('node_modules')) {
			// 	console.log(`[clientPathResolver] Processing import: "${id}" from "${importer}"`);
			// }

			// Handle workspace package imports (like @plugin/lobby, @shared/ui, @core/auth)
			if (isWorkspacePackageImport(id)) {
				const packageName = getPackageNameFromImport(id);
				// Create a safe virtual module ID: @plugin/lobby -> virtual:client-package-plugin-lobby-client-a
				const packageWithoutAt = packageName.replace('@', ''); // plugin/lobby
				const [scope, name] = packageWithoutAt.split('/'); // ["plugin", "lobby"]
				const virtualId = `virtual:client-package-${scope}-${name}-${client}`;
				// Use \0 prefix for internal resolution (Rollup/Vite convention)
				return `\0${virtualId}`;
			}

			return resolveClientOverride(id, importer!, pathConfig);
		},

		load(id: string) {
			// Handle virtual modules for client package overrides
			// Remove the \0 prefix if present (Rollup convention)
			const cleanId = id.startsWith('\0') ? id.slice(1) : id;
			
			// Match pattern: virtual:client-package-plugin-lobby-client-a
			const virtualModuleMatch = cleanId.match(/^virtual:client-package-([^-]+)-([^-]+)-(.+)$/);
			if (virtualModuleMatch) {
				const packageScope = virtualModuleMatch[1]; // e.g., "plugin"
				const packageName = virtualModuleMatch[2]; // e.g., "lobby"  
				const clientName = virtualModuleMatch[3]; // e.g., "client-a"
				
				// Reconstruct the original package name: @plugin/lobby
				const fullPackageName = `@${packageScope}/${packageName}`;
				const packagePath = `${packageScope}/${packageName}`; // plugin/lobby
				
				const overrideContent = createClientPackageOverride(fullPackageName, pathConfig);
				if (overrideContent) {
					return overrideContent;
				}
				
				// Fallback to original package
				const originalPackagePath = resolve(pathConfig.modulesPath, packagePath, 'src/lib/index.ts');
				if (existsSync(originalPackagePath)) {
					return `export * from '${originalPackagePath}';`;
				}
				
				console.warn(`[clientPathResolver] Could not find package: ${fullPackageName}`);
				return `// Package ${fullPackageName} not found`;
			}
			
			return loadCssWithClientOverride(id, pathConfig);
		}
	};
}