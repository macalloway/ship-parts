<template>
  <div class="container mt-4">
    <h1 class="text-center mb-4">Ships / Ship Parts Comparison</h1>
    
    <div class="card mb-4">
      <div class="card-body">
        <h5 class="card-title">Enter a wallet address</h5>
        <div class="input-group mb-3">
          <input 
            type="text" 
            class="form-control" 
            v-model="walletAddress" 
            placeholder="Solana wallet address"
            :disabled="loading"
          >
          <button 
            class="btn btn-primary" 
            @click="analyzeFleet" 
            :disabled="!walletAddress || loading"
          >
            <span v-if="loading" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
            {{ loading ? 'Loading...' : 'Analyze' }}
          </button>
        </div>
      </div>
    </div>

    <div v-if="error" class="alert alert-danger">
      {{ error }}
    </div>

    <div v-if="noDataFound" class="alert alert-info">
      No data for this wallet
    </div>

    <div v-if="fleetData.length > 0">
      <div class="card">
        <div class="card-header d-flex justify-content-between align-items-center">
          <h5 class="mb-0">Analysis Results</h5>
          <button 
            class="btn btn-sm btn-outline-secondary export-csv-btn" 
            title="Export to CSV"
            @click="exportToCSV"
          >
            <i class="csv-icon">📊</i> CSV
          </button>
        </div>
        <div class="card-body">
          <div class="table-responsive">
            <table class="table table-striped table-hover">
              <thead>
                <tr>
                  <th @click="sortBy('shipName')" class="sortable">
                    Ship Name
                    <span v-if="sortKey === 'shipName'" :class="sortOrder === 'asc' ? 'sort-asc' : 'sort-desc'"></span>
                  </th>
                  <th>Total Ships</th>
                  <th>Ship Parts</th>
                  <th @click="sortBy('difference')" class="sortable">
                    Difference
                    <span v-if="sortKey === 'difference'" :class="sortOrder === 'asc' ? 'sort-asc' : 'sort-desc'"></span>
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(item, index) in sortedFleetData" :key="index">
                  <td>{{ item.shipName }} <span class="ship-symbol">({{ item.symbol }})</span></td>
                  <td>{{ item.shipCount }}</td>
                  <td>{{ item.partCount }}</td>
                  <td :class="getDifferenceClass(item.difference)">
                    {{ item.difference }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'App',
  data() {
    return {
      walletAddress: '',
      fleetData: [],
      loading: false,
      error: null,
      noDataFound: false,
      sortKey: 'shipName', // Default sort key
      sortOrder: 'asc'      // Default sort order
    };
  },
  computed: {
    sortedFleetData() {
      // Create a copy of the fleet data to sort
      const data = [...this.fleetData];
      
      // Sort by the current sort key and order
      return data.sort((a, b) => {
        let comparison = 0;
        
        if (this.sortKey === 'shipName') {
          // Sort by ship name alphabetically
          comparison = a.shipName.localeCompare(b.shipName);
        } else if (this.sortKey === 'difference') {
          // Sort by difference numerically
          comparison = a.difference - b.difference;
        }
        
        // Reverse the comparison if sort order is descending
        return this.sortOrder === 'asc' ? comparison : -comparison;
      });
    }
  },
  methods: {
    async analyzeFleet() {
      if (!this.walletAddress) return;
      
      this.loading = true;
      this.error = null;
      this.noDataFound = false;
      this.fleetData = [];
      
      try {
        // Call to the backend API that will execute fleetManager.ts
        const response = await axios.post('/api/analyze-fleet', {
          walletAddress: this.walletAddress
        });
        
        if (response.data && response.data.success) {
          // Afficher les données brutes dans la console pour débogage
          console.log('Données brutes reçues du backend:', JSON.stringify(response.data.result, null, 2));
          
          this.fleetData = this.processFleetData(response.data.result);
          
          // Afficher les données traitées dans la console pour débogage
          console.log('Données après traitement:', JSON.stringify(this.fleetData, null, 2));
          
          if (this.fleetData.length === 0) {
            this.noDataFound = true;
          }
        } else {
          this.error = response.data.error || 'An error occurred while analyzing the fleet.';
        }
      } catch (error) {
        console.error('Error analyzing fleet:', error);
        this.error = 'Server connection error. Please try again later.';
      } finally {
        this.loading = false;
      }
    },
    
    processFleetData(data) {
      // Process data received from the backend
      if (!data) return [];
      
      // Traiter les paires correspondantes (vaisseaux et ship parts)
      const matchingPairs = data.matchingPairs || [];
      
      // Traiter les vaisseaux sans ship parts
      const shipsWithoutParts = (data.shipsWithoutParts || []).map(item => ({
        shipName: item.ship.name,
        symbol: item.ship.symbol,
        shipCount: item.count,
        partCount: 0,
        difference: -item.count,
        shipClass: this.getShipClass(item.ship),
        uniqueId: item.ship.mint || Math.random().toString(36).substring(2, 15)
      }));
      
      // Traiter les ship parts sans vaisseaux
      // Ignorer complètement les entrées avec préfixe "Ship Parts - "
      let partsWithoutShips = (data.partsWithoutShips || [])
        .filter(item => !item.part.name.startsWith('Ship Parts -'))
        .map(item => {
          // Normaliser le nom en supprimant le préfixe "Ship Parts - " (au cas où)
          const normalizedName = this.normalizeShipPartName(item.part.name);
          
          return {
            shipName: normalizedName,
            symbol: this.extractBaseSymbol(item.part.symbol),
            shipCount: 0,
            partCount: item.count,
            difference: item.count,
            shipClass: 'Unknown',
            uniqueId: item.part.mint || Math.random().toString(36).substring(2, 15)
          };
        });
      
      // Traiter également les matchingPairs pour normaliser les noms
      const processedMatchingPairs = matchingPairs.map(pair => {
        // Vérifier si le nom du vaisseau commence par "Ship Parts - "
        const isShipPart = pair.ship.name.startsWith('Ship Parts -');
        
        // Si c'est un ship part, normaliser le nom
        const shipName = isShipPart ? this.normalizeShipPartName(pair.ship.name) : pair.ship.name;
        
        return {
          shipName: shipName,
          symbol: pair.ship.symbol,
          shipCount: pair.shipCount,
          partCount: pair.partCount,
          difference: pair.difference,
          shipClass: pair.shipClass || 'Unknown',
          uniqueId: pair.ship.mint || Math.random().toString(36).substring(2, 15)
        };
      });
      
      // Combiner toutes les données
      const combinedData = [
        ...processedMatchingPairs,
        ...shipsWithoutParts,
        ...partsWithoutShips
      ];
      
      // Regrouper les vaisseaux par nom et symbole, en additionnant les compteurs
      const groupedEntries = {};
      
      combinedData.forEach(item => {
        const key = item.shipName.toLowerCase() + '|' + item.symbol.toLowerCase();
        
        if (!groupedEntries[key]) {
          // Première occurrence de ce type de vaisseau
          groupedEntries[key] = { ...item };
        } else {
          // Ce type de vaisseau existe déjà, additionner les compteurs
          const existingEntry = groupedEntries[key];
          existingEntry.shipCount += item.shipCount;
          existingEntry.partCount += item.partCount;
          existingEntry.difference = existingEntry.partCount - existingEntry.shipCount;
        }
      });
      
      return Object.values(groupedEntries);
    },
    
    normalizeShipPartName(name) {
      // Enlever le préfixe "Ship Parts - " s'il existe
      let normalizedName = name.replace(/^Ship Parts - /i, '');
      
      // Extraire le nom de base (sans le symbole entre parenthèses)
      const baseNameMatch = normalizedName.match(/(.*?)\s*\([A-Z0-9]+\)/);
      if (baseNameMatch && baseNameMatch[1]) {
        normalizedName = baseNameMatch[1].trim();
      }
      
      return normalizedName;
    },
    
    extractBaseSymbol(symbol) {
      // Extraire le symbole de base (sans le suffixe SP)
      if (symbol && symbol.endsWith('SP')) {
        return symbol.slice(0, -2);
      }
      return symbol;
    },
    
    getShipClass(ship) {
      if (!ship) return 'Unknown';
      
      // Essayer d'extraire la classe du vaisseau des attributs
      if (ship.attributes) {
        if (ship.attributes.class) return ship.attributes.class;
        if (ship.attributes.shipClass) return ship.attributes.shipClass;
      }
      
      // Si aucune classe n'est trouvée, retourner 'Unknown'
      return 'Unknown';
    },
    
    sortBy(key) {
      // If clicking on the same column, toggle sort order
      if (this.sortKey === key) {
        this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
      } else {
        // If clicking on a different column, set it as the new sort key
        this.sortKey = key;
        this.sortOrder = 'asc';
      }
    },
    
    getDifferenceClass(difference) {
      if (difference === 0) return 'text-success';
      if (difference > 0) return 'text-primary';
      return 'text-danger';
    },
    
    formatDifference(difference) {
      if (difference === 0) return 'Equal quantities';
      if (difference > 0) return `${difference} excess ship parts`;
      return `${Math.abs(difference)} missing ship parts`;
    },
    
    exportToCSV() {
      if (!this.fleetData.length) return;
      
      // Define CSV headers
      const headers = ['Ship Name', 'Total Ships', 'Ship Parts', 'Difference'];
      
      // Convert data to CSV format
      const csvData = this.sortedFleetData.map(item => [
        item.shipName,
        item.shipCount,
        item.partCount,
        item.difference
      ]);
      
      // Add headers to the beginning
      csvData.unshift(headers);
      
      // Convert to CSV string
      const csvString = csvData.map(row => row.map(cell => {
        // Escape quotes and wrap fields with commas or quotes in double quotes
        const cellStr = String(cell);
        return cellStr.includes(',') || cellStr.includes('"') 
          ? `"${cellStr.replace(/"/g, '""')}"` 
          : cellStr;
      }).join(',')).join('\n');
      
      // Create a blob and download link
      const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      
      // Set download attributes
      const date = new Date().toISOString().slice(0, 10);
      link.setAttribute('href', url);
      link.setAttribute('download', `ship-parts-analysis-${date}.csv`);
      link.style.visibility = 'hidden';
      
      // Append to document, trigger download, and clean up
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    },
  }
};
</script>

<style>
.text-success {
  font-weight: bold;
}
.text-primary {
  font-weight: bold;
  color: #0d6efd !important;
}
.text-danger {
  font-weight: bold;
  color: #dc3545 !important;
}
.sortable {
  cursor: pointer;
}
.sort-asc {
  display: inline-block;
  width: 0;
  height: 0;
  border-left: 5px solid transparent;
  border-right: 5px solid transparent;
  border-bottom: 5px solid #000;
}
.sort-desc {
  display: inline-block;
  width: 0;
  height: 0;
  border-left: 5px solid transparent;
  border-right: 5px solid transparent;
  border-top: 5px solid #000;
}
.ship-symbol {
  font-size: 0.9em;
  color: #666;
}
.export-csv-btn {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 0.85rem;
}

.csv-icon {
  font-size: 1.1rem;
}
</style>
