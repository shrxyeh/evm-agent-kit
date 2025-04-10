import { ethers } from "ethers";
import { ValidationUtils } from "../utils/validation";
import { ChainInfo, SUPPORTED_CHAINS } from "../interfaces/config";

/**
 * Manages providers for different EVM chains
 */
export class ProviderManager {
  private providers: Map<number, ethers.JsonRpcProvider> = new Map();
  private signers: Map<number, ethers.Wallet> = new Map();
  private defaultChainId: number;

  /**
   * Creates a new ProviderManager instance
   * @param defaultRpcUrl The default RPC URL to use
   * @param privateKey Optional private key for signing transactions
   * @param defaultChainId Optional chain ID for the default provider
   */
  constructor(
    defaultRpcUrl: string,
    privateKey?: string,
    defaultChainId?: number
  ) {
    if (!ValidationUtils.isValidRpcUrl(defaultRpcUrl)) {
      throw new Error("Invalid RPC URL");
    }

    // Set default chain ID based on URL or parameter
    this.defaultChainId = defaultChainId || this.guessChainId(defaultRpcUrl);

    // Create default provider
    const provider = new ethers.JsonRpcProvider(defaultRpcUrl);
    this.providers.set(this.defaultChainId, provider);

    // If private key provided, create a signer
    if (privateKey) {
      if (!ValidationUtils.isValidPrivateKey(privateKey)) {
        throw new Error("Invalid private key");
      }

      const wallet = new ethers.Wallet(privateKey, provider);
      this.signers.set(this.defaultChainId, wallet);
    }
  }

  /**
   * Gets a provider for a specific chain
   * @param chainId The chain ID
   * @returns JsonRpcProvider for the specified chain
   */
  getProvider(chainId?: number): ethers.JsonRpcProvider {
    const id = chainId || this.defaultChainId;
    const provider = this.providers.get(id);

    if (!provider) {
      throw new Error(`Provider not found for chain ID ${id}`);
    }

    return provider;
  }

  /**
   * Gets a signer for a specific chain
   * @param chainId The chain ID
   * @returns Wallet for the specified chain
   */
  getSigner(chainId?: number): ethers.Wallet {
    const id = chainId || this.defaultChainId;
    const signer = this.signers.get(id);

    if (!signer) {
      throw new Error(
        `Signer not found for chain ID ${id}. Did you provide a private key?`
      );
    }

    return signer;
  }

  /**
   * Adds a new provider for a specific chain
   * @param rpcUrl The RPC URL for the chain
   * @param chainId The chain ID
   * @param privateKey Optional private key for signing transactions
   */
  addProvider(rpcUrl: string, chainId: number, privateKey?: string): void {
    if (!ValidationUtils.isValidRpcUrl(rpcUrl)) {
      throw new Error("Invalid RPC URL");
    }

    const provider = new ethers.JsonRpcProvider(rpcUrl);
    this.providers.set(chainId, provider);

    if (privateKey) {
      if (!ValidationUtils.isValidPrivateKey(privateKey)) {
        throw new Error("Invalid private key");
      }

      const wallet = new ethers.Wallet(privateKey, provider);
      this.signers.set(chainId, wallet);
    }
  }

  /**
   * Gets chain information for a specific chain ID
   * @param chainId The chain ID
   * @returns ChainInfo for the specified chain
   */
  getChainInfo(chainId: number): ChainInfo | undefined {
    return Object.values(SUPPORTED_CHAINS).find(
      (chain) => chain.id === chainId
    );
  }

  /**
   * Attempts to guess the chain ID from an RPC URL
   * @param rpcUrl The RPC URL
   * @returns The guessed chain ID or default to Ethereum Mainnet (1)
   */
  private guessChainId(rpcUrl: string): number {
    for (const chain of Object.values(SUPPORTED_CHAINS)) {
      if (
        chain.rpcUrls.some(
          (url) => rpcUrl.includes(url) || url.includes(rpcUrl)
        )
      ) {
        return chain.id;
      }
    }

    // Default to Ethereum Mainnet
    return 1;
  }
}
