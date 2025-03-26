import { 
  fetchStakedShips, 
  StakedShipInfo, 
  getFactionName, 
  displayStakedShips,
  getProfilesFromWallet,
  getFleetsAndShips, 
  getShipsInStarbaseFromProfile,
  ShipInfo,
  FleetInfo,
  fetchNFTsForWallet,
  NFTMetadata,
} from 'star-utils-maca';
import dotenv from 'dotenv';
import path from 'path';

// Charger les variables d'environnement
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// Interfaces étendues pour inclure les propriétés nécessaires à la comparaison
interface ExtendedShipInfo extends ShipInfo {
  symbol?: string;
}

// Interface pour les vaisseaux stakés avec la propriété symbol optionnelle
interface ExtendedStakedShipInfo extends Omit<StakedShipInfo, 'symbol'> {
  symbol?: string;
}

/**
 * Convertit un ShipInfo en ExtendedShipInfo en ajoutant la propriété symbol si nécessaire
 * @param ship L'objet ShipInfo à convertir
 * @returns L'objet ExtendedShipInfo avec la propriété symbol
 */
function toExtendedShipInfo(ship: ShipInfo): ExtendedShipInfo {
  // Utiliser directement le symbole s'il existe déjà dans l'objet
  let symbol: string | undefined = (ship as any).symbol;
  
  // Si le symbole n'est pas disponible, essayer de l'extraire des attributs Galaxy
  if (!symbol && ship.attributes) {
    // Essayer d'extraire le symbole des attributs Galaxy
    if ((ship.attributes as any).symbol) {
      symbol = (ship.attributes as any).symbol;
    } else if ((ship.attributes as any).name) {
      // Si le nom est présent dans les attributs, essayer d'extraire le symbole du nom
      const name = (ship.attributes as any).name;
      if (name && typeof name === 'string') {
        // Essayer de trouver le symbole dans le nom (souvent entre parenthèses)
        const symbolMatch = name.match(/\(([A-Z0-9]+)\)/);
        if (symbolMatch && symbolMatch[1]) {
          symbol = symbolMatch[1];
        }
      }
    }
  }
  
  // Si toujours pas de symbole, essayer d'extraire le symbole du mint
  if (!symbol && ship.mint) {
    // Rechercher le vaisseau dans l'API Galaxy en utilisant le mint
    console.log(`Recherche du symbole pour le vaisseau ${ship.name} (${ship.mint}) dans l'API Galaxy`);
    // Cette partie serait idéalement implémentée dans star-utils-lib
  }
  
  return {
    ...ship,
    symbol
  };
}

/**
 * Convertit un StakedShipInfo en ExtendedStakedShipInfo en conservant la propriété symbol
 * @param ship L'objet StakedShipInfo à convertir
 * @returns L'objet ExtendedStakedShipInfo avec la propriété symbol
 */
function toExtendedStakedShipInfo(ship: StakedShipInfo): ExtendedStakedShipInfo {
  return {
    ...ship,
    symbol: ship.symbol
  };
}

/**
 * Convertit un tableau de ShipInfo ou StakedShipInfo en leurs versions étendues
 * @param ships Tableau de vaisseaux à convertir
 * @returns Tableau de vaisseaux étendus
 */
function toExtendedShips(ships: (ShipInfo | StakedShipInfo)[]): (ExtendedShipInfo | ExtendedStakedShipInfo)[] {
  return ships.map(ship => {
    if ('faction' in ship) {
      // C'est un StakedShipInfo
      return toExtendedStakedShipInfo(ship as StakedShipInfo);
    } else {
      // C'est un ShipInfo
      return toExtendedShipInfo(ship as ShipInfo);
    }
  });
}

/**
 * Récupère les vaisseaux stakés pour un portefeuille spécifique
 * @param walletAddress L'adresse du portefeuille à vérifier
 * @returns Un tableau d'informations sur les vaisseaux stakés
 */
export async function getStakedShipsForWallet(walletAddress: string): Promise<StakedShipInfo[]> {
  try {
    console.log(`Récupération des vaisseaux stakés pour le portefeuille: ${walletAddress}`);
    
    // Utiliser la fonction fetchStakedShips de star-utils-lib
    const stakedShips = await fetchStakedShips(walletAddress);
    
    console.log(`${stakedShips.length} vaisseaux stakés trouvés pour ${walletAddress}`);
    
    return stakedShips;
  } catch (error) {
    console.error('Erreur lors de la récupération des vaisseaux stakés:', error);
    return [];
  }
}

