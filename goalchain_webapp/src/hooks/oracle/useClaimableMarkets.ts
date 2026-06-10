import { useEffect, useState, useCallback } from 'react';
import { PublicKey } from '@solana/web3.js';
import { Connection } from '@solana/web3.js';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { fetchFixtures, fetchUserBets, type FixtureView, type UserBetView } from '../../lib/goalchainClient';

interface ClaimableMarket {
  fixture: FixtureView;
  userBet: UserBetView;
  /** Estimated claimable amount (simplified - actual amount depends on pool split) */
  estimatedClaimAmount: number;
}

interface UseClaimableMarketsResult {
  /** Markets where user has unclaimed winning bets */
  claimableMarkets: ClaimableMarket[];
  /** All fixtures with user bets (for UI tabs) */
  allUserMarkets: Array<{ fixture: FixtureView; userBet: UserBetView }>;
  /** Loading state */
  loading: boolean;
  /** Error message if any */
  error?: string;
  /** Refetch function */
  refetch: () => Promise<void>;
}

/**
 * Hook to fetch all claimable markets (fixtures) for the current user.
 * Returns markets where the fixture is completed and user has an unclaimed bet.
 */
export function useClaimableMarkets(): UseClaimableMarketsResult {
  const { connection } = useConnection();
  const wallet = useWallet();
  const [claimableMarkets, setClaimableMarkets] = useState<ClaimableMarket[]>([]);
  const [allUserMarkets, setAllUserMarkets] = useState<
    Array<{ fixture: FixtureView; userBet: UserBetView }>
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | undefined>();

  const refetch = useCallback(async () => {
    if (!connection || !wallet.publicKey) {
      setClaimableMarkets([]);
      setAllUserMarkets([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(undefined);

      const [fixtures, userBets] = await Promise.all([
        fetchFixtures(connection),
        fetchUserBets(connection, wallet.publicKey),
      ]);

      // Build map of fixtures by pubkey for quick lookup
      const fixtureMap = new Map(fixtures.map((f) => [f.pubkey, f]));

      const userMarkets = userBets
        .map((bet) => ({
          fixture: fixtureMap.get(bet.fixture),
          userBet: bet,
        }))
        .filter((m): m is { fixture: FixtureView; userBet: UserBetView } => !!m.fixture);

      setAllUserMarkets(userMarkets);

      // Filter for claimable: completed fixtures with unclaimed bets
      const claimable = userMarkets
        .filter((m) => m.fixture.status === 'completed' && !m.userBet.claimed)
        .map((m) => ({
          fixture: m.fixture,
          userBet: m.userBet,
          // Simplified estimation - actual payout depends on pool distribution
          estimatedClaimAmount: m.userBet.amountBaseUnits,
        }));

      setClaimableMarkets(claimable);
    } catch (err) {
      console.error('useClaimableMarkets error:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      setClaimableMarkets([]);
      setAllUserMarkets([]);
    } finally {
      setLoading(false);
    }
  }, [connection, wallet.publicKey]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return {
    claimableMarkets,
    allUserMarkets,
    loading,
    error,
    refetch,
  };
}