import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';

// Static pages. Add new top-level pages here.
const staticPaths = ['/', '/about', '/work', '/contact'];

export const GET: APIRoute = async ({ site }) => {
  const base = (site?.toString() ?? 'https://heurystics.com/').replace(/\/$/, '');
  const caseStudies = await getCollection('case-studies');

  const urls = [
    ...staticPaths.map((path) => ({ loc: `${base}${path}` })),
    ...caseStudies.map((cs) => ({
      loc: `${base}/work/${cs.slug}`,
      lastmod: cs.data.publishDate.toISOString().split('T')[0]
    }))
  ];

  const body =
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    urls
      .map(
        (u) =>
          `  <url><loc>${u.loc}</loc>${'lastmod' in u && u.lastmod ? `<lastmod>${u.lastmod}</lastmod>` : ''}</url>`
      )
      .join('\n') +
    `\n</urlset>\n`;

  return new Response(body, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' }
  });
};
