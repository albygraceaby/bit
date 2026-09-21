import { NextResponse } from "next/server";

export async function POST() {
  try {
    // Get Bitcoin market data
    const response = await fetch(
      "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd&include_24hr_change=true",
      {
        cache: "no-store",
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch market data");
    }

    const data = await response.json();

    const price = data.bitcoin.usd;
    const change24h = data.bitcoin.usd_24h_change;

    // --------------------------------
    // TRADING SIGNALS
    // --------------------------------

    let momentumScore = 0;
    let trendScore = 0;

    // Momentum
    if (change24h > 3) {
      momentumScore = 2;
    } else if (change24h > 0) {
      momentumScore = 1;
    } else if (change24h < -3) {
      momentumScore = -2;
    } else {
      momentumScore = -1;
    }

    // Trend
    if (change24h > 1) {
      trendScore = 1;
    } else if (change24h < -1) {
      trendScore = -1;
    }

    // --------------------------------
    // TOTAL SCORE
    // --------------------------------

    const totalScore =
      momentumScore + trendScore;

    let decision = "HOLD";
    let confidence = 50;
    let reason = "";

    // BUY
    if (totalScore >= 2) {
      decision = "BUY";

      confidence = Math.min(
        95,
        70 + totalScore * 5
      );

      reason =
        "Positive momentum and an upward trend were detected.";
    }

    // SELL
    else if (totalScore <= -2) {
      decision = "SELL";

      confidence = Math.min(
        95,
        70 + Math.abs(totalScore) * 5
      );

      reason =
        "Negative momentum and a downward trend were detected.";
    }

    // HOLD
    else {
      decision = "HOLD";

      confidence = 55;

      reason =
        "The market signals are mixed, so the agent is waiting for stronger confirmation.";
    }

    return NextResponse.json({
      success: true,

      asset: "Bitcoin",

      price: price,

      change24h: Number(
        change24h
      ).toFixed(2),

      momentumScore,

      trendScore,

      totalScore,

      decision,

      confidence,

      reason,
    });
  } catch (error) {
    console.error(
      "AI Agent Error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error:
          "Unable to analyze the market.",
      },
      {
        status: 500,
      }
    );
  }
}