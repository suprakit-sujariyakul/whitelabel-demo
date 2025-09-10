// Main exports for Client A configuration
import clientConfigData from './config.json';
import type { ClientConfig } from '../../../types.js';

export const clientConfig: ClientConfig = clientConfigData;

// Type exports
export type { ClientConfig } from '../../../types.js';

// Utility functions
export function getClientAssetPath(assetPath: string): string {
	return `/clients/client-a/src/lib/assets/${assetPath}`;
}

export function getClientMessagesPath(locale: string): string {
	return `/clients/client-a/messages/${locale}.json`;
}

// Client metadata
export const clientMetadata = {
	id: 'client-a',
	name: 'Acme Corporation',
	version: '1.0.0',
	tier: 'enterprise',
	enabledPlugins: [
		'lobby'
	],
	customizations: {
		hasCustomTheme: true,
		hasCustomMessages: true,
		hasCustomAssets: true,
		hasFeatureFlags: true
	}
} as const;
