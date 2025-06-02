import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
// @ts-expect-error - vite-plugin-eslint types issue
import eslint from 'vite-plugin-eslint'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    eslint({
      failOnError: process.env.NODE_ENV === 'production', // Fail on errors in production
      failOnWarning: false,
      cache: false,
      include: ['src/**/*.js', 'src/**/*.jsx', 'src/**/*.ts', 'src/**/*.tsx'],
      exclude: ['node_modules', 'dist', 'build'],
      lintOnStart: true, // Lint on startup
      emitWarning: true,
      emitError: true,
    })
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 5173,
    host: true,
    strictPort: true,
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          // React core
          'react-vendor': ['react', 'react-dom'],

          // Radix UI components (largest dependency group)
          'radix-ui': [
            '@radix-ui/react-accordion',
            '@radix-ui/react-alert-dialog',
            '@radix-ui/react-aspect-ratio',
            '@radix-ui/react-avatar',
            '@radix-ui/react-checkbox',
            '@radix-ui/react-collapsible',
            '@radix-ui/react-context-menu',
            '@radix-ui/react-dialog',
            '@radix-ui/react-dropdown-menu',
            '@radix-ui/react-hover-card',
            '@radix-ui/react-label',
            '@radix-ui/react-menubar',
            '@radix-ui/react-navigation-menu',
            '@radix-ui/react-popover',
            '@radix-ui/react-progress',
            '@radix-ui/react-radio-group',
            '@radix-ui/react-scroll-area',
            '@radix-ui/react-select',
            '@radix-ui/react-separator',
            '@radix-ui/react-slider',
            '@radix-ui/react-slot',
            '@radix-ui/react-switch',
            '@radix-ui/react-tabs',
            '@radix-ui/react-toggle',
            '@radix-ui/react-toggle-group',
            '@radix-ui/react-tooltip'
          ],

          // Utility libraries
          'utils': [
            'clsx',
            'class-variance-authority',
            'tailwind-merge',
            'tailwindcss-animate',
            'lucide-react'
          ],

          // Form and validation
          'forms': [
            'react-hook-form',
            '@hookform/resolvers',
            'zod'
          ],

          // Data visualization and UI components
          'ui-libs': [
            'recharts',
            'embla-carousel-react',
            'react-beautiful-dnd',
            'react-resizable-panels',
            'cmdk',
            'vaul',
            'sonner'
          ],

          // Date and time
          'date-utils': ['date-fns', 'dayjs', 'react-day-picker'],

          // Markdown and content
          'content': ['react-markdown', 'remark-gfm'],

          // Routing
          'router': ['react-router-dom'],

          // State management and themes
          'state': ['zustand', 'next-themes'],

          // API and networking
          'api': ['axios', '@upstash/redis', 'cloudinary'],

          // Other utilities
          'misc': [
            'nanoid',
            'jsonwebtoken',
            'bcryptjs',
            'cookie',
            'input-otp',
            'terminal-link',
            'update-notifier'
          ]
        }
      }
    },
    chunkSizeWarningLimit: 1000, // Increase warning limit to 1MB
    target: 'esnext',
    minify: 'esbuild',
  },
  define: {
    global: 'globalThis',
  },
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      'zustand',
      'axios',
      'clsx',
      'tailwind-merge',
      'lucide-react'
    ]
  },
})