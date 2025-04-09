/**
 * Configuration interface for EVM Agent Kit
 */
export interface EvmKitConfig {
  /**
   * RPC URL for the EVM-compatible blockchain
   */
  rpcUrl: string;

  /**
   * Optional private key for signing transactions
   */
  privateKey?: string;

  /**
   * Optional chain ID to specify the network
   */
  chainId?: number;

  /**
   * Maximum gas price willing to pay (in Gwei)
   */
  maxGasPrice?: number;

  /**
   * Timeout for RPC requests in milliseconds
   */
  timeout?: number;
}

/**
 * Chain information
 */
export interface ChainInfo {
  id: number;
  name: string;
  currencySymbol: string;
  explorerUrl: string;
  rpcUrls: string[];
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
}

/**
 * Supported chains with their configurations
 */
export const SUPPORTED_CHAINS: Record<string, ChainInfo> = {
  ETHEREUM: {
    id: 1,
    name: "Ethereum Mainnet",
    currencySymbol: "ETH",
    explorerUrl: "https://etherscan.io",
    rpcUrls: [
      "https://mainnet.infura.io/v3/YOUR_INFURA_PROJECT_ID", // Replace with  Infura Project ID
      "https://eth-mainnet.public.blastapi.io",
    ],
    nativeCurrency: {
      name: "Ether",
      symbol: "ETH",
      decimals: 18,
    },
  },
  POLYGON: {
    id: 137,
    name: "Polygon Mainnet",
    currencySymbol: "MATIC",
    explorerUrl: "https://polygonscan.com",
    rpcUrls: ["https://polygon-rpc.com"],
    nativeCurrency: {
      name: "MATIC",
      symbol: "MATIC",
      decimals: 18,
    },
  },
  BSC: {
    id: 56,
    name: "Binance Smart Chain",
    currencySymbol: "BNB",
    explorerUrl: "https://bscscan.com",
    rpcUrls: ["https://bsc-dataseed.binance.org/"],
    nativeCurrency: {
      name: "BNB",
      symbol: "BNB",
      decimals: 18,
    },
  },
  BASE: {
    id: 8453,
    name: "Base Mainnet",
    currencySymbol: "ETH",
    explorerUrl: "https://basescan.org",
    rpcUrls: ["https://mainnet.base.org"],
    nativeCurrency: {
      name: "Ether",
      symbol: "ETH",
      decimals: 18,
    },
  },
};
