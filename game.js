// Game State
const gameState = {
    player1: {
        score: 0,
        twoPointers: 0,
        threePointers: 0,
        misses: 0
    },
    player2: {
        score: 0,
        twoPointers: 0,
        threePointers: 0,
        misses: 0
    },
    gameOver: false,
    winningScore: 50
};

// Sound Effects (using Web Audio API for beeps)
const audioContext = new (window.AudioContext || window.webkitAudioContext)();

function playSound(frequency, duration) {
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = frequency;
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + duration);
}

function playScoredSound(points) {
    if (points === 2) {
        playSound(523.25, 0.2); // C5
    } else if (points === 3) {
        playSound(659.25, 0.15); // E5
        setTimeout(() => playSound(783.99, 0.2), 100); // G5
    }
}

function playMissSound() {
    playSound(196.00, 0.3); // G3 (lower, sadder sound)
}

function playWinSound() {
    playSound(523.25, 0.15); // C5
    setTimeout(() => playSound(659.25, 0.15), 150); // E5
    setTimeout(() => playSound(783.99, 0.3), 300); // G5
}

// Update Display
function updateDisplay() {
    // Update scores
    document.getElementById('score1').textContent = gameState.player1.score;
    document.getElementById('score2').textContent = gameState.player2.score;
    
    // Update stats
    document.getElementById('twoPointers1').textContent = gameState.player1.twoPointers;
    document.getElementById('threePointers1').textContent = gameState.player1.threePointers;
    document.getElementById('misses1').textContent = gameState.player1.misses;
    
    document.getElementById('twoPointers2').textContent = gameState.player2.twoPointers;
    document.getElementById('threePointers2').textContent = gameState.player2.threePointers;
    document.getElementById('misses2').textContent = gameState.player2.misses;
}

// Add to Game Log
function addToLog(message, playerClass) {
    const logDiv = document.getElementById('log');
    const entry = document.createElement('div');
    entry.className = `log-entry ${playerClass}`;
    
    const timestamp = new Date().toLocaleTimeString();
    entry.textContent = `[${timestamp}] ${message}`;
    
    logDiv.insertBefore(entry, logDiv.firstChild);
    
    // Keep only last 20 entries
    while (logDiv.children.length > 20) {
        logDiv.removeChild(logDiv.lastChild);
    }
}

// Shoot Function
function shoot(player, points) {
    if (gameState.gameOver) return;
    
    const playerKey = `player${player}`;
    gameState[playerKey].score += points;
    
    if (points === 2) {
        gameState[playerKey].twoPointers++;
    } else if (points === 3) {
        gameState[playerKey].threePointers++;
    }
    
    // Animate score
    const scoreElement = document.getElementById(`score${player}`);
    scoreElement.classList.add('pulse');
    setTimeout(() => scoreElement.classList.remove('pulse'), 500);
    
    // Play sound
    playScoredSound(points);
    
    // Add to log
    const playerName = `Player ${player}`;
    addToLog(`${playerName} SCORES ${points} POINTS! 🔥 Total: ${gameState[playerKey].score}`, `player${player}-action`);
    
    updateDisplay();
    checkWinner();
}

// Miss Function
function miss(player) {
    if (gameState.gameOver) return;
    
    const playerKey = `player${player}`;
    gameState[playerKey].misses++;
    
    // Play miss sound
    playMissSound();
    
    // Add to log
    const playerName = `Player ${player}`;
    addToLog(`${playerName} MISSES! 😬`, `player${player}-action`);
    
    updateDisplay();
}

// Check Winner
function checkWinner() {
    if (gameState.player1.score >= gameState.winningScore) {
        endGame(1);
    } else if (gameState.player2.score >= gameState.winningScore) {
        endGame(2);
    }
}

// End Game
function endGame(winner) {
    gameState.gameOver = true;
    playWinSound();
    
    const modal = document.getElementById('winnerModal');
    const winnerText = document.getElementById('winnerText');
    const finalStats = document.getElementById('finalStats');
    
    const winnerColor = winner === 1 ? '#4169e1' : '#dc143c';
    const winnerBadge = winner === 1 ? '🔵' : '🔴';
    
    winnerText.innerHTML = `${winnerBadge} PLAYER ${winner} WINS! ${winnerBadge}`;
    winnerText.style.color = winnerColor;
    
    const loser = winner === 1 ? 2 : 1;
    const winnerData = gameState[`player${winner}`];
    const loserData = gameState[`player${loser}`];
    
    finalStats.innerHTML = `
        <div style="margin-bottom: 20px;">
            <h3 style="color: ${winnerColor}; margin-bottom: 10px;">🏆 PLAYER ${winner} - CHAMPION</h3>
            <div>Final Score: ${winnerData.score} points</div>
            <div>2-Pointers Made: ${winnerData.twoPointers}</div>
            <div>3-Pointers Made: ${winnerData.threePointers}</div>
            <div>Misses: ${winnerData.misses}</div>
            <div>Shooting %: ${calculateShootingPercentage(winnerData)}%</div>
        </div>
        <div style="opacity: 0.7;">
            <h3 style="margin-bottom: 10px;">PLAYER ${loser}</h3>
            <div>Final Score: ${loserData.score} points</div>
            <div>2-Pointers Made: ${loserData.twoPointers}</div>
            <div>3-Pointers Made: ${loserData.threePointers}</div>
            <div>Misses: ${loserData.misses}</div>
            <div>Shooting %: ${calculateShootingPercentage(loserData)}%</div>
        </div>
    `;
    
    modal.classList.add('show');
    
    addToLog(`🏆 GAME OVER! PLAYER ${winner} WINS WITH ${winnerData.score} POINTS! 🏆`, `player${winner}-action`);
}

// Calculate Shooting Percentage
function calculateShootingPercentage(playerData) {
    const totalShots = playerData.twoPointers + playerData.threePointers + playerData.misses;
    if (totalShots === 0) return 0;
    const madeShotsValue = playerData.twoPointers + playerData.threePointers;
    return Math.round((madeShotsValue / totalShots) * 100);
}

// Reset Game
function resetGame() {
    gameState.player1 = {
        score: 0,
        twoPointers: 0,
        threePointers: 0,
        misses: 0
    };
    gameState.player2 = {
        score: 0,
        twoPointers: 0,
        threePointers: 0,
        misses: 0
    };
    gameState.gameOver = false;
    
    updateDisplay();
    
    const modal = document.getElementById('winnerModal');
    modal.classList.remove('show');
    
    const logDiv = document.getElementById('log');
    logDiv.innerHTML = '';
    
    addToLog('🏀 NEW GAME STARTED! First to 50 points wins! 🏀', '');
}

// Keyboard Controls
document.addEventListener('keydown', (e) => {
    if (gameState.gameOver) return;
    
    const key = e.key.toLowerCase();
    
    // Player 1 controls
    if (key === 'a') shoot(1, 2);
    else if (key === 's') shoot(1, 3);
    else if (key === 'd') miss(1);
    
    // Player 2 controls
    else if (key === 'j') shoot(2, 2);
    else if (key === 'k') shoot(2, 3);
    else if (key === 'l') miss(2);
});

// Initialize game on load
window.addEventListener('load', () => {
    updateDisplay();
    addToLog('🏀 GAME READY! First to 50 points wins! 🏀', '');
    addToLog('Player 1: A=2pt, S=3pt, D=Miss | Player 2: J=2pt, K=3pt, L=Miss', '');
});
