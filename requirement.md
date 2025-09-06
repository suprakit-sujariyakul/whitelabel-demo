# Whitelabel Platform Architecture Requirements

## Overview

This document outlines the technical requirements for a flexible whitelabel platform architecture that enables multiple clients to deploy customized versions of a core application. The platform is designed with a modular architecture to enable extensive customization while maintaining shared core functionality.

## Business Requirements

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

## Technical Requirements

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

### Project Structure

#### Monorepo Organization
The project follows a monorepo pattern with pnpm workspaces, carefully structured to integrate with Paraglide i18n, client-side routing, and other dependencies:

```
project-root/
├── modules/
│   ├── core/                    # Core modules (required)
│   │   ├── auth/
│   │   ├── data-management/
│   │   ├── user-interface/
│   │   └── ui-primitives/
│   ├── plugins/                 # Pluggable modules (optional)
│   │   ├── advanced-reporting/
│   │   ├── payment-processing/
│   │   ├── third-party-integrations/
│   │   └── premium-features/
│   └── shared/                  # Shared libraries and utilities
│       ├── design-tokens/
│       ├── types/               # Module contracts and interfaces
│       │   ├── ModuleInput.ts   # Standard input interface
│       │   ├── ModuleOutput.ts  # Standard output interface  
│       │   └── ClientConfig.ts  # Client configuration types
│       └── utils/
├── app/                         # Infrastructure/Skeleton App
│   ├── src/
│   │   ├── lib/
│   │   │   ├── config/          # Client config management
│   │   │   ├── router/          # Route management & navigation
│   │   │   ├── data/            # Inter-module data flow
│   │   │   └── orchestrator/    # Module coordination
│   │   ├── App.svelte           # Main app infrastructure
│   │   └── main.js              # Entry point
│   ├── package.json             # Dependencies
│   └── vite.config.js           # Build configuration
├── clients/                     # Client-specific configurations and overrides
│   ├── client-a/
│   │   ├── config.json          # Client configuration (modules, permissions, etc.)
│   │   ├── core/                # Core module overrides (mirrors modules/core/)
│   │   │   └── auth/            # Override for @core/auth
│   │   ├── plugins/             # Plugin module overrides (mirrors modules/plugins/)
│   │   │   └── reporting/       # Override for @plugin/reporting
│   │   └── shared/              # Shared utilities overrides
│   │       └── design-tokens/   # Override design tokens
│   └── client-b/
│       ├── config.json
│       ├── core/
│       │   └── auth/
│       └── plugins/
│           ├── payments/        # Different plugin overrides
│           └── premium/
├── package.json                 # Dependencies + workspace modules
├── vite.config.js               # Vite configuration
├── tsconfig.json                # TypeScript configuration
├── pnpm-workspace.yaml                
├── build/                        # Client-separated build outputs
│   ├── client-a/
│   │   ├── dev/                 # Development build (internal team)
│   │   │   ├── dist/                # Non-minified build
│   │   ├── stag/             # Staging build (internal team + external clients)
│   │   │   ├── dist/                 # Minified/obfuscated, no source maps
│   │   │   └── artifacts/           # Staging packaged deliverables
│   │   │       └── client-a-stag-v1.2.3.tar.gz
│   │   └── prod/          # Production build (external clients)
│   │       ├── dist/                 # Minified/obfuscated, no source maps
│   │       │   ├── assets/          # Heavily optimized, minified assets
│   │       │   ├── images/          # Compressed images
│   │       │   └── index.html       # Entry HTML file
│   │       └── artifacts/           # Production packaged deliverables
│   │           └── client-a-prod-v1.2.3.tar.gz
│   └── client-b/
│       ├── dev/
│       ├── stag/
│       └── prod/
└── tools/                       
    ├── build/
    └── scripts/
```

#### Architecture: Infrastructure vs Presentation

**App as Infrastructure:**
The `app/` directory is the **skeleton/infrastructure** that:
- Loads client configuration at build time
- Manages routing and navigation between modules  
- Coordinates data flow between modules
- Provides the foundation for module orchestration

**Modules as Pure Presentation:**
Each module is a **pure presentation component** that:
- **Input**: Receives data from other modules (via infrastructure)
- **Output**: Emits navigation requests with payload (to infrastructure) 
- **No direct communication**: Modules never talk to each other directly
- **Stateless UI**: Just renders pages based on input data

**Communication Flow:**
```
┌─────────────────────────────────────────────────────────────┐
│                    App Infrastructure                        │
│  ┌─────────────┐   ┌─────────────┐   ┌─────────────────────┐ │
│  │   Config    │   │   Router    │   │   Data Orchestra   │ │
│  │  Manager    │   │  Manager    │   │      (State)       │ │
│  └─────────────┘   └─────────────┘   └─────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
       ↓ Input Data                    ↑ Navigation Events
┌─────────────┐   ┌─────────────┐   ┌─────────────┐
│   Module A  │   │   Module B  │   │   Module C  │
│ (Dashboard) │   │  (Reports)  │   │   (Auth)    │
└─────────────┘   └─────────────┘   └─────────────┘
```

**Example Module Interface:**
```typescript
// Input: Data from other modules
interface ModuleInput {
  user: UserData;           // From @core/auth
  preferences: Settings;     // From @core/user-settings
  permissions: Permission[]; // From infrastructure
}

// Output: Navigation requests  
interface ModuleOutput {
  navigate: (route: string, payload?: any) => void;
  emit: (event: string, data: any) => void;
}

// Module is pure presentation
export const DashboardPage = ({ input, output }: {
  input: ModuleInput;
  output: ModuleOutput;
}) => {
  // Pure rendering based on input
  // Navigation via output.navigate()
};
```

**Build Flow:**
```
app/ (infrastructure) + client-config + modules → copy to build/client-a/ + generate routes
                            ↓ (standard Vite build)
                    build/client-a/dist/ (static site output)
```

**Key Architectural Principles:**
- ✅ **Infrastructure vs Presentation** - clear separation of concerns
- ✅ **Modules as Pure UI** - no side effects, just input → output  
- ✅ **Centralized State Management** - infrastructure manages all data flow
- ✅ **Build-Time Module Loading** - static imports, perfect tree shaking
- ✅ **Contract-Based Interfaces** - standardized input/output for all modules
- ✅ **Zero Module Coupling** - modules never import each other directly

