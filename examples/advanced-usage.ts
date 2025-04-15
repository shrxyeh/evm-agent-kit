import { EvmKit } from "../src/index";
import * as dotenv from "dotenv";

// Load environment variables
dotenv.config();

const privateKey = process.env.PRIVATE_KEY;
const rpcUrl = process.env.RPC_URL || "https://cloudflare-eth.com";

// Common token addresses on Ethereum mainnet
const TOKEN_ADDRESSES = {
  DAI: "0x6B175474E89094C44Da98b954EedeAC495271d0F",
  USDC: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
  USDT: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
  WETH: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
};

const SAMPLE_ADDRESS = "0x742d35Cc6634C0532925a3b844Bc454e4438f44e";

async function main() {
  try {
    console.log("Initializing EvmKit...");
    // Initialize EvmKit
    const kit = new EvmKit({
      rpcUrl,
      privateKey,
    });

    console.log("EvmKit initialized successfully");

    //Get token balances using multicall
    console.log("\nExample 1: Checking multiple token balances with multicall");
    const tokenAddresses = Object.values(TOKEN_ADDRESSES);
    console.log(
      `Checking balances for address ${SAMPLE_ADDRESS} for ${tokenAddresses.length} tokens`
    );

    const balances = await kit.multicall.getErc20BatchBalances(
      {
        ownerAddress: SAMPLE_ADDRESS,
        tokenAddresses,
      },
      1
    ); // Ethereum mainnet

    console.log("Token balances:");
    for (const [tokenAddress, balance] of balances.entries()) {
      // Get token symbol for better readability
      const tokenSymbol = Object.keys(TOKEN_ADDRESSES).find(
        (key) =>
          TOKEN_ADDRESSES[key as keyof typeof TOKEN_ADDRESSES] === tokenAddress
      );
      console.log(`${tokenSymbol}: ${balance}`);
    }

    //Token Deployment (simulated)
    console.log("\nExample 2: Token Deployment (simulation only)");
    if (!privateKey) {
      console.log(
        "Skipping token deployment example - no private key provided"
      );
    } else {
      console.log(
        "This would deploy a new ERC20 token with the following parameters:"
      );
      const deployParams = {
        name: "Example Token",
        symbol: "EXTKN",
        initialSupply: "1000000",
        decimals: 18,
      };

      console.log(deployParams);
      console.log("Token deployment not executed to avoid spending real ETH");

      // Actually deploy a token
      // const tokenAddress = await kit.tokenDeployer.deployToken(deployParams);
      // console.log(`Token deployed at address: ${tokenAddress}`);
    }

    //Permit2 allowance check
    console.log("\nExample 3: Permit2 allowance check");
    try {
      const permit2Allowance = await kit.permit2.getPermit2Allowance(
        SAMPLE_ADDRESS,
        TOKEN_ADDRESSES.DAI,
        "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D", // Uniswap V2 Router
        1 // Ethereum mainnet
      );

      console.log("Permit2 allowance:", permit2Allowance);
    } catch (error) {
      console.log(
        "Permit2 not available or error:",
        error instanceof Error ? error.message : String(error)
      );
    }

    //Demonstrate creating a permit signature (no actual transaction)
    console.log("\nExample 4: Creating a permit signature");
    if (!privateKey) {
      console.log(
        "Skipping permit signature example - no private key provided"
      );
    } else {
      console.log("This would create a permit signature for token approval");
      const deadline = Math.floor(Date.now() / 1000) + 3600; // 1 hour from now
      console.log({
        token: TOKEN_ADDRESSES.DAI,
        spender: "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D", // Uniswap V2 Router
        amount: "1000000000000000000", // 1 token
        deadline,
      });

      console.log(
        "Permit signature creation not executed to avoid signing actual messages"
      );

      //Actually create a permit signature
      // const signature = await kit.permit2.createPermitSignature(
      //   TOKEN_ADDRESSES.DAI,
      //   '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D', // Uniswap V2 Router
      //   '1000000000000000000', // 1 token
      //   deadline
      // );
      // console.log('Permit signature:', signature);
    }
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error:", error.message);
    } else {
      console.error("Unknown error:", error);
    }
  }
}

main();
