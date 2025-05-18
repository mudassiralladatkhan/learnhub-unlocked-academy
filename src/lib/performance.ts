/**
 * Performance optimization utilities
 * 
 * This file provides functions to optimize the app's performance
 * by adjusting resource loading, rendering, and other performance aspects.
 */

import { isLightweightMode } from './lightweight';

/**
 * Apply performance optimizations to the application
 */
export function applyPerformanceOptimizations(): void {
  if (typeof window === 'undefined') return;
  
  // Check if we should skip optimizations on auth-related pages
  const isAuthRelatedPage = window.location.pathname.includes('/login') || 
    window.location.pathname.includes('/register') || 
    window.location.pathname.includes('/auth');
  
  // Skip optimizations on auth pages to prevent issues
  if (isAuthRelatedPage) {
    console.log('Skipping performance optimizations on auth page');
    return;
  }
  
  // Disable unnecessary animations in lightweight mode
  if (isLightweightMode()) {
    document.documentElement.classList.add('lightweight-mode');
    
    // Reduce animation complexity
    const style = document.createElement('style');
    style.textContent = `
      .lightweight-mode * {
        transition-duration: 0ms !important;
        animation-duration: 0ms !important;
      }
      .lightweight-mode .complex-animation {
        display: none !important;
      }
    `;
    document.head.appendChild(style);
  }
  
  // Optimize image loading - but don't modify existing images
  // This avoids the blinking issue with course images
  document.querySelectorAll('img:not([loading])').forEach(img => {
    // Only set loading=lazy on images that don't already have it
    // Use proper typecast for HTMLImageElement
    (img as HTMLImageElement).loading = 'lazy';
  });
  
  // Don't modify image sources as it can cause blinking/loading issues
  
  // Apply less aggressive optimizations
  if (isLightweightMode()) {
    // Set flags but don't interfere with critical functionality
    window.__LESS_FREQUENT_UPDATES = true;
  }
}

/**
 * Initialize performance monitoring
 */
export function initPerformanceMonitoring(): void {
  if (typeof window === 'undefined' || !window.performance || isLightweightMode()) return;
  
  // Basic performance monitoring
  const reportPerformance = () => {
    if (window.performance && window.performance.timing) {
      const timing = window.performance.timing;
      const navigationStart = timing.navigationStart;
      
      console.log('Performance metrics:');
      console.log(`- Page load time: ${timing.loadEventEnd - navigationStart}ms`);
      console.log(`- DOM content loaded: ${timing.domContentLoadedEventEnd - navigationStart}ms`);
      console.log(`- First paint: ${window.performance.getEntriesByType('paint')[0]?.startTime || 'unknown'}ms`);
    }
  };
  
  window.addEventListener('load', reportPerformance);
}

declare global {
  interface Window {
    __LESS_FREQUENT_UPDATES?: boolean;
    __REDUCE_EVENT_LISTENERS?: boolean;
  }
}

/**
 * Debounce function executions for better performance
 * Used for frequent events like scroll, resize, etc.
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number = isLightweightMode() ? 150 : 50
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  
  return function(...args: Parameters<T>) {
    if (timeout) {
      clearTimeout(timeout);
    }
    
    timeout = setTimeout(() => {
      func(...args);
    }, wait);
  };
}
