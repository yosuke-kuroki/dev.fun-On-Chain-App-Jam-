// Configuration file for Solana Coin Battle Arena
module.exports = {
  // Solana network configuration
  solana: {
    rpcUrl: process.env.SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com',
    commitment: 'confirmed'
  },
  
  // Pump.fun API configuration
  pumpFun: {
    apiUrl: process.env.PUMP_FUN_API || 'https://frontend-api.pump.fun'
  },
  
  // Game configuration
  game: {
    defaultEntryFee: 0.001, // SOL
    minEntryFee: 0.001,
    maxEntryFee: 0.1,
    battleTimeout: 300000, // 5 minutes
    refreshInterval: 5000 // 5 seconds
  },
  
  // Server configuration
  server: {
    port: process.env.PORT || 3000,
    cors: {
      origin: '*',
      credentials: true
    }
  }
};
