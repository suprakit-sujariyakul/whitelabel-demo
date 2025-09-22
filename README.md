# Whitelabel Demo

A modular whitelabel application architecture with client-specific overrides and environment-based builds, enabling multiple clients to deploy customized versions of a core application.

## 📋 Business Requirements

### Core Purpose
- **Whitelabel Solution**: Customizable web platform for multiple clients across various industries
- **Primary Function**: Modular architecture that allows clients to enable/disable features based on their business needs
- **Target Market**: Any organization requiring a branded, customizable web application

### Module Architecture
The platform consists of two types of modules:

#### Core Modules (Required)
- Essential functionality that all clients must have
- Cannot be removed from any build
- Examples: user authentication, basic user interface, core data management

#### Pluggable Modules (Optional)
- Additional features that clients can choose to include
- Can be customized with client-specific behavior, interfaces, and logic flows
- Examples: advanced reporting, payment processing, third-party integrations, premium features

### Customization Levels
1. **Theme Customization**: All modules support visual theming (colors, fonts, branding)
2. **Behavioral Customization**: Only pluggable modules can have modified logic and custom interfaces
3. **Client-Specific Features**: Pluggable modules can include entirely new functionality per client

## 🎯 Features

- **Client-Specific Builds**: Each client gets completely customized static builds
- **Environment Support**: Different configurations for dev/stag/prod environments  
- **Path Override System**: Automatic file resolution with priority-based overrides
- **Webview Ready**: Optimized for webview/mobile app integration
- **Zero Runtime Cost**: All resolution happens at build time
- **Modular Design**: Core modules + pluggable modules architecture
- **Static Site Generation**: Pure frontend with no backend dependencies

## 🏗️ Architecture

```
project/
├── app/                          # Main application
│   ├── src/                      # Default source files
│   │   ├── lib/
│   │   │   ├── theme.css         # Default theme
│   │   │   └── config.json       # Default config
│   │   └── routes/
│   │       ├── +page.svelte      # Default home page
│   │       └── +layout.svelte    # Default layout
│   ├── vite.config.ts            # Vite config with client plugin
│   └── vite-plugins/
│       └── client-path-resolver.ts  # Path override plugin
│
├── clients/                      # Client-specific overrides
│   ├── client-a/                 # Acme Corporation
│   │   └── src/
│   │       ├── dev/              # Development overrides
│   │       │   └── lib/
│   │       │       └── config.json  # Dev-specific config
│   │       ├── prod/             # Production overrides  
│   │       │   └── lib/
│   │       │       └── config.json  # Prod-specific config
│   │       ├── lib/
│   │       │   ├── theme.css     # Client theme
│   │       │   └── config.json   # Default client config
│   │       └── routes/
│   │           ├── +page.svelte  # Client home page
│   │           └── +layout.svelte # Client layout
│   │
│   └── client-b/                 # TechCorp Industries
│       └── src/
│           └── lib/
│               ├── theme.css     # Different theme
│               └── config.json   # Different config
│
└── scripts/
    └── test-plugin.js            # Demo resolution logic
```

## 🔄 Path Resolution Priority

The Vite plugin resolves imports with the following priority:

1. **🎨 CLIENT + ENV** - `clients/{client}/src/{env}/{file}` (highest)
2. **🎨 CLIENT ONLY** - `clients/{client}/src/{file}` (medium) 
3. **📱 APP FALLBACK** - `app/src/{file}` (lowest)

## 🚀 Commands

Scripts follow the pattern: `client:command:env` for maximum clarity.

### 📊 Complete Command Matrix

| Client | Command | Environment | Script |
|--------|---------|-------------|---------|
| **Default** | dev | dev | `pnpm run dev` |
| **Default** | build | dev | `pnpm run build` |
| **Default** | test | dev | `pnpm run test` |
| client-a | dev | dev | `pnpm run client-a:dev:dev` |
| client-a | dev | stag | `pnpm run client-a:dev:stag` |
| client-a | dev | prod | `pnpm run client-a:dev:prod` |
| client-a | build | dev | `pnpm run client-a:build:dev` |
| client-a | build | stag | `pnpm run client-a:build:stag` |
| client-a | build | prod | `pnpm run client-a:build:prod` |
| client-a | test | dev | `pnpm run client-a:test` |
| client-b | dev | dev | `pnpm run client-b:dev:dev` |
| client-b | dev | stag | `pnpm run client-b:dev:stag` |
| client-b | dev | prod | `pnpm run client-b:dev:prod` |
| client-b | build | dev | `pnpm run client-b:build:dev` |
| client-b | build | stag | `pnpm run client-b:build:stag` |
| client-b | build | prod | `pnpm run client-b:build:prod` |
| client-b | test | dev | `pnpm run client-b:test` |
| **all** | build | dev | `pnpm run all:build:dev` |
| **all** | build | stag | `pnpm run all:build:stag` |
| **all** | build | prod | `pnpm run all:build:prod` |
| **all** | test | dev | `pnpm run all:test` |

