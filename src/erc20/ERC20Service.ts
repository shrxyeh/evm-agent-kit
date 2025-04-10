import { ethers } from "ethers";
import { ProviderManager } from "../providers/ProviderManager";
import {
  GetBalanceParams,
  TransferParams,
  ApproveParams,
  AllowanceParams,
} from "../interfaces/erc20";
import { ValidationUtils } from "../utils/validation";
import { parseTokenAmount, formatTokenAmount } from "../utils/formatting";

// Standard ERC20 ABI with only the functions we need
const ERC20_ABI = [
  // Read-only functions
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function decimals() view returns (uint8)",
  "function totalSupply() view returns (uint256)",
  "function balanceOf(address owner) view returns (uint256)",
  "function allowance(address owner, address spender) view returns (uint256)",

  // Write functions
  "function transfer(address to, uint256 value) returns (bool)",
  "function approve(address spender, uint256 value) returns (bool)",
  "function transferFrom(address from, address to, uint256 value) returns (bool)",

  // Events
  "event Transfer(address indexed from, address indexed to, uint256 value)",
  "event Approval(address indexed owner, address indexed spender, uint256 value)",
];

/**
 * Service for interacting with ERC20 tokens
 */
export class Erc20Service {
  private providerManager: ProviderManager;

  /**
   * Creates a new Erc20Service instance
   * @param providerManager ProviderManager instance
   */
  constructor(providerManager: ProviderManager) {
    this.providerManager = providerManager;
  }

