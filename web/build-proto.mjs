// Prototip yig'ilmasi: esbuild bilan to'plam, Three.js sahnasi alohida bo'lak (kechiktirib yuklanadi).
import { build } from 'esbuild';
import { rmSync, mkdirSync, cpSync, writeFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { page } from './proto/page.mjs';

const OUT = process.env.PROTO_OUT || 'dist-proto';
rmSync(OUT, { recursive: true, force: true });
mkdirSync(join(OUT, 'fonts'), { recursive: true });

const res = await build({
  entryPoints: { main: 'proto/main.js' },
  bundle: true, format: 'esm', splitting: true, minify: true, target: 'es2020',
  outdir: join(OUT, 'js'), entryNames: '[name].[hash]', chunkNames: '[name].[hash]', metafile: true, legalComments: 'none',
});
const main = Object.keys(res.metafile.outputs).find((f) => /js\/main\.[^/]+\.js$/.test(f)).split('/').pop();

// CSS
const css = await build({
  entryPoints: { proto: 'proto/proto.css' }, bundle: true, minify: true, outdir: join(OUT, 'css'), entryNames: '[name].[hash]',
  external: ['*.woff2'], write: true, metafile: true,
});
const cssFile = Object.keys(css.metafile.outputs).find((f) => f.endsWith('.css')).split('/').pop();

for (const f of readdirSync('src/fonts')) if (f.endsWith('.woff2')) cpSync(join('src/fonts', f), join(OUT, 'fonts', f));
// CSS fonts/ yo'li nisbiy: css/ papkasidan ../fonts
const html = page({ css: `css/${cssFile}`, js: `js/${main}` });
writeFileSync(join(OUT, 'index.html'), html);
writeFileSync(join(OUT, 'artifact.html'), page({ css: `css/${cssFile}`, js: `js/${main}`, fragment: true }));

// CSS ichidagi font yo'llarini to'g'rilash
import { readFileSync } from 'node:fs';
const cp = join(OUT, 'css', cssFile);
writeFileSync(cp, readFileSync(cp, 'utf8').replaceAll('url(fonts/', 'url(../fonts/'));

for (const [f, o] of Object.entries(res.metafile.outputs)) console.log((o.bytes / 1024).toFixed(1).padStart(8), 'KB', f);
