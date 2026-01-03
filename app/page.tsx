"use client";

import { useEffect, useState } from "react";
import PortfolioTable from "@/app/components/PortfolioTable";
import StatCard from "@/app/components/StatCard";
import { formatCurrency, formatDateTime, formatPercent } from "@/app/lib/format";
import { PortfolioSnapshot } from "@/app/lib/types";

const DashboardPage = () => {
  const [snapshot, setSnapshot] = useState<PortfolioSnapshot | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSnapshot = async () => {
    try {
      const response = await fetch("/api/portfolio");
      if (!response.ok) {
        throw new Error(`Failed to fetch: ${response.status}`);
      }
      const data: PortfolioSnapshot = await response.json();
      setSnapshot(data);
      setError(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      setError(errorMessage);
      console.error("Error fetching portfolio snapshot:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Initial fetch
    fetchSnapshot();

    // Set up polling every 15 seconds
    const interval = setInterval(() => {
      fetchSnapshot();
    }, 15000);

    // Cleanup interval on unmount
    return () => clearInterval(interval);
  }, []);

  if (isLoading && !snapshot) {
    return (
      <main className="mx-auto max-w-6xl px-2 py-12">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent"></div>
            <p className="mt-4 text-ink-600">Loading portfolio data...</p>
          </div>
        </div>
      </main>
    );
  }

  if (error && !snapshot) {
    return (
      <main className="mx-auto max-w-6xl px-2 py-12">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <p className="text-rose-600">Error: {error}</p>
            <button
              onClick={fetchSnapshot}
              className="mt-4 px-4 py-2 bg-ink-900 text-white rounded-lg hover:bg-ink-800"
            >
              Retry
            </button>
          </div>
        </div>
      </main>
    );
  }

  // Use last known snapshot if available, even if there's an error
  if (!snapshot) {
    return null;
  }

  const topPerformer = [...snapshot.holdings]
    .filter((holding) => holding.gainLossPct !== null)
    .sort((a, b) => (b.gainLossPct ?? 0) - (a.gainLossPct ?? 0))[0];

  return (
    <main className="mx-auto max-w-6xl px-2 py-12">
      <section className="grid gap-10 lg:grid-cols-[1fr_1fr]">
        <div className="animate-rise">
          <p className="text-xs uppercase tracking-[0.3em] text-ink-600">
            Dynamic Portfolio Intelligence
          </p>
          <h1 className="mt-4 font-display text-4xl font-semibold text-ink-900 sm:text-5xl">
            Portfolio Dashboard for Real-Time Investment Decisions
          </h1>
          <p className="mt-4 max-w-xl text-sm text-ink-600">
            Track position sizing, portfolio weights, and valuation metrics in one
            place. Market pricing is pulled from unofficial Yahoo Finance endpoints
            while P/E ratios and earnings are scraped from Google Finance.
          </p>
          <div className="mt-6 flex flex-wrap gap-3 text-xs uppercase tracking-[0.2em] text-ink-600">
            <span className="rounded-full border border-ink-200 bg-white/60 px-4 py-2">
              Yahoo Finance CMP
            </span>
            <span className="rounded-full border border-ink-200 bg-white/60 px-4 py-2">
              Google Finance P/E + Earnings
            </span>
            <span className="rounded-full border border-ink-200 bg-white/60 px-4 py-2">
              Node.js Data Pipeline
            </span>
          </div>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 sm:gap-6">
          <StatCard
            label="Total Investment"
            value={formatCurrency(snapshot.totals.investment)}
            subtext={`As of ${formatDateTime(snapshot.asOf)}`}
          />
          <StatCard
            label="Current Value"
            value={formatCurrency(snapshot.totals.currentValue)}
            subtext="Live CMP based valuation"
          />
          <StatCard
            label="Total Gain/Loss"
            value={formatCurrency(snapshot.totals.gainLoss)}
            subtext={
              snapshot.totals.gainLossPct !== null
                ? formatPercent(snapshot.totals.gainLossPct)
                : "Awaiting live prices"
            }
            tone={
              snapshot.totals.gainLoss !== null && snapshot.totals.gainLoss >= 0
                ? "positive"
                : "negative"
            }
          />
          <StatCard
            label="Top Performer"
            value={topPerformer ? topPerformer.name : "—"}
            subtext={
              topPerformer && topPerformer.gainLossPct !== null
                ? `${formatPercent(topPerformer.gainLossPct)} lift`
                : "Awaiting earnings data"
            }
          />
        </div>
      </section>

      <section className="mt-12">
        <PortfolioTable snapshot={snapshot} />
      </section>

      <section className="mt-10 grid gap-4 lg:grid-cols-[1fr_1fr]">
        <div className="glass-panel rounded-3xl p-6 shadow-card">
          <h3 className="font-display text-xl font-semibold text-ink-900">
            Data Processing Flow
          </h3>
          <p className="mt-3 text-xs text-ink-600">
            Each holding is enriched server-side by combining CMP from Yahoo Finance
            with valuation metrics scraped from Google Finance. The pipeline
            calculates investment, weight, and gain/loss to keep the dashboard
            actionable.
          </p>
        </div>
        <div className="glass-panel rounded-3xl p-6 shadow-card">
          <h3 className="font-display text-xl font-semibold text-ink-900">
            API Caveats
          </h3>
          <p className="mt-3 text-xs text-ink-600">
            Yahoo and Google Finance do not provide official public APIs. This demo
            uses unofficial endpoints and HTML parsing, and falls back to seeded
            data if remote calls fail.
          </p>
        </div>
      </section>
    </main>
  );
};

export default DashboardPage;