  /**
   * Gets the balance of an ERC20 token for a specific address
   * @param params GetBalanceParams object
   * @param chainId Optional chain ID
   * @returns Balance in token units
   */
  async getBalance(
    params: GetBalanceParams,
    chainId?: number
  ): Promise<string> {
    const { tokenAddress, ownerAddress } = params;

    // Validate inputs
    if (
      !ValidationUtils.validateTransferParams(tokenAddress, ownerAddress, "0")
        .valid
    ) {
      throw new Error("Invalid parameters for getBalance");
    }

    const provider = this.providerManager.getProvider(chainId);
    const contract = new ethers.Contract(tokenAddress, ERC20_ABI, provider);

    try {
      const balance = await contract.balanceOf(ownerAddress);
      return balance.toString();
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to get balance: ${error.message}`);
      } else {
        throw new Error("Failed to get balance: Unknown error");
      }
    }
  }

  /**
   * Gets the formatted balance of an ERC20 token with proper decimals
   * @param params GetBalanceParams object
   * @param chainId Optional chain ID
   * @returns Formatted balance in human-readable format
   */
  async getFormattedBalance(
    params: GetBalanceParams,
    chainId?: number
  ): Promise<string> {
    const { tokenAddress } = params;

    // Get raw balance
    const balance = await this.getBalance(params, chainId);

    // Get token decimals
    const provider = this.providerManager.getProvider(chainId);
    const contract = new ethers.Contract(tokenAddress, ERC20_ABI, provider);
    const decimals = await contract.decimals();

    return formatTokenAmount(balance, decimals);
  }

  /**
   * Transfers ERC20 tokens to a recipient
   * @param params TransferParams object
   * @param chainId Optional chain ID
   * @returns Transaction hash
   */
  async transfer(params: TransferParams, chainId?: number): Promise<string> {
    const { tokenAddress, recipientAddress, amount, gasPrice, gasLimit } =
      params;

    // Validate inputs
    const validation = ValidationUtils.validateTransferParams(
      tokenAddress,
      recipientAddress,
      amount
    );

    if (!validation.valid) {
      throw new Error(`Invalid parameters for transfer: ${validation.error}`);
    }

    const signer = this.providerManager.getSigner(chainId);
    const contract = new ethers.Contract(tokenAddress, ERC20_ABI, signer);

    try {
      // Get token decimals
      const decimals = await contract.decimals();
      const amountInWei = parseTokenAmount(amount, decimals);

      // Prepare transaction options
      const options: any = {};
      if (gasPrice) options.gasPrice = ethers.parseUnits(gasPrice, "gwei");
      if (gasLimit) options.gasLimit = gasLimit;

      const tx = await contract.transfer(
        recipientAddress,
        amountInWei,
        options
      );
      return tx.hash;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to transfer tokens: ${error.message}`);
      } else {
        throw new Error("Failed to transfer tokens: Unknown error");
      }
    }
  }

  /**
   * Approves a spender to spend tokens
   * @param params ApproveParams object
   * @param chainId Optional chain ID
   * @returns Transaction hash
   */
  async approve(params: ApproveParams, chainId?: number): Promise<string> {
    const { tokenAddress, spenderAddress, amount, gasPrice, gasLimit } = params;

    // Validate inputs
    const validation = ValidationUtils.validateTransferParams(
      tokenAddress,
      spenderAddress,
      amount
    );

    if (!validation.valid) {
      throw new Error(`Invalid parameters for approve: ${validation.error}`);
    }

    const signer = this.providerManager.getSigner(chainId);
    const contract = new ethers.Contract(tokenAddress, ERC20_ABI, signer);

    try {
      // Get token decimals
      const decimals = await contract.decimals();
      const amountInWei = parseTokenAmount(amount, decimals);

      // Prepare transaction options
      const options: any = {};
      if (gasPrice) options.gasPrice = ethers.parseUnits(gasPrice, "gwei");
      if (gasLimit) options.gasLimit = gasLimit;

      const tx = await contract.approve(spenderAddress, amountInWei, options);
      return tx.hash;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to approve tokens: ${error.message}`);
      } else {
        throw new Error("Failed to approve tokens: Unknown error");
      }
    }
  }

  /**
   * Gets the allowance for a spender
   * @param params AllowanceParams object
   * @param chainId Optional chain ID
   * @returns Allowance in token units
   */
  async getAllowance(
    params: AllowanceParams,
    chainId?: number
  ): Promise<string> {
    const { tokenAddress, ownerAddress, spenderAddress } = params;

    // Validate inputs
    if (
      !ValidationUtils.validateTransferParams(tokenAddress, ownerAddress, "0")
        .valid
    ) {
      throw new Error("Invalid parameters for getAllowance");
    }

    if (
      !ValidationUtils.validateTransferParams(tokenAddress, spenderAddress, "0")
        .valid
    ) {
      throw new Error("Invalid parameters for getAllowance");
    }

    const provider = this.providerManager.getProvider(chainId);
    const contract = new ethers.Contract(tokenAddress, ERC20_ABI, provider);

    try {
      const allowance = await contract.allowance(ownerAddress, spenderAddress);
      return allowance.toString();
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to get allowance: ${error.message}`);
      } else {
        throw new Error("Failed to get allowance: Unknown error");
      }
    }
  }

  /**
   * Gets token metadata (name, symbol, decimals)
   * @param tokenAddress The token address
   * @param chainId Optional chain ID
   * @returns Token metadata object
   */
  async getTokenMetadata(
    tokenAddress: string,
    chainId?: number
  ): Promise<{ name: string; symbol: string; decimals: number }> {
    if (
      !ValidationUtils.validateTransferParams(
        tokenAddress,
        "0x0000000000000000000000000000000000000000",
        "0"
      ).valid
    ) {
      throw new Error("Invalid token address");
    }

    const provider = this.providerManager.getProvider(chainId);
    const contract = new ethers.Contract(tokenAddress, ERC20_ABI, provider);

    try {
      const [name, symbol, decimals] = await Promise.all([
        contract.name(),
        contract.symbol(),
        contract.decimals(),
      ]);

      return {
        name,
        symbol,
        decimals: Number(decimals),
      };
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to get token metadata: ${error.message}`);
      } else {
        throw new Error("Failed to get token metadata: Unknown error");
      }
    }
  }
}