### 📱 Default (All Modules, No Client Overrides)
```bash
pnpm run dev              # Development server with all modules (defaults to ENV=dev)
pnpm run build            # Production build with all modules (defaults to ENV=dev)
pnpm run preview          # Preview production build
pnpm run test             # Run tests (defaults to ENV=dev)
```
> **Note**: Default commands automatically use `ENV=dev` and enable all modules without client overrides.

### 🏢 Client-A (Acme Corporation)
```bash
pnpm run client-a:dev:dev      # Development with client-a overrides in dev env
pnpm run client-a:dev:stag     # Development with client-a overrides in staging env
pnpm run client-a:dev:prod     # Development with client-a overrides in prod env
pnpm run client-a:build:dev    # Development build with client-a overrides
pnpm run client-a:build:stag   # Staging build with client-a overrides
pnpm run client-a:build:prod   # Production build with client-a overrides
pnpm run client-a:test         # Run tests with client-a context
```

### 🏭 Client-B (TechCorp Industries)
```bash
pnpm run client-b:dev:dev      # Development with client-b overrides in dev env
pnpm run client-b:dev:stag     # Development with client-b overrides in staging env
pnpm run client-b:dev:prod     # Development with client-b overrides in prod env
pnpm run client-b:build:dev    # Development build with client-b overrides
pnpm run client-b:build:stag   # Staging build with client-b overrides
pnpm run client-b:build:prod   # Production build with client-b overrides
pnpm run client-b:test         # Run tests with client-b context
```

### 🌍 All Clients
```bash
pnpm run all:build:dev     # Development builds for all clients
pnpm run all:build:stag    # Staging builds for all clients
pnpm run all:build:prod    # Production builds for all clients
pnpm run all:test          # Run tests for all clients
```

### 🔍 Testing & Development Tools
```bash
node scripts/test-plugin.js    # See path resolution in action
pnpm run format               # Format code
pnpm run lint                 # Lint code
pnpm run test:unit            # Unit tests
pnpm run test:e2e            # End-to-end tests
```

## 🚧 Development Workflow

### Client-Separated Build Process
1. **Client Selection**: Choose target client and environment
2. **Build Directory Setup**: Create isolated build directory with client-specific overrides
3. **Module Resolution**: Resolve dependencies based on client configuration
4. **Route Registration**: Register client-side routes with language support
5. **Theme Compilation**: Apply client-specific design tokens and theming
6. **Code Optimization**: Tree-shake and bundle only required modules
7. **Static Asset Generation**: Generate optimized assets for target deployment
8. **Artifact Packaging**: Create deployment-ready static files

### Development Commands
```bash
# Start development server for specific client
pnpm run client-a:dev:dev      # Client-A development with dev environment
pnpm run client-b:dev:prod     # Client-B development with production environment

# Build specific client + environment combinations
pnpm run client-a:build:stag   # Client-A staging build
pnpm run all:build:prod        # All clients production builds

# Test with client context
pnpm run client-a:test         # Test Client-A with overrides
pnpm run all:test             # Test all clients
```

### Quality Assurance
- **Type Safety**: TypeScript integration with client-specific type checking
- **Testing**: Tests run against client builds with their specific module combinations
- **Performance**: Bundle analysis per client to ensure optimal sizes
- **Path Resolution**: Debug logging shows exactly which files are being resolved

### Configuration Management
- **Client Configs**: `clients/{client-id}/src/lib/config.json` with module selections and branding
- **Environment Overrides**: `clients/{client-id}/src/{env}/` for environment-specific files
- **Theme Overrides**: `clients/{client-id}/src/lib/theme.css` for client-specific styling
- **Route Overrides**: `clients/{client-id}/src/routes/` for client-specific pages
- **Build Configs**: Dynamic configuration loaded from structured client directory

