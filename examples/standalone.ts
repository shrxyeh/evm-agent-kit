import * as ethers from "ethers";

async function main() {
  try {
    console.log("Testing standalone EVM example");

    const provider = new ethers.JsonRpcProvider(
      "https://ethereum.publicnode.com"
    );

    // Get the latest block number
    const blockNumber = await provider.getBlockNumber();
    console.log(`Current block number: ${blockNumber}`);

    // Get ETH balance of Vitalik's address
    const vitalikAddress = "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045";
    const balance = await provider.getBalance(vitalikAddress);
    console.log(`Vitalik's ETH balance: ${ethers.formatEther(balance)} ETH`);

    console.log("Standalone example completed successfully");
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error in standalone example:", error.message);
    } else {
      console.error("Error in standalone example:", error);
    }
  }
}

main();
