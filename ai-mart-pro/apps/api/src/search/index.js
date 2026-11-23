/**
 * Natural-Language Search & Query Understanding Engine V2
 * Capabilities:
 * - Query Normalization & Trilingual Language Detection (en, roman_urdu, urdu)
 * - Multi-dialect Budget & Price Entity Extraction (e.g., "under 9k", "3500 tak", "5000 se kam", "between 3k and 8k")
 * - Roman Urdu & Urdu synonym expansion (jootay -> shoes, ghari -> watch, sasta -> cheap, behtareen -> best)
 * - Levenshtein Typo Tolerance against Live Product Vocabulary
 * - Intent Detection (best, cheapest, deals, premium, newest)
 * - Hard Filtering vs Soft Ranking Fusion
 * - Zero-Result Relaxation with "relaxed: true" Rescue
 * - Unmet Demand & Search Analytics Logging
 */

// Search log in-memory store with persistence helper
export const searchLogs = [];

export function logSearch({ query, understood, resultCount, userId = null }) {
  const entry = {
    id: 'slog-' + Math.random().toString(36).slice(2, 9),
    query,
    understood,
    resultCount,
    userId,
    timestamp: new Date().toISOString()
  };
  searchLogs.unshift(entry);
  if (searchLogs.length > 2000) searchLogs.pop();
  return entry;
}

export function getUnmetDemandSearches(limit = 10) {
  // Searches that returned 0 results or high relaxation
  return searchLogs
    .filter(l => l.resultCount === 0)
    .slice(0, limit)
    .map(l => ({
      query: l.query,
      terms: l.understood?.terms || [],
      maxPrice: l.understood?.max_price,
      count: searchLogs.filter(x => x.query.toLowerCase() === l.query.toLowerCase()).length,
      lastSearched: l.timestamp
    }));
}

// Trilingual Synonyms & Vocabulary Mappings
const SYNONYMS = {
  // Roman Urdu to English Keywords
  'jootay': 'shoes sneakers footwear',
  'joote': 'shoes sneakers footwear',
  'joota': 'shoes sneakers',
  'ghari': 'watch smart watch amoled',
  'ghadi': 'watch',
  'khel': 'sports gym fitness yoga dumbbell',
  'warzish': 'sports gym exercise fitness',
  'kapray': 'fashion hoodie shirt clothing',
  'kapre': 'fashion hoodie clothing',
  'ainaq': 'glasses eyewear sunglasses',
  'chashma': 'glasses eyewear',
  'kitab': 'books journal handbook',
  'kitaben': 'books',
  'basta': 'backpack commuter bag',
  'awaz': 'headphones sound audio earbuds speaker',
  'khushbu': 'aroma diffuser botanical',
  'dawa': 'skincare serum',
  // Urdu script
  'جوتے': 'shoes sneakers footwear',
  'گھڑی': 'watch smart watch',
  'کتابیں': 'books journal',
  'کتاب': 'books handbook',
  'بیگ': 'backpack bag',
  'ہیڈفون': 'headphones audio earbuds'
};

const INTENT_LEXICON = {
  best: ['best', 'top', 'rated', 'popular', 'highest', 'behtareen', 'outclass', 'kamaal', 'acha', 'achi', 'بہترین'],
  cheapest: ['cheap', 'cheapest', 'budget', 'affordable', 'sasta', 'sasti', 'kam qeemat', 'ارزاں', 'سستا'],
  deals: ['deal', 'deals', 'discount', 'sale', 'off', 'flash', 'promo', 'بچت', 'رعایت'],
  premium: ['premium', 'luxury', 'pro', 'flagship', 'high end', 'titanium'],
  newest: ['new', 'latest', 'recent', 'naya', 'nayi', 'تازہ', 'نیا']
};

export function detectLanguage(text) {
  if (/[\u0600-\u06FF]/.test(text)) return 'urdu';
  const romanMarkers = ['bohat', 'sasta', 'sasti', 'mehanga', 'mehnga', 'jootay', 'joote', 'ghari', 'chahiye', 'tak', 'kam', 'se', 'hai', 'wala', 'wali', 'kamaal', 'behtareen'];
  const tokens = text.toLowerCase().split(/\s+/);
  if (tokens.some(t => romanMarkers.includes(t))) return 'roman_urdu';
  return 'en';
}

function parseKMultiplier(raw) {
  if (!raw) return null;
  const clean = raw.toLowerCase().trim().replace(/,/g, '');
  if (clean.endsWith('k')) {
    return Math.round(parseFloat(clean.slice(0, -1)) * 1000);
  }
  return Math.round(parseFloat(clean));
}

