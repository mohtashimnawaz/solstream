# SolStream Frontend

A beautiful React + Tailwind CSS v4 frontend for the SolStream token vesting platform on Solana.

## Features

- 🎨 Modern UI with Tailwind CSS v4
- 💰 Create token vesting streams with linear release
- 🔓 Withdraw vested tokens
- 📊 View all your vesting streams with real-time progress
- 🔐 Wallet adapter integration (Phantom, Solflare)

## Getting Started

### Prerequisites

- Node.js 18+ and Yarn
- A Solana wallet (Phantom or Solflare)
- Deployed SolStream program on devnet/localnet

### Installation

```bash
# Install dependencies (from root)
yarn install

# Start development server
yarn dev
```

The app will be available at `http://localhost:5173`

### Building for Production

```bash
yarn build
yarn preview
```

## Usage

1. **Connect Wallet**: Click "Select Wallet" in the top right
2. **Create Stream**: Fill in the beneficiary, mint, amount, and schedule
3. **Withdraw Tokens**: Enter sender and mint to withdraw vested tokens
4. **View Streams**: See all your active vesting streams at the bottom

## Tech Stack

- **React 19** - UI library
- **Vite** - Build tool
- **Tailwind CSS v4** - Styling
- **Solana Web3.js** - Blockchain interaction
- **Anchor** - Solana program framework
- **Wallet Adapter** - Wallet integration

## Configuration

To change the network, edit `src/contexts/WalletContextProvider.tsx`:

```typescript
// For devnet (default)
const network = WalletAdapterNetwork.Devnet;

// For localnet
const endpoint = 'http://127.0.0.1:8899';

// For mainnet
const network = WalletAdapterNetwork.Mainnet;
```
