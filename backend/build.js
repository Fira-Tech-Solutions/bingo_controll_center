const esbuild = require('esbuild');
const path = require('path');

async function build() {
  await esbuild.build({
    entryPoints: [path.join(__dirname, 'api', '_index.js')],
    bundle: true,
    platform: 'node',
    target: 'node20',
    outfile: path.join(__dirname, 'api', 'index.js'),
    minify: false,
    sourcemap: false,
  });
  console.log('Build complete: api/index.js (bundled)');
}

build().catch((e) => { console.error(e); process.exit(1); });
