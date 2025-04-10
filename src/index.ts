import { ProviderManager } from "./providers/ProviderManager";
import { Erc20Service } from "./erc20/ERC20Service";
import { EvmKitConfig } from "./interfaces/config";
import { ValidationUtils } from "./utils/validation";

/**
 * Main class for EVM Agent Kit
 */
export class EvmKit {
  private providerManager: ProviderManager;
  public erc20: Erc20Service;

  /**
   * Creates a new EvmKit instance
   * @param config Configuration object for EvmKit
   */
  constructor(config: EvmKitConfig) {
    // Validate RPC URL
    if (!ValidationUtils.isValidRpcUrl(config.rpcUrl)) {
      throw new Error("Invalid RPC URL");
    }

    // Create provider manager
    this.providerManager = new ProviderManager(
      config.rpcUrl,
      config.privateKey,
      config.chainId
    );

    // Initialize services
    this.erc20 = new Erc20Service(this.providerManager);
  }

  /**
   * Gets the provider manager instance
   * @returns ProviderManager instance
   */
  getProviderManager(): ProviderManager {
    return this.providerManager;
  }
}

// Export types
export * from "./interfaces/config";
export * from "./interfaces/erc20";

// Export utility functions
export * from "./utils/formatting";
export * from "./utils/validation";
