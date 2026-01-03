import { Holding } from "./types";

type JsonRow = {
  [key: string]: string | number | null;
};

/**
 * Parse data.json file to extract holdings with sector information
 */
export function parsePortfolioData(jsonData: JsonRow[]): Holding[] {
  const holdings: Holding[] = [];
  let currentSector: string | null = null;
  let rowIndex = 0;

  // Skip header row (first row with Column1: "No")
  const dataRows = jsonData.slice(1).filter((row) => row !== null);

  for (const row of dataRows) {
    rowIndex++;

    // Check if this is a sector row
    // Sector rows have Column2 matching sector patterns and no Column1 (or Column1 is not a number)
    const column2 = row.Column2;
    const column1 = row.Column1;

    if (
      typeof column2 === "string" &&
      (column2.includes("Sector") ||
        column2 === "Power" ||
        column2 === "Consumer " ||
        column2 === "Others")
    ) {
      // This is a sector row - update current sector
      currentSector = column2.trim();
      continue;
    }

    // Skip rows that are not stock entries
    // Stock entries have Column1 as a number and Column2 as a stock name
    if (
      typeof column1 !== "number" ||
      !column2 ||
      typeof column2 !== "string" ||
      column2.trim() === ""
    ) {
      continue;
    }

    // Check if this is a sold position (Column35 has "Exit", "Must exit", etc.)
    const column35 = row.Column35;
    if (
      typeof column35 === "string" &&
      (column35.toLowerCase().includes("exit") ||
        column35.toLowerCase() === "sold")
    ) {
      // Skip sold positions for now, or handle them separately if needed
      continue;
    }

    // Extract stock data
    const purchasePrice = typeof row.Column3 === "number" ? row.Column3 : null;
    const quantity = typeof row.Column4 === "number" ? row.Column4 : null;
    const exchangeCode = row.Column7;

    // Skip if essential data is missing
    if (!purchasePrice || !quantity || !exchangeCode) {
      continue;
    }

    // Extract fallback financial metrics from data.json
    const fallbackCmp =
      typeof row.Column8 === "number" ? row.Column8 : null;
    const fallbackPeRatio =
      typeof row.Column13 === "number" ? row.Column13 : null;
    const fallbackEarnings =
      typeof row.Column14 === "number"
        ? row.Column14.toString()
        : typeof row.Column14 === "string"
          ? row.Column14
          : null;

    // Determine exchange symbol
    // Column7 can be:
    // - NSE code as string (e.g., "HDFCBANK", "DMART")
    // - BSE code as number (e.g., 532174, 500400)
    let symbol: string;
    let exchange: string;

    if (typeof exchangeCode === "string" && exchangeCode.length > 0) {
      // NSE code (text)
      symbol = exchangeCode.toUpperCase();
      exchange = "NSE";
    } else if (typeof exchangeCode === "number") {
      // BSE code (numeric)
      symbol = exchangeCode.toString();
      exchange = "BSE";
    } else {
      continue; // Skip if we can't determine the exchange
    }

    // Create holding
    const holding: Holding = {
      symbol,
      name: column2.trim(),
      purchasePrice,
      quantity,
      exchange,
      sector: currentSector || "Unknown",
      fallbackCmp,
      fallbackPeRatio,
      fallbackEarnings
    };

    holdings.push(holding);
  }

  return holdings;
}

/**
 * Load and parse portfolio data from data.json
 * Import JSON directly for Vercel/serverless compatibility
 */
export async function loadPortfolioData(): Promise<Holding[]> {
  try {
    // Import JSON file directly - Next.js will bundle it at build time
    // This works in both local dev and Vercel/serverless environments
    // Using relative path from app/lib to root data.json
    const jsonData: JsonRow[] = await import("../../data.json").then(
      (module) => (module.default as JsonRow[]) || (module as JsonRow[])
    );
    return parsePortfolioData(jsonData);
  } catch (error) {
    console.error("Error loading portfolio data:", error);
    // Fallback: try file system read for local development
    try {
      const fs = await import("fs/promises");
      const path = await import("path");
      const filePath = path.join(process.cwd(), "data.json");
      const fileContents = await fs.readFile(filePath, "utf-8");
      const jsonData: JsonRow[] = JSON.parse(fileContents);
      return parsePortfolioData(jsonData);
    } catch (fsError) {
      console.error("Fallback file system read also failed:", fsError);
      return [];
    }
  }
}

