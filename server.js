const express = require('express');
const cors = require('cors');
const path = require('path');
const { Connection, PublicKey, Keypair, Transaction, SystemProgram, LAMPORTS_PER_SOL } = require('@solana/web3.js');
const { getAssociatedTokenAddress, createTransferInstruction, getAccount } = require('@solana/spl-token');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Solana connection
const connection = new Connection(process.env.SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com');

// Game state storage (in production, use a proper database)
const gameState = {
  battles: new Map(),
  players: new Map(),
  leaderboard: []
};

// Pump.fun API integration
const PUMP_FUN_API = 'https://frontend-api.pump.fun';

// Routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Get pump.fun coin data
app.get('/api/coin/:mintAddress', async (req, res) => {
  try {
    const { mintAddress } = req.params;
    const response = await axios.get(`${PUMP_FUN_API}/coins/${mintAddress}`);
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching coin data:', error);
    res.status(500).json({ error: 'Failed to fetch coin data' });
  }
});

// Create a new battle
app.post('/api/battle/create', async (req, res) => {
  try {
    const { playerWallet, coinMint, entryFee } = req.body;
    
    const battleId = `battle_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const battle = {
      id: battleId,
      player1: {
        wallet: playerWallet,
        coinMint: coinMint,
        power: Math.floor(Math.random() * 100) + 50,
        health: 100
      },
      player2: null,
      status: 'waiting',
      entryFee: entryFee || 0.001, // 0.001 SOL default
      prize: 0,
      createdAt: Date.now()
    };
    
    gameState.battles.set(battleId, battle);
    
    res.json({ battleId, battle });
  } catch (error) {
    console.error('Error creating battle:', error);
    res.status(500).json({ error: 'Failed to create battle' });
  }
});

// Join a battle
app.post('/api/battle/:battleId/join', async (req, res) => {
  try {
    const { battleId } = req.params;
    const { playerWallet, coinMint } = req.body;
    
    const battle = gameState.battles.get(battleId);
    if (!battle) {
      return res.status(404).json({ error: 'Battle not found' });
    }
    
    if (battle.status !== 'waiting') {
      return res.status(400).json({ error: 'Battle is not available' });
    }
    
    battle.player2 = {
      wallet: playerWallet,
      coinMint: coinMint,
      power: Math.floor(Math.random() * 100) + 50,
      health: 100
    };
    
    battle.status = 'active';
    battle.prize = battle.entryFee * 2; // Winner takes all
    
    // Start the battle simulation
    setTimeout(() => simulateBattle(battleId), 2000);
    
    res.json({ battle });
  } catch (error) {
    console.error('Error joining battle:', error);
    res.status(500).json({ error: 'Failed to join battle' });
  }
});

// Get battle status
app.get('/api/battle/:battleId', (req, res) => {
  const { battleId } = req.params;
  const battle = gameState.battles.get(battleId);
  
  if (!battle) {
    return res.status(404).json({ error: 'Battle not found' });
  }
  
  res.json({ battle });
});

// Get leaderboard
app.get('/api/leaderboard', (req, res) => {
  const leaderboard = Array.from(gameState.players.values())
    .sort((a, b) => b.wins - a.wins)
    .slice(0, 10);
  
  res.json({ leaderboard });
});

// Process payment for battle entry
app.post('/api/payment/process', async (req, res) => {
  try {
    const { fromWallet, toWallet, amount, battleId } = req.body;
    
    // In a real implementation, you would:
    // 1. Verify the transaction on-chain
    // 2. Check wallet signatures
    // 3. Process the actual SOL transfer
    
    // For demo purposes, we'll simulate a successful payment
    const transactionId = `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Update battle with payment confirmation
    const battle = gameState.battles.get(battleId);
    if (battle) {
      battle.paymentConfirmed = true;
      battle.transactionId = transactionId;
    }
    
    res.json({ 
      success: true, 
      transactionId,
      message: 'Payment processed successfully' 
    });
  } catch (error) {
    console.error('Error processing payment:', error);
    res.status(500).json({ error: 'Failed to process payment' });
  }
});

// Battle simulation logic
function simulateBattle(battleId) {
  const battle = gameState.battles.get(battleId);
  if (!battle || battle.status !== 'active') return;
  
  const rounds = [];
  let round = 1;
  
  const simulateRound = () => {
    if (battle.player1.health <= 0 || battle.player2.health <= 0) {
      // Battle finished
      const winner = battle.player1.health > 0 ? battle.player1 : battle.player2;
      const loser = battle.player1.health > 0 ? battle.player2 : battle.player1;
      
      battle.status = 'completed';
      battle.winner = winner;
      battle.loser = loser;
      battle.completedAt = Date.now();
      
      // Update player stats
      updatePlayerStats(winner.wallet, true);
      updatePlayerStats(loser.wallet, false);
      
      return;
    }
    
    // Simulate attack
    const p1Attack = Math.floor(Math.random() * battle.player1.power);
    const p2Attack = Math.floor(Math.random() * battle.player2.power);
    
    battle.player2.health = Math.max(0, battle.player2.health - p1Attack);
    battle.player1.health = Math.max(0, battle.player1.health - p2Attack);
    
    rounds.push({
      round,
      p1Attack,
      p2Attack,
      p1Health: battle.player1.health,
      p2Health: battle.player2.health
    });
    
    round++;
    
    // Continue battle if both players alive
    if (battle.player1.health > 0 && battle.player2.health > 0) {
      setTimeout(simulateRound, 1000);
    } else {
      simulateRound(); // Final round
    }
  };
  
  battle.rounds = rounds;
  simulateRound();
}

// Update player statistics
function updatePlayerStats(wallet, won) {
  if (!gameState.players.has(wallet)) {
    gameState.players.set(wallet, {
      wallet,
      wins: 0,
      losses: 0,
      totalBattles: 0,
      totalEarnings: 0
    });
  }
  
  const player = gameState.players.get(wallet);
  player.totalBattles++;
  
  if (won) {
    player.wins++;
    player.totalEarnings += 0.001; // Example earnings
  } else {
    player.losses++;
  }
}

// Get active battles
app.get('/api/battles/active', (req, res) => {
  const activeBattles = Array.from(gameState.battles.values())
    .filter(battle => battle.status === 'waiting' || battle.status === 'active')
    .sort((a, b) => b.createdAt - a.createdAt);
  
  res.json({ battles: activeBattles });
});

app.listen(PORT, () => {
  console.log(`🚀 Solana Coin Battle Arena running on port ${PORT}`);
  console.log(`🎮 Ready for the dev.fun On-Chain App Jam!`);
});
