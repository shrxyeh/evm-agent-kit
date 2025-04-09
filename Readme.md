# EVM Agent Kit

A comprehensive toolkit that enables AI agents to autonomously interact with EVM-compatible blockchain ecosystems (Ethereum, Polygon, BSC, Base).

## Overview

EVM Agent Kit is inspired by [solana-agent-kit](https://github.com/sendaifun/solana-agent-kit) but specifically designed for Ethereum Virtual Machine (EVM) chains. It provides a unified interface for AI agents to perform operations like token transfers, swaps, lending, and more across various EVM-compatible blockchains.

## Features (Planned)

### ERC20 Operations
- Token deployment with OpenZeppelin standards
- Cross-chain transfers (LayerZero/Wormhole)
- Balance checks with multicall
- Permit2 approvals

### DeFi Integration
- Uniswap v3 swaps
- Aave lending/borrowing
- Curve pool interactions
- 1inch aggregation

### Smart Contract Tools
- ABICoder utilities
- Gas estimation optimizers
- Transaction simulation
- Event log parsing

### AI-Ready Components
- LangChain tools wrapper
- Autonomous transaction signing
- Gas price prediction models
- Risk assessment modules

## Key Differentiators
- EIP-1559 transaction pricing
- MEV protection strategies
- Layer 2 rollup support (Optimism, Arbitrum)
- Account abstraction (ERC4337) integration

## Installation

```bash
npm install evm-agent-kit
```

## Usage

```typescript
import { EvmKit } from 'evm-agent-kit';

// Initialize with provider
const kit = new EvmKit({
  rpcUrl: 'https://eth-mainnet.g.alchemy.com/v2/YOUR_API_KEY',
  privateKey: process.env.PRIVATE_KEY
});

// Check ERC20 balance
const balance = await kit.erc20.getBalance({
  tokenAddress: '0x6B175474E89094C44Da98b954EedeAC495271d0F', // DAI
  ownerAddress: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e'
});
```

## Project Structure

```
evm-agent-kit/
├── src/
│   ├── core/         # Core functionality
│   ├── erc20/        # ERC20 token operations
│   ├── defi/         # DeFi integrations
│   ├── contracts/    # Smart contract interactions
│   ├── utils/        # Utility functions
│   ├── interfaces/   # TypeScript interfaces
│   └── providers/    # Chain provider management
├── examples/         # Example usage
└── tests/            # Test cases
```

## Implementation Roadmap

### Phase 1: Foundation
- Basic project setup and architecture
- Core utility functions
- Provider management
- ERC20 basic operations

### Phase 2: Advanced Features
- DeFi integrations
- Gas optimization
- Cross-chain operations
- Smart contract deployment tools

### Phase 3: AI Integration
- LangChain compatibility
- Autonomous agent utilities
- Risk assessment
- Decision-making modules

## Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build
npm run build

# Run tests
npm run test
```

## License

MIT