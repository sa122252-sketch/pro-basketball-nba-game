// Game Configuration
const CONFIG = {
    canvas: {
        width: 1000,
        height: 600
    },
    court: {
        threePointLine: 237.5,
        paintWidth: 160,
        rimRadius: 18
    },
    player: {
        size: 20,
        speed: 3,
        sprintSpeed: 5,
        shootRange: 400
    },
    ball: {
        size: 10,
        shootSpeed: 8
    },
    game: {
        shotClockDuration: 24,
        quarterDuration: 720, // 12 minutes = 720 seconds
        winningScore: 50
    }
};

// Game State
class GameState {
    constructor() {
        this.reset();
    }

    reset() {
        this.quarter = 1;
        this.timeRemaining = CONFIG.game.quarterDuration;
        this.shotClock = CONFIG.game.shotClockDuration;
        this.paused = false;
        this.gameOver = false;
        this.winner = null;
        
        this.player1 = {
            x: 150,
            y: 300,
            vx: 0,
            vy: 0,
            color: '#4169e1',
            hasBall: true,
            score: 0,
            stats: {
                fgMade: 0,
                fgAttempts: 0,
                threeMade: 0,
                threeAttempts: 0,
                steals: 0
            }
        };
        
        this.player2 = {
            x: 850,
            y: 300,
            vx: 0,
            vy: 0,
            color: '#dc143c',
            hasBall: false,
            score: 0,
            stats: {
                fgMade: 0,
                fgAttempts: 0,
                threeMade: 0,
                threeAttempts: 0,
                steals: 0
            }
        };
        
        this.ball = {
            x: 150,
            y: 300,
            vx: 0,
            vy: 0,
            inAir: false,
            shooter: null,
            targetX: 0,
            targetY: 0,
            arc: 0,
            arcProgress: 0
        };
        
        this.lastPossession = 1;
    }
}

