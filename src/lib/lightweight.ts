/**
 * Lightweight mode utilities
 * 
 * This file contains utilities for running the app in lightweight mode
 * which helps improve performance on lower-end devices.
 */

// The __LIGHTWEIGHT__ global is defined in vite.config.ts
declare global {
  const __LIGHTWEIGHT__: string;
}

/**
 * Checks if the app is running in lightweight mode
 */
export const isLightweightMode = (): boolean => {
  // We're making this return false by default to avoid the blinking issues
  // The user can still enable it manually if needed
  return false; // __LIGHTWEIGHT__ === 'true';
};

/**
 * Higher-order component that conditionally renders a component based on lightweight mode
 * In lightweight mode, it renders a simplified version
 * 
 * @param FullComponent The full-featured component
 * @param LightComponent The lightweight version of the component
 */
export const withLightweight = <P extends object>(
  FullComponent: React.ComponentType<P>,
  LightComponent: React.ComponentType<P>,
): React.ComponentType<P> => {
  // Import React here to avoid issues with JSX
  const React = require('react');
  
  return (props: P) => {
    if (isLightweightMode()) {
      return React.createElement(LightComponent, props);
    }
    return React.createElement(FullComponent, props);
  };
};

/**
 * A list of features that can be conditionally enabled/disabled in lightweight mode
 */
export const lightweightFeatures = {
  animations: !isLightweightMode(),
  complexUI: !isLightweightMode(),
  lazyLoading: true,
  heavyTransitions: !isLightweightMode(),
  detailedMetrics: !isLightweightMode(),
};