#### Standard Svelte App with Module Imports

**`app/` as Standard Svelte + Vite Application:**

The app imports modules like any standard Svelte library and uses conditional rendering:

```typescript
// app/src/lib/config/clientConfig.ts
export interface ClientConfig {
  clientId: string;
  modules: string[];
  permissions: string[];
  theme?: string;
}

// This would be loaded from clients/client-a/config.json at build time
export const clientConfig: ClientConfig = {
  plugins: ['@plugin/reporting', '@plugin/payment-processing']
};
```

**Client-Side Router with Module Loading:**

```typescript
// app/src/lib/router/Router.svelte
<script lang="ts">
  import { onMount } from 'svelte';
  import { clientConfig } from '$lib/config/clientConfig';
  import * as m from '$lib/paraglide/messages';
  
  // Standard dynamic imports based on current route
  let PageComponent: any = null;
  let loading = true;
  let error = '';
  let currentPath = '';
  
  $: slug = currentPath.replace('/', '');
  
  async function loadPage(slug: string) {
    loading = true;
    error = '';
    
    try {
      // Standard dynamic imports - no custom discovery needed
      switch (slug) {
        case 'dashboard':
          if (clientConfig.modules.includes('@core/data-management')) {
            const module = await import('@core/data-management');
            PageComponent = module.DashboardPage;
          } else {
            error = 'Module not available';
          }
          break;
          
        case 'reports':
          if (clientConfig.modules.includes('@plugin/reporting')) {
            const module = await import('@plugin/reporting');
            PageComponent = module.ReportsPage;
          } else {
            error = 'Module not available';
          }
          break;
          
        default:
          error = 'Page not found';
      }
    } catch (err) {
      error = 'Failed to load page';
      console.error('Page load error:', err);
    } finally {
      loading = false;
    }
  }
  
  $: if (slug) loadPage(slug);
</script>

{#if loading}
  <div>Loading...</div>
{:else if error}
  <div>Error: {error}</div>
{:else if PageComponent}
  <svelte:head>
    <title>{m.page_title()}</title>
  </svelte:head>
  <svelte:component this={PageComponent} />
{:else}
  <div>Page not found</div>
{/if}
```

**Even Simpler Approach - Module Registry:**

```typescript
// app/src/lib/modules/moduleRegistry.ts
import type { ComponentType } from 'svelte';
import { clientConfig } from '$lib/config/clientConfig';

// Registry of available modules - could be generated at build time
export const moduleRegistry = new Map<string, () => Promise<any>>();

// Only register modules that are enabled for this client
if (clientConfig.modules.includes('@core/data-management')) {
  moduleRegistry.set('dashboard', () => import('@core/data-management'));
  moduleRegistry.set('data-overview', () => import('@core/data-management').then(m => ({ default: m.OverviewPage })));
}

if (clientConfig.modules.includes('@plugin/reporting')) {
  moduleRegistry.set('reports', () => import('@plugin/reporting'));
  moduleRegistry.set('analytics', () => import('@plugin/reporting').then(m => ({ default: m.AnalyticsPage })));
}

export async function loadModule(slug: string): Promise<ComponentType | null> {
  const moduleLoader = moduleRegistry.get(slug);
  if (!moduleLoader) return null;
  
  try {
    const module = await moduleLoader();
    return module.default || module.MainPage;
  } catch (error) {
    console.error(`Failed to load module for ${slug}:`, error);
    return null;
  }
}
```

**Runtime Conditional Logic:**

```typescript
// Generated in build/client-a/src/lib/moduleLoader.ts
export const moduleLoader = {
  'core-auth': () => import('@core/auth'),
  'core-symptom': () => import('@core/symptom'),
  'plugin-scheduling': () => import('@plugin/scheduling'),
  // ❌ 'plugin-payments' NOT included (client didn't purchase)
  // ❌ 'plugin-premium' NOT included (client didn't purchase)
};

export async function loadModule(moduleId: string) {
  if (moduleLoader[moduleId]) {
    return await moduleLoader[moduleId]();
  }
  throw new Error(`Module '${moduleId}' not available for client-a`);
}
```

**Component-Level Conditional Rendering:**

```typescript
// Generated in build/client-a/src/routes/+layout.svelte
<script lang="ts">
  import { loadModule } from '$lib/moduleLoader';
  import type { ClientConfig } from '$lib/types';
  
  // Client config injected at build time
  const clientConfig: ClientConfig = {
    clientId: 'client-a',
    modules: ['@core/auth', '@core/symptom', '@plugin/scheduling'],
    theme: 'healthcare-theme',
    permissions: ['user', 'schedule']
  };
  
  // Conditional feature availability
  $: hasAuth = clientConfig.modules.includes('core-auth');
  $: hasScheduling = clientConfig.modules.includes('plugin-scheduling');
  $: hasPayments = clientConfig.modules.includes('plugin-payments'); // false
  
  let authComponent: any = null;
  let schedulingComponent: any = null;
  
  onMount(async () => {
    if (hasAuth) {
      const authModule = await loadModule('core-auth');
      authComponent = authModule.AuthProvider;
    }
    
    if (hasScheduling) {
      const schedulingModule = await loadModule('plugin-scheduling');
      schedulingComponent = schedulingModule.SchedulingProvider;
    }
  });
</script>

<div class="app">
  <!-- Conditional auth wrapper -->
  {#if hasAuth && authComponent}
    <svelte:component this={authComponent}>
      
      <!-- Conditional scheduling features -->
      {#if hasScheduling && schedulingComponent}
        <svelte:component this={schedulingComponent}>
          <slot />
        </svelte:component>
      {:else}
        <slot />
      {/if}
      
    </svelte:component>
  {:else}
    <slot />
  {/if}
  
  <!-- Conditional navigation based on available modules -->
  <nav>
    <a href="/symptoms">Symptoms</a> <!-- Always available (core) -->
    {#if hasScheduling}
      <a href="/appointments">Appointments</a>
    {/if}
    {#if hasPayments}
      <a href="/billing">Billing</a> <!-- Won't render for this client -->
    {/if}
  </nav>
</div>
```

#### Module Structure Guidelines
Each module follows a standardized structure compatible with Paraglide and other dependencies:

