# Client A Assets

This directory contains client-specific assets for Acme Corporation.

## Directory Structure

```
src/lib/assets/
├── images/
│   ├── logo.svg          # Main logo
│   ├── logo-dark.svg     # Dark mode logo
│   ├── banner.jpg        # Hero banner image
│   └── favicon.ico       # Favicon
├── icons/
│   ├── app-icon-192.png  # App icon (192x192)
│   ├── app-icon-512.png  # App icon (512x512)
│   └── manifest.json     # Web app manifest
└── README.md
```

## Usage

Assets can be referenced in the application using the client asset path utility:

```typescript
import { getClientAssetPath } from '@clients/client-a';

const logoPath = getClientAssetPath('images/logo.svg');
// Returns: /clients/client-a/src/lib/assets/images/logo.svg
```

## Asset Guidelines

### Logo
- Format: SVG preferred, PNG acceptable
- Size: Scalable (SVG) or minimum 300x100px (PNG)
- Background: Transparent
- Colors: Should work on both light and dark backgrounds

### Icons
- Format: PNG or ICO
- Sizes: 16x16, 32x32, 192x192, 512x512
- Style: Consistent with brand guidelines

### Images
- Format: WebP preferred, JPEG/PNG acceptable
- Optimization: Compressed for web delivery
- Responsive: Provide multiple sizes if needed

## Brand Colors

Use these colors consistently across assets:
- Primary: #3b82f6
- Secondary: #6b7280
- Accent: #10b981
