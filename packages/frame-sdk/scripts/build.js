const esbuild = require('esbuild')

esbuild.buildSync({
  entryPoints: ['src/index.ts'],
  bundle: true,
  minify: true,
  sourcemap: true,
  format: 'iife',
  globalName: 'frame', 
  outfile: 'dist/index.umd.js'
})