```
@core/auth/                      # Standard npm package structure
├── src/
│   ├── index.ts                 # Main entry point (like any npm package)
│   ├── components/              # Svelte components
│   │   ├── MainPage.svelte
│   │   ├── DetailPage.svelte
│   │   └── index.ts             # Export components
│   ├── stores/                  # Svelte stores
│   ├── lib/                     # Module logic and utilities
│   └── types/                   # TypeScript type definitions
├── messages/                    # i18n messages (standard location)
│   ├── en.json
│   └── th.json
├── package.json                 # Standard npm package.json with exports
└── README.md
```

**Standard Package.json (Like Any NPM Package):**
```json
// modules/core/data-management/package.json
{
  "name": "@core/data-management",
  "version": "1.0.0",
  "type": "module",
  "exports": {
    ".": "./src/index.ts",
    "./components": "./src/components/index.ts",
    "./components/*": "./src/components/*",
    "./messages/*": "./messages/*"
  },
  "svelte": "./src/index.ts",
  "types": "./src/index.ts",
  "files": ["src", "messages"],
  "peerDependencies": {
    "svelte": "^5.0.0"
  },
  "metadata": {
    "routes": [
      {"path": "/dashboard", "component": "MainPage"},
      {"path": "/data-overview", "component": "DetailPage"}
    ],
    "permissions": ["user"],
    "i18nNamespace": "dataManagement"
  }
}
```

**Standard Module Entry Point:**
```typescript
// modules/core/data-management/src/index.ts
export { default as DashboardPage } from './pages/DashboardPage.svelte';
export { default as OverviewPage } from './pages/OverviewPage.svelte';
export type * from './types/interfaces';

// Module contract - what it needs and provides
export const moduleContract = {
  // What this module needs from infrastructure
  inputs: {
    user: 'UserData',
    permissions: 'Permission[]',
    preferences: 'Settings'
  },
  
  // What this module provides to infrastructure  
  outputs: {
    navigate: '(route: string, payload?: any) => void',
    emit: '(event: string, data: any) => void'
  },
  
  // Routes this module can handle
  routes: [
    { path: '/dashboard', component: 'DashboardPage', permissions: ['user'] },
    { path: '/data-overview', component: 'OverviewPage', permissions: ['user'] }
  ],
  
  // Module metadata
  permissions: ['user'],
  i18nNamespace: 'dataManagement'
};
```

**Module Page Example:**
```svelte
<!-- modules/core/data-management/src/pages/DashboardPage.svelte -->
<script lang="ts">
  import type { ModuleInput, ModuleOutput } from '@shared/types';
  
  // Props provided by infrastructure
  export let input: ModuleInput;
  export let output: ModuleOutput;
  
  // Pure reactive statements based on input
  $: user = input.user;
  $: canViewAdvanced = input.permissions.includes('admin');
  
  // Navigation handlers (output only)
  function goToReports() {
    output.navigate('/reports', { fromDashboard: true });
  }
  
  function requestUserData() {
    output.emit('request-user-data', { userId: user.id });
  }
</script>

<div class="dashboard">
  <h1>Welcome, {user.name}</h1>
  
  {#if canViewAdvanced}
    <button on:click={goToReports}>View Reports</button>
  {/if}
  
  <button on:click={requestUserData}>Refresh Data</button>
</div>
```

**Infrastructure Implementation:**

The app skeleton orchestrates everything while modules remain pure:

```typescript
// app/src/lib/orchestrator/AppOrchestrator.ts
export class AppOrchestrator {
  private globalState = new Map<string, any>();
  private clientConfig: ClientConfig;
  
  constructor(clientConfig: ClientConfig) {
    this.clientConfig = clientConfig;
    this.initializeState();
  }
  
  // Provide data to modules (Input)
  getModuleInput(route: string): ModuleInput {
    return {
      user: this.globalState.get('currentUser'),
      permissions: this.globalState.get('userPermissions'), 
      preferences: this.globalState.get('userPreferences'),
      // Route-specific data
      routeData: this.globalState.get(`route:${route}`)
    };
  }
  
  // Handle module requests (Output)
  getModuleOutput(route: string): ModuleOutput {
    return {
      navigate: (targetRoute: string, payload?: any) => {
        // Infrastructure handles navigation
        this.handleNavigation(targetRoute, payload);
      },
      emit: (event: string, data: any) => {
        // Infrastructure manages inter-module communication  
        this.handleModuleEvent(event, data, route);
      }
    };
  }
  
  private handleNavigation(route: string, payload: any) {
    // Update URL, manage history, load target module
    if (payload) {
      this.globalState.set(`route:${route}`, payload);
    }
    // Trigger route change...
  }
  
  private handleModuleEvent(event: string, data: any, fromRoute: string) {
    // Handle inter-module communication
    switch (event) {
      case 'user-updated':
        this.globalState.set('currentUser', data);
        break;
      case 'request-data':
        // Fetch data and update state
        break;
    }
  }
}
```

**Generated App (Infrastructure):**
```svelte
<!-- build/client-a/src/App.svelte - Infrastructure layer -->
<script>
  import { AppOrchestrator } from '$lib/orchestrator/AppOrchestrator';
  import { clientConfig } from '$lib/config/client.config';
  
  // Static imports (generated based on client modules)
  import { DashboardPage } from '@core/data-management';
  import { ReportsPage } from '@plugin/reporting';
  
  const orchestrator = new AppOrchestrator(clientConfig);
  let currentRoute = '/dashboard';
  
  // Route mapping (build-time generated)
  const routes = {
    '/dashboard': DashboardPage,
    '/reports': ReportsPage
  };
  
  $: PageComponent = routes[currentRoute];
  $: input = orchestrator.getModuleInput(currentRoute);
  $: output = orchestrator.getModuleOutput(currentRoute);
</script>

<!-- Infrastructure provides managed input/output to modules -->
<svelte:component this={PageComponent} {input} {output} />
```

**Benefits of Infrastructure vs Presentation:**

1. **🔄 Clean Separation of Concerns**
   - **Infrastructure**: Manages state, routing, configuration, data flow
   - **Modules**: Pure presentation logic, no side effects

2. **🧪 Easy Testing**
   - **Module testing**: Just test component with mock input/output
   - **Infrastructure testing**: Test orchestration logic separately

3. **🔌 Perfect Modularity**  
   - **Modules never import each other**: Zero coupling between modules
   - **Infrastructure manages dependencies**: Centralized dependency coordination
   - **Hot-swappable modules**: Replace modules without affecting others

