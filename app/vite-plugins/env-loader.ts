import fs from 'fs';
import path from 'path';
import type { PluginOption } from 'vite';

/**
 * Vite plugin that copies the appropriate .env.{ENV} file to .env
 * This allows Vite to natively handle environment variables without custom defines
 */
export function envLoader(): PluginOption {
	let hasInitialized = false;
	
	return {
		name: 'vite-plugin-env-loader',
		configResolved() {
			// Only run once to prevent restart loops
			if (hasInitialized) {
				return;
			}
			hasInitialized = true;
			
			const env = process.env.ENV;
			
			if (!env) {
				return;
			}

			const sourceEnvPath = path.resolve(__dirname, `../.env.${env}`);
			const targetEnvPath = path.resolve(__dirname, '../.env');

			if (!fs.existsSync(sourceEnvPath)) {
				console.warn(`[envLoader] Environment file not found: ${sourceEnvPath}`);
				return;
			}

			// Check if target file exists and has the same content to avoid unnecessary writes
			if (fs.existsSync(targetEnvPath)) {
				const sourceContent = fs.readFileSync(sourceEnvPath, 'utf-8');
				const targetContent = fs.readFileSync(targetEnvPath, 'utf-8');
				if (sourceContent === targetContent) {
					return; // Files are identical, no need to copy
				}
			}

			try {
				// Copy the environment-specific file to .env
				fs.copyFileSync(sourceEnvPath, targetEnvPath);
			} catch (error) {
				console.error(`[envLoader] Failed to copy environment file:`, error);
			}
		}
	};
}
