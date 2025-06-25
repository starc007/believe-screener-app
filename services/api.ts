/**
 * API Service for Believe Screener App
 * Handles all API calls to Jupiter's data API for launchpad statistics and token data
 */

export interface LaunchpadStats {
  launchpad: string;
  liquidity: number;
  stats5m: {
    volume: number;
    traders: number;
    marketShare: number;
    mints: number;
    graduates: number;
  };
  stats1h: {
    volume: number;
    traders: number;
    marketShare: number;
    mints: number;
    graduates: number;
  };
  stats6h: {
    volume: number;
    traders: number;
    marketShare: number;
    mints: number;
    graduates: number;
  };
  stats24h: {
    volume: number;
    traders: number;
    marketShare: number;
    mints: number;
    graduates: number;
  };
}

export interface TokenStats {
  priceChange: number;
  holderChange: number;
  liquidityChange: number;
  volumeChange: number;
  buyVolume: number;
  sellVolume: number;
  buyOrganicVolume: number;
  sellOrganicVolume: number;
  numBuys: number;
  numSells: number;
  numTraders: number;
  numOrganicBuyers: number;
  numNetBuyers: number;
}

export interface Token {
  id: string;
  chain: string;
  dex: string;
  type: string;
  quoteAsset: string;
  createdAt: string;
  liquidity: number;
  volume24h: number;
  updatedAt: string;
  baseAsset: {
    id: string;
    name: string;
    symbol: string;
    icon?: string;
    decimals: number;
    twitter?: string;
    dev: string;
    circSupply: number;
    totalSupply: number;
    tokenProgram: string;
    launchpad: string;
    partnerConfig: string;
    firstPool: {
      id: string;
      createdAt: string;
    };
    holderCount: number;
    audit: {
      mintAuthorityDisabled: boolean;
      freezeAuthorityDisabled: boolean;
      topHoldersPercentage: number;
      devMigrations: number;
    };
    organicScore: number;
    organicScoreLabel: string;
    tags: string[];
    graduatedPool?: string;
    graduatedAt?: string;
    fdv: number;
    mcap: number;
    usdPrice: number;
    priceBlockId?: string;
    volume24h?: number;
    liquidity?: number;
    stats5m: TokenStats;
    stats1h: TokenStats;
    stats6h: TokenStats;
    stats24h: TokenStats;
  };
}

export interface LaunchpadStatsResponse {
  launchpads: LaunchpadStats[];
}

export interface TokensResponse {
  tokens: Token[];
}

const BASE_URL = "https://datapi.jup.ag/v1";

/**
 * Fetches launchpad statistics from Jupiter API
 */
export const fetchLaunchpadStats =
  async (): Promise<LaunchpadStatsResponse> => {
    try {
      const response = await fetch(`${BASE_URL}/launchpads/stats`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching launchpad stats:", error);
      throw error;
    }
  };

/**
 * Fetches top traded tokens from Believe launchpad with time filter
 */
export const fetchBelieveTokens = async (
  timeframe: string = "24h"
): Promise<TokensResponse> => {
  try {
    const response = await fetch(
      `${BASE_URL}/pools/toptraded/${timeframe}?launchpads=Believe`
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    if (Array.isArray(data?.pools)) {
      return { tokens: data.pools };
    } else if (data.pools && Array.isArray(data.pools)) {
      return data;
    } else {
      console.log("Unexpected data structure:", Object.keys(data));
      return { tokens: [] };
    }
  } catch (error) {
    console.error("Error fetching Believe tokens:", error);
    throw error;
  }
};

/**
 * Formats number to human readable format (e.g., 1.2M, 3.4K)
 */
export const formatNumber = (num: number): string => {
  if (num >= 1000000000) {
    return (num / 1e9).toFixed(2) + "B";
  }
  if (num >= 1000000) {
    return (num / 1e6).toFixed(2) + "M";
  }
  if (num >= 1000) {
    return (num / 1e3).toFixed(2) + "K";
  }
  return num.toFixed(2);
};

/**
 * Formats currency to USD format
 */
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

/**
 * Formats large currency amounts in millions notation
 */
export const formatCurrencyMillions = (amount: number): string => {
  if (!amount) {
    return "$0.00";
  }

  if (amount >= 1e9) {
    return `$${(amount / 1e9).toFixed(2)}B`;
  }
  if (amount >= 1e6) {
    return `$${(amount / 1e6).toFixed(2)}M`;
  }
  if (amount >= 1e3) {
    return `$${(amount / 1e3).toFixed(2)}K`;
  }
  return `$${amount.toFixed(2)}`;
};

/**
 * Formats percentage with proper sign and color indication
 */
export const formatPercentage = (
  percentage: number
): { text: string; isPositive: boolean } => {
  const isPositive = percentage >= 0;
  const sign = isPositive ? "+" : "";
  return {
    text: `${sign}${percentage.toFixed(2)}%`,
    isPositive,
  };
};

/**
 * Calculates time ago from timestamp
 */
export const getTimeAgo = (timestamp: string): string => {
  const now = new Date();
  const past = new Date(timestamp);
  const diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return `${diffInSeconds}s ago`;
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes}m ago`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours}h ago`;
  }

  const diffInDays = Math.floor(diffInHours / 24);
  return `${diffInDays}d ago`;
};
