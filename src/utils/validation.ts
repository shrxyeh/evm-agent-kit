import { ethers } from "ethers";
import { isValidAddress } from "./formatting";

/**
 * Validates transaction inputs to prevent common errors
 */
export class ValidationUtils {
  /**
   * Validates an Ethereum private key
   * @param privateKey The private key to validate
   * @returns True if the private key is valid
   */
  static isValidPrivateKey(privateKey: string): boolean {
    try {
      if (!privateKey.startsWith("0x")) {
        privateKey = "0x" + privateKey;
      }

      // Check if key is valid by attempting to create a wallet
      new ethers.Wallet(privateKey);
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Validates an amount string to ensure it's a valid number
   * @param amount The amount string to validate
   * @returns True if the amount is a valid number
   */
  static isValidAmount(amount: string): boolean {
    try {
      // Check if it's a valid number
      if (isNaN(Number(amount))) {
        return false;
      }

      // Check if it's a positive number
      if (Number(amount) < 0) {
        return false;
      }

      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Validates all parameters for an ERC20 transfer
   * @param tokenAddress The token contract address
   * @param recipientAddress The recipient address
   * @param amount The amount to transfer
   * @returns Object containing validation result and error message if any
   */
  static validateTransferParams(
    tokenAddress: string,
    recipientAddress: string,
    amount: string
  ): { valid: boolean; error?: string } {
    if (!isValidAddress(tokenAddress)) {
      return { valid: false, error: "Invalid token address" };
    }

    if (!isValidAddress(recipientAddress)) {
      return { valid: false, error: "Invalid recipient address" };
    }

    if (!this.isValidAmount(amount)) {
      return { valid: false, error: "Invalid amount" };
    }

    return { valid: true };
  }

  /**
   * Validates an RPC URL
   * @param url The RPC URL to validate
   * @returns True if the URL is valid
   */
  static isValidRpcUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch (error) {
      return false;
    }
  }
}