/**
 * Récupère les profils SAGE associés à un portefeuille
 * @param walletAddress L'adresse du portefeuille à vérifier
 * @returns Un tableau d'adresses de profils SAGE
 */
export async function getSageProfilesForWallet(walletAddress: string): Promise<string[]> {
  try {
    console.log(`Récupération des profils SAGE pour le portefeuille: ${walletAddress}`);
    
    // Utiliser la fonction getProfilesFromWallet de star-utils-lib
    const walletAndProfiles = await getProfilesFromWallet(walletAddress);
    
    if (!walletAndProfiles || walletAndProfiles.profiles.length === 0) {
      console.log(`Aucun profil SAGE trouvé pour ${walletAddress}`);
      return [];
    }
    
    console.log(`${walletAndProfiles.profiles.length} profils SAGE trouvés pour ${walletAddress}`);
    
    return walletAndProfiles.profiles;
  } catch (error) {
    console.error('Erreur lors de la récupération des profils SAGE:', error);
    return [];
  }
}

/**
 * Récupère les vaisseaux dans les flottes SAGE pour un profil
 * @param profileAddress L'adresse du profil à vérifier
 * @returns Un tableau d'informations sur les vaisseaux dans les flottes
 */
export async function getShipsInSageFleets(profileAddress: string): Promise<ShipInfo[]> {
  try {
    console.log(`Récupération des vaisseaux dans les flottes SAGE pour le profil: ${profileAddress}`);
    
    // Utiliser la fonction getFleetsAndShips de star-utils-lib
    const fleets = await getFleetsAndShips(profileAddress);
    
    if (fleets.length === 0) {
      console.log(`Aucune flotte trouvée pour le profil ${profileAddress}`);
      return [];
    }
    
    // Extraire tous les vaisseaux de toutes les flottes
    const allShips: ShipInfo[] = [];
    fleets.forEach(fleet => {
      console.log(`Flotte: ${fleet.fleetName} - ${fleet.ships.length} vaisseaux`);
      allShips.push(...fleet.ships);
    });
    
    console.log(`${allShips.length} vaisseaux trouvés dans les flottes SAGE pour le profil ${profileAddress}`);
    
    return allShips;
  } catch (error) {
    console.error('Erreur lors de la récupération des vaisseaux dans les flottes SAGE:', error);
    return [];
  }
}

/**
 * Récupère les vaisseaux dans les starbases pour un profil
 * @param profileAddress L'adresse du profil à vérifier
 * @returns Un tableau d'informations sur les vaisseaux dans les starbases
 */
export async function getShipsInStarbases(profileAddress: string): Promise<ShipInfo[]> {
  try {
    console.log(`Récupération des vaisseaux dans les starbases pour le profil: ${profileAddress}`);
    
    // ID du jeu SAGE (Star Atlas)
    const gameId = "GAMEzqJehF8yAnKiTARUuhZMvLvkZVAsCVri5vSfemLr";
    
    // Utiliser la fonction getShipsInStarbaseFromProfile de star-utils-lib
    const ships = await getShipsInStarbaseFromProfile(profileAddress, gameId);
    
    console.log(`${ships.length} vaisseaux trouvés dans les starbases pour le profil ${profileAddress}`);
    
    // Log détaillé des vaisseaux trouvés dans les starbases
    if (ships.length > 0) {
      console.log("=== Détail des vaisseaux dans les starbases ===");
      ships.forEach((ship, index) => {
        console.log(`[${index + 1}/${ships.length}] ${ship.name} (${ship.mint}) - Symbol: ${(ship as any).symbol || 'N/A'}`);
        
        // Log des attributs pour aider à déterminer la classe
        if (ship.attributes) {
          console.log(`  Attributs: ${JSON.stringify(ship.attributes)}`);
        }
      });
    }
    
    return ships;
  } catch (error) {
    console.error('Erreur lors de la récupération des vaisseaux dans les starbases:', error);
    console.error('Détail de l\'erreur:', error instanceof Error ? error.message : String(error));
    console.error('Stack trace:', error instanceof Error ? error.stack : 'Non disponible');
    return [];
  }
}

