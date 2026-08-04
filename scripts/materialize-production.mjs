import { gunzipSync } from 'node:zlib';
import { mkdir, writeFile } from 'node:fs/promises';

const SOURCE_URL = process.env.SNAPSHOT_SOURCE_URL
  ?? 'https://the-epstein-record.vercel.app/';
const CANONICAL_URL = 'https://the-epstein-record.vercel.app/';

function extractSemanticHtml(source) {
  if (!source.includes('DecompressionStream') && /<main[\s>]/i.test(source)) {
    return source;
  }

  const payload = source.match(/atob\((['"])([A-Za-z0-9+/=]+)\1\)/)?.[2];
  if (!payload) {
    throw new Error('The production bootstrap did not contain a recognizable base64 payload.');
  }

  return gunzipSync(Buffer.from(payload, 'base64')).toString('utf8');
}

function removeUnavailableFrameworkAssets(html) {
  let output = html;

  output = output.replace(/<link\b[^>]*href=["']\/_next\/[^"']+["'][^>]*>/gi, '');
  output = output.replace(/<script\b[^>]*src=["']\/_next\/[^"']+["'][^>]*>\s*<\/script>/gi, '');
  output = output.replace(/<link\b[^>]*rel=["'](?:preload|modulepreload|expect)["'][^>]*>/gi, '');
  output = output.replace(/<script\b[^>]*>[^<]*(?:self\.__next_f|__next_f|next-size-adjust)[\s\S]*?<\/script>/gi, '');

  const fallbackCss = `
<style id="static-fallback-css">
:root{color-scheme:dark;--bg:#080808;--panel:#111;--text:#f5f5f5;--muted:#b8b8b8;--line:#2a2a2a;--accent:#d7b46a}
*{box-sizing:border-box}
html{scroll-behavior:smooth}
body{margin:0;background:var(--bg);color:var(--text);font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;line-height:1.6}
a{color:var(--accent);text-decoration-thickness:.08em;text-underline-offset:.18em}
img,svg,video{max-width:100%;height:auto}
header,nav,main,footer,section,article,aside{display:block}
main{width:min(1180px,calc(100% - 32px));margin:0 auto;padding:32px 0 72px}
header{border-bottom:1px solid var(--line);background:#0b0b0b}
nav{width:min(1180px,calc(100% - 32px));margin:0 auto;padding:14px 0;display:flex;gap:18px;flex-wrap:wrap;align-items:center}
section,article,aside{background:var(--panel);border:1px solid var(--line);border-radius:14px;padding:clamp(18px,3vw,32px);margin:18px 0}
h1,h2,h3{line-height:1.15;margin-top:0;letter-spacing:-.02em}
h1{font-size:clamp(2rem,6vw,4.5rem)}
h2{font-size:clamp(1.45rem,3vw,2.4rem)}
p,li,dd,dt{max-width:78ch}
small,.muted,[class*="muted"],[class*="secondary"]{color:var(--muted)}
table{width:100%;border-collapse:collapse;display:block;overflow-x:auto}
th,td{padding:10px 12px;border:1px solid var(--line);text-align:left;vertical-align:top}
button,input,select,textarea{font:inherit}
button{background:#191919;color:var(--text);border:1px solid var(--line);border-radius:9px;padding:9px 13px}
@media(max-width:640px){main,nav{width:min(100% - 20px,1180px)}section,article,aside{border-radius:10px;padding:16px}}
</style>`;

  output = output.replace(/<\/head>/i, `${fallbackCss}\n</head>`);
  return output;
}

function normalizeHead(html) {
  let output = removeUnavailableFrameworkAssets(html);

  if (!/<meta\s+name=["']robots["']/i.test(output)) {
    output = output.replace(/<head>/i, '<head>\n<meta name="robots" content="index,follow,max-image-preview:large">');
  }

  if (!/<link\s+rel=["']canonical["']/i.test(output)) {
    output = output.replace(/<\/head>/i, `<link rel="canonical" href="${CANONICAL_URL}">\n</head>`);
  }

  if (!/<meta\s+name=["']description["']/i.test(output)) {
    output = output.replace(
      /<\/head>/i,
      '<meta name="description" content="The Epstein Record separates what authenticated records establish from allegations, associations, disputes, and unresolved claims.">\n</head>',
    );
  }

  return output;
}

function validate(html) {
  const required = [
    /<!doctype html>/i,
    /<html[\s>]/i,
    /<head[\s>]/i,
    /<body[\s>]/i,
    /<main[\s>]/i,
    /The Epstein Record/i,
    /static-fallback-css/i,
  ];

  for (const pattern of required) {
    if (!pattern.test(html)) {
      throw new Error(`Materialized page failed validation: ${pattern}`);
    }
  }

  const forbidden = [
    'DecompressionStream',
    'document.write(',
    "atob('",
    'atob("',
    'href="/_next/',
    "href='/_next/",
    'src="/_next/',
    "src='/_next/",
  ];
  for (const marker of forbidden) {
    if (html.includes(marker)) {
      throw new Error(`Materialized page still contains forbidden marker: ${marker}`);
    }
  }
}

const response = await fetch(SOURCE_URL, {
  headers: {
    'user-agent': 'The-Epstein-Record-Semantic-Materializer/2.0',
    accept: 'text/html,application/xhtml+xml',
  },
  redirect: 'follow',
});

if (!response.ok) {
  throw new Error(`Unable to fetch snapshot source: HTTP ${response.status}`);
}

const bootstrap = await response.text();
const semanticHtml = normalizeHead(extractSemanticHtml(bootstrap));
validate(semanticHtml);

await mkdir('public', { recursive: true });
await writeFile('public/index.html', `${semanticHtml.trim()}\n`, 'utf8');
await writeFile(
  'public/robots.txt',
  `User-agent: *\nAllow: /\n\nSitemap: ${CANONICAL_URL}sitemap.xml\n`,
  'utf8',
);
await writeFile(
  'public/sitemap.xml',
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <url>\n    <loc>${CANONICAL_URL}</loc>\n    <changefreq>weekly</changefreq>\n    <priority>1.0</priority>\n  </url>\n</urlset>\n`,
  'utf8',
);

console.log(`Materialized ${semanticHtml.length.toLocaleString()} characters of self-contained semantic HTML from ${SOURCE_URL}`);
