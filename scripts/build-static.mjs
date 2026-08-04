import { cpSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = process.cwd();
const source = resolve(root, 'public/index.html');
const output = resolve(root, 'dist');

if (!existsSync(source)) throw new Error('Missing public/index.html');

let html = readFileSync(source, 'utf8');

html = html
  // Remove framework-managed styles, preloads, scripts, and transport metadata.
  .replace(/<link\b[^>]*\/_next\/[^>]*>/gi, '')
  .replace(/<link\b[^>]*rel=["'](?:preload|expect)["'][^>]*>/gi, '')
  .replace(/<script\b(?![^>]*type=["']application\/ld\+json["'])[^>]*>[\s\S]*?<\/script>/gi, '')
  .replace(/\sdata-precedence=["'][^"']*["']/gi, '')
  .replace(/\scrossorigin(?:=["'][^"']*["'])?/gi, '')
  // Remove residual raw or escaped Next.js asset URLs from attributes,
  // serialized values, image references, and CSS declarations.
  .replace(/\/_next\/[^"'\s<>)]+/gi, '')
  .replace(/\\\/_next\\\/[^"'\s<>)]+/gi, '');

const baselineCss = `
<style id="record-lock-static-baseline">
:root{color-scheme:dark;--bg:#090b10;--panel:#11151d;--line:#2a3342;--text:#f3f5f7;--muted:#aeb7c4;--accent:#d8b46a}*{box-sizing:border-box}html{scroll-behavior:smooth}body{margin:0;background:var(--bg);color:var(--text);font:16px/1.6 system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}a{color:var(--accent)}img,svg,video{max-width:100%;height:auto}header,main,footer,section,article,nav{display:block}main{width:min(1180px,calc(100% - 32px));margin:0 auto;padding:32px 0 72px}header{border-bottom:1px solid var(--line);background:#0c1017}header>*{width:min(1180px,calc(100% - 32px));margin-inline:auto}section,article{background:var(--panel);border:1px solid var(--line);border-radius:14px;padding:clamp(18px,3vw,34px);margin:0 0 24px}h1,h2,h3{line-height:1.18;margin-top:0}h1{font-size:clamp(2rem,5vw,4rem)}h2{font-size:clamp(1.4rem,3vw,2.25rem)}p,li{color:var(--muted)}button,input,select,textarea{font:inherit}table{width:100%;border-collapse:collapse;display:block;overflow:auto}th,td{border:1px solid var(--line);padding:10px;text-align:left}.sr-only{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0}
</style>`;

const hasAuthoredStyles = /<style\b/i.test(html)
  || /<link\b[^>]*rel=["']stylesheet["']/i.test(html);

if (!hasAuthoredStyles) {
  if (/<\/head>/i.test(html)) html = html.replace(/<\/head>/i, `${baselineCss}</head>`);
  else html = `${baselineCss}${html}`;
}

if (!/<!doctype html>/i.test(html)) throw new Error('Output is not HTML');
if (!/<main\b/i.test(html)) throw new Error('Output has no main landmark');
if (!/The Epstein Record/i.test(html)) throw new Error('Output identity check failed');
if (!/data-product=["']the-epstein-record-public-reference["']/i.test(html)) {
  throw new Error('Output is missing the product identity marker');
}
if (/\/_next\//i.test(html) || /\\\/_next\\\//i.test(html)) {
  throw new Error('Dead Next.js asset references remain');
}
if (/DecompressionStream|document\.write\s*\(|\batob\s*\(/i.test(html)) {
  throw new Error('Browser bootstrap code remains');
}
if (/Log in to Vercel|vercel\.com\/login/i.test(html)) {
  throw new Error('Vercel authentication capture detected');
}

rmSync(output, { recursive: true, force: true });
mkdirSync(output, { recursive: true });
writeFileSync(resolve(output, 'index.html'), html);
for (const file of ['robots.txt', 'sitemap.xml']) {
  const from = resolve(root, 'public', file);
  if (existsSync(from)) cpSync(from, resolve(output, file));
}

console.log(`Built self-contained static HTML (${html.length} characters) with no framework dependencies.`);