/**
 * Récupère les vaisseaux directement dans le portefeuille
 * @param walletAddress L'adresse du portefeuille à vérifier
 * @returns Un tableau d'informations sur les vaisseaux dans le portefeuille
 */
export async function getShipsInWallet(walletAddress: string): Promise<ShipInfo[]> {
  try {
    console.log(`Récupération des vaisseaux dans le portefeuille: ${walletAddress}`);
    
    // Utiliser la fonction fetchNFTsForWallet de star-utils-lib
    const nfts = await fetchNFTsForWallet(walletAddress);
    
    // Filtrer uniquement les vaisseaux
    const ships = nfts.filter(nft => nft.itemType === 'ship');
    
    console.log(`${ships.length} vaisseaux trouvés dans le portefeuille ${walletAddress}`);
    
    // Convertir les NFT en ShipInfo pour avoir un format cohérent
    const shipInfos: ShipInfo[] = ships.map(ship => ({
      mint: ship.mint,
      name: ship.name,
      amount: ship.quantity,
      spec: ship.spec || 'Unknown'
    }));
    
    return shipInfos;
  } catch (error) {
    console.error('Erreur lors de la récupération des vaisseaux dans le portefeuille:', error);
    return [];
  }
}

/**
 * Récupère les ship parts dans le portefeuille
 * @param walletAddress L'adresse du portefeuille à vérifier
 * @returns Un tableau d'informations sur les ship parts dans le portefeuille
 */
export async function getShipPartsInWallet(walletAddress: string): Promise<NFTMetadata[]> {
  try {
    console.log(`Récupération des ship parts dans le portefeuille: ${walletAddress}`);
    
    // Utiliser la fonction fetchNFTsForWallet de star-utils-lib
    const nfts = await fetchNFTsForWallet(walletAddress);
    
    // Filtrer uniquement les ship parts
    const shipParts = nfts.filter(nft => nft.itemType === 'ship parts');
    
    console.log(`${shipParts.length} ship parts trouvés dans le portefeuille ${walletAddress}`);
    
    return shipParts;
  } catch (error) {
    console.error('Erreur lors de la récupération des ship parts dans le portefeuille:', error);
    return [];
  }
}

/**
 * Récupère tous les vaisseaux pour un portefeuille (stakés, flottes SAGE, starbases et portefeuille)
 * @param walletAddress L'adresse du portefeuille à vérifier
 * @returns Un objet contenant tous les vaisseaux trouvés
 */
export async function getAllShipsForWallet(walletAddress: string): Promise<{
  stakedShips: StakedShipInfo[];
  sageFleetShips: ShipInfo[];
  starbaseShips: ShipInfo[];
  walletShips: ShipInfo[];
  total: number;
}> {

  console.log('\n========== FLEET MANAGER: GET ALL SHIPS ==========');
  console.log(`Getting all ships for wallet: ${walletAddress}`);
  // Récupérer les vaisseaux stakés
  const stakedShips = await getStakedShipsForWallet(walletAddress);

  
  // Récupérer les profils SAGE
  const sageProfiles = await getSageProfilesForWallet(walletAddress);
  
  // Variables pour stocker les vaisseaux des flottes SAGE et des starbases
  let sageFleetShips: ShipInfo[] = [];
  let starbaseShips: ShipInfo[] = [];
  
  // Si des profils SAGE ont été trouvés, récupérer les vaisseaux dans les flottes et les starbases
  if (sageProfiles.length > 0) {
    // Pour chaque profil, récupérer les vaisseaux dans les flottes SAGE et les starbases
    for (const profile of sageProfiles) {
      const profileFleetShips = await getShipsInSageFleets(profile);
      const profileStarbaseShips = await getShipsInStarbases(profile);
      
      sageFleetShips = [...sageFleetShips, ...profileFleetShips];
      starbaseShips = [...starbaseShips, ...profileStarbaseShips];
    }
  }
  
  // Récupérer les vaisseaux directement dans le portefeuille
  const walletShips = await getShipsInWallet(walletAddress);
  
  // Calculer le total de vaisseaux
  const total = stakedShips.length + sageFleetShips.length + starbaseShips.length + walletShips.length;
  
  // Afficher un résumé
  console.log('\n=== Résumé des vaisseaux trouvés ===');
  console.log(`Vaisseaux stakés: ${stakedShips.length}`);
  console.log(`Vaisseaux dans les flottes SAGE: ${sageFleetShips.length}`);
  console.log(`Vaisseaux dans les starbases: ${starbaseShips.length}`);
  console.log(`Vaisseaux dans le portefeuille: ${walletShips.length}`);
  console.log(`Total: ${total}`);
  
  return {
    stakedShips,
    sageFleetShips,
    starbaseShips,
    walletShips,
    total
  };
}

