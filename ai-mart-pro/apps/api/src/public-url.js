import dns from 'node:dns/promises';
import https from 'node:https';
import net from 'node:net';
import { fail } from './core.js';

function publicIP(ip) {
  const v = net.isIP(ip);
  if (!v) return false;
  if (v === 4) {
    const [a, b] = ip.split('.').map(Number);
    return !(
      a === 0 ||
      a === 10 ||
      a === 127 ||
      a >= 224 ||
      (a === 169 && b === 254) ||
      (a === 172 && b >= 16 && b <= 31) ||
      (a === 192 && b === 168) ||
      (a === 100 && b >= 64 && b <= 127) ||
      (a === 192 && b === 0) ||
      (a === 198 && (b === 18 || b === 19))
    );
  }
  const a = ip.toLowerCase();
  return !(
    a === '::1' ||
    a === '::' ||
    a.startsWith('fc') ||
    a.startsWith('fd') ||
    a.startsWith('fe8') ||
    a.startsWith('fe9') ||
    a.startsWith('fea') ||
    a.startsWith('feb') ||
    a.startsWith('::ffff:')
  );
}

const DEFAULT_ALLOWED = [
  'example.com',
  'fakestoreapi.com',
  'dummyjson.com',
  'store.google.com',
  'apple.com',
  'daraz.pk',
  'amazon.com'
];

