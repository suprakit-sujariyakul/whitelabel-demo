# Client A Configuration

This directory contains the configuration for **Acme Corporation** (Client A), including theming, feature flags, localization, and environment settings.

## Configuration Files

### Core Configuration
- `src/lib/config.json` - Pure client configuration (no logic)
- `src/lib/theme.css` - CSS custom properties for theming
- `src/lib/index.ts` - Main exports and utilities

### Messages
- `messages/en.json` - English translations
- `messages/th.json` - Thai translations

### Assets
- `src/lib/assets/images/` - Client-specific images
- `src/lib/assets/icons/` - Client-specific icons

## Environment Setup

Copy the environment variables from the main app's `.env` file and add client-specific overrides:

```bash
# Client A specific variables
CLIENT_A_API_URL=https://api.client-a.example.com
CLIENT_A_PRIMARY_COLOR=#3b82f6
CLIENT_A_DEFAULT_LOCALE=en
```

## Plugin Configuration

Client A has the following plugins enabled:
- ✅ Lobby plugin

**Note:** Core (auth) and shared (ui) modules are always enabled by default.

## Theming

Client A uses a blue-based color scheme:
- Primary: `#3b82f6` (Blue)
- Secondary: `#6b7280` (Gray)
- Accent: `#10b981` (Green)

## Usage

Import the client configuration in your application:

```typescript
import { 
  clientConfig,
  getClientMessagesPath,
  getClientAssetPath 
} from '@clients/client-a';

// Access client configuration
console.log(clientConfig.clientName); // "Acme Corporation"
console.log(clientConfig.plugins); // ["lobby"]

// Check enabled plugins
if (clientConfig.plugins.includes('lobby')) {
  // Render lobby UI
}
```

### Asset Override System

Assets (logo, favicon, etc.) are automatically overridden at build time:
- **Default assets:** Located in `app/src/lib/assets/`
- **Client overrides:** Place files with same name in `clients/client-a/src/lib/assets/`
- **Build system:** Automatically detects and uses client version if present, falls back to default
- **No configuration needed:** Assets are resolved by filename matching, not config
