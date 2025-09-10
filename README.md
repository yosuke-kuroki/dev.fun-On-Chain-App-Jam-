# ⚔️ Solana Coin Battle Arena

**dev.fun On-Chain App Jam Submission**

A thrilling on-chain battle arena game where players can battle using their favorite pump.fun coins, stake SOL, and compete for prizes on the Solana blockchain.

## 🎮 Features

- **On-Chain Battles**: Real-time battles with pump.fun coin integration
- **SOL Payments**: Stake SOL to enter battles, winner takes all
- **Wallet Integration**: Connect with Phantom and other Solana wallets
- **Live Leaderboard**: Track top warriors and their earnings
- **Real-time Updates**: Live battle monitoring and status updates
- **Modern UI**: Beautiful, responsive design with animations

## 🚀 Quick Start

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Set Environment Variables**
   ```bash
   cp .env.example .env
   # Edit .env with your preferred Solana RPC URL
   ```

3. **Start the Server**
   ```bash
   npm start
   # or for development
   npm run dev
   ```

4. **Open in Browser**
   Navigate to `http://localhost:3000`

## 🎯 How to Play

1. **Connect Wallet**: Click "Connect Wallet" to link your Solana wallet
2. **Choose Coin**: Enter a pump.fun coin mint address or use sample coins
3. **Create Battle**: Set entry fee and create a new battle
4. **Join Battles**: Browse active battles and join as Player 2
5. **Battle**: Watch your coin warriors fight in real-time
6. **Win Prizes**: Winner takes the entire prize pool!

## 🔧 Technical Stack

- **Backend**: Express.js with Solana Web3.js
- **Frontend**: Vanilla JavaScript with modern CSS
- **Blockchain**: Solana mainnet integration
- **Wallet**: Phantom wallet support
- **API**: Pump.fun API integration

## 📡 API Endpoints

- `GET /api/coin/:mintAddress` - Get pump.fun coin data
- `POST /api/battle/create` - Create a new battle
- `POST /api/battle/:id/join` - Join an existing battle
- `GET /api/battle/:id` - Get battle status
- `GET /api/battles/active` - List active battles
- `GET /api/leaderboard` - Get top players
- `POST /api/payment/process` - Process SOL payments

## 🎨 Sample Coins

The app includes sample pump.fun coin addresses for easy testing:
- **$Buidl**: `EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v`
- **$Rick**: `So11111111111111111111111111111111111111112`
- **$Zala**: `DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263`

## 🏆 Competition Requirements

This app meets all dev.fun On-Chain App Jam requirements:

✅ **Built on Solana** - Full Solana blockchain integration  
✅ **On-Chain Elements** - SOL payments and transactions  
✅ **Pump.fun Integration** - Coin data and display  
✅ **Live on dev.fun** - Ready for deployment  
✅ **Engaging Gameplay** - Battle mechanics with real stakes  

## 🚀 Deployment

### For dev.fun Platform:
1. Deploy to your preferred hosting service (Vercel, Netlify, etc.)
2. Update the API base URL in `public/app.js`
3. Submit to dev.fun platform

### For Local Development:
```bash
npm install
npm start
```

## 🎮 Game Mechanics

- **Battle System**: Turn-based combat with randomized damage
- **Health System**: 100 HP per player, damage based on coin "power"
- **Prize Pool**: Winner takes 2x entry fee (minus platform fees)
- **Leaderboard**: Tracks wins, losses, and total earnings

## 🔐 Security Features

- Wallet signature verification
- Transaction validation
- Rate limiting on API endpoints
- Input sanitization

## 📱 Mobile Responsive

The app is fully responsive and works on:
- Desktop browsers
- Mobile devices
- Tablet screens

## 🎨 UI/UX Features

- Modern gradient backgrounds
- Smooth animations and transitions
- Real-time battle visualization
- Intuitive wallet connection
- Clear battle status indicators

## 🏅 Competition Submission

This app is specifically designed for the **dev.fun On-Chain App Jam** and includes:

- Innovative on-chain gaming mechanics
- Pump.fun coin integration
- Real SOL transactions
- Engaging user experience
- Modern, professional design

