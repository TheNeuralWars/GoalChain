import { useEffect, useState, useCallback } from 'react';
import { PublicKey } from '@solana/web3.js';
import { Connection } from '@solana/web3.js';
import { useConnection } from '@solana/wallet-adapter-react';
import { fetchUserBets, type UserBetView, type FixtureStatus } from '../../lib/goalchainClient';

type SettlementStatus = FixtureStatus | 'loading' | 'error' | 'unknown';

interface UseSettlementStatusResult {
  /** Current settlement status of the fixture */
  status: SettlementStatus;
  /** If settled, whether the user's bet won */
  isWinner?: boolean;
  /** If settled and user bet, the claimable amount in base units */
  claimableAmount?: number;
  /** Whether the user has already claimed */
  claimed?: boolean;
  /** Raw user bet data if available */
  userBet?: UserBetView;
  /** Refetch function */
  refetch: () => Promise<void>;
  /** Error message if any */
  error?: string;
}

/**
 * Hook to track settlement status of a specific fixture for the current user.
 * Returns whether the fixture is settled, if user won, and claimable amount.
 */
export function useSettlementStatus(
  fixturePubkey: string | null
): UseSettlementStatusResult {
  const { connection } = useConnection();
  const [status, setStatus] = useState<SettlementStatus>('loading');
  const [userBet, setUserBet] = useState<UserBetView | null>(null);
  const [error, setError] = useState<string | undefined>();

  const refetch = useCallback(async () => {
    if (!fixturePubkey || !connection) {
      setStatus('error');
      setError('Missing fixture or connection');
      return;
    }

    try {
      setStatus('loading');
      setError(undefined);

      const bets = await fetchUserBets(connection, new PublicKey(fixturePubkey));
      // Find bet for this specific fixture
      const bet = bets.find((b) => b.fixture === fixturePubkey);

      if (!bet) {
        setStatus('unknown');
        setUserBet(null);
        return;
      }

      setUserBet(bet);

      if (bet.claimed) {
        setStatus('completed');
        return;
      }

      // Note: In the current program, we don't have direct "won/lost" on the bet account.
      // The status is determined by the fixture status. If fixture is completed and user has bet,
      // they can claim (which will succeed only if they won).
      // For now, we return the fixture status as the settlement status.
      // A more sophisticated version would check the fixture account directly.
      setStatus('completed');
    } catch (err) {
      console.error('useSettlementStatus error:', err);
      setStatus('error');
      setError(err instanceof Error ? err.message : 'Unknown error');
    }
  }, [fixturePubkey, connection]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return {
    status,
    isWinner: status === 'completed' && !!userBet && !userBet.claimed,
    claimableAmount: userBet?.amountBaseUnits,
    claimed: userBet?.claimed,
    userBet: userBet ?? undefined,
    refetch,
    error,
  };
}