import babel from '@rolldown/plugin-babel'
import tailwindcss from '@tailwindcss/vite'
import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), babel({ presets: [reactCompilerPreset()] }), tailwindcss()],
  server: { port: 5190 },
  build: {
    rolldownOptions: {
      output: {
        codeSplitting: {
          groups: [
            { name: 'react', test: /node_modules[\\/](react|react-dom|scheduler)[\\/]/ },
            { name: 'motion', test: /node_modules[\\/](motion|motion-dom|motion-utils|framer-motion)[\\/]/ },
            { name: 'ui', test: /node_modules[\\/](radix-ui|@radix-ui|cmdk|sonner|@floating-ui)[\\/]/ },
            { name: 'charts', test: /node_modules[\\/](d3-[a-z-]+|internmap|number-flow|@number-flow)[\\/]/ },
            { name: 'brands', test: /node_modules[\\/](simple-icons|lucide-react)[\\/]/ },
          ],
        },
      },
    },
  },
})