export function extractBudget(query) {
  let maxPrice = null;
  let minPrice = null;
  const q = query.toLowerCase();

  // Pattern 1: "between X and Y" / "X se Y tak"
  const rangeMatch = q.match(/(?:between|from)?\s*([0-9.]+[kK]?|[0-9,]+)\s*(?:to|and|-|se)\s*([0-9.]+[kK]?|[0-9,]+)\s*(?:tak|rs|pkr)?/i);
  if (rangeMatch && !q.includes('under') && !q.includes('below')) {
    const val1 = parseKMultiplier(rangeMatch[1]);
    const val2 = parseKMultiplier(rangeMatch[2]);
    if (val1 && val2 && val1 !== val2) {
      minPrice = Math.min(val1, val2);
      maxPrice = Math.max(val1, val2);
      return { maxPrice, minPrice };
    }
  }

  // Pattern 2: Upper budget limits: "under 9k", "below Rs 5000", "less than 10k", "5000 tak", "3500 se kam", "max 15000"
  const underMatch = q.match(/(?:under|below|less than|upto|up to|max|within|tak|se kam|se kam me|under rs|below rs|\$|rs\.?)\s*([0-9.]+[kK]?|[0-9,]+)/i)
    || q.match(/([0-9.]+[kK]?|[0-9,]+)\s*(?:tak|se kam|se neechay|tak ka|tak ki)/i);

  if (underMatch) {
    maxPrice = parseKMultiplier(underMatch[1]);
  }

  // Pattern 3: Lower budget limits: "above 10k", "more than 5000", "10000 se zyada"
  const aboveMatch = q.match(/(?:above|more than|over|greater than|min|se zyada|se upar)\s*([0-9.]+[kK]?|[0-9,]+)/i);
  if (aboveMatch) {
    minPrice = parseKMultiplier(aboveMatch[1]);
  }

  return { maxPrice, minPrice };
}

export function extractIntent(query) {
  const q = query.toLowerCase();
  const foundIntents = [];

  for (const [intent, keywords] of Object.entries(INTENT_LEXICON)) {
    if (keywords.some(k => new RegExp(`\\b${k}\\b`, 'i').test(q))) {
      foundIntents.push(intent);
    }
  }
  return foundIntents.length ? foundIntents : ['relevant'];
}

function levenshtein(a, b) {
  const matrix = Array.from({ length: b.length + 1 }, (_, i) => [i]);
  for (let j = 0; j <= a.length; j++) matrix[0][j] = j;

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b[i - 1] === a[j - 1]) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }
  return matrix[b.length][a.length];
}

export function correctTypos(tokens, catalogVocabulary) {
  const corrections = [];
  const correctedTokens = tokens.map(token => {
    if (token.length <= 2 || catalogVocabulary.has(token)) return token;

    let bestMatch = token;
    let minDistance = token.length <= 4 ? 1 : 2;

    for (const word of catalogVocabulary) {
      const dist = levenshtein(token, word);
      if (dist <= minDistance) {
        minDistance = dist - 1;
        bestMatch = word;
      }
    }

    if (bestMatch !== token) {
      corrections.push({ original: token, corrected: bestMatch });
      return bestMatch;
    }
    return token;
  });

  return { correctedTokens, corrections };
}

export function parseNaturalLanguageQuery(query, catalogVocabulary = new Set()) {
  const language = detectLanguage(query);
  const { maxPrice, minPrice } = extractBudget(query);
  const intent = extractIntent(query);

  // Normalize tokens and remove stop words & budget substrings
  let cleanQuery = query
    .toLowerCase()
    .replace(/(?:under|below|less than|more than|above|between|and|to|tak|se kam|se zyada|rs\.?|pkr)\s*[0-9.]+[kK]?/gi, ' ')
    .replace(/[^a-zA-Z0-9\u0600-\u06FF\s]/g, ' ')
    .trim();

  let rawTokens = cleanQuery.split(/\s+/).filter(w => w.length > 1);

  // Synonym & concept expansion
  const expandedTokens = [];
  for (const token of rawTokens) {
    if (SYNONYMS[token]) {
      expandedTokens.push(...SYNONYMS[token].split(/\s+/));
    } else {
      expandedTokens.push(token);
    }
  }

  // Typo correction against known vocabulary
  const { correctedTokens, corrections } = correctTypos(expandedTokens, catalogVocabulary);

  // Filter stop words
  const stopWords = new Set(['the', 'and', 'with', 'for', 'show', 'find', 'me', 'want', 'need', 'chahiye', 'hai', 'ka', 'ki', 'ke', 'in', 'of']);
  const searchTerms = correctedTokens.filter(t => !stopWords.has(t));

  return {
    query,
    understood: {
      terms: Array.from(new Set(searchTerms)),
      max_price: maxPrice,
      min_price: minPrice,
      intent,
      language,
      corrections
    }
  };
}

