export const AVAILABLE_PLUGINS = ['lobby', 'payment', 'analytics'] as const;

type PluginName = typeof AVAILABLE_PLUGINS[number];

export type PluginConfig = Record<PluginName, boolean>;

// Map plugins to their associated routes
export const PLUGIN_ROUTES: Record<PluginName, string[]> = {
	lobby: ['src/routes/lobby'],
	payment: ['src/routes/payment', 'src/routes/checkout'],
	analytics: ['src/routes/analytics', 'src/routes/reports']
};

// Map plugins to their route patterns (for more flexible matching)
export const PLUGIN_ROUTE_PATTERNS: Record<PluginName, RegExp[]> = {
	lobby: [/src\/routes\/lobby/],
	payment: [/src\/routes\/payment/, /src\/routes\/checkout/],
	analytics: [/src\/routes\/analytics/, /src\/routes\/reports/]
};

export function isValidPlugin(name: string): name is PluginName {
	return AVAILABLE_PLUGINS.includes(name as PluginName);
}

export function getDefaultPluginConfig(): PluginConfig {
	return AVAILABLE_PLUGINS.reduce((config, plugin) => {
		config[plugin] = false;
		return config;
	}, {} as PluginConfig);
}

export function getDisabledRoutes(pluginConfig: PluginConfig): string[] {
	const disabledRoutes: string[] = [];
	
	Object.entries(pluginConfig).forEach(([plugin, isEnabled]) => {
		if (!isEnabled && isValidPlugin(plugin)) {
			disabledRoutes.push(...PLUGIN_ROUTES[plugin]);
		}
	});
	
	return disabledRoutes;
}

export function isRouteDisabled(routePath: string, pluginConfig: PluginConfig): boolean {
	for (const [plugin, isEnabled] of Object.entries(pluginConfig)) {
		if (!isEnabled && isValidPlugin(plugin)) {
			const patterns = PLUGIN_ROUTE_PATTERNS[plugin];
			if (patterns.some(pattern => pattern.test(routePath))) {
				return true;
			}
		}
	}
	return false;
}
