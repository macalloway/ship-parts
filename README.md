# Ship Parts

A TypeScript library for managing Star Atlas ship parts, built on top of the star-utils-lib.

## Features

- Fetch ship parts from a wallet
- Check compatibility between ship parts and ships
- Filter parts by type (engine, weapon, shield, component)
- Calculate combined stats for collections of ship parts

## Installation

```bash
npm install
```

## Usage

```typescript
import { fetchShipParts, isCompatible, getPartsByType, ShipPartType } from 'ship-parts';

// Fetch all ship parts for a wallet
const walletAddress = 'your_solana_wallet_address';
const shipParts = await fetchShipParts(walletAddress);

// Get all engines
const engines = getPartsByType(shipParts, ShipPartType.ENGINE);

// Check compatibility
const shipClass = 'fighter';
const compatibleParts = shipParts.filter(part => isCompatible(part, shipClass));
```

## Development

```bash
# Build the project
npm run build

# Run the project
npm start
```

## Dependencies

This project depends on the local star-utils-lib. Make sure it's properly built before using this library.
