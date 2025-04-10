import { ethers } from "ethers";

/**
 * Converts a token amount from human-readable format to token units
 * @param amount The amount in human-readable format
 * @param decimals The number of decimals the token has
 * @returns The amount in token units as a string
 */
export function parseTokenAmount(amount: string, decimals: number): string {
  return ethers.parseUnits(amount, decimals).toString();
}

/**
 * Converts a token amount from token units to human-readable format
 * @param amount The amount in token units
 * @param decimals The number of decimals the token has
 * @returns The amount in human-readable format
 */
export function formatTokenAmount(amount: string, decimals: number): string {
  return ethers.formatUnits(amount, decimals);
}

/**
 * Validates an Ethereum address
 * @param address The address to validate
 * @returns Boolean indicating if the address is valid
 */
export function isValidAddress(address: string): boolean {
  try {
    return ethers.isAddress(address);
  } catch (error) {
    return false;
  }
}

/**
 * Shortens an Ethereum address for display
 * @param address The address to shorten
 * @param startLength The number of characters to include at the start
 * @param endLength The number of characters to include at the end
 * @returns Shortened address string
 */
export function shortenAddress(
  address: string,
  startLength = 6,
  endLength = 4
): string {
  if (!isValidAddress(address)) {
    throw new Error("Invalid Ethereum address");
  }

  return `${address.slice(0, startLength)}...${address.slice(-endLength)}`;
}

/**
 * Converts Wei to Gwei
 * @param wei Amount in Wei
 * @returns Amount in Gwei
 */
export function weiToGwei(wei: string): string {
  return formatTokenAmount(wei, 9);
}

/**
 * Converts Gwei to Wei
 * @param gwei Amount in Gwei
 * @returns Amount in Wei
 */
export function gweiToWei(gwei: string): string {
  return parseTokenAmount(gwei, 9);
}
