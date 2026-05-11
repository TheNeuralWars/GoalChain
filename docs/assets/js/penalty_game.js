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

        // Estado inicial
        this.reset();

        // 3x3 grid de target zones
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
            e.preventDefault();
            this.handleInput(e.touches[0]);
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

            // Mover balón
            const startX = this.width / 2;
            const startY = this.height - 55;
            this.ball.x = startX + (this.shotTarget.x - startX) * ease;
            this.ball.y = startY + (this.shotTarget.y - startY) * ease;

            // Mover portero
            this.goalie.x = (this.width / 2) + (this.goalieTarget.x - this.width / 2) * ease;

            if (this.animationProgress >= 1) {
                this.resolveResult();
            }
        }

        // Update particles
        this.particles = this.particles.filter(p => p.life > 0);
        this.particles.forEach(p => {
            p.x += p.vx; p.y += p.vy;
            p.life -= 0.03;
        });
    }

    resolveResult() {
        const isGoal = this.shotTarget.id !== this.goalieTarget.id;
        if (isGoal) {
            this.result = '¡GOOOOOL! ⚽';
            this.resultColor = '#14f195';
            this.goals++; this.streak++;
            this.spawnParticles(this.ball.x, this.ball.y, '#14f195');
        } else {
            this.result = '¡ATAJADA! 🧤';
            this.resultColor = '#ff4d6a';
            this.saves++; this.streak = 0;
            this.spawnParticles(this.ball.x, this.ball.y, '#ff4d6a');
        }
        
        this.updateStatsUI();
        this.gameState = 'RESULT';
        setTimeout(() => this.reset(), 1800);
    }

    spawnParticles(x, y, color) {
        for (let i = 0; i < 15; i++) {
            this.particles.push({
                x, y, color, life: 1,
                vx: (Math.random() - 0.5) * 10,
                vy: (Math.random() - 0.5) * 10,
                size: Math.random() * 4 + 2
            });
        }
    }

    updateStatsUI() {
        const g = document.getElementById('statGoals'), s = document.getElementById('statSaves'), st = document.getElementById('statStreak');
        if (g) g.innerText = this.goals;
        if (s) s.innerText = this.saves;
        if (st) st.innerText = this.streak;
    }

    draw() {
        const ctx = this.ctx;
        ctx.clearRect(0, 0, this.width, this.height);

        // Fondo y portería
        ctx.fillStyle = '#050508'; ctx.fillRect(0, 0, this.width, this.height);
        ctx.strokeStyle = '#fff'; ctx.lineWidth = 4; ctx.strokeRect(150, 80, 500, 260);

        // Zonas (solo si ready)
        if (this.gameState === 'READY') {
            ctx.fillStyle = 'rgba(20, 241, 149, 0.05)';
            this.targets.forEach(t => {
                ctx.fillRect(t.x, t.y, t.w, t.h);
                ctx.strokeStyle = 'rgba(255,255,255,0.1)'; ctx.strokeRect(t.x, t.y, t.w, t.h);
            });
        }

        // Portero
        ctx.fillStyle = '#9945ff';
        ctx.beginPath();
        ctx.roundRect(this.goalie.x - this.goalie.width/2, this.goalie.y, this.goalie.width, this.goalie.height, 8);
        ctx.fill();

        // Balón
        ctx.beginPath();
        ctx.arc(this.ball.x, this.ball.y, this.ball.radius, 0, Math.PI * 2);
        ctx.fillStyle = '#fff'; ctx.fill();

        // Partículas
        this.particles.forEach(p => {
            ctx.globalAlpha = p.life;
            ctx.fillStyle = p.color;
            ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2); ctx.fill();
        });
        ctx.globalAlpha = 1;

        // Resultado
        if (this.gameState === 'RESULT') {
            ctx.fillStyle = this.resultColor;
            ctx.font = 'bold 40px Inter'; ctx.textAlign = 'center';
            ctx.fillText(this.result, this.width / 2, this.height / 2 + 50);
        }
    }

    loop() {
        this.update();
        this.draw();
        requestAnimationFrame(() => this.loop());
    }
}

window.addEventListener('load', () => { new PenaltyGame('gameCanvas'); });
