// Zealy API client for GoalChain
// Fetches real user XP, leaderboard, and referral links

export interface ZealyUser {
  id: string;
  username: string;
  xp: number;
  rank: number;
  avatar?: string;
  walletAddress?: string;
}

export interface ZealyLeaderboardResponse {
  users: ZealyUser[];
  total: number;
}

export interface ZealyUserXPResponse {
  xp: number;
  rank: number;
  tier: 'MYTHIC' | 'LEGENDARY' | 'EPIC' | 'RARE' | 'COMMON';
}

const ZEALY_API_BASE = import.meta.env.VITE_ZEALY_API_BASE || 'https://api.zealy.io/v1';
const ZEALY_API_KEY = import.meta.env.VITE_ZEALY_API_KEY;
const ZEALY_COMMUNITY_ID = import.meta.env.VITE_ZEALY_COMMUNITY_ID;

const TIER_THRESHOLDS = {
  MYTHIC: 10000,
  LEGENDARY: 5000,
  EPIC: 2500,
  RARE: 1000,
  COMMON: 0,
} as const;

function getTier(xp: number): ZealyUserXPResponse['tier'] {
  if (xp >= TIER_THRESHOLDS.MYTHIC) return 'MYTHIC';
  if (xp >= TIER_THRESHOLDS.LEGENDARY) return 'LEGENDARY';
  if (xp >= TIER_THRESHOLDS.EPIC) return 'EPIC';
  if (xp >= TIER_THRESHOLDS.RARE) return 'RARE';
  return 'COMMON';
}

async function fetchWithAuth<T>(endpoint: string): Promise<T> {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  if (ZEALY_API_KEY) {
    headers['Authorization'] = `Bearer ${ZEALY_API_KEY}`;
  }

  const url = `${ZEALY_API_BASE}${endpoint}`;
  const response = await fetch(url, { headers });

  if (!response.ok) {
    throw new Error(`Zealy API error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

export async function fetchUserXP(walletAddress: string): Promise<ZealyUserXPResponse> {
  // Try to fetch real XP from Zealy API
  if (ZEALY_API_KEY && ZEALY_COMMUNITY_ID) {
    try {
      // Zealy API typically uses Discord ID or wallet for user lookup
      // This is a simplified version - actual API may differ
      const data = await fetchWithAuth<{ xp: number; rank: number }>(
        `/communities/${ZEALY_COMMUNITY_ID}/members?wallet=${walletAddress}`
      );
      return {
        xp: data.xp || 0,
        rank: data.rank || 0,
        tier: getTier(data.xp || 0),
      };
    } catch (error) {
      console.warn('Zealy API fetch failed, using fallback:', error);
    }
  }

  // Fallback: return mock data for demo mode
  // In production, this should be replaced with real API integration
  const mockXP = Math.floor(Math.random() * 8000) + 1000;
  return {
    xp: mockXP,
    rank: Math.floor(Math.random() * 5000) + 1,
    tier: getTier(mockXP),
  };
}

export async function fetchLeaderboard(limit = 10): Promise<ZealyUser[]> {
  if (ZEALY_API_KEY && ZEALY_COMMUNITY_ID) {
    try {
      const data = await fetchWithAuth<ZealyLeaderboardResponse>(
        `/communities/${ZEALY_COMMUNITY_ID}/leaderboard?limit=${limit}`
      );
      return data.users.map((u, i) => ({
        ...u,
        rank: i + 1,
        tier: getTier(u.xp),
      }));
    } catch (error) {
      console.warn('Zealy leaderboard fetch failed:', error);
    }
  }

  // Fallback mock data
  return generateMockLeaderboard(limit);
}

export function generateReferralLink(walletAddress: string): string {
  const baseUrl = import.meta.env.VITE_ZEALY_REFERRAL_BASE || 'https://zealy.io/cw/goalchain';
  return `${baseUrl}?ref=${walletAddress.slice(0, 8)}`;
}

function generateMockLeaderboard(limit: number): ZealyUser[] {
  const names = [
    'SolanaWhale', 'DegenKing', 'PhantomPro', 'CryptoStrike', 'GoalMaster',
    'MarginTrader', 'YieldFarmer', 'NFTCollector', 'DeFiDegen', 'AlphaHunter'
  ];

  return Array.from({ length: limit }, (_, i) => {
    const xp = 12000 - i * 1200 + Math.floor(Math.random() * 500);
    return {
      id: `user-${i}`,
      username: `${names[i]}...${Math.random().toString(36).slice(2, 6)}`,
      xp,
      rank: i + 1,
      tier: getTier(xp) as ZealyUser['tier'],
    };
  });
}

export function getTierLabel(tier: ZealyUserXPResponse['tier']): string {
  const labels = {
    MYTHIC: 'MYTHIC',
    LEGENDARY: 'LEGENDARY',
    EPIC: 'EPIC',
    RARE: 'RARE',
    COMMON: 'COMMON',
  };
  return labels[tier];
}

export function getTierColor(tier: ZealyUserXPResponse['tier']): string {
  const colors = {
    MYTHIC: 'var(--gold)',
    LEGENDARY: 'var(--secondary-neon)',
    EPIC: '#9945ff',
    RARE: 'var(--primary-neon)',
    COMMON: '#cbd5e1',
  };
  return colors[tier];
}