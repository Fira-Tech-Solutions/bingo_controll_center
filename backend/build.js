const esbuild = require('esbuild');
const path = require('path');
const fs = require('fs');

async function build() {
  const outdir = path.join(__dirname, '.vercel');
  fs.mkdirSync(outdir, { recursive: true });

  await esbuild.build({
    entryPoints: [path.join(__dirname, 'api/index.js')],
    bundle: true,
    platform: 'node',
    target: 'node20',
    outfile: path.join(outdir, 'index.js'),
    external: ['pg', 'pg-hstore'],
    minify: false,
    sourcemap: false,
  });

  fs.copyFileSync(
    path.join(__dirname, 'package.json'),
    path.join(outdir, 'package.json'),
  );

  console.log('Build complete: .vercel/index.js');
}

build().catch((e) => { console.error(e); process.exit(1); });
