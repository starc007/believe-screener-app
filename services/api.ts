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

export interface ChartCandle {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface ChartData {
  candles: ChartCandle[];
}

export type ChartInterval = "1_HOUR" | "4_HOUR" | "12_HOUR";

export interface LaunchpadStatsResponse {
  launchpads: LaunchpadStats[];
}

export interface TokensResponse {
  tokens: Token[];
}

export interface TokenDetailResponse {
  pools: Token[];
  total: number;
}

const BASE_URL = "https://datapi.jup.ag/v1";
const CHART_BASE_URL = "https://datapi.jup.ag/v2";

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
    const url = `${BASE_URL}/pools/toptraded/${timeframe}?launchpads=Believe`;
    const response = await fetch(url);

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
 * Fetches detailed token information by asset ID
 */
export const fetchTokenDetail = async (
  assetId: string
): Promise<Token | null> => {
  try {
    const url = `${BASE_URL}/pools?assetIds=${assetId}`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: TokenDetailResponse = await response.json();
    return data.pools && data.pools.length > 0 ? data.pools[0] : null;
  } catch (error) {
    console.error("Error fetching token details:", error);
    throw error;
  }
};

/**
 * Fetches chart data for a token
 */
export const fetchTokenChart = async (
  assetId: string,
  interval: ChartInterval = "4_HOUR",
  candles: number = 300
): Promise<ChartData> => {
  try {
    const to = Date.now();
    const url = `${CHART_BASE_URL}/charts/${assetId}?interval=${interval}&to=${to}&candles=${candles}&type=price`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: ChartData = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching token chart:", error);
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

/**
 * Formats address for display (shortens middle part)
 */
export const formatAddress = (address: string): string => {
  if (!address) return "";
  if (address.length <= 10) return address;
  return `${address.slice(0, 4)}...${address.slice(-4)}`;
};
