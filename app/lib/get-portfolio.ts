import { getHoldings } from "@/app/lib/portfolio";
import { fetchGoogleMetrics, fetchYahooQuotes } from "@/app/lib/finance";
import { EnrichedHolding, PortfolioSnapshot, SectorSummary } from "@/app/lib/types";

const round = (value: number, decimals = 2): number => {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
};

export const getPortfolioSnapshot = async (): Promise<PortfolioSnapshot> => {
  const holdings = await getHoldings();
  const symbols = holdings.map((holding) => holding.symbol);
  const exchanges = holdings.map((holding) => holding.exchange);
  
  // Create fallback data map for Yahoo Finance (CMP values)
  const fallbackCmpMap = new Map<string, { cmp?: number | null }>();
  for (const holding of holdings) {
    fallbackCmpMap.set(holding.symbol, { cmp: holding.fallbackCmp ?? null });
  }
  
  const [yahooQuotes, googleMetrics] = await Promise.all([
    fetchYahooQuotes(symbols, exchanges, fallbackCmpMap),
    fetchGoogleMetrics(holdings)
  ]);

  const totalInvestment = holdings.reduce(
    (sum, holding) => sum + holding.purchasePrice * holding.quantity,
    0
  );

  const enrichedHoldings: EnrichedHolding[] = holdings.map((holding) => {
    const investment = holding.purchasePrice * holding.quantity;
    const yahoo = yahooQuotes[holding.symbol];
    const google = googleMetrics[holding.symbol];
    const cmp = yahoo?.cmp ?? google?.cmp ?? null;
    const peRatio = google?.peRatio ?? yahoo?.peRatio ?? null;
    const latestEarnings = google?.latestEarnings ?? yahoo?.latestEarnings ?? null;
    const currentValue = cmp ? cmp * holding.quantity : null;
    const gainLoss = currentValue !== null ? currentValue - investment : null;
    const gainLossPct =
      currentValue !== null && investment !== 0 && gainLoss !== null
        ? (gainLoss / investment) * 100
        : null;

    return {
      ...holding,
      investment: round(investment),
      weight: round((investment / totalInvestment) * 100, 2),
      cmp: cmp !== null ? round(cmp) : null,
      peRatio: peRatio !== null ? round(peRatio, 2) : null,
      latestEarnings,
      currentValue: currentValue !== null ? round(currentValue) : null,
      gainLoss: gainLoss !== null ? round(gainLoss) : null,
      gainLossPct: gainLossPct !== null ? round(gainLossPct, 2) : null
    };
  });

  let currentValueTotal = 0;
  let missingCurrent = false;

  for (const holding of enrichedHoldings) {
    if (holding.currentValue === null) {
      missingCurrent = true;
      continue;
    }
    currentValueTotal += holding.currentValue;
  }

  const totalCurrentValue = missingCurrent ? null : round(currentValueTotal);
  const totalGainLoss =
    totalCurrentValue !== null
      ? round(totalCurrentValue - totalInvestment)
      : null;
  const totalGainLossPct =
    totalCurrentValue !== null && totalGainLoss !== null
      ? round((totalGainLoss / totalInvestment) * 100, 2)
      : null;

  // Group by sector and calculate sector summaries
  const sectorMap = new Map<string, EnrichedHolding[]>();
  for (const holding of enrichedHoldings) {
    const sector = holding.sector || "Unknown";
    if (!sectorMap.has(sector)) {
      sectorMap.set(sector, []);
    }
    sectorMap.get(sector)!.push(holding);
  }

  const sectors: SectorSummary[] = [];
  for (const [sector, sectorHoldings] of sectorMap.entries()) {
    const sectorInvestment = sectorHoldings.reduce(
      (sum, h) => sum + h.investment,
      0
    );
    const sectorCurrentValue = sectorHoldings.reduce(
      (sum, h) => sum + (h.currentValue ?? 0),
      0
    );
    const sectorGainLoss =
      sectorCurrentValue > 0 ? sectorCurrentValue - sectorInvestment : null;
    const sectorGainLossPct =
      sectorGainLoss !== null
        ? round((sectorGainLoss / sectorInvestment) * 100, 2)
        : null;

    sectors.push({
      sector,
      investment: round(sectorInvestment),
      currentValue: sectorCurrentValue > 0 ? round(sectorCurrentValue) : null,
      gainLoss: sectorGainLoss !== null ? round(sectorGainLoss) : null,
      gainLossPct: sectorGainLossPct
    });
  }

  // Sort sectors by investment (descending)
  sectors.sort((a, b) => b.investment - a.investment);

  return {
    asOf: new Date().toISOString(),
    holdings: enrichedHoldings,
    sectors,
    totals: {
      investment: round(totalInvestment),
      currentValue: totalCurrentValue,
      gainLoss: totalGainLoss,
      gainLossPct: totalGainLossPct
    }
  };
};
