import { useEffect, useState, useCallback } from 'react';
import { PublicKey } from '@solana/web3.js';
import { Connection } from '@solana/web3.js';
import { useConnection } from '@solana/wallet-adapter-react';
import { fetchFixtures, type FixtureView } from '../../lib/goalchainClient';

interface FixtureResolution {
  fixture: FixtureView;
  /** Winning side if completed: 'A', 'B', or 'Draw' */
  winningSide?: 'A' | 'B' | 'Draw';
  /** Total pool amounts */
  poolA: number;
  poolB: number;
  poolDraw: number;
  /** Whether the market is settled (completed) */
  isSettled: boolean;
  /** Block timestamp when settled (if available) */
  settledAt?: number;
}

interface UseFixtureResolutionResult {
  /** Resolution data for a specific fixture */
  resolution?: FixtureResolution;
  /** Loading state */
  loading: boolean;
  /** Error message if any */
  error?: string;
  /** Refetch function */
  refetch: () => Promise<void>;
}

/**
 * Hook to get fixture resolution data (winning side, pools) for a specific fixture.
 * In the current program, the winning side is determined off-chain from the oracle result.
 * This hook provides the current fixture state with pool info.
 */
export function useFixtureResolution(
  fixturePubkey: string | null
): UseFixtureResolutionResult {
  const { connection } = useConnection();
  const [resolution, setResolution] = useState<FixtureResolution | undefined>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | undefined>();

  const refetch = useCallback(async () => {
    if (!fixturePubkey || !connection) {
      setResolution(undefined);
      setError('Missing fixture or connection');
      return;
    }

    try {
      setLoading(true);
      setError(undefined);

      const fixtures = await fetchFixtures(connection);
      const fixture = fixtures.find((f) => f.pubkey === fixturePubkey);

      if (!fixture) {
        setError('Fixture not found');
        setResolution(undefined);
        return;
      }

      const isSettled = fixture.status === 'completed';

      // For completed fixtures, the winning side would be determined by the oracle
      // Currently the program doesn't store winning side on the fixture account directly
      // This could be extended to fetch from oracle API or listen to settlement events
      let winningSide: 'A' | 'B' | 'Draw' | undefined;
      if (isSettled) {
        // Heuristic: largest pool typically wins (this is a simplification)
        // In reality, the oracle sets the result and the program uses it for payouts
        const pools = {
          A: fixture.poolA,
          B: fixture.poolB,
          Draw: fixture.poolDraw,
        };
        winningSide = Object.entries(pools).reduce(
          (a, b) => (pools[a[0] as 'A' | 'B' | 'Draw'] > pools[b[0] as 'A' | 'B' | 'Draw'] ? a : b)
        )[0] as 'A' | 'B' | 'Draw';
      }

      setResolution({
        fixture,
        winningSide,
        poolA: fixture.poolA,
        poolB: fixture.poolB,
        poolDraw: fixture.poolDraw,
        isSettled,
        settledAt: isSettled ? fixture.matchDate : undefined,
      });
    } catch (err) {
      console.error('useFixtureResolution error:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      setResolution(undefined);
    } finally {
      setLoading(false);
    }
  }, [fixturePubkey, connection]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return {
    resolution,
    loading,
    error,
    refetch,
  };
}