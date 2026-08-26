const path = require('path');
const esbuild = require('esbuild');

const entry = path.join(__dirname, 'agentation-dev.jsx');
const outfile = path.join(__dirname, '..', 'agentation-dev.js');

(async () => {
  await esbuild.build({
    entryPoints: [entry],
    outfile,
    bundle: true,
    format: 'esm',
    minify: true,
    sourcemap: false,
    define: {
      'process.env.NODE_ENV': '"production"',
    },
    logLevel: 'silent',
  });
  console.log(`Built ${outfile}`);
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