4. **📈 Scalable Architecture**
   - **Add modules**: Just provide new pages with same input/output interface
   - **Change routing**: Infrastructure change, modules unaffected
   - **Update data flow**: Orchestrator change, modules unaffected

5. **🎯 Build-Time Optimization**
   - **Static imports**: All module imports known at build time
   - **Tree shaking**: Unused modules completely eliminated  
   - **Type safety**: Full TypeScript support with interface contracts

**Example Inter-Module Communication:**
```typescript
// Module A (Dashboard) requests user data
output.emit('request-user-data', { userId: 123 });

// Infrastructure handles this:
// 1. Fetches data from appropriate source  
// 2. Updates global state
// 3. All modules receive updated input automatically

// Module B (Profile) gets updated data
$: user = input.user; // Automatically reactive to infrastructure state
```

**Client Configuration Example:**
```json
// clients/client-a/config.json
{
  "clientId": "client-a",
  "name": "Client A Platform",
  "modules": [
    "@core/auth",
    "@core/data-management", 
    "@core/user-interface",
    "@plugin/reporting"
  ],
  "permissions": ["user", "admin", "reports"],
  "theme": "corporate-theme",
  "branding": {
    "logo": "./assets/logo.svg",
    "primaryColor": "#0066CC",
    "name": "Client A Portal"
  },
  "features": {
    "reporting": true,
    "payments": false,
    "premium": false
  },
  "locales": ["en", "th"],
  "defaultLocale": "en"
}
```

```json
// clients/client-b/config.json  
{
  "clientId": "client-b",
  "name": "Client B Platform",
  "modules": [
    "@core/auth",
    "@core/data-management",
    "@plugin/payments",
    "@plugin/premium"
  ],
  "permissions": ["user", "premium", "billing"],
  "theme": "modern-theme", 
  "branding": {
    "logo": "./core/auth/assets/logo.svg",
    "primaryColor": "#00AA44",
    "name": "Client B Platform"
  },
  "features": {
    "reporting": false,
    "payments": true, 
    "premium": true
  },
  "locales": ["en"],
  "defaultLocale": "en"
}
```

**Practical Override Examples:**

```css
/* clients/client-a/core/auth/theme/styles.css */
/* Override the login page styling for client-a */
.auth-login-form {
  background-color: var(--client-primary);
  border-radius: 12px;
}

.auth-button {
  background: linear-gradient(135deg, #0066CC, #004A99);
  color: white;
}
```

```json
// clients/client-a/plugins/reporting/messages/en.json
// Override reporting messages for client-a branding
{
  "reports.title": "Analytics Dashboard",
  "reports.generate.title": "Generate Custom Report",
  "reports.confirmation": "Your report has been generated successfully"
}
```

```json
// clients/client-b/plugins/payments/messages/en.json  
// Override payment messages for client-b branding
{
  "billing.title": "Premium Plan Billing",
  "payment.method": "Choose Your Payment Method",
  "payment.success": "Welcome to your premium experience!"
}
```


**Paraglide Integration Per Module:**
```json
// modules/core/auth/messages/en.json
{
  "auth.login.title": "Sign In",
  "auth.login.email": "Email Address",
  "auth.login.password": "Password",
  "auth.login.submit": "Sign In"
}
```

```json
// modules/core/auth/messages/th.json  
{
  "auth.login.title": "เข้าสู่ระบบ",
  "auth.login.email": "อีเมล",
  "auth.login.password": "รหัสผ่าน",
  "auth.login.submit": "เข้าสู่ระบบ"
}
```

#### Svelte-Specific Guidelines

##### Component Organization
- **Atomic Design**: Components organized by complexity (atoms → molecules → organisms)
- **Single Responsibility**: Each component has one clear purpose
- **Prop Contracts**: Clear TypeScript interfaces for all component props
- **Event Contracts**: Standardized event naming and payload structures

##### Store Management
- **Module Stores**: Each module manages its own Svelte stores
- **Store Contracts**: Defined interfaces for store interactions between modules
- **State Isolation**: Module stores are isolated unless explicitly shared through contracts

##### File Naming Conventions
- **Components**: PascalCase (e.g., `SymptomInput.svelte`, `DoctorCard.svelte`)
- **Stores**: camelCase with `.store.ts` suffix (e.g., `userAuth.store.ts`)
- **Routes**: Client-side routing with dynamic page components
- **Types**: PascalCase with `.types.ts` suffix (e.g., `User.types.ts`)

##### Import/Export Patterns
- **Barrel Exports**: Each module provides a single entry point (`index.ts`)
- **Named Exports**: Prefer named exports over default exports for better tree-shaking
- **Type-Only Imports**: Separate type imports from runtime imports

##### Build Integration
- **Workspace Dependencies**: Modules declare dependencies on other workspace packages
- **Build-Time Resolution**: Module imports resolved at build time based on client configuration
- **Tree Shaking**: Unused exports automatically removed from final bundles

### Module Discovery and Route Management

#### File Discovery in Monorepo

**Package Resolution Strategy:**
```json
// apps/web-app/package.json
{
  "dependencies": {
    "@core/auth": "workspace:*",
    "@core/symptom": "workspace:*", 
    "@plugin/scheduling": "workspace:*",
    "@client/client-a": "workspace:*",
    "@shared/utils": "workspace:*"
  }
}
```

**Import Resolution:**
Svelte/Vite resolves modules through standard package imports:
```typescript
// In any Svelte component
import { AuthStore } from '@core/auth';
import { SymptomForm } from '@core/symptom';
import { ClientTheme } from '@client/client-a';
```

**Workspace Package Resolution:**
```typescript
// Modules are resolved as standard workspace packages
// No special Vite configuration needed - standard workspace resolution works
```

#### Simplified Route Discovery in Skeleton App

**How the Skeleton App Discovers Routes:**

The skeleton app (`app/`) handles all route discovery by reading JSON configuration files from modules:

```typescript
// app/src/lib/module-discovery/RouteDiscovery.ts
export class RouteDiscovery {
  static async discoverAllRoutes(clientConfig: ClientConfig): Promise<RouteInfo[]> {
    const enabledModules = clientConfig.modules;
    const allRoutes: RouteInfo[] = [];
    
    for (const moduleId of enabledModules) {
      try {
        // Read module configuration from JSON file
        const configPath = `modules/${this.getModuleType(moduleId)}/${moduleId}/module.config.json`;
        const moduleConfig = await this.readModuleConfig(configPath);
        
        // Process routes from module config
        const moduleRoutes = this.processModuleRoutes(moduleConfig, moduleId, clientConfig);
        allRoutes.push(...moduleRoutes);
        
      } catch (error) {
        console.warn(`Failed to process module ${moduleId}:`, error);
      }
    }
    
    // Resolve any path conflicts
    return this.resolveRouteConflicts(allRoutes);
  }
  
  private static processModuleRoutes(
    moduleConfig: ModuleConfig, 
    moduleId: string, 
    clientConfig: ClientConfig
  ): RouteInfo[] {
    return moduleConfig.routes
      .filter(route => this.isRouteValidForClient(route, clientConfig))
      .map(route => ({
        path: route.path,
        pageComponent: `${moduleId}/src/pages/${route.page}`,
        permissions: route.permissions,
        dependencies: route.dependencies,
        moduleId,
        i18nNamespace: moduleConfig.i18nNamespace
      }));
  }
  
  private static isRouteValidForClient(route: RouteConfig, clientConfig: ClientConfig): boolean {
    // Check permissions
    if (!route.permissions.every(perm => clientConfig.permissions.includes(perm))) {
      return false;
    }
    
    // Check dependencies
    if (!route.dependencies.every(dep => clientConfig.modules.includes(dep))) {
      return false;
    }
    
    // Check client overrides
    if (clientConfig.routeOverrides?.[route.path]?.disabled) {
      return false;
    }
    
    return true;
  }
}
```

**Example Module Configurations:**

```json
// modules/core/symptom-input/module.config.json
{
  "moduleId": "core-symptom",
  "type": "core",
  "required": true,
  "routes": [
    {
      "path": "/symptoms",
      "page": "SymptomInputPage.svelte",
      "permissions": ["user"],
      "dependencies": []
    },
    {
      "path": "/symptoms/history",
      "page": "SymptomHistoryPage.svelte", 
      "permissions": ["user"],
      "dependencies": ["core-symptom"]
    }
  ],
  "i18nNamespace": "symptoms",
  "dependencies": []
}
```

```json
// modules/plugins/appointment-scheduling/module.config.json
{
  "moduleId": "plugin-scheduling",
  "type": "plugin", 
  "required": false,
  "routes": [
    {
      "path": "/appointments",
      "page": "AppointmentListPage.svelte",
      "permissions": ["user", "schedule"],
      "dependencies": ["core-auth"]
    },
    {
      "path": "/appointments/book",
      "page": "BookAppointmentPage.svelte",
      "permissions": ["user", "book"],
      "dependencies": ["core-auth"]
    }
  ],
  "i18nNamespace": "appointments",
  "dependencies": ["core-auth"]
}
```

**Complete Build Process:**

```bash
# When you run: pnpm build --client=client-a --env=prod

# Step 1: Skeleton app reads client config
# client-a: modules: ['@core/auth', '@core/data-management', '@plugin/reporting']

# Step 2: Skeleton discovers module configs
# - modules/core/data-management/module.config.json → 2 routes
# - modules/core/auth/module.config.json → 2 routes  
# - modules/plugins/reporting/module.config.json → 2 routes
# (plugin-payments and plugin-premium skipped - not enabled)

# Step 3: Filter routes based on permissions & dependencies
# ✅ '/dashboard' (core, has 'user' permission)
# ✅ '/data-overview' (core, has 'user', depends on core-data-management ✓)
# ✅ '/login' (core, public access)
# ✅ '/profile' (core, has 'user' permission) 
# ✅ '/reports' (plugin enabled, has 'user'+'admin', depends on core-auth ✓)
# ✅ '/analytics' (plugin enabled, has 'user'+'reports', depends on core-auth ✓)

# Step 4: Generate client-side routes in build/client-a/prod/
# Each route gets dynamic imports for module page components
```

**Generated Application Structure:**
```
build/client-a/prod/src/
├── App.svelte                      # Root app component
├── main.ts                         # Entry point
├── pages/                          # Page components
│   ├── Home.svelte                 # Home page
│   ├── Dashboard.svelte            # ✅ From core-data-management module
│   ├── DataOverview.svelte         # ✅ From core-data-management module
│   ├── Login.svelte                # ✅ From core-auth module
│   ├── Profile.svelte              # ✅ From core-auth module
│   └── Reports.svelte              # ✅ From plugin-reporting module
│   # ❌ No billing/ or premium-features/ (modules not enabled)
├── lib/
│   ├── router/                     # Client-side routing
│   └── moduleLoader.ts             # Dynamic module imports
└── public/
    └── index.html                  # Entry HTML
```

**Benefits of Modular Architecture:**

1. **🎯 Single Source of Truth**: All module logic centralized in the main app
2. **📝 Simple Configuration**: Modules provide clear metadata and exports
3. **🔒 Built-in Security**: Permission and dependency validation in the build process
4. **🚀 Optimal Performance**: Only enabled modules included, perfect tree-shaking
5. **🌐 Automatic i18n**: Every module gets Paraglide support out of the box
6. **⚙️ Easy Maintenance**: Standard Svelte + Vite tooling, no custom build complexity

#### Module Loading Patterns
```typescript
// build-tools/i18n-compiler/index.ts
export async function compileModuleMessages(clientConfig: ClientConfig) {
  const enabledModules = clientConfig.modules;
  const aggregatedMessages = {};
  
  // Aggregate messages from all enabled modules
  for (const moduleId of enabledModules) {
    const modulePath = `modules/${getModuleType(moduleId)}/${moduleId}`;
    const enMessages = await import(`${modulePath}/messages/en.json`);
    const thMessages = await import(`${modulePath}/messages/th.json`);
    
    // Merge with namespace prefix
    Object.assign(aggregatedMessages.en, prefixKeys(enMessages, moduleId));
    Object.assign(aggregatedMessages.th, prefixKeys(thMessages, moduleId));
  }
  
  // Apply client-specific overrides
  if (clientConfig.customMessages) {
    applyClientOverrides(aggregatedMessages, clientConfig);
  }
  
  // Write final message files for Paraglide
  await writeFile('apps/web-app/messages/en.json', JSON.stringify(aggregatedMessages.en, null, 2));
  await writeFile('apps/web-app/messages/th.json', JSON.stringify(aggregatedMessages.th, null, 2));
}
```

