import { EvmKit } from "../index";
import * as dotenv from "dotenv";

// Load environment variables
dotenv.config();

const privateKey = process.env.PRIVATE_KEY;
const rpcUrl =
  process.env.RPC_URL || "https://eth-mainnet.g.alchemy.com/v2/your-api-key";

// DAI token address on Ethereum mainnet
const DAI_ADDRESS = "0x6B175474E89094C44Da98b954EedeAC495271d0F";
const SAMPLE_ADDRESS = "0x742d35Cc6634C0532925a3b844Bc454e4438f44e";

async function main() {
  try {
    // Initialize EvmKit
    const kit = new EvmKit({
      rpcUrl,
      privateKey,
    });

    console.log("EvmKit initialized successfully");

    // Get DAI token metadata
    const metadata = await kit.erc20.getTokenMetadata(DAI_ADDRESS);
    console.log("Token Metadata:", metadata);

    // Get DAI balance
    const balance = await kit.erc20.getFormattedBalance({
      tokenAddress: DAI_ADDRESS,
      ownerAddress: SAMPLE_ADDRESS,
    });

    console.log(`DAI Balance: ${balance} ${metadata.symbol}`);

    // Check allowance (if we have a private key)
    if (privateKey) {
      const signer = kit.getProviderManager().getSigner();
      const signerAddress = await signer.getAddress();

      const allowance = await kit.erc20.getAllowance({
        tokenAddress: DAI_ADDRESS,
        ownerAddress: signerAddress,
        spenderAddress: "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D", // Uniswap V2 Router
      });

      console.log(`Allowance for Uniswap: ${allowance}`);
    }
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error:", error.message);
    } else {
      console.error("Unexpected error:", error);
    }
  }
}

main();