export function executeNaturalLanguageSearch({
  query,
  products = [],
  categories = [],
  userId = null
}) {
  if (!query || !query.trim()) {
    return {
      query: '',
      understood: { terms: [], max_price: null, min_price: null, intent: ['relevant'], language: 'en', corrections: [] },
      results: products.slice(0, 20).map(p => ({ ...p, score: 1.0, matchReason: 'Marketplace featured' })),
      relaxed: false,
      total: products.length,
      model_version: 'search-v2-trilingual'
    };
  }

  // Build catalog vocabulary for typo checking
  const vocabulary = new Set();
  for (const p of products) {
    p.name.toLowerCase().split(/\s+/).forEach(w => vocabulary.add(w.replace(/[^a-z0-9]/g, '')));
    if (p.category?.name) {
      p.category.name.toLowerCase().split(/\s+/).forEach(w => vocabulary.add(w.replace(/[^a-z0-9]/g, '')));
    }
  }

  const { understood } = parseNaturalLanguageQuery(query, vocabulary);

  // 1. HARD FILTERS: Budget bounds & stock
  let eligible = products.filter(p => {
    if (p.active === false || p.moderation === 'REMOVED' || p.moderation === 'HIDDEN') return false;
    if (understood.max_price !== null && p.price > understood.max_price) return false;
    if (understood.min_price !== null && p.price < understood.min_price) return false;
    return true;
  });

  let relaxed = false;

  // Relaxation rule: If budget filter leaves zero products, relax upper bound by 15% or relax to all items with flag
  if (eligible.length === 0 && (understood.max_price !== null || understood.min_price !== null)) {
    eligible = products.filter(p => p.active !== false && p.moderation !== 'REMOVED');
    relaxed = true;
  }

  // 2. SOFT SCORING: Text Relevance + Category + Intent Boosts
  const scored = eligible.map(p => {
    let score = 0.0;
    const reasons = [];

    const pName = p.name.toLowerCase();
    const pDesc = (p.description || '').toLowerCase();
    const pCat = (p.category?.name || '').toLowerCase();
    const pVendor = (p.vendor?.vendorProfile?.storeName || p.vendor?.name || '').toLowerCase();

    // Query terms matching
    for (const term of understood.terms) {
      if (pName.includes(term)) {
        score += 5.0;
        reasons.push(`Title matches '${term}'`);
      } else if (pCat.includes(term)) {
        score += 3.5;
        reasons.push(`Category '${p.category?.name}'`);
      } else if (pDesc.includes(term)) {
        score += 1.5;
      } else if (pVendor.includes(term)) {
        score += 2.0;
        reasons.push(`Store '${pVendor}'`);
      }
    }

    // Intent-based ranking signals
    if (understood.intent.includes('best')) {
      const rating = p.rating || 4.5;
      score += (rating - 3.0) * 2.0;
      if (rating >= 4.7) reasons.push(`Top-rated (${rating}★)`);
    }

    if (understood.intent.includes('deals')) {
      const discount = (p.comparePrice && p.comparePrice > p.price)
        ? (p.comparePrice - p.price) / p.comparePrice
        : 0;
      score += discount * 8.0;
      if (discount > 0.1) reasons.push(`Discount applied (${Math.round(discount * 100)}% off)`);
    }

    if (understood.intent.includes('cheapest')) {
      // Inverse logarithmic price scoring
      score += Math.max(0, 15.0 - Math.log(Math.max(100, p.price)));
      reasons.push('Low price match');
    }

    if (understood.intent.includes('premium')) {
      score += Math.log(Math.max(100, p.price)) * 1.5;
      if (p.price > 25000) reasons.push('Premium tier specification');
    }

    if (understood.max_price && p.price <= understood.max_price) {
      reasons.push(`Under budget (Rs. ${p.price.toLocaleString()})`);
    }

    const uniqueReasons = Array.from(new Set(reasons)).slice(0, 3);
    return {
      ...p,
      score: Number(score.toFixed(2)),
      matchReason: uniqueReasons.join(' · ') || 'Relevant catalog match'
    };
  });

  // Sort by score descending
  let ranked = scored.filter(s => s.score > 0).sort((a, b) => b.score - a.score);

  // If still 0 matches after term filtering, relax terms (show closest popular items)
  if (ranked.length === 0 && products.length > 0) {
    relaxed = true;
    ranked = products.slice(0, 8).map(p => ({
      ...p,
      score: 0.5,
      matchReason: 'No exact matches found — showing trending items'
    }));
  }

  // Log search analytics for vendor demand insights
  logSearch({ query, understood, resultCount: ranked.length, userId });

  return {
    query,
    understood,
    results: ranked,
    relaxed,
    total: ranked.length,
    model_version: 'search-v2-trilingual'
  };
}