**Vite + Paraglide Configuration:**
```javascript
// app/vite.config.ts
import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { paraglide } from '@inlang/paraglide-js/vite';

export default defineConfig({
  plugins: [
    svelte(),
    paraglide({
      project: './project.inlang',
      outdir: './src/lib/paraglide'
    })
  ],
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: './src/main.ts'
    }
  }
});
```

**Paraglide Project Configuration:**
```json
// apps/web-app/project.inlang/settings.json
{
  "sourceLanguageTag": "en",
  "languageTags": ["en", "th"],
  "messageLintRules": [],
  "modules": [
    "https://cdn.jsdelivr.net/npm/@inlang/message-lint-rule-empty-pattern@latest/build/index.js",
    "https://cdn.jsdelivr.net/npm/@inlang/message-lint-rule-missing-translation@latest/build/index.js"
  ],
  "plugin.inlang.messageFormat": {
    "pathPattern": "./messages/{languageTag}.json"
  }
}
```

#### Module Loading Patterns

**Lazy Loading Strategy:**
```typescript
// Route components are lazy-loaded
export const routes = {
  '/symptoms': () => import('@core/symptom/SymptomPage'),
  '/appointments': () => import('@plugin/scheduling/AppointmentPage'),
  '/consultation': () => import('@core/consultation/ConsultationPage')
};
```

**Conditional Module Loading:**
```typescript
// Build-time conditional imports based on client config
import type { ClientConfig } from '@shared/types';

export async function loadClientModules(config: ClientConfig) {
  const modules = await Promise.all([
    // Always load core modules
    import('@core/auth'),
    import('@core/symptom'),
    
    // Conditionally load plugins
    ...(config.features.scheduling ? [import('@plugin/scheduling')] : []),
    ...(config.features.payments ? [import('@plugin/payments')] : []),
    
    // Load client-specific overrides
    import(`@client/${config.clientId}`)
  ]);
  
  return modules;
}
```

#### Component Discovery

**Component Registration:**
```typescript
// Each module exports its components
// modules/core/auth/src/index.ts
export { default as LoginForm } from './components/LoginForm.svelte';
export { default as UserProfile } from './components/UserProfile.svelte';
export { authStore } from './stores/auth.store.ts';
```

**Standard Module Imports:**
```typescript
// Standard ES module imports work directly with workspace packages
import { DashboardPage } from '@core/data-management';
import { ReportsPage } from '@plugin/reporting';
import { LoginForm, authStore } from '@core/auth';

// No special auto-import configuration needed
```

#### Build-Time Integration

**Module Bundling Process:**
1. **Discovery Phase**: Scan enabled modules from client configuration
2. **Route Generation**: Create route files in main app from module definitions  
3. **Component Aggregation**: Bundle components from selected modules
4. **Asset Optimization**: Tree-shake unused code and optimize assets
5. **Client Customization**: Apply client-specific overrides and themes

**Simplified Build Process:**
```bash
# Build process with standard tools only
pnpm build --client=client-a --env=prod

# Build steps:
# 1. Copy src/ to build/client-a/prod/src/
# 2. Update package.json with only client's purchased modules
# 3. Run standard Vite build process
# 4. Package artifacts → create .tar.gz for delivery
```

**Simplified Build Script with Module Override System:**
```typescript
// Build script that handles structured module overrides
export async function buildClientApp(clientId: string, env: string) {
  // 1. Load client configuration
  const clientConfigPath = `clients/${clientId}/config.json`;
  const clientConfig = await fs.readJSON(clientConfigPath);
  
  const sourcePath = './';  // Root project with src/, package.json, etc
  const outputPath = `build/${clientId}/${env}/`;
  
  // 2. Copy entire project directory
  await fs.copy(sourcePath, outputPath);
  
  // 3. Update package.json dependencies
  const packageJsonPath = path.join(outputPath, 'package.json');
  const packageJson = await fs.readJSON(packageJsonPath);
  
  // Only include dependencies for enabled modules
  const enabledDeps = {};
  for (const moduleId of clientConfig.modules) {
    enabledDeps[moduleId] = 'workspace:*';
  }
  
  packageJson.dependencies = {
    ...packageJson.dependencies,
    ...enabledDeps
  };
  
  // Embed client config
  packageJson.clientConfig = clientConfig;
  await fs.writeJSON(packageJsonPath, packageJson, { spaces: 2 });
  
  // 4. Apply module-specific overrides
  await applyModuleOverrides(clientId, clientConfig.modules, outputPath);
  
  // 5. Apply shared overrides
  await applySharedOverrides(clientId, outputPath);
  
  // 6. Run standard Vite build
  execSync('pnpm build', { cwd: outputPath });
  
  // 7. Package if requested
  if (process.env.PACKAGE === 'true') {
    await createPackage(outputPath, clientConfig);
  }
}

async function applyModuleOverrides(
  clientId: string, 
  enabledModules: string[], 
  outputPath: string
) {
  for (const moduleId of enabledModules) {
    // Parse module ID to get type and name
    // e.g., "@core/auth" -> type: "core", name: "auth"
    const [, moduleType, moduleName] = moduleId.match(/@(core|plugin)\/(.+)/) || [];
    if (!moduleType || !moduleName) continue;
    
    const clientOverridePath = `clients/${clientId}/${moduleType}/${moduleName}/`;
    if (!(await fs.pathExists(clientOverridePath))) continue;
    
    console.log(`Applying ${clientId} overrides for ${moduleId}`);
    
    // Apply message overrides
    const messageOverridePath = path.join(clientOverridePath, 'messages/');
    if (await fs.pathExists(messageOverridePath)) {
      const outputMessagePath = path.join(outputPath, `messages/${moduleType}-${moduleName}/`);
      await fs.copy(messageOverridePath, outputMessagePath);
    }
    
    // Apply theme overrides
    const themeOverridePath = path.join(clientOverridePath, 'theme/');
    if (await fs.pathExists(themeOverridePath)) {
      const outputThemePath = path.join(outputPath, `src/lib/theme/${moduleType}-${moduleName}/`);
      await fs.copy(themeOverridePath, outputThemePath);
    }
    
    // Apply asset overrides
    const assetOverridePath = path.join(clientOverridePath, 'assets/');
    if (await fs.pathExists(assetOverridePath)) {
      const outputAssetPath = path.join(outputPath, `src/lib/assets/${moduleType}-${moduleName}/`);
      await fs.copy(assetOverridePath, outputAssetPath);
    }
  }
}

async function applySharedOverrides(clientId: string, outputPath: string) {
  const sharedOverridePath = `clients/${clientId}/shared/`;
  if (!(await fs.pathExists(sharedOverridePath))) return;
  
  console.log(`Applying ${clientId} shared overrides`);
  
  // Apply shared design token overrides
  const designTokensPath = path.join(sharedOverridePath, 'design-tokens/');
  if (await fs.pathExists(designTokensPath)) {
    const outputTokensPath = path.join(outputPath, 'src/lib/theme/shared/');
    await fs.copy(designTokensPath, outputTokensPath);
  }
}

```

