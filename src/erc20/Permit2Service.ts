import { ethers } from "ethers";
import { ProviderManager } from "../providers/ProviderManager.js";
import { PermitParams } from "../interfaces/erc20";

const PERMIT2_ADDRESS = "0x000000000022D473030F116dDEE9F6B43aC78BA3"; // Same address on all chains

const PERMIT2_ABI = [
  "function approve(address token, address spender, uint160 amount, uint48 expiration) external",
  "function allowance(address owner, address token, address spender) external view returns (uint160 amount, uint48 expiration, uint48 nonce)",
  "function permit(address owner, tuple(address token, uint160 amount, uint48 expiration, uint48 nonce) details, bytes signature) external",
  "function permitTransferFrom(tuple(address token, uint256 amount) permitted, tuple(address spender, uint256 nonce, uint256 deadline) spenderPermission, address owner, bytes signature) external returns (uint256)",
];

const ERC20_PERMIT_ABI = [
  "function permit(address owner, address spender, uint256 value, uint256 deadline, uint8 v, bytes32 r, bytes32 s) external",
  "function nonces(address owner) external view returns (uint256)",
  "function DOMAIN_SEPARATOR() external view returns (bytes32)",
];

/**
 * Service for handling ERC20 permit and Permit2 operations
 */
export class Permit2Service {
  private providerManager: ProviderManager;

  /**
   * Creates a new Permit2Service instance
   * @param providerManager ProviderManager instance
   */
  constructor(providerManager: ProviderManager) {
    this.providerManager = providerManager;
  }

  /**
   * Executes a permit call for ERC20 tokens that support the permit function (EIP-2612)
   * @param params Permit parameters
   * @param chainId Optional chain ID
   * @returns Transaction hash
   */
  async executePermit(params: PermitParams, chainId?: number): Promise<string> {
    const {
      tokenAddress,
      ownerAddress,
      spenderAddress,
      value,
      deadline,
      v,
      r,
      s,
    } = params;

    const signer = this.providerManager.getSigner(chainId);
    const contract = new ethers.Contract(
      tokenAddress,
      ERC20_PERMIT_ABI,
      signer
    );

    try {
      const tx = await contract.permit(
        ownerAddress,
        spenderAddress,
        value,
        deadline,
        v,
        r,
        s
      );

      return tx.hash;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to execute permit: ${error.message}`);
      } else {
        throw new Error("Failed to execute permit: Unknown error");
      }
    }
  }

  /**
   * Creates a permit signature for ERC20 tokens that support the permit function (EIP-2612)
   * @param tokenAddress The token address
   * @param spenderAddress The spender address
   * @param value The approval amount
   * @param deadline The deadline timestamp
   * @param chainId Optional chain ID
   * @returns Signature components (v, r, s) and nonce
   */
  async createPermitSignature(
    tokenAddress: string,
    spenderAddress: string,
    value: string,
    deadline: number,
    chainId?: number
  ): Promise<{ v: number; r: string; s: string; nonce: string }> {
    const signer = this.providerManager.getSigner(chainId);
    const signerAddress = await signer.getAddress();

    const provider = this.providerManager.getProvider(chainId);
    const contract = new ethers.Contract(
      tokenAddress,
      ERC20_PERMIT_ABI,
      provider
    );

    try {
      // Get current nonce
      const nonce = await contract.nonces(signerAddress);

      // Get domain separator
      const domainSeparator = await contract.DOMAIN_SEPARATOR();

      // EIP-712 type data
      const typedData = {
        types: {
          Permit: [
            { name: "owner", type: "address" },
            { name: "spender", type: "address" },
            { name: "value", type: "uint256" },
            { name: "nonce", type: "uint256" },
            { name: "deadline", type: "uint256" },
          ],
        },
        primaryType: "Permit",
        domain: {
          name: await contract.name(),
          version: "1",
          chainId: chainId || (await provider.getNetwork()).chainId,
          verifyingContract: tokenAddress,
        },
        message: {
          owner: signerAddress,
          spender: spenderAddress,
          value,
          nonce: nonce.toString(),
          deadline,
        },
      };

      // Sign the typed data
      const signature = await signer.signTypedData(
        typedData.domain,
        { Permit: typedData.types.Permit },
        typedData.message
      );

      // Split signature into components
      const splitSig = ethers.Signature.from(signature);

      return {
        v: splitSig.v,
        r: splitSig.r,
        s: splitSig.s,
        nonce: nonce.toString(),
      };
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to create permit signature: ${error.message}`);
      } else {
        throw new Error("Failed to create permit signature: Unknown error");
      }
    }
  }

  /**
   * Approves tokens using Permit2 contract
   * @param tokenAddress The token address
   * @param spenderAddress The spender address
   * @param amount The approval amount
   * @param expiration The expiration timestamp (in seconds from now)
   * @param chainId Optional chain ID
   * @returns Transaction hash
   */
  async approveWithPermit2(
    tokenAddress: string,
    spenderAddress: string,
    amount: string,
    expiration: number = 0xffffffffffff, // Max uint48
    chainId?: number
  ): Promise<string> {
    const signer = this.providerManager.getSigner(chainId);
    const permit2 = new ethers.Contract(PERMIT2_ADDRESS, PERMIT2_ABI, signer);

    try {
      // Approve Permit2 to spend the token
      const erc20 = new ethers.Contract(
        tokenAddress,
        ["function approve(address spender, uint256 amount) returns (bool)"],
        signer
      );

      const approveTx = await erc20.approve(PERMIT2_ADDRESS, ethers.MaxUint256);
      await approveTx.wait();

      // Approve the spender via Permit2
      const tx = await permit2.approve(
        tokenAddress,
        spenderAddress,
        amount,
        expiration
      );

      return tx.hash;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to approve with Permit2: ${error.message}`);
      } else {
        throw new Error("Failed to approve with Permit2: Unknown error");
      }
    }
  }

  /**
   * Gets the current allowance from Permit2
   * @param ownerAddress The owner address
   * @param tokenAddress The token address
   * @param spenderAddress The spender address
   * @param chainId Optional chain ID
   * @returns Allowance amount, expiration, and nonce
   */
  async getPermit2Allowance(
    ownerAddress: string,
    tokenAddress: string,
    spenderAddress: string,
    chainId?: number
  ): Promise<{ amount: string; expiration: number; nonce: number }> {
    const provider = this.providerManager.getProvider(chainId);
    const permit2 = new ethers.Contract(PERMIT2_ADDRESS, PERMIT2_ABI, provider);

    try {
      const [amount, expiration, nonce] = await permit2.allowance(
        ownerAddress,
        tokenAddress,
        spenderAddress
      );

      return {
        amount: amount.toString(),
        expiration: Number(expiration),
        nonce: Number(nonce),
      };
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to get Permit2 allowance: ${error.message}`);
      } else {
        throw new Error("Failed to get Permit2 allowance: Unknown error");
      }
    }
  }
}
