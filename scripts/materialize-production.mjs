import { gunzipSync } from 'node:zlib';
import { mkdir, writeFile } from 'node:fs/promises';

const SOURCE_URL = process.env.SNAPSHOT_SOURCE_URL
  ?? 'https://the-epstein-record-72glq5ayh-hasan-kazmi-s-projects.vercel.app/';
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

function normalizeHead(html) {
  let output = html;

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
  ];

  for (const pattern of required) {
    if (!pattern.test(html)) {
      throw new Error(`Materialized page failed validation: ${pattern}`);
    }
  }

  const forbidden = ['DecompressionStream', 'document.write(', "atob('", 'atob("'];
  for (const marker of forbidden) {
    if (html.includes(marker)) {
      throw new Error(`Materialized page still contains bootstrap marker: ${marker}`);
    }
  }
}

const response = await fetch(SOURCE_URL, {
  headers: {
    'user-agent': 'The-Epstein-Record-Semantic-Materializer/1.0',
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

console.log(`Materialized ${semanticHtml.length.toLocaleString()} characters of semantic HTML from ${SOURCE_URL}`);
