class PenaltyGame {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) return;
        this.ctx = this.canvas.getContext('2d');
        this.width = this.canvas.width;
        this.height = this.canvas.height;
        this.dpr = Math.min(window.devicePixelRatio || 1, 2);

        this.goals = 0;
        this.saves = 0;
        this.streak = 0;
        this.bestStreak = 0;

        this.ball = { x: this.width / 2, y: this.height - 55, radius: 14 };
        this.goalie = { x: this.width / 2, y: 115, width: 55, height: 75 };
        this.gameState = 'READY';
        this.result = '';
        this.resultColor = '#fff';
        this.particles = [];

        // 3x3 grid of target zones inside the goal
        const gx = 155, gy = 85, gw = 490, gh = 250;
        const tw = gw / 3, th = gh / 3;
        this.targets = [];
        for (let r = 0; r < 3; r++) {
            for (let c = 0; c < 3; c++) {
                this.targets.push({ x: gx + c * tw, y: gy + r * th, w: tw, h: th, id: `${r}${c}` });
            }
        }

        // Events — mouse + touch
        this.canvas.addEventListener('mousedown', (e) => this.handleInput(e));
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            this.handleInput(touch);
        }, { passive: false });

        this.loop();
    }

    getCanvasCoords(e) {
        const rect = this.canvas.getBoundingClientRect();
        const scaleX = this.width / rect.width;
        const scaleY = this.height / rect.height;
        return {
            x: (e.clientX - rect.left) * scaleX,
            y: (e.clientY - rect.top) * scaleY
        };
    }

    handleInput(e) {
        if (this.gameState !== 'READY') return;
        const { x, y } = this.getCanvasCoords(e);
        for (const target of this.targets) {
            if (x >= target.x && x <= target.x + target.w && y >= target.y && y <= target.y + target.h) {
                this.shoot(target);
                break;
            }
        }
    }

    shoot(target) {
        this.gameState = 'SHOOTING';
        const goalieTarget = this.targets[Math.floor(Math.random() * this.targets.length)];

        const startX = this.ball.x, startY = this.ball.y;
        const endX = target.x + target.w / 2, endY = target.y + target.h / 2;
        const goalieEndX = goalieTarget.x + goalieTarget.w / 2;

        let progress = 0;
        const animate = () => {
            progress += 0.04;
            const ease = 1 - Math.pow(1 - Math.min(progress, 1), 3); // easeOutCubic
            this.ball.x = startX + (endX - startX) * ease;
            this.ball.y = startY + (endY - startY) * ease;
            this.goalie.x = (this.width / 2) + (goalieEndX - this.width / 2) * ease;

            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                this.checkResult(target.id, goalieTarget.id);
            }
        };
        animate();
    }

    checkResult(playerChoice, goalieChoice) {
        const isGoal = playerChoice !== goalieChoice;
        if (isGoal) {
            this.result = '¡GOOOOOL! ⚽';
            this.resultColor = '#14f195';
            this.goals++;
            this.streak++;
            if (this.streak > this.bestStreak) this.bestStreak = this.streak;
            this.spawnParticles(this.ball.x, this.ball.y, '#14f195');
        } else {
            this.result = '¡ATAJADA! 🧤';
            this.resultColor = '#ff4d6a';
            this.saves++;
            this.streak = 0;
            this.spawnParticles(this.ball.x, this.ball.y, '#ff4d6a');
        }
        this.updateStats();
        this.gameState = 'RESULT';
        setTimeout(() => this.reset(), 1800);
    }

    spawnParticles(x, y, color) {
        for (let i = 0; i < 20; i++) {
            this.particles.push({
                x, y,
                vx: (Math.random() - 0.5) * 8,
                vy: (Math.random() - 0.5) * 8,
                life: 1,
                color,
                size: Math.random() * 4 + 2
            });
        }
    }

    updateStats() {
        const g = document.getElementById('statGoals');
        const s = document.getElementById('statSaves');
        const st = document.getElementById('statStreak');
        if (g) g.innerText = this.goals;
        if (s) s.innerText = this.saves;
        if (st) st.innerText = this.streak;
    }

    reset() {
        this.ball = { x: this.width / 2, y: this.height - 55, radius: 14 };
        this.goalie = { x: this.width / 2, y: 115, width: 55, height: 75 };
        this.gameState = 'READY';
        this.result = '';
    }

    draw() {
        const ctx = this.ctx;
        ctx.clearRect(0, 0, this.width, this.height);

        // Pitch gradient
        const bg = ctx.createLinearGradient(0, 0, 0, this.height);
        bg.addColorStop(0, '#0a1a0a');
        bg.addColorStop(1, '#030305');
        ctx.fillStyle = bg;
        ctx.fillRect(0, 0, this.width, this.height);

        // Pitch lines
        ctx.strokeStyle = 'rgba(20, 241, 149, 0.1)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(0, this.height / 2);
        ctx.lineTo(this.width, this.height / 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(this.width / 2, this.height - 20, 60, Math.PI, 0);
        ctx.stroke();

        // Goal frame with glow
        ctx.shadowColor = 'rgba(20, 241, 149, 0.3)';
        ctx.shadowBlur = 15;
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 4;
        ctx.strokeRect(150, 80, 500, 260);
        ctx.shadowBlur = 0;

        // Net lines
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.06)';
        ctx.lineWidth = 1;
        for (let x = 150; x <= 650; x += 25) {
            ctx.beginPath(); ctx.moveTo(x, 80); ctx.lineTo(x, 340); ctx.stroke();
        }
        for (let y = 80; y <= 340; y += 25) {
            ctx.beginPath(); ctx.moveTo(150, y); ctx.lineTo(650, y); ctx.stroke();
        }

        // Target zones
        if (this.gameState === 'READY') {
            this.targets.forEach(t => {
                ctx.fillStyle = 'rgba(20, 241, 149, 0.08)';
                ctx.fillRect(t.x, t.y, t.w, t.h);
                ctx.strokeStyle = 'rgba(20, 241, 149, 0.2)';
                ctx.lineWidth = 1;
                ctx.strokeRect(t.x, t.y, t.w, t.h);
            });
        }

        // Goalie
        const gx = this.goalie.x - this.goalie.width / 2;
        const gy = this.goalie.y;
        ctx.fillStyle = '#9945ff';
        ctx.shadowColor = 'rgba(153, 69, 255, 0.4)';
        ctx.shadowBlur = 10;
        // Body
        ctx.beginPath();
        ctx.roundRect(gx + 10, gy + 20, this.goalie.width - 20, this.goalie.height - 20, 6);
        ctx.fill();
        // Head
        ctx.beginPath();
        ctx.arc(this.goalie.x, gy + 12, 12, 0, Math.PI * 2);
        ctx.fill();
        // Arms
        ctx.strokeStyle = '#9945ff';
        ctx.lineWidth = 5;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(gx + 5, gy + 35);
        ctx.lineTo(gx - 10, gy + 20);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(gx + this.goalie.width - 5, gy + 35);
        ctx.lineTo(gx + this.goalie.width + 10, gy + 20);
        ctx.stroke();
        ctx.shadowBlur = 0;

        // Ball with shadow
        ctx.beginPath();
        ctx.arc(this.ball.x + 3, this.ball.y + 3, this.ball.radius, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.fill();

        ctx.beginPath();
        ctx.arc(this.ball.x, this.ball.y, this.ball.radius, 0, Math.PI * 2);
        const ballGrad = ctx.createRadialGradient(this.ball.x - 4, this.ball.y - 4, 2, this.ball.x, this.ball.y, this.ball.radius);
        ballGrad.addColorStop(0, '#ffffff');
        ballGrad.addColorStop(1, '#cccccc');
        ctx.fillStyle = ballGrad;
        ctx.fill();
        // Ball pattern
        ctx.strokeStyle = 'rgba(0,0,0,0.15)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(this.ball.x - 5, this.ball.y - 8);
        ctx.lineTo(this.ball.x + 5, this.ball.y + 8);
        ctx.moveTo(this.ball.x + 5, this.ball.y - 8);
        ctx.lineTo(this.ball.x - 5, this.ball.y + 8);
        ctx.stroke();

        // Particles
        this.particles = this.particles.filter(p => p.life > 0);
        this.particles.forEach(p => {
            p.x += p.vx;
            p.y += p.vy;
            p.life -= 0.03;
            p.vx *= 0.97;
            p.vy *= 0.97;
            ctx.globalAlpha = p.life;
            ctx.fillStyle = p.color;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
            ctx.fill();
        });
        ctx.globalAlpha = 1;

        // Result text
        if (this.gameState === 'RESULT') {
            ctx.fillStyle = this.resultColor;
            ctx.font = 'bold 36px Inter, sans-serif';
            ctx.textAlign = 'center';
            ctx.shadowColor = this.resultColor;
            ctx.shadowBlur = 20;
            ctx.fillText(this.result, this.width / 2, this.height / 2 + 30);
            ctx.shadowBlur = 0;
        }

        // Streak indicator
        if (this.streak >= 3) {
            ctx.fillStyle = '#ffd700';
            ctx.font = 'bold 14px Inter, sans-serif';
            ctx.textAlign = 'right';
            ctx.fillText(`🔥 x${this.streak}`, this.width - 20, 30);
        }
    }

    loop() {
        this.draw();
        requestAnimationFrame(() => this.loop());
    }
}

window.addEventListener('load', () => {
    if (document.getElementById('gameCanvas')) {
        new PenaltyGame('gameCanvas');
    }
});
