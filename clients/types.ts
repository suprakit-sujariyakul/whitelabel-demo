export interface ClientConfig {
	// Client identification
	clientId: string;
	clientName: string;

	// Plugin configuration (core and shared modules are always enabled)
	plugins: string[];
}

