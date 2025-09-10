// Solana Coin Battle Arena - Frontend JavaScript
class SolanaBattleArena {
    constructor() {
        this.wallet = null;
        this.walletAddress = null;
        this.walletBalance = 0;
        this.currentBattle = null;
        this.battleInterval = null;
        this.apiBase = window.location.origin;
        
        this.initializeApp();
    }
    
    async initializeApp() {
        this.setupEventListeners();
        await this.loadInitialData();
        this.startDataRefresh();
    }
    
    setupEventListeners() {
        // Wallet connection
        document.getElementById('connectWallet').addEventListener('click', () => this.connectWallet());
        
        // Coin loading
        document.getElementById('loadCoinData').addEventListener('click', () => this.loadCoinData());
        document.getElementById('coinMintInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.loadCoinData();
        });
        
        // Battle creation
        document.getElementById('createBattle').addEventListener('click', () => this.createBattle());
        
        // Auto-refresh battles
        setInterval(() => this.loadActiveBattles(), 5000);
        setInterval(() => this.loadLeaderboard(), 10000);
    }
    
    async connectWallet() {
        try {
            if (typeof window.solana !== 'undefined') {
                const response = await window.solana.connect();
                this.wallet = window.solana;
                this.walletAddress = response.publicKey.toString();
                
                // Update UI
                document.getElementById('connectWallet').style.display = 'none';
                document.getElementById('walletInfo').style.display = 'flex';
                document.getElementById('walletAddress').textContent = 
                    `${this.walletAddress.slice(0, 4)}...${this.walletAddress.slice(-4)}`;
                
                // Get balance
                await this.updateWalletBalance();
                
                this.showNotification('Wallet connected successfully!');
            } else {
                this.showNotification('Please install Phantom wallet!', 'error');
            }
        } catch (error) {
            console.error('Wallet connection failed:', error);
            this.showNotification('Failed to connect wallet', 'error');
        }
    }
    
    async updateWalletBalance() {
        if (!this.walletAddress) return;
        
        try {
            const response = await fetch(`${this.apiBase}/api/balance/${this.walletAddress}`);
            const data = await response.json();
            this.walletBalance = data.balance || 0;
            document.getElementById('walletBalance').textContent = `${this.walletBalance.toFixed(4)} SOL`;
        } catch (error) {
            console.error('Failed to fetch balance:', error);
        }
    }
    
    async loadCoinData() {
        const mintAddress = document.getElementById('coinMintInput').value.trim();
        if (!mintAddress) {
            this.showNotification('Please enter a coin mint address', 'error');
            return;
        }
        
        try {
            this.showLoading(true);
            const response = await fetch(`${this.apiBase}/api/coin/${mintAddress}`);
            const coinData = await response.json();
            
            if (coinData.error) {
                throw new Error(coinData.error);
            }
            
            // Display coin info
            document.getElementById('coinInfo').style.display = 'block';
            document.getElementById('coinName').textContent = coinData.name || 'Unknown Coin';
            document.getElementById('coinSymbol').textContent = coinData.symbol || 'UNKNOWN';
            document.getElementById('coinPrice').textContent = `$${coinData.price || '0.00'}`;
            document.getElementById('coinImage').src = coinData.image || 'https://via.placeholder.com/60x60?text=COIN';
            
            // Show battle creation section
            document.getElementById('battleCreation').style.display = 'block';
            
            this.showNotification('Coin data loaded successfully!');
        } catch (error) {
            console.error('Failed to load coin data:', error);
            this.showNotification('Failed to load coin data', 'error');
        } finally {
            this.showLoading(false);
        }
    }
    
    async createBattle() {
        if (!this.walletAddress) {
            this.showNotification('Please connect your wallet first', 'error');
            return;
        }
        
        const entryFee = parseFloat(document.getElementById('entryFee').value);
        const coinMint = document.getElementById('coinMintInput').value.trim();
        
        if (!coinMint) {
            this.showNotification('Please load a coin first', 'error');
            return;
        }
        
        try {
            this.showLoading(true);
            
            // Create battle
            const response = await fetch(`${this.apiBase}/api/battle/create`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    playerWallet: this.walletAddress,
                    coinMint: coinMint,
                    entryFee: entryFee
                })
            });
            
            const data = await response.json();
            
            if (data.error) {
                throw new Error(data.error);
            }
            
            this.currentBattle = data.battle;
            this.showNotification('Battle created! Waiting for opponent...');
            
            // Start monitoring the battle
            this.monitorBattle(data.battleId);
            
        } catch (error) {
            console.error('Failed to create battle:', error);
            this.showNotification('Failed to create battle', 'error');
        } finally {
            this.showLoading(false);
        }
    }
    
    async joinBattle(battleId) {
        if (!this.walletAddress) {
            this.showNotification('Please connect your wallet first', 'error');
            return;
        }
        
        const coinMint = document.getElementById('coinMintInput').value.trim();
        if (!coinMint) {
            this.showNotification('Please load a coin first', 'error');
            return;
        }
        
        try {
            this.showLoading(true);
            
            const response = await fetch(`${this.apiBase}/api/battle/${battleId}/join`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    playerWallet: this.walletAddress,
                    coinMint: coinMint
                })
            });
            
            const data = await response.json();
            
            if (data.error) {
                throw new Error(data.error);
            }
            
            this.currentBattle = data.battle;
            this.showNotification('Joined battle! Battle starting...');
            
            // Start monitoring the battle
            this.monitorBattle(battleId);
            
        } catch (error) {
            console.error('Failed to join battle:', error);
            this.showNotification('Failed to join battle', 'error');
        } finally {
            this.showLoading(false);
        }
    }
    
    async monitorBattle(battleId) {
        this.battleInterval = setInterval(async () => {
            try {
                const response = await fetch(`${this.apiBase}/api/battle/${battleId}`);
                const data = await response.json();
                
                if (data.battle) {
                    this.updateBattleDisplay(data.battle);
                    
                    if (data.battle.status === 'completed') {
                        clearInterval(this.battleInterval);
                        this.showBattleResult(data.battle);
                    }
                }
            } catch (error) {
                console.error('Failed to monitor battle:', error);
            }
        }, 1000);
    }
    
    updateBattleDisplay(battle) {
        // Show battle arena
        document.getElementById('battleArena').style.display = 'block';
        
        // Update player info
        document.getElementById('player1Name').textContent = 
            `${battle.player1.wallet.slice(0, 6)}...${battle.player1.wallet.slice(-4)}`;
        document.getElementById('player2Name').textContent = 
            battle.player2 ? `${battle.player2.wallet.slice(0, 6)}...${battle.player2.wallet.slice(-4)}` : 'Waiting...';
        
        // Update health bars
        const p1HealthPercent = (battle.player1.health / 100) * 100;
        const p2HealthPercent = battle.player2 ? (battle.player2.health / 100) * 100 : 100;
        
        document.getElementById('player1Health').style.width = `${p1HealthPercent}%`;
        document.getElementById('player2Health').style.width = `${p2HealthPercent}%`;
        
        document.getElementById('player1HealthText').textContent = `${battle.player1.health}/100`;
        document.getElementById('player2HealthText').textContent = 
            battle.player2 ? `${battle.player2.health}/100` : '100/100';
        
        // Update battle status
        const statusElement = document.getElementById('battleStatus');
        switch (battle.status) {
            case 'waiting':
                statusElement.textContent = 'Waiting for opponent...';
                break;
            case 'active':
                statusElement.textContent = 'Battle in progress!';
                break;
            case 'completed':
                statusElement.textContent = 'Battle completed!';
                break;
        }
        
        // Update battle logs
        if (battle.rounds) {
            this.updateBattleLogs(battle.rounds);
        }
    }
    
    updateBattleLogs(rounds) {
        const logsContainer = document.getElementById('battleLogs');
        logsContainer.innerHTML = '';
        
        rounds.slice(-5).forEach(round => {
            const logElement = document.createElement('div');
            logElement.className = 'battle-log';
            logElement.innerHTML = `
                <strong>Round ${round.round}:</strong> 
                Player 1 deals ${round.p1Attack} damage, Player 2 deals ${round.p2Attack} damage
            `;
            logsContainer.appendChild(logElement);
        });
        
        logsContainer.scrollTop = logsContainer.scrollHeight;
    }
    
    showBattleResult(battle) {
        const winner = battle.winner;
        const isWinner = winner.wallet === this.walletAddress;
        
        const message = isWinner 
            ? `🎉 Victory! You won ${battle.prize} SOL!`
            : `💔 Defeat! Better luck next time!`;
        
        this.showNotification(message, isWinner ? 'success' : 'info');
        
        // Hide battle arena after 5 seconds
        setTimeout(() => {
            document.getElementById('battleArena').style.display = 'none';
        }, 5000);
    }
    
    async loadActiveBattles() {
        try {
            const response = await fetch(`${this.apiBase}/api/battles/active`);
            const data = await response.json();
            
            this.displayBattles(data.battles);
        } catch (error) {
            console.error('Failed to load battles:', error);
        }
    }
    
    displayBattles(battles) {
        const battlesList = document.getElementById('battlesList');
        battlesList.innerHTML = '';
        
        if (battles.length === 0) {
            battlesList.innerHTML = '<p style="text-align: center; opacity: 0.7;">No active battles. Create one to get started!</p>';
            return;
        }
        
        battles.forEach(battle => {
            const battleCard = document.createElement('div');
            battleCard.className = 'battle-card';
            
            const canJoin = battle.status === 'waiting' && 
                           battle.player1.wallet !== this.walletAddress;
            
            battleCard.innerHTML = `
                <h4>Battle #${battle.id.slice(-8)}</h4>
                <div class="battle-info">
                    <span>Entry Fee: ${battle.entryFee} SOL</span>
                    <span>Prize: ${battle.prize} SOL</span>
                </div>
                <div class="battle-status status-${battle.status}">
                    ${battle.status.toUpperCase()}
                </div>
                <p style="margin: 1rem 0; font-size: 0.9rem;">
                    Player 1: ${battle.player1.wallet.slice(0, 6)}...${battle.player1.wallet.slice(-4)}
                </p>
                ${canJoin ? `
                    <button class="btn-secondary" onclick="app.joinBattle('${battle.id}')">
                        Join Battle
                    </button>
                ` : ''}
            `;
            
            battlesList.appendChild(battleCard);
        });
    }
    
    async loadLeaderboard() {
        try {
            const response = await fetch(`${this.apiBase}/api/leaderboard`);
            const data = await response.json();
            
            this.displayLeaderboard(data.leaderboard);
        } catch (error) {
            console.error('Failed to load leaderboard:', error);
        }
    }
    
    displayLeaderboard(leaderboard) {
        const leaderboardList = document.getElementById('leaderboardList');
        leaderboardList.innerHTML = '';
        
        if (leaderboard.length === 0) {
            leaderboardList.innerHTML = '<p style="text-align: center; opacity: 0.7;">No players yet. Be the first to battle!</p>';
            return;
        }
        
        leaderboard.forEach((player, index) => {
            const item = document.createElement('div');
            item.className = 'leaderboard-item';
            
            const rank = index + 1;
            const rankEmoji = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : '🏅';
            
            item.innerHTML = `
                <div class="leaderboard-rank">${rankEmoji} ${rank}</div>
                <div class="leaderboard-wallet">${player.wallet.slice(0, 8)}...${player.wallet.slice(-8)}</div>
                <div class="leaderboard-stats">
                    <span>Wins: ${player.wins}</span>
                    <span>Losses: ${player.losses}</span>
                    <span>Earnings: ${player.totalEarnings.toFixed(4)} SOL</span>
                </div>
            `;
            
            leaderboardList.appendChild(item);
        });
    }
    
    async loadInitialData() {
        await this.loadActiveBattles();
        await this.loadLeaderboard();
    }
    
    startDataRefresh() {
        // Refresh stats every 30 seconds
        setInterval(async () => {
            try {
                const response = await fetch(`${this.apiBase}/api/stats`);
                const stats = await response.json();
                
                document.getElementById('totalBattles').textContent = stats.totalBattles || 0;
                document.getElementById('activePlayers').textContent = stats.activePlayers || 0;
                document.getElementById('totalPrize').textContent = stats.totalPrize || 0;
            } catch (error) {
                console.error('Failed to load stats:', error);
            }
        }, 30000);
    }
    
    showLoading(show) {
        document.getElementById('loadingOverlay').style.display = show ? 'flex' : 'none';
    }
    
    showNotification(message, type = 'success') {
        const notification = document.getElementById('notification');
        const notificationText = document.getElementById('notificationText');
        
        notificationText.textContent = message;
        notification.className = `notification ${type}`;
        notification.style.display = 'block';
        
        setTimeout(() => {
            notification.style.display = 'none';
        }, 3000);
    }
}

// Initialize the app when the page loads
let app;
document.addEventListener('DOMContentLoaded', () => {
    app = new SolanaBattleArena();
});

// Add some sample pump.fun coin addresses for easy testing
const sampleCoins = {
    'Buidl': 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', // USDC as example
    'Rick': 'So11111111111111111111111111111111111111112', // SOL as example
    'Zala': 'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263' // BONK as example
};

// Add sample coin buttons
document.addEventListener('DOMContentLoaded', () => {
    const coinInputSection = document.querySelector('.coin-input-section');
    const sampleCoinsDiv = document.createElement('div');
    sampleCoinsDiv.style.marginTop = '1rem';
    sampleCoinsDiv.innerHTML = `
        <p style="margin-bottom: 0.5rem; opacity: 0.8;">Quick select sample coins:</p>
        <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
            ${Object.entries(sampleCoins).map(([name, address]) => 
                `<button class="btn-secondary" onclick="document.getElementById('coinMintInput').value='${address}'">${name}</button>`
            ).join('')}
        </div>
    `;
    coinInputSection.appendChild(sampleCoinsDiv);
});