/**
 * Compare les quantités de vaisseaux et de ship parts
 * @param ships Liste des vaisseaux (toutes sources confondues)
 * @param shipParts Liste des ship parts
 * @returns Un rapport de comparaison
 */
export function compareShipsAndParts(ships: (ExtendedShipInfo | ExtendedStakedShipInfo)[], shipParts: NFTMetadata[]): {
  shipsWithoutParts: { ship: ExtendedShipInfo | ExtendedStakedShipInfo, count: number }[];
  partsWithoutShips: { part: NFTMetadata, count: number }[];
  matchingPairs: { ship: ExtendedShipInfo | ExtendedStakedShipInfo, part: NFTMetadata, shipCount: number, partCount: number, difference: number, shipClass: string }[];
} {
  // Créer des maps pour regrouper les vaisseaux et les ship parts par symbole
  const shipMap = new Map<string, { ships: (ExtendedShipInfo | ExtendedStakedShipInfo)[], totalCount: number, shipClass: string }>();
  const partMap = new Map<string, { parts: NFTMetadata[], totalCount: number }>();
  
  console.log("\n=== Symboles des vaisseaux ===");
  // Regrouper les vaisseaux par symbole
  for (const ship of ships) {
    // Ignorer les vaisseaux sans symbole
    if (!ship.symbol) {
      console.log(`Vaisseau sans symbole: ${ship.name} (${ship.mint})`);
      continue;
    }
    
    console.log(`Vaisseau: ${ship.name} - Symbole: ${ship.symbol}`);
    
    const shipSymbol = ship.symbol;
    const count = 'amount' in ship ? ship.amount : 1;
    const shipClass = getShipClass(ship);
    
    if (!shipMap.has(shipSymbol)) {
      shipMap.set(shipSymbol, { ships: [], totalCount: 0, shipClass });
    }
    
    const entry = shipMap.get(shipSymbol)!;
    entry.ships.push(ship);
    entry.totalCount += count;
  }
  
  console.log("\n=== Symboles des ship parts ===");
  // Regrouper les ship parts par symbole (sans le "SP" à la fin)
  for (const part of shipParts) {
    // Ignorer les ship parts sans symbole ou dont le symbole ne se termine pas par "SP"
    if (!part.symbol) {
      console.log(`Ship part sans symbole: ${part.name} (${part.mint})`);
      continue;
    }
    
    if (!part.symbol.endsWith('SP')) {
      console.log(`Ship part avec symbole ne se terminant pas par SP: ${part.name} - Symbole: ${part.symbol}`);
      continue;
    }
    
    console.log(`Ship part: ${part.name} - Symbole: ${part.symbol} - Symbole correspondant: ${part.symbol.slice(0, -2)}`);
    
    // Enlever le "SP" à la fin pour faire correspondre avec le symbole du vaisseau
    const shipSymbol = part.symbol.slice(0, -2);
    
    if (!partMap.has(shipSymbol)) {
      partMap.set(shipSymbol, { parts: [], totalCount: 0 });
    }
    
    const entry = partMap.get(shipSymbol)!;
    entry.parts.push(part);
    entry.totalCount += part.quantity;
  }
  
  // Résultats de la comparaison
  const shipsWithoutParts: { ship: ExtendedShipInfo | ExtendedStakedShipInfo, count: number }[] = [];
  const partsWithoutShips: { part: NFTMetadata, count: number }[] = [];
  const matchingPairs: { ship: ExtendedShipInfo | ExtendedStakedShipInfo, part: NFTMetadata, shipCount: number, partCount: number, difference: number, shipClass: string }[] = [];
  
  console.log("\n=== Comparaison des symboles ===");
  console.log("Symboles de vaisseaux:", Array.from(shipMap.keys()));
  console.log("Symboles de ship parts (sans SP):", Array.from(partMap.keys()));
  
  // Trouver les vaisseaux sans ship parts correspondants
  for (const [symbol, { ships, totalCount, shipClass }] of shipMap.entries()) {
    if (!partMap.has(symbol)) {
      // Aucun ship part correspondant trouvé
      console.log(`Aucun ship part trouvé pour le symbole de vaisseau: ${symbol}`);
      for (const ship of ships) {
        const count = 'amount' in ship ? ship.amount : 1;
        shipsWithoutParts.push({ ship, count });
      }
    } else {
      // Il y a des ship parts correspondants, comparer les quantités
      console.log(`Correspondance trouvée pour le symbole: ${symbol}`);
      const { parts, totalCount: partCount } = partMap.get(symbol)!;
      
      // Utiliser le premier vaisseau comme représentant pour ce symbole
      const representativeShip = ships[0];
      
      // Utiliser le premier part comme représentant pour ce symbole
      const representativePart = parts[0];
      
      // Ajouter une seule entrée avec les totaux
      matchingPairs.push({
        ship: representativeShip,
        part: representativePart,
        shipCount: totalCount,
        partCount: partCount,
        difference: partCount - totalCount,
        shipClass
      });
    }
  }
  
  // Trouver les ship parts sans vaisseaux correspondants et les ajouter à matchingPairs
  for (const [symbol, { parts, totalCount }] of partMap.entries()) {
    if (!shipMap.has(symbol)) {
      console.log(`Aucun vaisseau trouvé pour le symbole de ship part: ${symbol}`);
      
      // Créer un objet vaisseau factice pour les parts sans vaisseaux
      const dummyShip = {
        name: parts[0].name.replace(' Ship Part', ''),
        symbol: symbol,
        mint: 'dummy',
        attributes: {},
        image: '',
        amount: 0
      } as ExtendedShipInfo;
      
      // Utiliser le premier part comme représentant
      const representativePart = parts[0];
      
      // Ajouter à matchingPairs avec shipCount = 0
      matchingPairs.push({
        ship: dummyShip,
        part: representativePart,
        shipCount: 0,
        partCount: totalCount,
        difference: totalCount, // Toutes les parts sont en excès
        shipClass: 'Unknown' // Nous ne connaissons pas la classe pour les parts sans vaisseaux
      });
      
      // Ajouter également à partsWithoutShips pour la compatibilité ascendante
      for (const part of parts) {
        partsWithoutShips.push({ part, count: part.quantity });
      }
    }
  }
  
  return {
    shipsWithoutParts,
    partsWithoutShips,
    matchingPairs
  };
}

