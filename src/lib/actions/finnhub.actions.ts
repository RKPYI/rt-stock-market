'use server';

import { getDateRange, validateArticle, formatArticle, calculateNewsDistribution } from '@/lib/utils';

const FINNHUB_BASE_URL = 'https://finnhub.io/api/v1';
const NEXT_PUBLIC_FINNHUB_API_KEY = process.env.NEXT_PUBLIC_FINNHUB_API_KEY || '';

type FetchOptions = { revalidateSeconds?: number };

async function fetchJSON<T>(url: string, revalidateSeconds?: number): Promise<T> {
  const fetchOptions: RequestInit & { next?: { revalidate?: number; cache?: string } } = {};

  if (typeof revalidateSeconds === 'number') {
    fetchOptions.next = { revalidate: revalidateSeconds, cache: 'force-cache' };
  } else {
    fetchOptions.next = { cache: 'no-store' };
  }

  const res = await fetch(url, fetchOptions);
  if (!res.ok) throw new Error(`Failed to fetch ${url} - ${res.status}`);
  return res.json();
}

export const getNews = async (symbols?: string[]): Promise<MarketNewsArticle[]> => {
  try {
    const { from, to } = getDateRange(5);

    // Helper to validate and format an article
    const formatIfValid = (article: RawNewsArticle, isCompany: boolean, symbol?: string, idx = 0) => {
      if (!validateArticle(article)) return null;
      return formatArticle(article, isCompany, symbol, idx);
    };

    // If symbols provided, collect company news in a round-robin fashion
    if (symbols && symbols.length > 0) {
      const cleaned = symbols
        .filter(Boolean)
        .map((s) => s.trim().toUpperCase())
        .slice(0, 12); // cap input size to something reasonable

      const { itemsPerSymbol, targetNewsCount } = calculateNewsDistribution(cleaned.length);

    const collected: MarketNewsArticle[] = [];

      // Round-robin up to max 6 rounds (or until collected reaches target)
      let round = 0;
      while (collected.length < targetNewsCount && round < 6) {
        for (let i = 0; i < cleaned.length && collected.length < targetNewsCount; i++) {
          const symbol = cleaned[i];
          try {
            const url = `${FINNHUB_BASE_URL}/company-news?symbol=${encodeURIComponent(symbol)}&from=${from}&to=${to}&token=${NEXT_PUBLIC_FINNHUB_API_KEY}`;
            const articles: RawNewsArticle[] = await fetchJSON(url, 60 * 60); // cache for 1 hour

            if (Array.isArray(articles) && articles.length > 0) {
              // pick the article at index 'round' if exists, otherwise the first valid
              let candidate: RawNewsArticle | null = null;
              candidate = articles[round] || articles.find(Boolean) || null;
              if (candidate) {
                const formatted = formatIfValid(candidate, true, symbol, round);
                if (formatted) collected.push(formatted);
              }
            }
          } catch (e) {
            // ignore per-symbol errors and continue
            console.error('Error fetching company news for', symbol, e);
          }
        }
        round += 1;
      }

      // Sort by datetime desc and limit to 6
      return collected
        .sort((a, b) => b.datetime - a.datetime)
        .slice(0, Math.min(6, collected.length));
    }

    // No symbols: fetch general market news and dedupe
    const marketUrl = `${FINNHUB_BASE_URL}/news?category=general&token=${NEXT_PUBLIC_FINNHUB_API_KEY}`;
    const marketArticles: RawNewsArticle[] = await fetchJSON(marketUrl, 60 * 60);
    if (!Array.isArray(marketArticles)) return [];

    const seen = new Set<string>();
  const formatted: MarketNewsArticle[] = [];

    for (let i = 0; i < marketArticles.length && formatted.length < 6; i++) {
      const art = marketArticles[i];
      if (!validateArticle(art)) continue;
      const dedupeKey = art.id ? String(art.id) : `${art.url}-${art.headline}`;
      if (seen.has(dedupeKey)) continue;
      seen.add(dedupeKey);
      const f = formatIfValid(art, false, undefined, i);
      if (f) formatted.push(f);
    }

    return formatted.slice(0, 6);
  } catch (e) {
    console.error('Failed to fetch news', e);
    throw new Error('Failed to fetch news');
  }
};
