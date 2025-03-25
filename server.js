const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

// Create Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Serve static files from the Vue app build directory
app.use(express.static(path.join(__dirname, 'web-app/dist')));

// API endpoint to analyze fleet
app.post('/api/analyze-fleet', async (req, res) => {
  try {
    const { walletAddress } = req.body;
    
    if (!walletAddress) {
      return res.status(400).json({ 
        success: false, 
        error: 'Wallet address is required' 
      });
    }
    
    console.log(`Analyzing fleet for wallet: ${walletAddress}`);
    
    // Import the compiled fleetManager module directly
    try {
      // Dynamically import the compiled module
      const fleetManager = require('./dist/fleetManager');
      
      // Call the analyzeFleet function
      const result = await fleetManager.analyzeFleet(walletAddress);
      
      return res.json({
        success: true,
        result: result
      });
    } catch (error) {
      console.error('Error executing fleetManager:', error);
      return res.status(500).json({
        success: false,
        error: 'Error analyzing fleet: ' + (error.message || 'Unknown error')
      });
    }
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Internal server error' 
    });
  }
});

// Catch-all handler to serve the Vue app
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'web-app/dist/index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