/**
 * Affiche un rapport de comparaison entre les vaisseaux et les ship parts
 * @param comparisonResult Résultat de la comparaison
 */
export function displayShipPartComparison(comparisonResult: {
  shipsWithoutParts: { ship: ExtendedShipInfo | ExtendedStakedShipInfo, count: number }[];
  partsWithoutShips: { part: NFTMetadata, count: number }[];
  matchingPairs: { ship: ExtendedShipInfo | ExtendedStakedShipInfo, part: NFTMetadata, shipCount: number, partCount: number, difference: number, shipClass: string }[];
}) {
  const { shipsWithoutParts, partsWithoutShips, matchingPairs } = comparisonResult;
  
  console.log('\n=== Rapport de comparaison vaisseaux / ship parts ===');
  
  // Afficher les vaisseaux sans ship parts
  console.log('\n--- Vaisseaux sans ship parts correspondants ---');
  if (shipsWithoutParts.length === 0) {
    console.log('Aucun vaisseau sans ship part correspondant.');
  } else {
    for (const { ship, count } of shipsWithoutParts) {
      console.log(`${ship.name} (${ship.symbol}) - Quantité: ${count} - Aucun ship part correspondant`);
    }
  }
  
  // Afficher les ship parts sans vaisseaux
  console.log('\n--- Ship parts sans vaisseaux correspondants ---');
  if (partsWithoutShips.length === 0) {
    console.log('Aucun ship part sans vaisseau correspondant.');
  } else {
    for (const { part, count } of partsWithoutShips) {
      console.log(`${part.name} (${part.symbol}) - Quantité: ${count} - Aucun vaisseau correspondant`);
    }
  }
  
  // Afficher les paires correspondantes avec les différences de quantité
  console.log('\n--- Paires vaisseau / ship part correspondantes ---');
  if (matchingPairs.length === 0) {
    console.log('Aucune paire correspondante trouvée.');
  } else {
    // Regrouper par type de vaisseau pour éviter les doublons
    const groupedPairs = new Map<string, { ship: ExtendedShipInfo | ExtendedStakedShipInfo, part: NFTMetadata, shipCount: number, partCount: number, difference: number, shipClass: string }>();
    
    for (const pair of matchingPairs) {
      const key = `${pair.ship.name}-${pair.part.name}`;
      
      if (!groupedPairs.has(key) || Math.abs(pair.difference) > Math.abs(groupedPairs.get(key)!.difference)) {
        groupedPairs.set(key, pair);
      }
    }
    
    for (const pair of groupedPairs.values()) {
      const status = pair.difference > 0 
        ? `${pair.difference} ship parts en trop` 
        : pair.difference < 0 
          ? `${Math.abs(pair.difference)} ship parts manquants` 
          : 'Quantités égales';
      
      console.log(`${pair.ship.name} (${pair.ship.symbol}) - Classe: ${pair.shipClass} - Vaisseaux: ${pair.shipCount}, Ship parts: ${pair.partCount} - ${status}`);
    }
  }
}

