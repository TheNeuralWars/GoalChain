/**
 * GoalChain Drift Markets Prototype
 * Simulation of Perpetual Markets and Derivatives for World Cup events.
 */

class DriftMarkets {
    constructor() {
        this.selector = document.getElementById('marketSelector');
        this.longBtn = document.getElementById('longBtn');
        this.shortBtn = document.getElementById('shortBtn');
        this.leverageRange = document.getElementById('leverageRange');
        this.leverageVal = document.getElementById('leverageVal');
        this.chart = document.getElementById('priceChartSim');
        this.positionsList = document.getElementById('activePositions');

        this.currentPrice = 100;
        this.positions = [];
        this.prices = Array(30).fill(100);
        
        this.init();
    }

    init() {
        if (!this.selector) return;
        
        this.leverageRange.oninput = (e) => {
            this.leverageVal.innerText = `${e.target.value}x`;
        };

        this.longBtn.onclick = () => this.openPosition('LONG');
        this.shortBtn.onclick = () => this.openPosition('SHORT');

        this.startPriceSim();
    }

    startPriceSim() {
        setInterval(() => {
            const change = (Math.random() - 0.48) * 2; // Slight upward bias
            this.currentPrice = Math.max(10, this.currentPrice + change);
            this.prices.push(this.currentPrice);
            this.prices.shift();
            this.updateChart();
            this.updatePositions();
        }, 1000);
    }

    updateChart() {
        const max = Math.max(...this.prices);
        const min = Math.min(...this.prices);
        const range = max - min || 1;

        this.chart.innerHTML = this.prices.map(p => {
            const height = ((p - min) / range) * 80 + 10;
            return `<div style="flex:1; height:${height}%; background:var(--primary); opacity:0.6; border-radius:2px;"></div>`;
        }).join('');
    }

    openPosition(side) {
        const market = this.selector.options[this.selector.selectedIndex].text;
        const leverage = parseInt(this.leverageRange.value);
        const entryPrice = this.currentPrice;

        const pos = {
            id: Date.now(),
            market,
            side,
            entryPrice,
            leverage,
            size: (100 * leverage).toFixed(2), // Simulación de 100 $GCH de margen
            pnl: 0
        };

        this.positions.unshift(pos);
        this.renderPositions();

        if (window.gcDialect) {
            window.gcDialect.notify("📈 Orden Ejecutada", `${side} en ${market} a ${entryPrice.toFixed(2)} (${leverage}x)`);
        }
    }

    updatePositions() {
        this.positions.forEach(p => {
            const diff = this.currentPrice - p.entryPrice;
            const pnlPercent = (diff / p.entryPrice) * p.leverage * 100;
            p.pnl = p.side === 'LONG' ? pnlPercent : -pnlPercent;
        });
        this.renderPositions();
    }

    renderPositions() {
        if (this.positions.length === 0) {
            this.positionsList.innerHTML = '<tr><td colspan="4" style="text-align: center; padding: 20px; color: var(--text-dim);">No hay posiciones abiertas</td></tr>';
            return;
        }

        this.positionsList.innerHTML = this.positions.map(p => `
            <tr style="border-bottom: 1px solid rgba(255,255,255,0.05);">
                <td style="padding: 12px 0;">
                    <span style="color:${p.side === 'LONG' ? 'var(--primary)' : '#ff4d6a'}; font-weight:bold;">${p.side}</span>
                    <br><small style="color:var(--text-dim);">${p.market}</small>
                </td>
                <td>${p.size} $GCH <br><small style="color:var(--text-dim);">${p.leverage}x</small></td>
                <td style="color:${p.pnl >= 0 ? 'var(--primary)' : '#ff4d6a'}; font-weight:bold;">
                    ${p.pnl >= 0 ? '+' : ''}${p.pnl.toFixed(2)}%
                </td>
                <td>
                    <div style="width:40px; height:4px; background:#222; border-radius:2px; overflow:hidden;">
                        <div style="width:${Math.min(100, Math.abs(p.pnl)) * 2}%; height:100%; background:${Math.abs(p.pnl) > 80 ? 'red' : 'orange'};"></div>
                    </div>
                </td>
            </tr>
        `).join('');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.gcMarkets = new DriftMarkets();
});
