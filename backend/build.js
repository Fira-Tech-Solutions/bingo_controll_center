const esbuild = require('esbuild');
const path = require('path');

async function build() {
  await esbuild.build({
    entryPoints: [path.join(__dirname, 'api/index.js')],
    bundle: true,
    platform: 'node',
    target: 'node20',
    outfile: path.join(__dirname, 'dist/api/index.js'),
    external: ['pg', 'pg-hstore'],
    minify: false,
    sourcemap: false,
  });
  console.log('Build complete: dist/api/index.js');
}

build().catch((e) => { console.error(e); process.exit(1); });
