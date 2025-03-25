import { 
  getConnection, 
  fetchGalaxyData, 
  GalaxyNFT, 
  NFTMetadata 
} from 'star-utils-maca';

// Ship parts specific interfaces
export interface ShipPart {
  mint: string;
  name: string;
  symbol: string;
  quantity: number;
  type: ShipPartType;
  compatibility: string[];
  stats: Record<string, number>;
}

export enum ShipPartType {
  ENGINE = 'engine',
  WEAPON = 'weapon',
  SHIELD = 'shield',
  COMPONENT = 'component'
}

// Re-export from star-utils-lib
export {
  getConnection,
  fetchGalaxyData,
  GalaxyNFT,
  NFTMetadata
};
