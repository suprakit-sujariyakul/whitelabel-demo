import fs from 'fs';
import path from 'path';
import type { PluginOption } from 'vite';
import { type PluginConfig, getDefaultPluginConfig } from '../../plugin-registry';

interface ConfigFile {
	plugins?: Partial<PluginConfig>;
}

function getConfigPath(client?: string): string {
	if (client) {
		return path.resolve(__dirname, `../../clients/${client}/config.json`);
	}
	return path.resolve(__dirname, '../config.json');
}

function loadModuleConfig(configPath: string): PluginConfig {
	const defaultConfig = getDefaultPluginConfig();

	if (!fs.existsSync(configPath)) {
		return defaultConfig;
	}

	try {
		const configFile: ConfigFile = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
		return { ...defaultConfig, ...configFile.plugins };
	} catch (error) {
		console.warn(`Failed to parse config file ${configPath}:`, error);
		return defaultConfig;
	}
}

function createConstantName(moduleName: string): string {
	return `__IS_${moduleName.toUpperCase()}_ENABLED__`;
}

function createViteDefines(moduleConfig: PluginConfig): Record<string, string> {
	const defines: Record<string, string> = {};
	
	Object.entries(moduleConfig).forEach(([moduleName, isEnabled]) => {
		const constantName = createConstantName(moduleName);
		defines[constantName] = JSON.stringify(isEnabled);
	});
	
	return defines;
}

function createTypeDeclarations(moduleConfig: PluginConfig): string {
	const declarations = Object.keys(moduleConfig).map(moduleName => {
		const constantName = createConstantName(moduleName);
		return `declare const ${constantName}: boolean;`;
	});
	
	return declarations.join('\n');
}

function createModuleDefinitions(moduleConfig: PluginConfig) {
	return {
		defines: createViteDefines(moduleConfig),
		typeDeclarations: createTypeDeclarations(moduleConfig)
	};
}

function writeTypeDeclarations(content: string): void {
	const dtsPath = path.resolve(__dirname, '../src/lib/client-plugins.d.ts');
	fs.writeFileSync(dtsPath, content);
}

export function clientModuleToggler(client?: string): PluginOption {
	return {
		name: 'vite-plugin-client-module-toggler',
		config: () => {
			const configPath = getConfigPath(client);
			const moduleConfig = loadModuleConfig(configPath);
			const { defines, typeDeclarations } = createModuleDefinitions(moduleConfig);
			
			writeTypeDeclarations(typeDeclarations);

			return { define: defines };
		}
	};
}
