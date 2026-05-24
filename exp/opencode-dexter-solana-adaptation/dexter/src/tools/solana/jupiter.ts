import { DynamicStructuredTool } from '@langchain/core/tools';
import { z } from 'zod';

/**
 * Jupiter Swap Tool (Solana)
 * 
 * This is a minimal adapter to enable Dexter to interact with Jupiter DEX on Solana.
 * For production use, this would need:
 * - Real wallet/signer integration
 * - Transaction building and signing
 * - Slippage protection
 * - Confirmation polling
 */

const JupiterQuoteInputSchema = z.object({
  inputMint: z.string().describe("Input token mint address (e.g. SOL mint or USDC mint)"),
  outputMint: z.string().describe("Output token mint address"),
  amount: z.number().describe("Amount of input token (in smallest unit, e.g. lamports for SOL)"),
  slippageBps: z.number().default(50).describe("Slippage tolerance in basis points (default 50 = 0.5%)"),
});

export const jupiterGetQuote = new DynamicStructuredTool({
  name: 'jupiter_get_quote',
  description: `Gets a swap quote from Jupiter DEX on Solana. Returns route, expected output amount, and price impact.`,
  schema: JupiterQuoteInputSchema,
  func: async (input) => {
    const params = new URLSearchParams({
      inputMint: input.inputMint,
      outputMint: input.outputMint,
      amount: input.amount.toString(),
      slippageBps: input.slippageBps.toString(),
    });

    const url = `https://quote-api.jup.ag/v6/quote?${params.toString()}`;
    
    try {
      const response = await fetch(url);
      const data = await response.json();
      
      if (!response.ok) {
        return `Error fetching Jupiter quote: ${data.error || 'Unknown error'}`;
      }

      return JSON.stringify({
        inputMint: data.inputMint,
        outputMint: data.outputMint,
        inAmount: data.inAmount,
        outAmount: data.outAmount,
        priceImpactPct: data.priceImpactPct,
        routePlan: data.routePlan?.map((r: any) => r.swapInfo?.label).filter(Boolean),
        url,
      }, null, 2);
    } catch (error) {
      return `Failed to fetch Jupiter quote: ${error}`;
    }
  },
});

export const jupiterTools = [
  jupiterGetQuote,
];