/**
 * Get the order value for a ship class for sorting purposes
 * @param shipClass The ship class to get the order value for
 * @returns A number representing the order (lower numbers will appear first)
 */
function getShipClassOrder(shipClass: string): number {
  const classOrder: Record<string, number> = {
    'Titan': 1,
    'Commander': 2,
    'Capital': 3,
    'Large': 4,
    'Medium': 5,
    'Small': 6,
    'X-Small': 7,
    'XX-Small': 8,
    'XXS': 8, // Same as XX-Small
  };

  // Default to a high number for unknown classes
  return classOrder[shipClass] || 9;
}

/**
 * Get the ship class from attributes or name
 * @param ship The ship to get the class for
 * @returns The ship class as a string
 */
function getShipClass(ship: ExtendedShipInfo | ExtendedStakedShipInfo): string {
  // Try to get the class from attributes
  if (ship.attributes) {
    const attrs = ship.attributes as any;
    if (attrs.class) {
      return attrs.class;
    }
    if (attrs.size) {
      return attrs.size;
    }
  }

  // Try to infer class from name
  const name = ship.name.toLowerCase();
  if (name.includes('titan')) return 'Titan';
  if (name.includes('commander')) return 'Commander';
  if (name.includes('capital')) return 'Capital';
  if (name.includes('large')) return 'Large';
  if (name.includes('medium')) return 'Medium';
  if (name.includes('small') && name.includes('xx')) return 'XX-Small';
  if (name.includes('small') && name.includes('x')) return 'X-Small';
  if (name.includes('small')) return 'Small';
  
  // Default to Medium if we can't determine
  return 'Medium';
}

/**
 * Affiche les statistiques des vaisseaux stakés par faction
 * @param ships Le tableau des vaisseaux stakés
 */
export function displayShipStatsByFaction(ships: StakedShipInfo[]): void {
  // Regrouper les vaisseaux par faction
  const factionGroups: Record<string, StakedShipInfo[]> = {};
  
  ships.forEach(ship => {
    const factionName = getFactionName(ship.factionId);
    if (!factionGroups[factionName]) {
      factionGroups[factionName] = [];
    }
    factionGroups[factionName].push(ship);
  });
  
  // Afficher les statistiques par faction
  console.log('\n=== Statistiques des vaisseaux par faction ===');
  
  Object.entries(factionGroups).forEach(([factionName, factionShips]) => {
    console.log(`\n--- Faction: ${factionName} ---`);
    console.log(`Nombre de vaisseaux: ${factionShips.length}`);
    
    // Calculer la quantité totale de ressources par faction
    const totalFuel = factionShips.reduce((sum, ship) => sum + parseInt(ship.fuelQuantity || '0'), 0);
    const totalFood = factionShips.reduce((sum, ship) => sum + parseInt(ship.foodQuantity || '0'), 0);
    const totalArms = factionShips.reduce((sum, ship) => sum + parseInt(ship.armsQuantity || '0'), 0);
    
    console.log(`Carburant total: ${totalFuel}`);
    console.log(`Nourriture totale: ${totalFood}`);
    console.log(`Armes totales: ${totalArms}`);
    
    // Afficher les types de vaisseaux
    const shipTypes = new Set(factionShips.map(ship => ship.attributes.spec || 'Unknown'));
    console.log(`Types de vaisseaux: ${Array.from(shipTypes).join(', ')}`);
    
    // Afficher la liste des vaisseaux avec leur nom et mint
    console.log('\nListe des vaisseaux:');
    factionShips.forEach((ship, index) => {
      console.log(`${index + 1}. ${ship.name} (Mint: ${ship.mint}) - Quantité: ${ship.amount}`);
    });
  });
}