export async function analyzePublicURL(input) {
  let u;
  try {
    u = new URL(input);
  } catch {
    throw fail('Invalid product URL');
  }

  const envAllowed = (process.env.ALLOWED_PRODUCT_DOMAINS || '')
    .split(',')
    .map((x) => x.trim().toLowerCase())
    .filter(Boolean);

  const allowed = envAllowed.length ? envAllowed : DEFAULT_ALLOWED;

  // In development, if '*' is allowed or domain is in allowlist
  const isAllowed =
    allowed.includes('*') ||
    allowed.some((d) => u.hostname.toLowerCase() === d || u.hostname.toLowerCase().endsWith('.' + d));

  if (u.protocol !== 'https:' || (u.port && u.port !== '443') || u.username || u.password) {
    throw fail('Only secure HTTPS URLs are permitted.');
  }

  if (!isAllowed) {
    throw fail(
      `Domain "${u.hostname}" is not allowlisted. Permitted domains: ${allowed.slice(0, 5).join(', ')}. Set ALLOWED_PRODUCT_DOMAINS in environment to permit others.`,
      403
    );
  }

  // SSRF Protection: Resolve and verify public IP
  const ips = await dns.lookup(u.hostname, { all: true });
  if (!ips.length || ips.some((p) => !publicIP(p.address))) {
    throw fail('Destination resolved to an internal or reserved network address and was blocked for security.', 403);
  }

  const ip = ips[0];
  const html = await new Promise((resolve, reject) => {
    const req = https.get(
      {
        hostname: u.hostname,
        port: 443,
        path: u.pathname + u.search,
        servername: u.hostname,
        timeout: 7500,
        maxHeaderSize: 16000,
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 AI-Mart-Pro-Academic/2.0',
          Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
        },
        lookup: (hostname, opts, cb) => {
          const callback = typeof opts === 'function' ? opts : cb;
          const options = typeof opts === 'object' ? opts : {};
          if (options.all) {
            callback(null, [{ address: ip.address, family: ip.family }]);
          } else {
            callback(null, ip.address, ip.family);
          }
        }
      },
      (res) => {
        if (res.statusCode && (res.statusCode < 200 || res.statusCode >= 300)) {
          res.resume();
          return reject(fail(`Target server returned HTTP status ${res.statusCode}`, 422));
        }
        if (!String(res.headers['content-type'] || '').includes('text/html')) {
          res.resume();
          return reject(fail('Target page must return text/html', 422));
        }
        let total = 0;
        const chunks = [];
        res.on('data', (chunk) => {
          total += chunk.length;
          if (total > 600000) {
            req.destroy(fail('Page content exceeds 600KB safety limit', 422));
            return;
          }
          chunks.push(chunk);
        });
        res.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
      }
    );
    req.on('timeout', () => req.destroy(fail('Request to competitor host timed out', 422)));
    req.on('error', reject);
  });

  // 1. Regex metadata extraction
  const clean = (s) => (s || '').replace(/<[^>]*>/g, '').replace(/&amp;/g, '&').replace(/&quot;/g, '"').trim();
  const extractMatch = (re) => clean(html.match(re)?.[1] || '');

  const title =
    extractMatch(/<meta[^>]*property=["']og:title["'][^>]*content=["']([^"']*)["']/i) ||
    extractMatch(/<title[^>]*>([\s\S]*?)<\/title>/i) ||
    null;

  const description =
    extractMatch(/<meta[^>]*property=["']og:description["'][^>]*content=["']([^"']*)["']/i) ||
    extractMatch(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']*)["']/i) ||
    null;

  const ogImage =
    extractMatch(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']*)["']/i) ||
    null;

  let metaPrice =
    extractMatch(/<meta[^>]*property=["'](?:og|product):price:amount["'][^>]*content=["']([^"']*)["']/i) ||
    extractMatch(/<meta[^>]*property=["']product:sale_price:amount["'][^>]*content=["']([^"']*)["']/i) ||
    null;

  let currency =
    extractMatch(/<meta[^>]*property=["'](?:og|product):price:currency["'][^>]*content=["']([^"']*)["']/i) ||
    'PKR';

  // 2. Parse Schema.org JSON-LD scripts
  let jsonLdProduct = null;
  const jsonLdMatches = html.matchAll(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi);
  for (const m of jsonLdMatches) {
    try {
      const parsed = JSON.parse(m[1].trim());
      const findProduct = (obj) => {
        if (!obj || typeof obj !== 'object') return null;
        if (obj['@type'] === 'Product') return obj;
        if (Array.isArray(obj['@graph'])) {
          return obj['@graph'].find((item) => item['@type'] === 'Product') || null;
        }
        return null;
      };
      const found = findProduct(parsed);
      if (found) {
        jsonLdProduct = found;
        break;
      }
    } catch {}
  }

  let brand = jsonLdProduct?.brand?.name || (typeof jsonLdProduct?.brand === 'string' ? jsonLdProduct.brand : null);
  let availability = jsonLdProduct?.offers?.availability || null;
  if (!metaPrice && jsonLdProduct?.offers) {
    const offer = Array.isArray(jsonLdProduct.offers) ? jsonLdProduct.offers[0] : jsonLdProduct.offers;
    if (offer?.price) metaPrice = String(offer.price);
    if (offer?.priceCurrency) currency = String(offer.priceCurrency);
  }

  // 3. Compute Listing Quality Score (0–100)
  const scoreBreakdown = [];
  let totalScore = 0;

  // Title assessment (max 25)
  if (title && title.length >= 30 && title.length <= 140) {
    totalScore += 25;
    scoreBreakdown.push({ item: 'Title length & clarity', score: 25, max: 25, status: 'pass', note: 'Optimal length (30-140 chars)' });
  } else if (title && title.length > 0) {
    totalScore += 12;
    scoreBreakdown.push({ item: 'Title length & clarity', score: 12, max: 25, status: 'warn', note: 'Title is too short or too generic' });
  } else {
    scoreBreakdown.push({ item: 'Title length & clarity', score: 0, max: 25, status: 'fail', note: 'Missing title tag' });
  }

  // Description depth (max 25)
  if (description && description.length >= 100) {
    totalScore += 25;
    scoreBreakdown.push({ item: 'Product description depth', score: 25, max: 25, status: 'pass', note: 'Rich customer-facing copy' });
  } else if (description) {
    totalScore += 12;
    scoreBreakdown.push({ item: 'Product description depth', score: 12, max: 25, status: 'warn', note: 'Description under 100 characters' });
  } else {
    scoreBreakdown.push({ item: 'Product description depth', score: 0, max: 25, status: 'fail', note: 'Missing meta description' });
  }

  // Structured Price & Currency (max 20)
  if (metaPrice) {
    totalScore += 20;
    scoreBreakdown.push({ item: 'Price disclosure & Currency', score: 20, max: 20, status: 'pass', note: `${currency} ${metaPrice} disclosed` });
  } else {
    scoreBreakdown.push({ item: 'Price disclosure & Currency', score: 0, max: 20, status: 'fail', note: 'No open price metadata found' });
  }

  // Structured Data Schema.org (max 15)
  if (jsonLdProduct) {
    totalScore += 15;
    scoreBreakdown.push({ item: 'Schema.org JSON-LD Product', score: 15, max: 15, status: 'pass', note: 'Rich snippet schema detected' });
  } else {
    scoreBreakdown.push({ item: 'Schema.org JSON-LD Product', score: 0, max: 15, status: 'warn', note: 'Missing application/ld+json Product tag' });
  }

  // Media & Visual Assets (max 15)
  if (ogImage) {
    totalScore += 15;
    scoreBreakdown.push({ item: 'OpenGraph Visual Imagery', score: 15, max: 15, status: 'pass', note: 'High-res thumbnail provided' });
  } else {
    scoreBreakdown.push({ item: 'OpenGraph Visual Imagery', score: 0, max: 15, status: 'warn', note: 'No og:image thumbnail' });
  }

  // 4. AI-Enhanced Listing Recommendations
  const cleanTitle = (title || 'Premium Marketplace Product').replace(/[-|].*$/, '').trim();
  const enhancedTitle = `${cleanTitle} — High-Performance Specs & Official Warranty`;
  const enhancedBullets = [
    'Engineered for long-lasting performance with certified build quality.',
    'Fast express fulfillment across Pakistan with cash-on-delivery support.',
    'Full 1-year verified replacement warranty and 30-day money-back guarantee.',
    'Includes official accessories, user guide, and original tamper-proof packaging.'
  ];

  return {
    url: u.origin + u.pathname,
    domain: u.hostname,
    title: title || 'Untitled Product',
    description: description || 'No product description was published on this page.',
    price: metaPrice ? Number(metaPrice) : null,
    currency,
    brand: brand || 'Unspecified Brand',
    availability: availability ? availability.replace(/https?:\/\/schema\.org\//i, '') : 'InStock',
    imageUrl: ogImage,
    hasJsonLd: Boolean(jsonLdProduct),
    listingQualityScore: totalScore,
    scoreBreakdown,
    aiSuggestions: {
      suggestedTitle: enhancedTitle,
      suggestedBulletPoints: enhancedBullets,
      pricingGuidance: metaPrice
        ? `Disclosed price is ${currency} ${metaPrice}. Position within ±5% with bundled delivery to win buy-box.`
        : 'Price is unindexed; benchmark against marketplace category median for competitive edge.'
    },
    relativeAssessment:
      'Public metadata analyzed for listing quality and competitive SEO. No private vendor sales volumes or conversion rates are inferred.',
    missing: [
      !metaPrice && 'explicit price tag',
      !jsonLdProduct && 'schema.org JSON-LD',
      !brand && 'brand specification',
      !description && 'meta description'
    ].filter(Boolean),
    is_estimate: true,
    analyzed_at: new Date().toISOString()
  };
}
