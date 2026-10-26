import { defineConfig } from 'vite';
import { resolve } from 'node:path';
export default defineConfig({
  base: './',
  build: {
    rollupOptions: {
      input: {
        character:resolve(import.meta.dirname,'index.html'),
        dance:resolve(import.meta.dirname,'dance.html')
      }
    },
    target:'es2020',
    cssMinify:true
  }
});
