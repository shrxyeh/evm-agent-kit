// Simplified version to test compilation
import { EvmKit } from "../src/index";

async function main() {
  try {
    console.log("Initializing EvmKit...");
    // Initialize EvmKit with public RPC
    const kit = new EvmKit({
      rpcUrl: "https://cloudflare-eth.com",
    });

    console.log("EvmKit initialized successfully");

    // Just a simple test
    console.log("EVM Agent Kit is working!");
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error:", error.message);
    } else {
      console.error("Error:", error);
    }
  }
}

main();
