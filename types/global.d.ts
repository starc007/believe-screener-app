export declare global {
  type TimeFrame = "5m" | "1h" | "6h" | "24h";
  type ChartTimeFrame = "1_HOUR" | "4_HOUR" | "12_HOUR";

  interface TokenStats {
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
      isVerified: boolean;
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
      cexes: string[];
    };
  }
}
