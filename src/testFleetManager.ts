import { analyzeFleet } from './fleetManager';
import dotenv from 'dotenv';
import path from 'path';

// Charger les variables d'environnement
dotenv.config({ path: path.resolve(__dirname, '../.env') });

async function runTest() {
  try {
    console.log('=== Test du module fleetManager ===');
    
    // Récupérer l'adresse du portefeuille de test depuis les variables d'environnement
    const walletAddress = process.env.TEST_WALLET_ADDRESS || '';
    
    if (!walletAddress) {
      console.error('Veuillez définir TEST_WALLET_ADDRESS dans le fichier .env');
      return;
    }
    
    console.log(`Analyse de la flotte pour le portefeuille: ${walletAddress}`);
    
    // Appeler la fonction analyzeFleet pour récupérer et afficher les informations sur les vaisseaux stakés
    await analyzeFleet(walletAddress);
    
  } catch (error) {
    console.error('Erreur lors du test:', error);
  }
}

// Exécuter le test
runTest()
  .then(() => console.log('\nTest terminé avec succès'))
  .catch(err => console.error('\nTest échoué:', err))
  .finally(() => process.exit());
