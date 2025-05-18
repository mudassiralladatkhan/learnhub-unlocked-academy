# LearnHub Lightweight Mode

This document explains the lightweight mode implemented in LearnHub to improve performance on lower-end devices.

## Overview

LearnHub's lightweight mode reduces resource usage and improves performance by:

1. Disabling or simplifying animations and transitions
2. Reducing rendering complexity
3. Optimizing JavaScript execution
4. Minimizing reflows and repaints
5. Optimizing bundle size and code splitting

## How to Run in Lightweight Mode

### Method 1: Using the Lightweight Script

Run the application in lightweight mode using the dedicated script:

```bash
node scripts/run-lightweight.js
```

### Method 2: Using NPM Script

Alternatively, use the npm script directly:

```bash
npm run dev:light
```

## Technical Implementation

The lightweight mode is implemented through several key components:

1. **Vite Configuration**: Optimized build settings and conditional plugin loading
2. **Lightweight Context**: React context to manage and expose lightweight mode settings
3. **Performance Optimizations**: Runtime optimizations for rendering and JavaScript execution
4. **CSS Optimizations**: Simplified CSS with reduced visual complexity
5. **Component Conditionals**: Components can render simpler versions when in lightweight mode

## Development Guidelines

When developing features for LearnHub, keep these guidelines in mind to maintain lightweight mode compatibility:

1. Use the `useLightweight()` hook to check if lightweight mode is active:
   ```typescript
   import { useLightweight } from '@/contexts/LightweightContext';
   
   function MyComponent() {
     const { isLightweight, features } = useLightweight();
     
     // Conditionally render based on mode
     if (isLightweight) {
       return <SimplifiedVersion />;
     }
     
     return <FullFeaturedVersion />;
   }
   ```

2. Use the `withLightweight()` HOC for components that need lightweight alternatives:
   ```typescript
   import { withLightweight } from '@/lib/lightweight';
   
   const MyComponent = withLightweight(FullComponent, LightComponent);
   ```

3. Check specific feature flags:
   ```typescript
   if (features.animations) {
     // Implement animations
   }
   ```

## Performance Monitoring

Performance metrics are automatically collected when not in lightweight mode. To view them, check the browser console output after the application has loaded.
