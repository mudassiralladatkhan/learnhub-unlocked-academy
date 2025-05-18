import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import './lightweight.css';
import { applyPerformanceOptimizations, initPerformanceMonitoring } from './lib/performance';
import { isLightweightMode } from './lib/lightweight';

// Apply performance optimizations before rendering
applyPerformanceOptimizations();

const root = createRoot(document.getElementById("root")!);

// Use a lightweight rendering approach
root.render(<App />);

// Initialize performance monitoring after render
initPerformanceMonitoring();