**Client Build Directory Structure:**
```
build/
├── client-a/                    # Client A builds
│   ├── dev/                     # Copy of project with client-a package.json
│   │   ├── src/                 # Standard Svelte + Vite src/
│   │   ├── public/              # Static assets
│   │   ├── package.json         # Only includes @core/auth, @plugin/reporting
│   │   ├── vite.config.js       # Vite configuration
│   │   └── messages/            # Aggregated i18n messages
│   ├── stag/                 # Staging environment
│   └── prod/              # Production environment
│       ├── src/                 # Standard Svelte + Vite src/
│       ├── package.json         # Production dependencies
│       ├── build/                # Standard Vite build output  
│       │   ├── assets/          # Compiled JS/CSS
│       │   ├── images/          # Optimized images
│       │   └── index.html       # Entry HTML file
│       └── artifacts/           # Packaged deliverables
│           └── client-a-prod-v1.2.3.tar.gz
└── client-b/                    # Client B builds
    ├── dev/
    │   ├── package.json         # Only includes @core/auth, @plugin/payments
    │   └── ...
    ├── stag/
    └── prod/
```

**Build Isolation Benefits:**
- **Complete Separation**: Each client's build is completely isolated
- **Concurrent Builds**: Multiple clients can be built simultaneously
- **Version Management**: Each client maintains separate versioned artifacts
- **Environment Parity**: Dev/stag/prod builds per client
- **Deployment Ready**: Artifacts ready for both hosted and self-hosted deployment

**Enhanced Build Commands:**
```bash
# Development mode for specific client
pnpm dev --client=client-a --env=dev
# Output: build/client-a/dev/ (live reload, source maps)

# Build all environments for a client
pnpm build --client=client-a --all-envs
# Output: build/client-a/{dev,stag,prod}/

# Build multiple clients
pnpm build --clients=client-a,client-b --env=prod
# Output: build/{client-a,client-b}/prod/

# Build with packaging (staging)
pnpm build --client=client-a --env=stag --package
# Output: build/client-a/stag/artifacts/client-a-stag-v1.2.3.tar.gz

# Build with packaging (production)
pnpm build --client=client-a --env=prod --package
# Output: build/client-a/prod/artifacts/client-a-prod-v1.2.3.tar.gz

# Clean client builds
pnpm clean --client=client-a --env=stag
# Removes: build/client-a/stag/
```

**Integration Considerations:**

- **Paraglide**: Standard i18n setup, messages aggregated from enabled modules only
- **Svelte + Vite**: Standard build process with client-side routing, no custom generation
- **Design Tokens**: CSS imported from enabled modules through standard imports
- **TypeScript**: Standard type checking, modules provide their own types
- **Testing**: Standard testing setup per client build
- **Static Analysis**: Standard linting and formatting
- **Deployment**: Each build directory is standard Vite static site output

This simplified approach ensures that:
- ✅ **Standard Tooling**: Uses only standard Svelte/Vite/pnpm tools
- ✅ **Standard Imports**: Modules imported like any npm package
- ✅ **Standard Build**: No custom build logic, just standard Vite build
- ✅ **Tree Shaking**: Unused modules automatically excluded via package.json
- ✅ **Familiar Development**: Standard Svelte development experience
- ✅ **Easy Maintenance**: No complex custom build system to maintain

### Styling System

#### CSS Architecture
- **No Inline Styles**: All styling must be in dedicated CSS files or Svelte component style blocks
- **Design Token System**: CSS custom properties define styling contracts
  - Example tokens: `--color-primary`, `--radius-md`, `--font-family-body`
- **Component Styles**: Component-specific styles in Svelte `<style>` blocks
- **Theme Inheritance**: Client themes override default tokens with fallback behavior

#### Theme Management
- **Build-Time Theming**: One theme per build (no runtime theme switching)
- **Client Overrides**: Clients can override tokens, themes, and fonts in their modules
- **Default Fallback**: Unspecified overrides fall back to default theme values

### Internationalization (i18n)

#### Language Support
- **Framework**: Paraglide i18n library
- **Supported Languages**: English (en) and Thai (th)
- **Default Language**: English

#### Route Structure
- `/en` - English content
- `/th` - Thai content  
- `/` - Default route (redirects to English)

#### Language Detection
- **Fallback**: Default to client-configured language if webview doesn't specify
- **URL-Based**: Webview can manually navigate to specific language routes

### Build System

#### Module Resolution
- **Build-Time Resolution**: All imports resolved during build process
- **Tree Shaking**: Unused code automatically removed to prevent feature leakage
- **Client-Specific Builds**: Each client gets a unique build with only their selected modules

#### Build Configuration
- **Client Selection**: Build command allows choosing specific client and environment
- **Module Selection**: Configurable at build time based on client's purchased modules
- **Environment Configs**: Separate `.env` files for dev/stag/prod per client plus shared configs (override by client env)

#### Output Artifacts
- **Compilation**: Source code compiled and minified
- **Packaging**: Optional `.tar.gz` packaging for delivery
- **Static Assets**: Optimized for static hosting and webview deployment

### Versioning Strategy

#### Dual Version System
- **Technical Version**: Integer starting from 1, incrementing sequentially
- **Marketing Version**: Semantic versioning (major.minor.patch)
- **Purpose**: Technical version for internal tracking, marketing version for client communication

### Deployment Models

