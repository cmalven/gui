import path from 'path';
import { defineConfig } from 'vite';

module.exports = defineConfig({
  build: {
    lib: {
      entry: path.resolve(__dirname, 'src/gui.ts'),
      name: 'Gui',
      fileName: (format) => `gui.${format}.js`,
    },
  },
});