/**
 * Affiche les statistiques des vaisseaux SAGE par type
 * @param ships Le tableau des vaisseaux SAGE
 * @param sourceLabel Le label de la source (flotte ou starbase)
 */
export function displaySageShipStats(ships: ShipInfo[], sourceLabel: string): void {
  // Regrouper les vaisseaux par type (spec)
  const typeGroups: Record<string, ShipInfo[]> = {};
  
  ships.forEach(ship => {
    const shipType = ship.spec || 'Unknown';
    if (!typeGroups[shipType]) {
      typeGroups[shipType] = [];
    }
    typeGroups[shipType].push(ship);
  });
  
  // Afficher les statistiques par type
  console.log(`\n=== Statistiques des vaisseaux ${sourceLabel} par type ===`);
  
  Object.entries(typeGroups).forEach(([shipType, typeShips]) => {
    console.log(`\n--- Type: ${shipType} ---`);
    console.log(`Nombre de vaisseaux: ${typeShips.length}`);
    
    // Afficher la liste des vaisseaux avec leur nom et mint
    console.log('\nListe des vaisseaux:');
    typeShips.forEach((ship, index) => {
      console.log(`${index + 1}. ${ship.name} (Mint: ${ship.mint}) - Quantité: ${ship.amount}`);
    });
  });
}

/**
 * Analyze and display information about a wallet's fleet
 * @param walletAddress The wallet address to analyze
 * @returns The comparison result object that can be used by the Vue.js application
 */
export async function analyzeFleet(walletAddress: string): Promise<any> {
  try {
    console.log(`Analyzing fleet for wallet: ${walletAddress}`);
    
    // Get all ships for the wallet (staked, SAGE fleets, starbases, and wallet)
    const allShipsResult = await getAllShipsForWallet(walletAddress);
    
    // Get all ship parts in the wallet
    const shipParts = await getShipPartsInWallet(walletAddress);
    
    console.log(`Found ${allShipsResult.total} ships and ${shipParts.length} ship parts for wallet ${walletAddress}`);
    
    // Convert all ships to extended ships with symbol property
    const allShips = toExtendedShips([
      ...allShipsResult.stakedShips,
      ...allShipsResult.sageFleetShips,
      ...allShipsResult.starbaseShips,
      ...allShipsResult.walletShips
    ]);
    
    // Compare ships and parts
    const comparisonResult = compareShipsAndParts(allShips, shipParts);
    
    // Display the comparison result
    displayShipPartComparison(comparisonResult);
    
    // Return the comparison result for the API
    return comparisonResult;
  } catch (error) {
    console.error('Error analyzing fleet:', error);
    throw error;
  }
}

/**
 * Fonction principale pour tester le script
 */
export async function main(): Promise<void> {
  try {
    // Utiliser l'adresse de portefeuille de test depuis les variables d'environnement
    const walletAddress = process.env.TEST_WALLET_ADDRESS || '';
    
    if (!walletAddress) {
      console.error('Veuillez définir TEST_WALLET_ADDRESS dans le fichier .env');
      return;
    }
    
    await analyzeFleet(walletAddress);
  } catch (error) {
    console.error('Erreur dans la fonction principale:', error);
  }
}

// Exécuter le test si ce fichier est lancé directement
if (require.main === module) {
  main()
    .then(() => console.log('\nTest terminé avec succès'))
    .catch(err => console.error('\nTest échoué:', err))
    .finally(() => process.exit());
}
