class PenaltyGame {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) return;
        this.ctx = this.canvas.getContext('2d');
        this.width = this.canvas.width;
        this.height = this.canvas.height;

        this.goals = 0; this.saves = 0; this.streak = 0;
        this.currentBet = 10;
        this.balance = parseInt(localStorage.getItem('gch_balance') || '1000');
        
        this.reset();
        this.setupBettingUI();

        const gx = 155, gy = 85, gw = 490, gh = 250;
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
    }

    reset() {
        this.gameState = 'READY';
        this.ball = { x: this.width / 2, y: this.height - 55, radius: 14 };
        this.goalie = { x: this.width / 2, y: 115, width: 55, height: 75 };
        this.animationProgress = 0;
        this.shotTarget = null;
        this.goalieTarget = null;
        this.result = '';
        this.particles = [];
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
            alert("¡No tienes suficientes $GCH para esta apuesta!");
            return;
        }

        // Cobrar apuesta y aplicar 10% tax
        this.balance -= this.currentBet;
        localStorage.setItem('gch_balance', this.balance);
        this.updateStatsUI();

        this.gameState = 'SHOOTING';
        this.animationProgress = 0;
        this.shotTarget = { x: target.x + target.w / 2, y: target.y + target.h / 2, id: target.id };
        const gT = this.targets[Math.floor(Math.random() * this.targets.length)];
        this.goalieTarget = { x: gT.x + gT.w / 2, id: gT.id };
    }

    update() {
        if (this.gameState === 'SHOOTING') {
            this.animationProgress += 0.04;
            const ease = 1 - Math.pow(1 - Math.min(this.animationProgress, 1), 3);
            const startX = this.width / 2, startY = this.height - 55;
            this.ball.x = startX + (this.shotTarget.x - startX) * ease;
            this.ball.y = startY + (this.shotTarget.y - startY) * ease;
            this.goalie.x = (this.width / 2) + (this.goalieTarget.x - this.width / 2) * ease;
            if (this.animationProgress >= 1) this.resolveResult();
        }
        this.particles.forEach(p => { p.x += p.vx; p.y += p.vy; p.life -= 0.025; });
        this.particles = this.particles.filter(p => p.life > 0);
    }

    resolveResult() {
        const isGoal = this.shotTarget.id !== this.goalieTarget.id;
        if (isGoal) {
            this.result = '¡GOOOOOL! ⚽'; this.resultColor = '#14f195';
            this.goals++; this.streak++; this.spawnParticles(this.ball.x, this.ball.y, '#14f195');
            
            // Recompensa: Apuesta + 90% de ganancia (10% tax queda en la casa)
            const prize = Math.floor(this.currentBet * 1.9);
            this.balance += prize;
            localStorage.setItem('gch_balance', this.balance);
        } else {
            this.result = '¡ATAJADA! 🧤'; this.resultColor = '#ff4d6a';
            this.saves++; this.streak = 0; this.spawnParticles(this.ball.x, this.ball.y, '#ff4d6a');
        }
        this.updateStatsUI();
        this.gameState = 'RESULT';
        setTimeout(() => this.reset(), 1800);
    }

    spawnParticles(x, y, color) {
        for (let i = 0; i < 20; i++) {
            this.particles.push({
                x, y, color, life: 1, vx: (Math.random() - 0.5) * 8, vy: (Math.random() - 0.5) * 8, size: Math.random() * 3 + 2
            });
        }
    }

    updateStatsUI() {
        const g = document.getElementById('statGoals'), s = document.getElementById('statSaves'), st = document.getElementById('statStreak');
        const bal = document.getElementById('userGCH');
        if (g) g.innerText = this.goals; if (s) s.innerText = this.saves; if (st) st.innerText = this.streak;
        if (bal) bal.innerText = this.balance.toLocaleString();
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
        ctx.clearRect(0, 0, this.width, this.height);

        // 1. Césped con Gradiente
        const groundGrad = ctx.createLinearGradient(0, 0, 0, this.height);
        groundGrad.addColorStop(0, '#0a1a0a');
        groundGrad.addColorStop(1, '#030305');
        ctx.fillStyle = groundGrad;
        ctx.fillRect(0, 0, this.width, this.height);

        // 2. Líneas de cancha sutiles
        ctx.strokeStyle = 'rgba(20, 241, 149, 0.15)';
        ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(0, this.height/2); ctx.lineTo(this.width, this.height/2); ctx.stroke();

        // 3. Portería con Brillo Neón
        ctx.shadowColor = 'rgba(255, 255, 255, 0.4)';
        ctx.shadowBlur = 15;
        ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 5;
        ctx.strokeRect(150, 80, 500, 260);
        ctx.shadowBlur = 0;

        ctx.strokeStyle = 'rgba(255,255,255,0.05)'; ctx.lineWidth = 1;
        for(let x=150; x<=650; x+=25) { ctx.beginPath(); ctx.moveTo(x,80); ctx.lineTo(x,340); ctx.stroke(); }
        for(let y=80; y<=340; y+=25) { ctx.beginPath(); ctx.moveTo(150,y); ctx.lineTo(650,y); ctx.stroke(); }

        if (this.gameState === 'READY') {
            this.targets.forEach(t => {
                ctx.fillStyle = 'rgba(20, 241, 149, 0.08)';
                ctx.fillRect(t.x, t.y, t.w, t.h);
                ctx.strokeStyle = 'rgba(20, 241, 149, 0.2)'; ctx.strokeRect(t.x, t.y, t.w, t.h);
            });
        }

        const gx = this.goalie.x - this.goalie.width/2;
        const gy = this.goalie.y;
        ctx.fillStyle = '#9945ff';
        ctx.shadowColor = 'rgba(153, 69, 255, 0.5)'; ctx.shadowBlur = 10;
        // Cuerpo
        ctx.beginPath(); ctx.roundRect(gx+10, gy+20, this.goalie.width-20, this.goalie.height-20, 6); ctx.fill();
        // Cabeza
        ctx.beginPath(); ctx.arc(this.goalie.x, gy+12, 12, 0, Math.PI*2); ctx.fill();
        // Brazos
        ctx.strokeStyle = '#9945ff'; ctx.lineWidth = 6; ctx.lineCap = 'round';
        ctx.beginPath(); ctx.moveTo(gx+5, gy+35); ctx.lineTo(gx-10, gy+20); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(gx+this.goalie.width-5, gy+35); ctx.lineTo(gx+this.goalie.width+10, gy+20); ctx.stroke();
        ctx.shadowBlur = 0;

        // 6. Balón con Sombra y Gradiente
        // Sombra
        ctx.beginPath(); ctx.arc(this.ball.x+4, this.ball.y+4, this.ball.radius, 0, Math.PI*2);
        ctx.fillStyle = 'rgba(0,0,0,0.4)'; ctx.fill();
        // Esfera
        const ballGrad = ctx.createRadialGradient(this.ball.x-4, this.ball.y-4, 2, this.ball.x, this.ball.y, this.ball.radius);
        ballGrad.addColorStop(0, '#ffffff'); ballGrad.addColorStop(1, '#bbbbbb');
        ctx.beginPath(); ctx.arc(this.ball.x, this.ball.y, this.ball.radius, 0, Math.PI*2);
        ctx.fillStyle = ballGrad; ctx.fill();
        // Costuras
        ctx.strokeStyle = 'rgba(0,0,0,0.1)'; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(this.ball.x-6, this.ball.y-6); ctx.lineTo(this.ball.x+6, this.ball.y+6); ctx.stroke();

        // 7. Partículas
        this.particles.forEach(p => {
            ctx.globalAlpha = p.life; ctx.fillStyle = p.color;
            ctx.beginPath(); ctx.arc(p.x, p.y, p.size*p.life, 0, Math.PI*2); ctx.fill();
        });
        ctx.globalAlpha = 1;

        // 8. Resultado Flotante
        if (this.gameState === 'RESULT') {
            ctx.fillStyle = this.resultColor; ctx.font = 'bold 38px Inter';
            ctx.textAlign = 'center'; ctx.shadowColor = this.resultColor; ctx.shadowBlur = 15;
            ctx.fillText(this.result, this.width / 2, this.height / 2 + 60);
            ctx.shadowBlur = 0;
        }
    }

    loop() {
        this.update(); this.draw();
        requestAnimationFrame(() => this.loop());
    }
}
window.addEventListener('load', () => { new PenaltyGame('gameCanvas'); });
