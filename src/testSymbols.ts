import { fetchNFTsForWallet, NFTMetadata } from '../../star-utils-lib/src';
import * as dotenv from 'dotenv';
import { PublicKey } from '@solana/web3.js';

// Charger les variables d'environnement
dotenv.config();

async function testFetchNFTsForWallet() {
  try {
    // Utiliser l'adresse du portefeuille depuis les variables d'environnement
    const walletAddress = process.env.TEST_WALLET_ADDRESS || '';
    
    if (!walletAddress) {
      console.error('Erreur: TEST_WALLET_ADDRESS non définie dans le fichier .env');
      return;
    }
    
    console.log(`Récupération des NFTs pour le portefeuille: ${walletAddress}`);
    
    // Appeler la fonction fetchNFTsForWallet
    const nfts = await fetchNFTsForWallet(walletAddress);
    
    // Filtrer pour obtenir uniquement les vaisseaux
    const ships = nfts.filter((nft: NFTMetadata) => nft.itemType === 'ship');
    
    console.log(`\n${ships.length} vaisseaux trouvés dans le portefeuille`);
    
    // Afficher les détails des vaisseaux, y compris les symboles
    console.log('\nDétails des vaisseaux:');
    ships.forEach((ship: NFTMetadata, index: number) => {
      console.log(`${index + 1}. ${ship.name} - Symbole: ${ship.symbol || 'Non défini'} - Type: ${ship.itemType}`);
    });
    
    // Vérifier si tous les vaisseaux ont un symbole
    const shipsWithSymbol = ships.filter((ship: NFTMetadata) => ship.symbol);
    console.log(`\n${shipsWithSymbol.length} vaisseaux sur ${ships.length} ont un symbole défini`);
    
    // Afficher les ship parts également pour comparaison
    const shipParts = nfts.filter((nft: NFTMetadata) => nft.itemType === 'ship parts');
    
    console.log(`\n${shipParts.length} ship parts trouvés dans le portefeuille`);
    
    console.log('\nDétails des ship parts:');
    shipParts.forEach((part: NFTMetadata, index: number) => {
      console.log(`${index + 1}. ${part.name} - Symbole: ${part.symbol || 'Non défini'} - Type: ${part.itemType}`);
    });
    
    // Vérifier si tous les ship parts ont un symbole
    const partsWithSymbol = shipParts.filter((part: NFTMetadata) => part.symbol);
    console.log(`\n${partsWithSymbol.length} ship parts sur ${shipParts.length} ont un symbole défini`);
    
  } catch (error) {
    console.error('Erreur lors du test:', error);
  }
}

// Exécuter la fonction de test
testFetchNFTsForWallet().then(() => {
  console.log('Test terminé');
}).catch(error => {
  console.error('Erreur:', error);
});
