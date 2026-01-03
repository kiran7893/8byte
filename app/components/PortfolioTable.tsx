import React from "react";
import { EnrichedHolding, PortfolioSnapshot } from "@/app/lib/types";
import { formatCurrency, formatNumber, formatPercent } from "@/app/lib/format";
import clsx from "clsx";

type PortfolioTableProps = {
  snapshot: PortfolioSnapshot;
};

const PortfolioTable = ({ snapshot }: PortfolioTableProps) => {
  // Group holdings by sector
  const sectorMap = new Map<string, EnrichedHolding[]>();
  for (const holding of snapshot.holdings) {
    const sector = holding.sector || "Unknown";
    if (!sectorMap.has(sector)) {
      sectorMap.set(sector, []);
    }
    sectorMap.get(sector)!.push(holding);
  }

  // Get sector summaries from snapshot
  const sectorSummaryMap = new Map(
    snapshot.sectors.map((s) => [s.sector, s])
  );

  return (
    <div className="glass-panel rounded-3xl p-6 shadow-glass">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-2xl font-semibold text-ink-900">
            Portfolio Holdings
          </h2>
          <p className="mt-1 text-sm text-ink-600">
            Snapshot of allocations with live pricing and valuation metrics.
          </p>
        </div>
        <div className="hidden sm:flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-ink-600">
          Live
          <span className="inline-flex h-2 w-2 rounded-full bg-mint-500" />
        </div>
      </div>

      <div className="mt-6 overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="text-xs uppercase tracking-[0.2em] text-ink-600">
            <tr className="border-b border-ink-200">
              <th className="pb-4 pr-6 font-medium">Particulars</th>
              <th className="pb-4 pr-6 font-medium">Purchase Price</th>
              <th className="pb-4 pr-6 font-medium">Qty</th>
              <th className="pb-4 pr-6 font-medium">Investment</th>
              <th className="pb-4 pr-6 font-medium">Portfolio (%)</th>
              <th className="pb-4 pr-6 font-medium">NSE/BSE</th>
              <th className="pb-4 pr-6 font-medium">CMP</th>
              <th className="pb-4 pr-6 font-medium">Present Value</th>
              <th className="pb-4 pr-6 font-medium">Gain/Loss</th>
              <th className="pb-4 pr-6 font-medium">P/E Ratio</th>
              <th className="pb-4 font-medium">Latest Earnings</th>
            </tr>
          </thead>
          <tbody>
            {snapshot.sectors.map((sectorSummary) => {
              const sectorHoldings = sectorMap.get(sectorSummary.sector) || [];
              if (sectorHoldings.length === 0) return null;

              return (
                <React.Fragment key={sectorSummary.sector}>
                  {/* Sector Summary Row */}
                  <tr className="border-b-2 border-ink-300 bg-ink-50/50">
                    <td className="py-3 pr-6 font-semibold text-ink-900">
                      {sectorSummary.sector}
                    </td>
                    <td className="py-3 pr-6">—</td>
                    <td className="py-3 pr-6">—</td>
                    <td className="py-3 pr-6 font-medium text-ink-900">
                      {formatCurrency(sectorSummary.investment)}
                    </td>
                    <td className="py-3 pr-6">—</td>
                    <td className="py-3 pr-6">—</td>
                    <td className="py-3 pr-6">—</td>
                    <td className="py-3 pr-6 font-medium text-ink-900">
                      {formatCurrency(sectorSummary.currentValue)}
                    </td>
                    <td
                      className={clsx(
                        "py-3 pr-6 font-medium",
                        sectorSummary.gainLoss !== null &&
                          sectorSummary.gainLoss >= 0
                          ? "text-emerald-600"
                          : "text-rose-600"
                      )}
                    >
                      {sectorSummary.gainLoss !== null
                        ? `${formatCurrency(sectorSummary.gainLoss)} (${formatPercent(
                            sectorSummary.gainLossPct
                          )})`
                        : "—"}
                    </td>
                    <td className="py-3 pr-6">—</td>
                    <td className="py-3">—</td>
                  </tr>
                  {/* Individual Holdings in Sector */}
                  {sectorHoldings.map((holding) => (
                    <tr
                      key={holding.symbol}
                      className="border-b border-ink-100 last:border-b-0"
                    >
                      <td className="py-4 pr-6">
                        <div className="font-medium text-ink-900">
                          {holding.name}
                        </div>
                      </td>
                      <td className="py-4 pr-6">
                        {formatCurrency(holding.purchasePrice)}
                      </td>
                      <td className="py-4 pr-6">{holding.quantity}</td>
                      <td className="py-4 pr-6">
                        {formatCurrency(holding.investment)}
                      </td>
                      <td className="py-4 pr-6">
                        {formatPercent(holding.weight)}
                      </td>
                      <td className="py-4 pr-6 text-xs text-ink-600">
                        {holding.symbol} · {holding.exchange}
                      </td>
                      <td className="py-4 pr-6">
                        {formatCurrency(holding.cmp)}
                      </td>
                      <td className="py-4 pr-6">
                        {formatCurrency(holding.currentValue)}
                      </td>
                      <td
                        className={clsx(
                          "py-4 pr-6",
                          holding.gainLoss !== null && holding.gainLoss >= 0
                            ? "text-emerald-600"
                            : "text-rose-600"
                        )}
                      >
                        {holding.gainLoss !== null
                          ? `${formatCurrency(holding.gainLoss)} (${formatPercent(
                              holding.gainLossPct
                            )})`
                          : "—"}
                      </td>
                      <td className="py-4 pr-6">
                        {formatNumber(holding.peRatio)}
                      </td>
                      <td className="py-4 text-xs text-ink-700">
                        {holding.latestEarnings ?? "—"}
                      </td>
                    </tr>
                  ))}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PortfolioTable;
