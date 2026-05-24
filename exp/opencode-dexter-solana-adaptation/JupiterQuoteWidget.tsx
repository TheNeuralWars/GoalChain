import React, { useState } from 'react';

interface JupiterQuote {
  inputMint: string;
  outputMint: string;
  inAmount: string;
  outAmount: string;
  priceImpactPct: string;
  routePlan: string[];
}

interface QuoteResponse {
  success: boolean;
  quote?: JupiterQuote;
  error?: string;
}

export function JupiterQuoteWidget() {
  const [inputMint, setInputMint] = useState('So11111111111111111111111111111111111111112'); // SOL
  const [outputMint, setOutputMint] = useState('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'); // USDC
  const [amount, setAmount] = useState('1000000000'); // 1 SOL
  const [slippageBps, setSlippageBps] = useState('50');

  const [quote, setQuote] = useState<JupiterQuote | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchQuote = async () => {
    setLoading(true);
    setError(null);
    setQuote(null);

    try {
      const res = await fetch('/api/solana/jupiter/quote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          inputMint,
          outputMint,
          amount: Number(amount),
          slippageBps: Number(slippageBps),
        }),
      });

      const data: QuoteResponse = await res.json();

      if (!res.ok || !data.success) {
        setError(data.error || 'Failed to fetch quote');
        return;
      }

      if (data.quote) {
        setQuote(data.quote);
      }
    } catch (err: any) {
      setError(err.message || 'Network error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '600px', fontFamily: 'sans-serif' }}>
      <h2>Jupiter Quote</h2>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
        <label>
          Input Mint:
          <input
            type="text"
            value={inputMint}
            onChange={(e) => setInputMint(e.target.value)}
            style={{ width: '100%', padding: '8px', marginTop: '4px' }}
          />
        </label>

        <label>
          Output Mint:
          <input
            type="text"
            value={outputMint}
            onChange={(e) => setOutputMint(e.target.value)}
            style={{ width: '100%', padding: '8px', marginTop: '4px' }}
          />
        </label>

        <label>
          Amount (in smallest unit):
          <input
            type="text"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            style={{ width: '100%', padding: '8px', marginTop: '4px' }}
          />
        </label>

        <label>
          Slippage (bps):
          <input
            type="text"
            value={slippageBps}
            onChange={(e) => setSlippageBps(e.target.value)}
            style={{ width: '100%', padding: '8px', marginTop: '4px' }}
          />
        </label>

        <button
          onClick={fetchQuote}
          disabled={loading}
          style={{
            padding: '12px',
            background: '#0066ff',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: loading ? 'not-allowed' : 'pointer',
          }}
        >
          {loading ? 'Fetching quote...' : 'Get Quote'}
        </button>
      </div>

      {error && (
        <div style={{ color: 'red', marginBottom: '16px' }}>
          Error: {error}
        </div>
      )}

      {quote && (
        <div style={{ background: '#f5f5f5', padding: '16px', borderRadius: '8px' }}>
          <h3>Quote Result</h3>
          <pre style={{ fontSize: '13px', overflowX: 'auto' }}>
            {JSON.stringify(quote, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
