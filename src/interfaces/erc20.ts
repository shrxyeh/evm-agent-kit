/**
 * Interface for ERC20 token operations
 */

export interface TokenInfo {
  address: string;
  name: string;
  symbol: string;
  decimals: number;
  chainId: number;
  logoURI?: string;
}

export interface GetBalanceParams {
  tokenAddress: string;
  ownerAddress: string;
}

export interface TransferParams {
  tokenAddress: string;
  recipientAddress: string;
  amount: string;
  gasPrice?: string;
  gasLimit?: string;
}

export interface ApproveParams {
  tokenAddress: string;
  spenderAddress: string;
  amount: string;
  gasPrice?: string;
  gasLimit?: string;
}

export interface AllowanceParams {
  tokenAddress: string;
  ownerAddress: string;
  spenderAddress: string;
}

export interface DeployTokenParams {
  name: string;
  symbol: string;
  initialSupply: string;
  decimals?: number;
  gasPrice?: string;
  gasLimit?: string;
}

export interface PermitParams {
  tokenAddress: string;
  ownerAddress: string;
  spenderAddress: string;
  value: string;
  deadline: number;
  v: number;
  r: string;
  s: string;
}

export interface Erc20BatchBalanceParams {
  ownerAddress: string;
  tokenAddresses: string[];
}
