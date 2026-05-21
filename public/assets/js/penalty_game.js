class PenaltyGame {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.width = this.canvas.width;
        this.height = this.canvas.height;
        
        this.ball = { x: this.width / 2, y: this.height - 50, radius: 15, speed: 0 };
        this.goalie = { x: this.width / 2, y: 120, width: 60, height: 80 };
        this.gameState = 'READY'; // READY, SHOOTING, RESULT
        this.result = '';
        
        this.targets = [
            { x: 150, y: 100, w: 100, h: 80, id: 'TL' }, { x: 350, y: 100, w: 100, h: 80, id: 'TM' }, { x: 550, y: 100, w: 100, h: 80, id: 'TR' },
            { x: 150, y: 180, w: 100, h: 80, id: 'ML' }, { x: 350, y: 180, w: 100, h: 80, id: 'MM' }, { x: 550, y: 180, w: 100, h: 80, id: 'MR' },
            { x: 150, y: 260, w: 100, h: 80, id: 'BL' }, { x: 350, y: 260, w: 100, h: 80, id: 'BM' }, { x: 550, y: 260, w: 100, h: 80, id: 'BR' }
        ];

        this.canvas.addEventListener('mousedown', (e) => this.handleClick(e));
        this.loop();
    }

    handleClick(e) {
        if (this.gameState !== 'READY') return;

        const rect = this.canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        this.targets.forEach(target => {
            if (mouseX >= target.x && mouseX <= target.x + target.w &&
                mouseY >= target.y && mouseY <= target.y + target.h) {
                this.shoot(target);
            }
        });
    }

    shoot(target) {
        this.gameState = 'SHOOTING';
        const goalieChoice = this.targets[Math.floor(Math.random() * this.targets.length)];
        
        // Simple animation logic
        const startX = this.ball.x;
        const startY = this.ball.y;
        const targetX = target.x + target.w / 2;
        const targetY = target.y + target.h / 2;
        
        let progress = 0;
        const animate = () => {
            progress += 0.05;
            this.ball.x = startX + (targetX - startX) * progress;
            this.ball.y = startY + (targetY - startY) * progress;
            
            // Goalie dive
            this.goalie.x = (this.width / 2) + (goalieChoice.x + goalieChoice.w/2 - this.width/2) * progress;

            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                this.checkResult(target.id, goalieChoice.id);
            }
        };
        animate();
    }

    checkResult(playerChoice, goalieChoice) {
        if (playerChoice === goalieChoice) {
            this.result = '¡ATAJADA! 🧤';
        } else {
            this.result = '¡GOOOOOL! ⚽';
        }
        this.gameState = 'RESULT';
        setTimeout(() => this.reset(), 2000);
    }

    reset() {
        this.ball = { x: this.width / 2, y: this.height - 50, radius: 15 };
        this.goalie = { x: this.width / 2, y: 120, width: 60, height: 80 };
        this.gameState = 'READY';
        this.result = '';
    }

    draw() {
        this.ctx.clearRect(0, 0, this.width, this.height);
        
        // Draw Goal
        this.ctx.strokeStyle = '#fff';
        this.ctx.lineWidth = 5;
        this.ctx.strokeRect(150, 80, 500, 260);

        // Draw Targets (if READY)
        if (this.gameState === 'READY') {
            this.ctx.fillStyle = 'rgba(20, 241, 149, 0.2)';
            this.targets.forEach(t => {
                this.ctx.fillRect(t.x, t.y, t.w, t.h);
                this.ctx.strokeRect(t.x, t.y, t.w, t.h);
            });
        }

        // Draw Goalie
        this.ctx.fillStyle = '#9945ff';
        this.ctx.fillRect(this.goalie.x - this.goalie.width/2, this.goalie.y, this.goalie.width, this.goalie.height);

        // Draw Ball
        this.ctx.beginPath();
        this.ctx.arc(this.ball.x, this.ball.y, this.ball.radius, 0, Math.PI * 2);
        this.ctx.fillStyle = '#fff';
        this.ctx.fill();
        this.ctx.closePath();

        // Draw Result
        if (this.gameState === 'RESULT') {
            this.ctx.fillStyle = '#fff';
            this.ctx.font = 'bold 40px Inter';
            this.ctx.textAlign = 'center';
            this.ctx.fillText(this.result, this.width / 2, this.height / 2);
        }
    }

    loop() {
        this.draw();
        requestAnimationFrame(() => this.loop());
    }
}

// Init when ready
window.addEventListener('load', () => {
    new PenaltyGame('gameCanvas');
});
