import { ethers } from "ethers";
import { ProviderManager } from "../providers/ProviderManager.js";
import { Erc20BatchBalanceParams } from "../interfaces/erc20";

// Multicall2 ABI - This allows us to batch multiple calls into a single RPC request
const MULTICALL2_ABI = [
  "function aggregate(tuple(address target, bytes callData)[] calls) view returns (uint256 blockNumber, bytes[] returnData)",
  "function tryAggregate(bool requireSuccess, tuple(address target, bytes callData)[] calls) view returns (tuple(bool success, bytes returnData)[])",
];

// Multicall2 addresses on different chains
const MULTICALL2_ADDRESSES: Record<number, string> = {
  1: "0x5BA1e12693Dc8F9c48aAD8770482f4739bEeD696", // Ethereum Mainnet
  137: "0x275617327c958bD06b5D6b871E7f491D76113dd8", // Polygon
  56: "0xa9193376D09C7f31283C54e56D013fCF370Cd9D9", // BSC
  8453: "0xcA11bde05977b3631167028862bE2a173976CA11", // Base
  10: "0xcA11bde05977b3631167028862bE2a173976CA11", // Optimism
  42161: "0xcA11bde05977b3631167028862bE2a173976CA11", // Arbitrum
};

//ERC20 interface for balanceOf function
const ERC20_BALANCE_ABI = [
  "function balanceOf(address owner) view returns (uint256)",
];

/**
 * Service for batching multiple calls into a single RPC request
 */
export class MulticallService {
  private providerManager: ProviderManager;

  /**
   * Creates a new MulticallService instance
   * @param providerManager ProviderManager instance
   */
  constructor(providerManager: ProviderManager) {
    this.providerManager = providerManager;
  }

  /**
   * Gets the multicall contract address for a specific chain
   * @param chainId The chain ID
   * @returns Multicall2 contract address
   */
  private getMulticallAddress(chainId: number): string {
    const address = MULTICALL2_ADDRESSES[chainId];
    if (!address) {
      throw new Error(`Multicall2 address not found for chain ID ${chainId}`);
    }
    return address;
  }

  /**
   * Batches multiple ERC20 balance checks into a single RPC call
   * @param params Parameters for batch balance check
   * @param chainId The chain ID
   * @returns Map of token addresses to balances
   */
  async getErc20BatchBalances(
    params: Erc20BatchBalanceParams,
    chainId: number = 1
  ): Promise<Map<string, string>> {
    const { ownerAddress, tokenAddresses } = params;

    // Get provider and multicall contract
    const provider = this.providerManager.getProvider(chainId);
    const multicall = new ethers.Contract(
      this.getMulticallAddress(chainId),
      MULTICALL2_ABI,
      provider
    );

    // ERC20 interface for encoding calls
    const erc20Interface = new ethers.Interface(ERC20_BALANCE_ABI);

    // Prepare calls array for multicall
    const calls = tokenAddresses.map((tokenAddress) => ({
      target: tokenAddress,
      callData: erc20Interface.encodeFunctionData("balanceOf", [ownerAddress]),
    }));

    try {
      // Execute multicall
      const [blockNumber, returnData] = await multicall.aggregate(calls);

      // Process results
      const balances = new Map<string, string>();
      for (let i = 0; i < tokenAddresses.length; i++) {
        const balance = ethers.AbiCoder.defaultAbiCoder().decode(
          ["uint256"],
          returnData[i]
        )[0];
        balances.set(tokenAddresses[i], balance.toString());
      }

      return balances;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to get batch balances: ${error.message}`);
      } else {
        throw new Error("Failed to get batch balances: Unknown error occurred");
      }
    }
  }

  /**
   * General purpose method to batch any contract calls
   * @param calls Array of calls with target address and encoded calldata
   * @param chainId The chain ID
   * @param requireSuccess Whether to require all calls to succeed
   * @returns Array of results
   */
  async batchCalls(
    calls: { target: string; callData: string }[],
    chainId: number = 1,
    requireSuccess: boolean = false
  ): Promise<{ success: boolean; returnData: string }[]> {
    // Get provider and multicall contract
    const provider = this.providerManager.getProvider(chainId);
    const multicall = new ethers.Contract(
      this.getMulticallAddress(chainId),
      MULTICALL2_ABI,
      provider
    );

    try {
      // Execute tryAggregate
      const results = await multicall.tryAggregate(requireSuccess, calls);

      return results.map((result: [boolean, string]) => ({
        success: result[0],
        returnData: result[1],
      }));
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to batch calls: ${error.message}`);
      } else {
        throw new Error("Failed to batch calls: Unknown error occurred");
      }
    }
  }
}
