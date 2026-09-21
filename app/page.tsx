"use client";

import { useEffect, useState } from "react";
import { ethers } from "ethers";

type Bot = {
  id: number;
  name: string;
  strategy: string;
  risk: string;
  amount: string;
  active: boolean;
};

export default function Home() {
  // Wallet
  const [account, setAccount] = useState<string | null>(null);
  const [balance, setBalance] = useState("0");

  // Bots
  const [bots, setBots] = useState<Bot[]>([]);

  // Create bot modal
  const [showCreate, setShowCreate] = useState(false);
  const [botName, setBotName] = useState("");
  const [strategy, setStrategy] = useState("AI Balanced");
  const [risk, setRisk] = useState("Medium");
  const [amount, setAmount] = useState("");

  // AI Agent
  const [decision, setDecision] = useState("WAITING");
  const [agentReason, setAgentReason] = useState(
    "Start an analysis to get an AI trading signal."
  );
  const [analyzing, setAnalyzing] = useState(false);

  // =========================
  // CONNECT WALLET
  // =========================

  async function connectWallet() {
    try {
      if (!window.ethereum) {
        alert("MetaMask was not detected.");
        return;
      }

      const provider = new ethers.BrowserProvider(
        window.ethereum
      );

      const accounts = await provider.send(
        "eth_requestAccounts",
        []
      );

      if (accounts.length > 0) {
        setAccount(accounts[0]);

        const balanceWei = await provider.getBalance(
          accounts[0]
        );

        const balanceEth = ethers.formatEther(balanceWei);

        setBalance(Number(balanceEth).toFixed(4));
      }
    } catch (error) {
      console.error("Wallet connection error:", error);
    }
  }

  // =========================
  // CREATE BOT
  // =========================

  function createBot() {
    if (!botName || !amount) {
      alert("Please enter bot name and trading amount.");
      return;
    }

    const newBot: Bot = {
      id: Date.now(),
      name: botName,
      strategy,
      risk,
      amount,
      active: false,
    };

    setBots((currentBots) => [
      ...currentBots,
      newBot,
    ]);

    setBotName("");
    setAmount("");
    setShowCreate(false);
  }

  // =========================
  // START / STOP BOT
  // =========================

  function toggleBot(id: number) {
    setBots((currentBots) =>
      currentBots.map((bot) =>
        bot.id === id
          ? {
              ...bot,
              active: !bot.active,
            }
          : bot
      )
    );
  }

  // =========================
  // AI MARKET ANALYSIS
  // =========================

  async function analyzeMarket() {
  try {
    setAnalyzing(true);

    setDecision("ANALYZING");

    setAgentReason(
      "AI agent is analyzing multiple market signals..."
    );

    const response = await fetch(
      "/api/agent",
      {
        method: "POST",
      }
    );

    const data = await response.json();

    if (!data.success) {
      throw new Error(
        "Agent analysis failed"
      );
    }

    setDecision(data.decision);

    setAgentReason(
      `${data.asset} price: $${Number(
        data.price
      ).toLocaleString()}. 24h change: ${
        data.change24h
      }%. Momentum score: ${
        data.momentumScore
      }. Trend score: ${
        data.trendScore
      }. Confidence: ${
        data.confidence
      }%. ${data.reason}`
    );
  } catch (error) {
    console.error(
      "AI Agent Error:",
      error
    );

    setDecision("ERROR");

    setAgentReason(
      "The AI agent could not analyze the market."
    );
  } finally {
    setAnalyzing(false);
  }
}

  // =========================
  // ACCOUNT CHANGE
  // =========================

  useEffect(() => {
    if (!window.ethereum) return;

    const handleAccountsChanged = (
      accounts: string[]
    ) => {
      if (accounts.length > 0) {
        setAccount(accounts[0]);
      } else {
        setAccount(null);
        setBalance("0");
      }
    };

    window.ethereum.on?.(
      "accountsChanged",
      handleAccountsChanged
    );

    return () => {
      window.ethereum.removeListener?.(
        "accountsChanged",
        handleAccountsChanged
      );
    };
  }, []);

  // =========================
  // DECISION STYLE
  // =========================

  function getDecisionStyle() {
    if (decision === "BUY") {
      return "text-green-400";
    }

    if (decision === "SELL") {
      return "text-red-400";
    }

    if (decision === "HOLD") {
      return "text-yellow-400";
    }

    if (decision === "ERROR") {
      return "text-red-400";
    }

    return "text-gray-400";
  }

  return (
    <main className="min-h-screen bg-black text-white">

      {/* ================= HEADER ================= */}

      <header className="flex items-center justify-between border-b border-gray-800 px-8 py-5">

        <div>
          <h1 className="text-2xl font-bold">
            AI Trading
          </h1>

          <p className="text-sm text-gray-500">
            Autonomous Trading Agents
          </p>
        </div>

        <button
          onClick={connectWallet}
          className="rounded-xl bg-white px-5 py-3 font-semibold text-black transition hover:bg-gray-200"
        >
          {account
            ? `${account.slice(
                0,
                6
              )}...${account.slice(-4)}`
            : "Connect Wallet"}
        </button>

      </header>

      {/* ================= MAIN ================= */}

      <section className="px-8 py-12">

        {/* TITLE */}

        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">

          <div>
            <h2 className="text-4xl font-bold">
              Your AI Trading Bots
            </h2>

            <p className="mt-2 text-gray-400">
              Deploy autonomous agents to manage
              your portfolio.
            </p>
          </div>

          <button
            onClick={() =>
              setShowCreate(true)
            }
            className="rounded-xl bg-white px-6 py-3 font-semibold text-black transition hover:bg-gray-200"
          >
            + Create Bot
          </button>

        </div>

        {/* ================= WALLET CARD ================= */}

        <div className="mt-10 rounded-2xl border border-gray-800 bg-gray-950 p-6">

          <p className="text-sm text-gray-500">
            CONNECTED WALLET
          </p>

          <h3 className="mt-2 text-xl font-semibold">
            {account
              ? `${account.slice(
                  0,
                  10
                )}...${account.slice(-8)}`
              : "Not connected"}
          </h3>

          <div className="mt-6">

            <p className="text-sm text-gray-500">
              ETH BALANCE
            </p>

            <h3 className="mt-1 text-4xl font-bold">
              {balance} ETH
            </h3>

          </div>

        </div>

        {/* ================= AI AGENT ================= */}

        <div className="mt-8 rounded-2xl border border-gray-800 bg-gray-950 p-6">

          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

            <div>

              <p className="text-sm text-gray-500">
                AI TRADING AGENT
              </p>

              <h3 className="mt-1 text-2xl font-bold">
                Market Analysis
              </h3>

            </div>

            <div
              className={`text-2xl font-bold ${getDecisionStyle()}`}
            >
              {decision}
            </div>

          </div>

          <div className="mt-5 rounded-xl border border-gray-800 bg-black p-5">

            <p className="text-gray-400">
              {agentReason}
            </p>

          </div>

          <button
            onClick={analyzeMarket}
            disabled={analyzing}
            className="mt-6 rounded-xl bg-white px-6 py-3 font-semibold text-black transition hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {analyzing
              ? "Analyzing Market..."
              : "Run AI Analysis"}
          </button>

        </div>

        {/* ================= BOTS ================= */}

        {bots.length === 0 ? (

          <div className="mt-8 rounded-2xl border border-dashed border-gray-700 p-12 text-center">

            <h3 className="text-2xl font-semibold">
              No trading bots yet
            </h3>

            <p className="mt-2 text-gray-500">
              Create your first AI trading agent.
            </p>

            <button
              onClick={() =>
                setShowCreate(true)
              }
              className="mt-6 rounded-xl bg-white px-6 py-3 font-semibold text-black transition hover:bg-gray-200"
            >
              Create Your First Bot
            </button>

          </div>

        ) : (

          <div className="mt-8 grid gap-6 md:grid-cols-3">

            {bots.map((bot) => (

              <div
                key={bot.id}
                className="rounded-2xl border border-gray-800 bg-gray-950 p-6"
              >

                <div className="flex items-center justify-between gap-3">

                  <h3 className="text-xl font-bold">
                    {bot.name}
                  </h3>

                  <span
                    className={
                      bot.active
                        ? "text-green-400"
                        : "text-gray-500"
                    }
                  >
                    {bot.active
                      ? "● Running"
                      : "● Stopped"}
                  </span>

                </div>

                <div className="mt-6 space-y-3 text-sm">

                  <p>
                    <span className="text-gray-500">
                      Strategy:
                    </span>{" "}
                    {bot.strategy}
                  </p>

                  <p>
                    <span className="text-gray-500">
                      Risk:
                    </span>{" "}
                    {bot.risk}
                  </p>

                  <p>
                    <span className="text-gray-500">
                      Trading Amount:
                    </span>{" "}
                    {bot.amount} ETH
                  </p>

                </div>

                <button
                  onClick={() =>
                    toggleBot(bot.id)
                  }
                  className="mt-6 w-full rounded-xl border border-gray-700 px-4 py-3 transition hover:bg-gray-900"
                >
                  {bot.active
                    ? "Stop Bot"
                    : "Start Bot"}
                </button>

              </div>

            ))}

          </div>

        )}

      </section>

      {/* ================= CREATE BOT MODAL ================= */}

      {showCreate && (

        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">

          <div className="w-full max-w-md rounded-2xl border border-gray-800 bg-gray-950 p-8">

            {/* MODAL HEADER */}

            <div className="flex items-center justify-between">

              <h2 className="text-2xl font-bold">
                Create AI Trading Bot
              </h2>

              <button
                onClick={() =>
                  setShowCreate(false)
                }
                className="text-xl text-gray-500 transition hover:text-white"
              >
                ✕
              </button>

            </div>

            {/* BOT NAME */}

            <label className="mt-6 block text-sm text-gray-400">
              Bot Name
            </label>

            <input
              value={botName}
              onChange={(e) =>
                setBotName(e.target.value)
              }
              placeholder="My Trading Bot"
              className="mt-2 w-full rounded-xl border border-gray-700 bg-black px-4 py-3 outline-none focus:border-gray-400"
            />

            {/* STRATEGY */}

            <label className="mt-5 block text-sm text-gray-400">
              Strategy
            </label>

            <select
              value={strategy}
              onChange={(e) =>
                setStrategy(e.target.value)
              }
              className="mt-2 w-full rounded-xl border border-gray-700 bg-black px-4 py-3"
            >
              <option>
                AI Conservative
              </option>

              <option>
                AI Balanced
              </option>

              <option>
                AI Aggressive
              </option>

              <option>
                Momentum Trading
              </option>
            </select>

            {/* RISK */}

            <label className="mt-5 block text-sm text-gray-400">
              Risk Level
            </label>

            <select
              value={risk}
              onChange={(e) =>
                setRisk(e.target.value)
              }
              className="mt-2 w-full rounded-xl border border-gray-700 bg-black px-4 py-3"
            >
              <option>Low</option>

              <option>Medium</option>

              <option>High</option>
            </select>

            {/* AMOUNT */}

            <label className="mt-5 block text-sm text-gray-400">
              Trading Amount (ETH)
            </label>

            <input
              value={amount}
              onChange={(e) =>
                setAmount(e.target.value)
              }
              placeholder="0.01"
              type="number"
              min="0"
              step="0.001"
              className="mt-2 w-full rounded-xl border border-gray-700 bg-black px-4 py-3 outline-none focus:border-gray-400"
            />

            {/* CREATE BUTTON */}

            <button
              onClick={createBot}
              className="mt-7 w-full rounded-xl bg-white px-5 py-3 font-semibold text-black transition hover:bg-gray-200"
            >
              Create Bot
            </button>

          </div>

        </div>

      )}

    </main>
  );
}