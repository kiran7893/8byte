import { NextResponse } from "next/server";
import { getPortfolioSnapshot } from "@/app/lib/get-portfolio";

export const runtime = "nodejs";

export const GET = async () => {
  const snapshot = await getPortfolioSnapshot();
  return NextResponse.json(snapshot);
};
