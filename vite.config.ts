import { defineConfig, UserConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const isLightweight = mode === 'lightweight';
  const isDevelopment = mode === 'development';
  
  const config: UserConfig = {
    server: {
      host: "::",
      port: 8080,
      hmr: {
        overlay: false // Disable the error overlay for better performance
      },
      watch: {
        usePolling: false, // Disable polling for file changes
      }
    },
    plugins: [
      react(),
    ],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    // Enable dependency optimization
    optimizeDeps: {
      include: ['react', 'react-dom'],
      exclude: [],
    },
    // Reduce build size
    build: {
      target: 'esnext',
      minify: true,
      cssMinify: true,
      sourcemap: isDevelopment,
      // Chunk splitting for better caching
      rollupOptions: {
        output: {
          manualChunks: {
            'vendor': ['react', 'react-dom'],
            'ui': [
              '@radix-ui/react-dialog',
              '@radix-ui/react-dropdown-menu',
              '@radix-ui/react-navigation-menu'
            ]
          }
        }
      }
    },
    // Only include what's needed based on mode
    define: {
      __LIGHTWEIGHT__: isLightweight ? 'true' : 'false',
    }
  };

  // Only add componentTagger in full development mode (not lightweight)
  if (isDevelopment && !isLightweight) {
    config.plugins?.push(componentTagger());
  }

  return config;
});

