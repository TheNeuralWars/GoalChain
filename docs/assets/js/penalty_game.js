/**
 * penalty_game.js - Versión Sincronizada con NFT Collection
 */

class PenaltyGame {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) return;
        this.ctx = this.canvas.getContext('2d');
        this.width = this.canvas.width;
        this.height = this.canvas.height;

        this.goals = 0; 
        this.saves = 0; 
        this.streak = 0;
        this.currentBet = 10;
        this.balance = parseInt(localStorage.getItem('gch_balance') || '1000');
        
        // Cargar jugador activo de la colección
        this.loadActivePlayer();
        
        this.reset();
        this.setupBettingUI();

        // Hitboxes (9 zonas: 3x3)
        const gx = 150, gy = 80, gw = 500, gh = 260;
        const tw = gw / 3, th = gh / 3;
        this.targets = [];
        for (let r = 0; r < 3; r++) {
            for (let c = 0; c < 3; c++) {
                this.targets.push({ x: gx + c * tw, y: gy + r * th, w: tw, h: th, id: `${r}${c}` });
            }
        }

        this.canvas.addEventListener('mousedown', (e) => this.handleInput(e));
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault(); this.handleInput(e.touches[0]);
        }, { passive: false });

        this.loop();

        // Escuchar cambios de wallet
        window.addEventListener('walletChanged', (e) => {
            const pk = e.detail.publicKey;
            this.activePlayer.name = `PLAYER (${pk.substring(pk.length - 4)})`;
            this.updateStatsUI();
        });
    }

    loadActivePlayer() {
        const inventory = JSON.parse(localStorage.getItem('goalchain_inventory') || '[]');
        this.activePlayer = inventory.length > 0 ? inventory[inventory.length - 1] : { name: 'Rookie', rarity: 'common' };
        console.log("Jugador activo en el campo:", this.activePlayer.name);
    }

    reset() {
        this.gameState = 'READY';
        this.ball = { x: this.width / 2, y: this.height - 55, radius: 14, angle: 0 };
        // Arquero ahora empieza en la base (340 - altura)
        this.goalie = { x: this.width / 2, y: 265, width: 55, height: 75 };
        this.animationProgress = 0;
        this.shotTarget = null;
        this.goalieTarget = null;
        this.result = '';
        this.particles = [];
        this.screenShake = 0;
    }

    handleInput(e) {
        if (this.gameState !== 'READY') return;
        const rect = this.canvas.getBoundingClientRect();
        const scaleX = this.width / rect.width;
        const scaleY = this.height / rect.height;
        const x = (e.clientX - rect.left) * scaleX;
        const y = (e.clientY - rect.top) * scaleY;

        for (const target of this.targets) {
            if (x >= target.x && x <= target.x + target.w && y >= target.y && y <= target.y + target.h) {
                this.startShot(target);
                break;
            }
        }
    }

    startShot(target) {
        if (this.balance < this.currentBet) {
            this.showToast("Saldo insuficiente");
            return;
        }

        // Tarea Social: Jugar Minijuego (t6)
        const completed = JSON.parse(localStorage.getItem('completed_tasks') || '[]');
        if (!completed.includes('t6')) {
            completed.push('t6');
            localStorage.setItem('completed_tasks', JSON.stringify(completed));
            
            let pts = parseInt(localStorage.getItem('goalpoints') || '0');
            pts += 500;
            localStorage.setItem('goalpoints', pts);
            
            // Disparar re-render de tareas si existe la función
            if (window.renderSocialTasks) window.renderSocialTasks();
            if (window.updateGoalPoints) window.updateGoalPoints();
            if (window.notifier) window.notifier.show('⚽ ¡PRIMER TIRO!', 'Has ganado 500 GoalPoints por probar el juego.');
            console.log("¡Tarea t6 completada! +500 GoalPoints");
        }

        this.balance -= this.currentBet;
        localStorage.setItem('gch_balance', this.balance);
        this.updateStatsUI();

        this.gameState = 'SHOOTING';
        this.animationProgress = 0;
        this.shotTarget = { x: target.x + target.w / 2, y: target.y + target.h / 2, id: target.id };
        
        // IA del Arquero (Mejora con la racha del usuario)
        const difficulty = Math.min(0.2 + (this.streak * 0.05), 0.5);
        const gT = Math.random() < difficulty ? target : this.targets[Math.floor(Math.random() * this.targets.length)];
        this.goalieTarget = { x: gT.x + gT.w / 2, y: gT.y + gT.h / 2, id: gT.id };
    }

    update() {
        if (this.gameState === 'SHOOTING') {
            // Buff de velocidad por rareza
            let speed = 0.035;
            if (this.activePlayer.rarity === 'mythic') speed = 0.05;
            if (this.activePlayer.rarity === 'legendary') speed = 0.045;

            this.animationProgress += speed;
            const ease = 1 - Math.pow(1 - Math.min(this.animationProgress, 1), 3);
            const startX = this.width / 2, startY = this.height - 55;
            
            // Curva del balón
            const curve = Math.sin(this.animationProgress * Math.PI) * 40;
            this.ball.x = startX + (this.shotTarget.x - startX) * ease + curve;
            this.ball.y = startY + (this.shotTarget.y - startY) * ease;
            this.ball.angle += 0.2;
            
            // Arquero reacciona (Salto)
            const goalieEase = 1 - Math.pow(1 - Math.min(this.animationProgress * 1.3, 1), 3);
            const goalieStartY = 265; // Base original
            this.goalie.x = (this.width / 2) + (this.goalieTarget.x - this.width / 2) * goalieEase;
            this.goalie.y = goalieStartY + (this.goalieTarget.y - goalieStartY) * goalieEase;
            
            if (this.animationProgress >= 1) {
                this.resolveResult();
            }
        }

        if (this.screenShake > 0) this.screenShake -= 1;
        this.particles.forEach(p => { p.x += p.vx; p.y += p.vy; p.life -= 0.025; });
        this.particles = this.particles.filter(p => p.life > 0);
    }

    resolveResult() {
        if (this.gameState !== 'SHOOTING') return;
        
        const isGoal = this.shotTarget.id !== this.goalieTarget.id;
        if (isGoal) {
            this.result = '¡GOOOL! ⚽'; 
            this.resultColor = '#14f195';
            this.goals++; 
            this.streak++;
            this.screenShake = 15;
            this.spawnParticles(this.ball.x, this.ball.y, '#14f195');
            
            // Multiplicador por rareza
            let multiplier = 1.9;
            if (this.activePlayer.rarity === 'mythic') multiplier = 2.5;
            if (this.activePlayer.rarity === 'legendary') multiplier = 2.2;
            
            const prize = Math.floor(this.currentBet * multiplier);
            this.balance += prize;
            localStorage.setItem('gch_balance', this.balance);
            
            if (window.notifier) {
                window.notifier.play('goal');
                window.notifier.show('¡GOOOOL! ⚽', `Has ganado ${prize} $GCH.`);
            }
        } else {
            this.result = '¡ATAJADA! 🧤'; 
            this.resultColor = '#ff4d6a';
            this.saves++; 
            this.streak = 0;
            this.spawnParticles(this.ball.x, this.ball.y, '#ff4d6a');
        }

        this.updateStatsUI();
        this.gameState = 'RESULT';
        setTimeout(() => this.reset(), 1000);
    }

    spawnParticles(x, y, color) {
        for (let i = 0; i < 30; i++) {
            this.particles.push({
                x, y, color, life: 1, vx: (Math.random() - 0.5) * 10, vy: (Math.random() - 0.5) * 10, size: Math.random() * 4 + 2
            });
        }
    }

    updateStatsUI() {
        const bal = document.getElementById('userGCH');
        if (bal) bal.innerText = this.balance.toLocaleString();
        
        // Nombre del jugador en la UI
        const playerNameUI = document.getElementById('activePlayerName');
        if (playerNameUI) {
            playerNameUI.innerText = this.activePlayer.name;
            playerNameUI.style.color = this.getRarityColor(this.activePlayer.rarity);
        }
    }

    getRarityColor(rarity) {
        const colors = { mythic: '#ffd700', legendary: '#9945ff', epic: '#00e5ff', rare: '#14f195' };
        return colors[rarity] || '#fff';
    }

    setupBettingUI() {
        document.querySelectorAll('.bet-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.bet-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.currentBet = parseInt(btn.getAttribute('data-amount'));
            });
        });
        this.updateStatsUI();
    }

    draw() {
        const ctx = this.ctx;
        ctx.save();
        
        // Screen Shake
        if (this.screenShake > 0) {
            ctx.translate((Math.random() - 0.5) * this.screenShake, (Math.random() - 0.5) * this.screenShake);
        }

        ctx.clearRect(0, 0, this.width, this.height);

        // Fondo y Portería (Estilo Neon)
        ctx.fillStyle = '#030305'; ctx.fillRect(0, 0, this.width, this.height);
        
        ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 4;
        ctx.strokeRect(150, 80, 500, 260); // Arco

        // Dibujar Portero (Un poco más detallado)
        const gx = this.goalie.x - this.goalie.width/2;
        const gy = this.goalie.y;
        ctx.fillStyle = '#9945ff';
        ctx.beginPath(); ctx.roundRect(gx, gy, this.goalie.width, this.goalie.height, 10); ctx.fill();
        ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(this.goalie.x, gy - 5, 12, 0, Math.PI*2); ctx.fill();

        // Dibujar Balón con rotación
        ctx.save();
        ctx.translate(this.ball.x, this.ball.y);
        ctx.rotate(this.ball.angle);
        ctx.fillStyle = '#fff';
        ctx.beginPath(); ctx.arc(0, 0, this.ball.radius, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = '#000'; ctx.lineWidth = 1; ctx.stroke();
        ctx.restore();

        // Efectos de partículas
        this.particles.forEach(p => {
            ctx.globalAlpha = p.life; ctx.fillStyle = p.color;
            ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI*2); ctx.fill();
        });

        // UI de Resultado
        if (this.gameState === 'RESULT') {
            ctx.fillStyle = this.resultColor;
            ctx.font = '900 48px Outfit';
            ctx.textAlign = 'center';
            ctx.fillText(this.result, this.width / 2, this.height / 2);
        }

        ctx.restore();
    }

    loop() {
        this.update(); this.draw();
        requestAnimationFrame(() => this.loop());
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.game = new PenaltyGame('gameCanvas');
});