## 📁 Override Examples

### Environment-Specific Configuration
```json
// clients/client-a/src/dev/lib/config.json (Development)
{
  "clientId": "client-a",
  "clientName": "Acme Corporation (Development)",
  "features": {
    "debugMode": true,
    "mockData": true
  },
  "api": {
    "baseUrl": "https://dev-api.acme.com"
  }
}

// clients/client-a/src/prod/lib/config.json (Production)  
{
  "clientId": "client-a",
  "clientName": "Acme Corporation",
  "features": {
    "debugMode": false,
    "mockData": false
  },
  "api": {
    "baseUrl": "https://api.acme.com"
  }
}
```

### Client-Specific Theming
```css
/* clients/client-a/src/lib/theme.css - Acme Corp Blue Theme */
:root {
  --primary-color: #3b82f6;
  --acme-gradient: linear-gradient(135deg, #3b82f6, #1e40af);
}

/* clients/client-b/src/lib/theme.css - TechCorp Dark Theme */
:root {
  --primary-color: #f97316;
  --color-background: #111827;
  --techcorp-gradient: linear-gradient(135deg, #f97316, #ea580c);
}
```

## 🎨 Live Example

The test script shows actual resolution results:

**Client A + Dev Environment:**
- `lib/config.json` → 🎨 **CLIENT + ENV** (uses dev-specific config)
- `lib/theme.css` → 🎨 **CLIENT ONLY** (uses client theme)  
- `routes/lobby/+page.svelte` → 📱 **APP FALLBACK** (uses default)

**Client B + Prod Environment:**
- `lib/theme.css` → 🎨 **CLIENT ONLY** (uses TechCorp dark theme)
- `routes/+page.svelte` → 📱 **APP FALLBACK** (uses default page)

## ⚙️ Technical Requirements

### Technology Stack
- **Frontend Framework**: Svelte 5
- **Build Strategy**: Static Site Generation (SSG)
- **Package Management**: pnpm with monorepo structure
- **Deployment**: Static webapp optimized for webview environments

### Architecture Principles

#### Modular Design
- **Core Modules**: Essential functionality (user authentication, data management, user interface)
- **Pluggable Modules**: Optional features (advanced reporting, payment processing, third-party integrations)
- **Client Customization Modules**: Client-specific overrides and extensions
- **Shared Libraries**: Common functions and components used across modules

#### Module Contracts
- **Interface Definition**: Each module must define clear interfaces ("Contracts") for inter-module communication
- **Bridge Interfaces**: Modules requiring native webview communication must implement Bridge interfaces
- **Dependency Management**: All module dependencies must be explicitly declared and resolved at build time

#### Infrastructure vs Presentation
**App as Infrastructure:**
The `app/` directory is the skeleton/infrastructure that:
- Loads client configuration at build time
- Manages routing and navigation between modules  
- Coordinates data flow between modules
- Provides the foundation for module orchestration

**Modules as Pure Presentation:**
Each module is a pure presentation component that:
- **Input**: Receives data from other modules (via infrastructure)
- **Output**: Emits navigation requests with payload (to infrastructure) 
- **No direct communication**: Modules never talk to each other directly
- **Stateless UI**: Just renders pages based on input data

## 🔧 Implementation Details

- **Frontend Only**: No backend required, pure static site generation
- **Webview Optimized**: Perfect for mobile/desktop webview integration  
- **Build-Time Resolution**: Zero runtime overhead, optimal bundle sizes
- **Vite Plugin**: Seamlessly integrates with existing Vite/SvelteKit workflow
- **TypeScript Support**: Full type safety with client override system
- **Module Communication**: Infrastructure coordinates all inter-module data flow
- **Client Separation**: Complete build isolation per client with environment variants

## 🌟 Benefits

- **Perfect Bundle Optimization**: Only client-specific files included, unused modules completely excluded
- **Environment Flexibility**: Different builds for dev/staging/production with environment-specific overrides
- **Simple Override System**: Just mirror the file structure to override any app file
- **Zero Configuration**: Works with standard Vite/SvelteKit setup, no custom build complexity
- **Developer Friendly**: Clear resolution priority, debug logging, and systematic command structure
- **Scalable Architecture**: Add new clients or modules without affecting existing ones
- **Deployment Ready**: Each build outputs standard static files ready for any hosting