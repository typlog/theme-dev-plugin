# theme-dev-plugin

A vite plugin for Typlog theme development.


```js
import { defineConfig } from "vite"
import tailwind from "@tailwindcss/vite"
import { themeDevServer } from "@typlog/theme-dev-plugin/vite"

export default defineConfig({
  plugins: [
    tailwind(),
    themeDevServer(),
  ],
  build: {
    minify: true,
    cssCodeSplit: true,
    outDir: 'static',
    lib: {
      entry: [
        'src/index.js',
        'src/index.css',
        'src/content.css',
        'src/page.css',
      ],
      formats: ['es'],
      fileName: (_, name) => `${name}.js`,
    }
  }
})
```
