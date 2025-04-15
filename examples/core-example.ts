/**
 * A simpler version of our EVM Kit example that avoids complex imports
 */

import { ethers } from "ethers";

async function main() {
  try {
    console.log("Testing core EVM functionality without EVM Kit");

    const provider = new ethers.JsonRpcProvider(
      "https://ethereum.publicnode.com"
    );

    // Define a common ERC20 interface (DAI token)
    const daiAddress = "0x6B175474E89094C44Da98b954EedeAC495271d0F";
    const erc20Abi = [
      "function name() view returns (string)",
      "function symbol() view returns (string)",
      "function decimals() view returns (uint8)",
      "function balanceOf(address owner) view returns (uint256)",
    ];

    // Create contract instance
    const daiContract = new ethers.Contract(daiAddress, erc20Abi, provider);

    // Get token information
    const [name, symbol, decimals] = await Promise.all([
      daiContract.name(),
      daiContract.symbol(),
      daiContract.decimals(),
    ]);

    console.log(`Token Info: ${name} (${symbol}) - ${decimals} decimals`);

    // Get balance for a sample address
    const sampleAddress = "0x742d35Cc6634C0532925a3b844Bc454e4438f44e";
    const balance = await daiContract.balanceOf(sampleAddress);

    // Format the balance
    const formattedBalance = ethers.formatUnits(balance, decimals);
    console.log(`${sampleAddress} has ${formattedBalance} ${symbol}`);

    console.log("Core example completed successfully");
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error in core example:", error.message);
    } else {
      console.error("Error in core example:", error);
    }
  }
}

main();
