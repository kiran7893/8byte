import { Holding, QuoteData } from "@/app/lib/types";

const FALLBACK_QUOTES: Record<string, QuoteData> = {
  // Fallback data - will be populated from data.json if API fails
};

const toNumber = (value: string | null): number | null => {
  if (!value) {
    return null;
  }
  const cleaned = value.replace(/,/g, "").trim();
  const num = Number(cleaned);
  return Number.isFinite(num) ? num : null;
};

const extractNumberAfterLabel = (html: string, label: string): number | null => {
  const pattern = new RegExp(`${label}[^0-9]{0,80}([0-9.,-]+)`, "i");
  const match = html.match(pattern);
  return match ? toNumber(match[1]) : null;
};

const extractTextAfterLabel = (html: string, label: string): string | null => {
  // More specific pattern to avoid matching CSS colors
  // Look for label followed by a number or currency amount
  const pattern = new RegExp(
    `${label}[^0-9]*?([0-9]+(?:\\.[0-9]+)?(?:[^a-zA-Z<]|$))`,
    "i"
  );
  const match = html.match(pattern);
  if (match) {
    const value = match[1].trim();
    // Validate it's a number and not CSS (no hex colors, no long sequences)
    if (/^[0-9]+(\.[0-9]+)?$/.test(value) && value.length < 20) {
      return value;
    }
  }
  return null;
};

/**
 * Convert NSE/BSE symbol to Yahoo Finance format
 * NSE: SYMBOL.NS (e.g., HDFCBANK.NS)
 * BSE: SYMBOL.BO (e.g., 532174.BO)
 */
function toYahooSymbol(symbol: string, exchange: string): string {
  if (exchange === "NSE") {
    return `${symbol}.NS`;
  } else if (exchange === "BSE") {
    return `${symbol}.BO`;
  }
  return symbol;
}

export const fetchYahooQuotes = async (
  symbols: string[],
  exchanges: string[],
  fallbackData?: Map<string, { cmp?: number | null }>
): Promise<Record<string, QuoteData>> => {
  if (symbols.length === 0) {
    return {};
  }

  try {
    // Convert symbols to Yahoo Finance format
    const yahooSymbols = symbols.map((sym, idx) =>
      toYahooSymbol(sym, exchanges[idx] || "NSE")
    );
    const url = `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${yahooSymbols.join(",")}`;
    const response = await fetch(url, { cache: "no-store" });
    if (!response.ok) {
      throw new Error(`Yahoo Finance response ${response.status}`);
    }
    const data = await response.json();
    const results = data?.quoteResponse?.result ?? [];

    const mapped: Record<string, QuoteData> = {};
    for (let i = 0; i < results.length; i++) {
      const item = results[i];
      const originalSymbol = symbols[i];
      if (!item?.symbol || !originalSymbol) {
        continue;
      }
      const apiCmp = Number.isFinite(item.regularMarketPrice)
        ? item.regularMarketPrice
        : null;
      // Use API data if available, otherwise fall back to data.json value
      const fallbackCmp = fallbackData?.get(originalSymbol)?.cmp ?? null;
      mapped[originalSymbol] = {
        cmp: apiCmp ?? fallbackCmp,
        peRatio: Number.isFinite(item.trailingPE) ? item.trailingPE : null,
        latestEarnings: null
      };
    }

    // Fill in any symbols that weren't in the API response with fallback data
    for (const symbol of symbols) {
      if (!mapped[symbol]) {
        const fallbackCmp = fallbackData?.get(symbol)?.cmp ?? null;
        mapped[symbol] = {
          cmp: fallbackCmp,
          peRatio: null,
          latestEarnings: null
        };
      }
    }

    return mapped;
  } catch {
    // On error, use fallback data from data.json
    const fallback: Record<string, QuoteData> = {};
    for (const symbol of symbols) {
      const fallbackCmp = fallbackData?.get(symbol)?.cmp ?? null;
      fallback[symbol] = {
        cmp: fallbackCmp,
        peRatio: null,
        latestEarnings: null
      };
    }
    return fallback;
  }
};

/**
 * Convert exchange code for Google Finance URL
 * NSE: NSE:SYMBOL
 * BSE: BOM:SYMBOL (Bombay Stock Exchange)
 */
function toGoogleFinanceUrl(symbol: string, exchange: string): string {
  if (exchange === "NSE") {
    return `NSE:${symbol}`;
  } else if (exchange === "BSE") {
    return `BOM:${symbol}`;
  }
  return `${exchange}:${symbol}`;
}

export const fetchGoogleMetrics = async (
  holdings: Holding[]
): Promise<Record<string, QuoteData>> => {
  const results: Record<string, QuoteData> = {};

  // Add delay between requests to avoid rate limiting
  for (const holding of holdings) {
    // Use fallback data from data.json
    const fallbackPeRatio = holding.fallbackPeRatio ?? null;
    const fallbackEarnings = holding.fallbackEarnings ?? null;

    try {
      const urlSymbol = toGoogleFinanceUrl(holding.symbol, holding.exchange);
      const url = `https://www.google.com/finance/quote/${urlSymbol}`;
      const response = await fetch(url, { cache: "no-store" });
      if (!response.ok) {
        throw new Error(`Google Finance response ${response.status}`);
      }
      const html = await response.text();
      const apiPeRatio = extractNumberAfterLabel(html, "P/E ratio");
      const apiEarnings =
        extractTextAfterLabel(html, "Earnings per share") ??
        extractTextAfterLabel(html, "EPS");

      // Use API data if available, otherwise fall back to data.json values
      results[holding.symbol] = {
        cmp: null, // CMP comes from Yahoo Finance
        peRatio: apiPeRatio ?? fallbackPeRatio,
        latestEarnings: apiEarnings ?? fallbackEarnings
      };
    } catch {
      // On error, use fallback data from data.json
      results[holding.symbol] = {
        cmp: null,
        peRatio: fallbackPeRatio,
        latestEarnings: fallbackEarnings
      };
    }

    // Small delay to avoid rate limiting
    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  return results;
};
