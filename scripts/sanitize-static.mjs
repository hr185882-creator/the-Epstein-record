import { readFileSync, writeFileSync } from 'node:fs';

const file = 'public/index.html';
let html = readFileSync(file, 'utf8');

html = html
  .replace(/<link\b[^>]*href=["']\/_next\/[^"']+["'][^>]*>/gi, '')
  .replace(/<script\b[^>]*src=["']\/_next\/[^"']+["'][^>]*><\/script>/gi, '')
  .replace(/<link\b[^>]*rel=["'](?:preload|modulepreload)["'][^>]*>/gi, '')
  .replace(/<script>\(function aw[\s\S]*?<\/script>/i, '')
  .replace(/<script>\(\(\{protect:a\}\)[\s\S]*?<\/script>/i, '');

if (!/<style[^>]*data-static-fallback/i.test(html)) {
  const fallback = `<style data-static-fallback>
:root{color-scheme:dark;background:#0a0a0a;color:#f4f4f5;font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}*{box-sizing:border-box}body{margin:0;background:#0a0a0a;color:#f4f4f5;line-height:1.55}a{color:#9ec5ff}img{max-width:100%;height:auto}header,main,footer{max-width:1200px;margin:auto;padding:24px}section,article{margin:0 0 28px;padding:22px;border:1px solid #2b2b2f;border-radius:14px;background:#111113}h1,h2,h3{line-height:1.15}button,input,select,textarea{font:inherit}.sr-only{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0,0,0,0)}@media(max-width:700px){header,main,footer{padding:16px}section,article{padding:16px}}
</style>`;
  html = html.replace(/<\/head>/i, `${fallback}</head>`);
}

if (/\/_next\//i.test(html)) {
  throw new Error('Sanitization failed: unresolved /_next/ references remain.');
}
if (/DecompressionStream|document\.write\s*\(|\batob\s*\(/i.test(html)) {
  throw new Error('Sanitization failed: prohibited bootstrap code remains.');
}

writeFileSync(file, html);
console.log(`Sanitized ${file}; ${html.length} characters written.`);
