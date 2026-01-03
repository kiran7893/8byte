import { Holding } from "./types";
import { loadPortfolioData } from "./data-parser";

// Cache for portfolio data to avoid re-parsing on every request
let cachedHoldings: Holding[] | null = null;

/**
 * Get portfolio holdings from data.json
 * Uses caching to avoid re-parsing on every request
 */
export async function getHoldings(): Promise<Holding[]> {
  if (cachedHoldings === null) {
    cachedHoldings = await loadPortfolioData();
  }
  return cachedHoldings;
}

// For backward compatibility, export as holdings array
// Note: This is now async, so consumers should use getHoldings() instead
export const holdings: Holding[] = [];