// Game Class
class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.canvas.width = CONFIG.canvas.width;
        this.canvas.height = CONFIG.canvas.height;
        
        this.state = new GameState();
        this.keys = {};
        this.lastTime = 0;
        
        this.init();
    }
    
    init() {
        // Event listeners
        document.addEventListener('keydown', (e) => {
            this.keys[e.key] = true;
            if (e.key === 'Escape') {
                this.togglePause();
            }
        });
        
        document.addEventListener('keyup', (e) => {
            this.keys[e.key] = false;
        });
        
        // Start game loop
        requestAnimationFrame((time) => this.gameLoop(time));
        
        // Start timers
        setInterval(() => this.updateTimers(), 1000);
    }
    
    gameLoop(currentTime) {
        const deltaTime = currentTime - this.lastTime;
        this.lastTime = currentTime;
        
        if (!this.state.paused && !this.state.gameOver) {
            this.update(deltaTime);
        }
        
        this.render();
        requestAnimationFrame((time) => this.gameLoop(time));
    }
    
    update(deltaTime) {
        this.handleInput();
        this.updatePhysics();
        this.checkCollisions();
        this.updateBall();
    }
    
    handleInput() {
        const p1 = this.state.player1;
        const p2 = this.state.player2;
        
        // Player 1 movement (WASD)
        p1.vx = 0;
        p1.vy = 0;
        const p1Speed = this.keys['Shift'] ? CONFIG.player.sprintSpeed : CONFIG.player.speed;
        
        if (this.keys['w'] || this.keys['W']) p1.vy = -p1Speed;
        if (this.keys['s'] || this.keys['S']) p1.vy = p1Speed;
        if (this.keys['a'] || this.keys['A']) p1.vx = -p1Speed;
        if (this.keys['d'] || this.keys['D']) p1.vx = p1Speed;
        
        // Player 1 shoot/steal (SPACE)
        if (this.keys[' '] && !this.state.ball.inAir) {
            if (p1.hasBall) {
                this.shoot(p1, 1);
                this.keys[' '] = false;
            } else {
                this.attemptSteal(p1, p2, 1);
            }
        }
        
        // Player 2 movement (Arrow keys)
        p2.vx = 0;
        p2.vy = 0;
        const p2Speed = this.keys['Shift'] ? CONFIG.player.sprintSpeed : CONFIG.player.speed;
        
        if (this.keys['ArrowUp']) p2.vy = -p2Speed;
        if (this.keys['ArrowDown']) p2.vy = p2Speed;
        if (this.keys['ArrowLeft']) p2.vx = -p2Speed;
        if (this.keys['ArrowRight']) p2.vx = p2Speed;
        
        // Player 2 shoot/steal (ENTER)
        if (this.keys['Enter'] && !this.state.ball.inAir) {
            if (p2.hasBall) {
                this.shoot(p2, 2);
                this.keys['Enter'] = false;
            } else {
                this.attemptSteal(p2, p1, 2);
            }
        }
    }
    
    updatePhysics() {
        const p1 = this.state.player1;
        const p2 = this.state.player2;
        
        // Update player positions
        p1.x += p1.vx;
        p1.y += p1.vy;
        p2.x += p2.vx;
        p2.y += p2.vy;
        
        // Keep players in bounds
        this.keepInBounds(p1);
        this.keepInBounds(p2);
        
        // Ball follows player with possession
        if (!this.state.ball.inAir) {
            if (p1.hasBall) {
                this.state.ball.x = p1.x;
                this.state.ball.y = p1.y;
            } else if (p2.hasBall) {
                this.state.ball.x = p2.x;
                this.state.ball.y = p2.y;
            }
        }
    }
    
    keepInBounds(player) {
        const margin = CONFIG.player.size;
        player.x = Math.max(margin, Math.min(CONFIG.canvas.width - margin, player.x));
        player.y = Math.max(margin, Math.min(CONFIG.canvas.height - margin, player.y));
    }
    
    checkCollisions() {
        const p1 = this.state.player1;
        const p2 = this.state.player2;
        const dist = Math.hypot(p2.x - p1.x, p2.y - p1.y);
        
        if (dist < CONFIG.player.size * 2) {
            // Push players apart
            const angle = Math.atan2(p2.y - p1.y, p2.x - p1.x);
            const overlap = CONFIG.player.size * 2 - dist;
            
            p1.x -= Math.cos(angle) * overlap / 2;
            p1.y -= Math.sin(angle) * overlap / 2;
            p2.x += Math.cos(angle) * overlap / 2;
            p2.y += Math.sin(angle) * overlap / 2;
        }
    }
    
    shoot(player, playerNum) {
        const ball = this.state.ball;
        
        // Determine target (basket)
        const basketX = playerNum === 1 ? CONFIG.canvas.width - 30 : 30;
        const basketY = CONFIG.canvas.height / 2;
        
        // Calculate distance to basket
        const distance = Math.hypot(basketX - player.x, basketY - player.y);
        
        // Set ball trajectory
        ball.inAir = true;
        ball.shooter = playerNum;
        ball.targetX = basketX;
        ball.targetY = basketY;
        ball.arcProgress = 0;
        ball.arc = distance / 2; // Arc height based on distance
        
        player.hasBall = false;
        
        // Update stats
        player.stats.fgAttempts++;
        const isThreePointer = distance > CONFIG.court.threePointLine;
        if (isThreePointer) {
            player.stats.threeAttempts++;
        }
        
        // Calculate accuracy (closer = better)
        const accuracy = Math.max(0.3, 1 - (distance / CONFIG.player.shootRange));
        const randomFactor = Math.random();
        
        // Determine if shot is successful
        setTimeout(() => {
            if (randomFactor < accuracy) {
                this.scoreBasket(playerNum, isThreePointer);
            } else {
                this.missShot(playerNum);
            }
        }, 800);
    }
    
    scoreBasket(playerNum, isThreePointer) {
        const player = playerNum === 1 ? this.state.player1 : this.state.player2;
        const points = isThreePointer ? 3 : 2;
        
        player.score += points;
        player.stats.fgMade++;
        if (isThreePointer) {
            player.stats.threeMade++;
        }
        
        // Play sound
        this.playSound(800, 0.2);
        
        // Reset possession to other player
        this.resetPossession(playerNum === 1 ? 2 : 1);
        
        // Update UI
        this.updateUI();
        
        // Check for winner
        if (player.score >= CONFIG.game.winningScore) {
            this.endGame(playerNum);
        }
    }
    
    missShot(playerNum) {
        // Play miss sound
        this.playSound(200, 0.3);
        
        // Rebound goes to defensive player
        this.resetPossession(playerNum === 1 ? 2 : 1);
    }
    
    resetPossession(playerNum) {
        this.state.ball.inAir = false;
        this.state.shotClock = CONFIG.game.shotClockDuration;
        
        if (playerNum === 1) {
            this.state.player1.hasBall = true;
            this.state.player2.hasBall = false;
            this.state.player1.x = 150;
            this.state.player1.y = 300;
        } else {
            this.state.player1.hasBall = false;
            this.state.player2.hasBall = true;
            this.state.player2.x = 850;
            this.state.player2.y = 300;
        }
        
        this.state.lastPossession = playerNum;
    }
    
    attemptSteal(defender, ballHandler, defenderNum) {
        const dist = Math.hypot(ballHandler.x - defender.x, ballHandler.y - defender.y);
        
        if (dist < CONFIG.player.size * 2.5) {
            // Successful steal
            if (Math.random() < 0.3) {
                ballHandler.hasBall = false;
                defender.hasBall = true;
                defender.stats.steals++;
                this.state.shotClock = CONFIG.game.shotClockDuration;
                this.playSound(600, 0.15);
                this.updateUI();
            }
        }
    }
    
    updateBall() {
        if (this.state.ball.inAir) {
            this.state.ball.arcProgress += 0.02;
            
            if (this.state.ball.arcProgress >= 1) {
                this.state.ball.arcProgress = 1;
            }
            
            // Calculate ball position along arc
            const startX = this.state.ball.shooter === 1 ? this.state.player1.x : this.state.player2.x;
            const startY = this.state.ball.shooter === 1 ? this.state.player1.y : this.state.player2.y;
            
            this.state.ball.x = startX + (this.state.ball.targetX - startX) * this.state.ball.arcProgress;
            this.state.ball.y = startY + (this.state.ball.targetY - startY) * this.state.ball.arcProgress - 
                                Math.sin(this.state.ball.arcProgress * Math.PI) * this.state.ball.arc;
        }
    }
    
    updateTimers() {
        if (this.state.paused || this.state.gameOver) return;
        
        // Update shot clock
        if (this.state.shotClock > 0) {
            this.state.shotClock--;
            document.getElementById('shotClock').textContent = this.state.shotClock;
            
            // Update shot clock color
            const shotClockEl = document.getElementById('shotClock');
            if (this.state.shotClock <= 5) {
                shotClockEl.className = 'shot-clock-value critical';
            } else if (this.state.shotClock <= 10) {
                shotClockEl.className = 'shot-clock-value warning';
            } else {
                shotClockEl.className = 'shot-clock-value';
            }
        } else {
            // Shot clock violation - turnover
            this.resetPossession(this.state.lastPossession === 1 ? 2 : 1);
        }
        
        // Update game time
        if (this.state.timeRemaining > 0) {
            this.state.timeRemaining--;
            const minutes = Math.floor(this.state.timeRemaining / 60);
            const seconds = this.state.timeRemaining % 60;
            document.getElementById('timer').textContent = 
                `${minutes}:${seconds.toString().padStart(2, '0')}`;
        } else {
            // Quarter ended
            if (this.state.quarter < 4) {
                this.state.quarter++;
                this.state.timeRemaining = CONFIG.game.quarterDuration;
                document.getElementById('quarter').textContent = this.state.quarter;
            } else {
                // Game over - check scores
                if (this.state.player1.score !== this.state.player2.score) {
                    this.endGame(this.state.player1.score > this.state.player2.score ? 1 : 2);
                } else {
                    // Overtime
                    this.state.quarter++;
                    this.state.timeRemaining = 300; // 5 minute OT
                    document.getElementById('quarter').textContent = 'OT' + (this.state.quarter - 4);
                }
            }
        }
    }
    
    updateUI() {
        document.getElementById('p1Score').textContent = this.state.player1.score;
        document.getElementById('p2Score').textContent = this.state.player2.score;
        
        const p1 = this.state.player1.stats;
        const p2 = this.state.player2.stats;
        
        document.getElementById('p1FG').textContent = `${p1.fgMade}/${p1.fgAttempts}`;
        document.getElementById('p13PT').textContent = `${p1.threeMade}/${p1.threeAttempts}`;
        document.getElementById('p1STL').textContent = p1.steals;
        
        document.getElementById('p2FG').textContent = `${p2.fgMade}/${p2.fgAttempts}`;
        document.getElementById('p23PT').textContent = `${p2.threeMade}/${p2.threeAttempts}`;
        document.getElementById('p2STL').textContent = p2.steals;
    }
    
    render() {
        this.ctx.clearRect(0, 0, CONFIG.canvas.width, CONFIG.canvas.height);
        
        this.drawCourt();
        this.drawPlayers();
        this.drawBall();
    }
    
    drawCourt() {
        const ctx = this.ctx;
        const w = CONFIG.canvas.width;
        const h = CONFIG.canvas.height;
        
        // Court background
        ctx.fillStyle = '#2d5016';
        ctx.fillRect(0, 0, w, h);
        
        // Court lines
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 3;
        
        // Half court line
        ctx.beginPath();
        ctx.moveTo(w / 2, 0);
        ctx.lineTo(w / 2, h);
        ctx.stroke();
        
        // Center circle
        ctx.beginPath();
        ctx.arc(w / 2, h / 2, 60, 0, Math.PI * 2);
        ctx.stroke();
        
        // Left basket
        ctx.fillStyle = '#ff6b35';
        ctx.beginPath();
        ctx.arc(30, h / 2, CONFIG.court.rimRadius, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = 'white';
        ctx.stroke();
        
        // Right basket
        ctx.beginPath();
        ctx.arc(w - 30, h / 2, CONFIG.court.rimRadius, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = 'white';
        ctx.stroke();
        
        // Three-point lines (simplified)
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.lineWidth = 2;
        
        // Left three-point arc
        ctx.beginPath();
        ctx.arc(30, h / 2, CONFIG.court.threePointLine, -Math.PI / 2, Math.PI / 2);
        ctx.stroke();
        
        // Right three-point arc
        ctx.beginPath();
        ctx.arc(w - 30, h / 2, CONFIG.court.threePointLine, Math.PI / 2, -Math.PI / 2);
        ctx.stroke();
        
        // Paint areas
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.strokeRect(30, (h - CONFIG.court.paintWidth) / 2, 150, CONFIG.court.paintWidth);
        ctx.strokeRect(w - 180, (h - CONFIG.court.paintWidth) / 2, 150, CONFIG.court.paintWidth);
    }
    
    drawPlayers() {
        this.drawPlayer(this.state.player1, '1');
        this.drawPlayer(this.state.player2, '2');
    }
    
    drawPlayer(player, number) {
        const ctx = this.ctx;
        
        // Player circle
        ctx.fillStyle = player.color;
        ctx.beginPath();
        ctx.arc(player.x, player.y, CONFIG.player.size, 0, Math.PI * 2);
        ctx.fill();
        
        // Player border
        ctx.strokeStyle = player.hasBall ? '#ffd700' : 'white';
        ctx.lineWidth = player.hasBall ? 4 : 2;
        ctx.stroke();
        
        // Player number
        ctx.fillStyle = 'white';
        ctx.font = 'bold 20px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(number, player.x, player.y);
        
        // Direction indicator
        if (Math.abs(player.vx) > 0 || Math.abs(player.vy) > 0) {
            const angle = Math.atan2(player.vy, player.vx);
            ctx.strokeStyle = player.color;
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(player.x, player.y);
            ctx.lineTo(
                player.x + Math.cos(angle) * (CONFIG.player.size + 10),
                player.y + Math.sin(angle) * (CONFIG.player.size + 10)
            );
            ctx.stroke();
        }
    }
    
    drawBall() {
        const ctx = this.ctx;
        const ball = this.state.ball;
        
        if (!ball.inAir || ball.arcProgress < 1) {
            // Ball
            ctx.fillStyle = '#ff6b35';
            ctx.beginPath();
            ctx.arc(ball.x, ball.y, CONFIG.ball.size, 0, Math.PI * 2);
            ctx.fill();
            
            // Ball lines
            ctx.strokeStyle = 'black';
            ctx.lineWidth = 1.5;
            ctx.stroke();
            
            // Ball highlight
            ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
            ctx.beginPath();
            ctx.arc(ball.x - 3, ball.y - 3, 3, 0, Math.PI * 2);
            ctx.fill();
        }
    }
    
    playSound(frequency, duration) {
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.value = frequency;
            oscillator.type = 'sine';
            
            gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + duration);
        } catch (e) {
            // Audio not supported
        }
    }
    
    togglePause() {
        if (this.state.gameOver) return;
        
        this.state.paused = !this.state.paused;
        const modal = document.getElementById('pauseMenu');
        modal.classList.toggle('show', this.state.paused);
    }
    
    resume() {
        this.state.paused = false;
        document.getElementById('pauseMenu').classList.remove('show');
    }
    
    endGame(winner) {
        this.state.gameOver = true;
        this.state.winner = winner;
        
        const modal = document.getElementById('winnerModal');
        const winnerText = document.getElementById('winnerText');
        const finalStats = document.getElementById('finalStats');
        
        const winnerPlayer = winner === 1 ? this.state.player1 : this.state.player2;
        const loserPlayer = winner === 1 ? this.state.player2 : this.state.player1;
        const winnerColor = winner === 1 ? '#4169e1' : '#dc143c';
        const winnerBadge = winner === 1 ? '🔵' : '🔴';
        
        winnerText.innerHTML = `${winnerBadge} PLAYER ${winner} WINS! ${winnerBadge}`;
        winnerText.style.color = winnerColor;
        
        const calcPct = (made, attempts) => attempts > 0 ? ((made / attempts) * 100).toFixed(1) : '0.0';
        
        finalStats.innerHTML = `
            <div>
                <h3 style="color: ${winnerColor}">🏆 PLAYER ${winner} - CHAMPION</h3>
                <div>Final Score: ${winnerPlayer.score} points</div>
                <div>FG: ${winnerPlayer.stats.fgMade}/${winnerPlayer.stats.fgAttempts} (${calcPct(winnerPlayer.stats.fgMade, winnerPlayer.stats.fgAttempts)}%)</div>
                <div>3PT: ${winnerPlayer.stats.threeMade}/${winnerPlayer.stats.threeAttempts} (${calcPct(winnerPlayer.stats.threeMade, winnerPlayer.stats.threeAttempts)}%)</div>
                <div>Steals: ${winnerPlayer.stats.steals}</div>
            </div>
            <div style="opacity: 0.7; margin-top: 20px;">
                <h3>PLAYER ${winner === 1 ? 2 : 1}</h3>
                <div>Final Score: ${loserPlayer.score} points</div>
                <div>FG: ${loserPlayer.stats.fgMade}/${loserPlayer.stats.fgAttempts} (${calcPct(loserPlayer.stats.fgMade, loserPlayer.stats.fgAttempts)}%)</div>
                <div>3PT: ${loserPlayer.stats.threeMade}/${loserPlayer.stats.threeAttempts} (${calcPct(loserPlayer.stats.threeMade, loserPlayer.stats.threeAttempts)}%)</div>
                <div>Steals: ${loserPlayer.stats.steals}</div>
            </div>
        `;
        
        modal.classList.add('show');
        this.playSound(800, 0.5);
    }
    
    reset() {
        this.state.reset();
        this.updateUI();
        document.getElementById('quarter').textContent = this.state.quarter;
        document.getElementById('timer').textContent = '12:00';
        document.getElementById('shotClock').textContent = '24';
        document.getElementById('pauseMenu').classList.remove('show');
        document.getElementById('winnerModal').classList.remove('show');
    }
}

// Initialize game
let game;
window.addEventListener('load', () => {
    game = new Game();
});
