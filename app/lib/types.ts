export type Holding = {
  symbol: string;
  name: string;
  purchasePrice: number;
  quantity: number;
  exchange: string;
  sector: string;
  fallbackCmp?: number | null;
  fallbackPeRatio?: number | null;
  fallbackEarnings?: string | null;
};

export type QuoteData = {
  cmp: number | null;
  peRatio: number | null;
  latestEarnings: string | null;
};

export type EnrichedHolding = Holding & {
  investment: number;
  weight: number;
  cmp: number | null;
  peRatio: number | null;
  latestEarnings: string | null;
  currentValue: number | null;
  gainLoss: number | null;
  gainLossPct: number | null;
};

export type SectorSummary = {
  sector: string;
  investment: number;
  currentValue: number | null;
  gainLoss: number | null;
  gainLossPct: number | null;
};

export type PortfolioSnapshot = {
  asOf: string;
  holdings: EnrichedHolding[];
  sectors: SectorSummary[];
  totals: {
    investment: number;
    currentValue: number | null;
    gainLoss: number | null;
    gainLossPct: number | null;
  };
};