#### Hosted Solution
- **Provider**: We deploy and maintain the infrastructure
- **Client Identification**: Subdomain routing (e.g., `client-a.platform.app`, `client-b.platform.app`)
- **Build Source**: Deploy from `build/{client-id}/prod/dist/`
- **Automation**: Automated deployment from client-specific build artifacts
- **Benefits**: Full service management, automatic updates, centralized monitoring

#### Self-Hosted Solution
- **Delivery**: Client-specific static build artifacts provided as `.tar.gz`
- **Artifact Location**: 
  - Staging: `build/{client-id}/stag/artifacts/{client-id}-stag-v{version}.tar.gz`
  - Production: `build/{client-id}/prod/artifacts/{client-id}-prod-v{version}.tar.gz`
- **Client Responsibility**: Deployment and hosting infrastructure
- **Backend Connection**: Still connects to our backend services for core functionality
- **Benefits**: Full control over hosting environment, data locality compliance

#### Deployment Workflow Examples:

**Hosted Deployment:**
```bash
# Build and deploy to hosted environment
pnpm build --client=client-a --env=prod
pnpm deploy --client=client-a --target=hosted
# Deploys build/client-a/prod/dist/ to client-a.platform.app
```

**Self-Hosted Delivery:**
```bash
# Build and package for staging environment
pnpm build --client=client-a --env=stag --package
# Creates build/client-a/stag/artifacts/client-a-stag-v1.2.3.tar.gz

# Build and package for production environment
pnpm build --client=client-a --env=prod --package
# Creates build/client-a/prod/artifacts/client-a-prod-v1.2.3.tar.gz

# Client extracts and deploys to their infrastructure
```

**Multi-Client Deployment:**
```bash
# Deploy multiple clients to hosted environment
pnpm build --clients=client-a,client-b --env=prod
pnpm deploy --clients=client-a,client-b --target=hosted
# Deploys build/client-a/prod/dist/ and build/client-b/prod/dist/ to client-a.platform.app and client-b.platform.app
```

## Development Workflow

### Client-Separated Build Process
1. **Client Selection**: Choose target client and environment
2. **Build Directory Setup**: Create isolated build directory in `build/{client-id}/{env}/`
3. **Module Resolution**: Resolve dependencies based on client configuration
4. **i18n Aggregation**: Compile module messages for Paraglide
5. **Route Registration**: Register client-side routes with language support
6. **Theme Compilation**: Apply client-specific design tokens and theming
7. **Code Optimization**: Tree-shake and bundle only required modules
8. **Static Asset Generation**: Generate optimized assets for target deployment
9. **Artifact Packaging**: Create deployment-ready packages (if requested)

### Development Commands
```bash
# Start development server for specific client
pnpm dev --client=client-a --env=dev
# Output: build/client-a/dev/ with live reload

# Start development server for different environment
pnpm dev --client=client-a --env=stag
# Output: build/client-a/stag/ preview mode

# Preview production build locally
pnpm preview --client=client-a --env=prod
# Serves build/client-a/prod/dist/ locally

# Run all development tasks for client
pnpm start --client=client-a --env=dev
# Equivalent to pnpm dev --client=client-a --env=dev

# Test client build
pnpm test --client=client-a --env=stag
# Runs tests against build/client-a/stag/

# Run tests in development environment
pnpm test --client=client-a --env=dev
# Runs tests with source maps and debugging

# Lint client build
pnpm lint --client=client-a --env=dev
# Lints generated code in build/client-a/dev/

# Type check client build  
pnpm type-check --client=client-a --env=dev
# Checks types in client-specific build

# Format code for specific client
pnpm format --client=client-a --env=dev
# Formats code in build/client-a/dev/
```

### Quality Assurance
- **Type Safety**: TypeScript integration with client-specific type checking
- **Testing**: Tests run against client builds with their specific module combinations
- **Performance**: Bundle analysis per client to ensure optimal sizes
- **i18n Validation**: Message completeness checks per client and language
- **Theme Validation**: Design token validation per client theme

### Configuration Management
- **Client Configs**: `clients/{client-id}/config.json` with module selections and branding
- **Module Overrides**: Structured by module path `clients/{client-id}/{module-type}/{module-name}/`
  - **Theme Overrides**: `clients/{client-id}/core/auth/theme/` overrides `@core/auth` theme
  - **Message Overrides**: `clients/{client-id}/plugins/scheduling/messages/` overrides scheduling i18n
  - **Asset Overrides**: `clients/{client-id}/core/auth/assets/` overrides auth module assets
- **Shared Overrides**: `clients/{client-id}/shared/design-tokens/` for global theme changes
- **Build Configs**: Dynamic configuration loaded from structured client directory

### Multi-Client Development
```bash
# Compare builds between clients
pnpm compare --clients=client-a,client-b --metric=bundle-size

# Update multiple clients
pnpm build --clients=client-a,client-b --env=stag

# Sync shared dependencies across clients
pnpm sync-deps --all-clients --env=dev

# Sync dependencies for specific client
pnpm sync-deps --client=client-a --env=dev
```

**Example Package.json Scripts:**
```json
{
  "scripts": {
    "dev": "node tools/scripts/dev.js",
    "build": "node tools/scripts/build.js", 
    "test": "node tools/scripts/test.js",
    "lint": "node tools/scripts/lint.js",
    "type-check": "node tools/scripts/type-check.js",
    "preview": "node tools/scripts/preview.js",
    "start": "node tools/scripts/dev.js",
    "format": "node tools/scripts/format.js",
    "clean": "node tools/scripts/clean.js",
    "sync-deps": "node tools/scripts/sync-deps.js",
    "compare": "node tools/scripts/compare.js",
    "deploy": "node tools/scripts/deploy.js"
  }
}
```

**Script Implementation Example:**
```javascript
// tools/scripts/dev.js
const { execSync } = require('child_process');
const args = process.argv.slice(2);
const clientArg = args.find(arg => arg.startsWith('--client='));
const envArg = args.find(arg => arg.startsWith('--env=')) || '--env=dev';

if (!clientArg) {
  console.error('Error: --client is required');
  process.exit(1);
}

const client = clientArg.split('=')[1];
const env = envArg.split('=')[1];

// 1. Generate client build
execSync(`node tools/build/generateClientBuild.js ${client} ${env}`, { stdio: 'inherit' });

// 2. Run vite dev on generated build
execSync(`vite --config build/${client}/vite.config.js`, { 
  cwd: `build/${client}`, 
  stdio: 'inherit' 
});
```