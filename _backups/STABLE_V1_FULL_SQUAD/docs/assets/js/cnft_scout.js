/**
 * GoalChain cNFT Scouting Prototype
 * Simulation of State Compression (Metaplex Bubblegum) for mass tokenization.
 */

class cNFTScout {
    constructor() {
        this.scoutBtn = document.getElementById('scoutBtn');
        this.prospectsList = document.getElementById('prospectsList');
        this.merkleProgress = document.getElementById('merkleProgress');
        this.merkleStatus = document.getElementById('merkleStatus');
        this.merkleRoot = document.getElementById('merkleRoot');

        this.scoutedCount = 1248;
        this.myProspects = [];
        
        this.init();
    }

    init() {
        if (this.scoutBtn) {
            this.scoutBtn.onclick = () => this.scoutPlayers();
        }
    }

    async scoutPlayers() {
        this.scoutBtn.disabled = true;
        this.scoutBtn.innerText = "COMPRIMIENDO DATOS...";
        
        // Simular actualización del Merkle Tree
        let progress = 0;
        const interval = setInterval(() => {
            progress += 5;
            this.merkleProgress.style.width = `${progress}%`;
            if (progress >= 100) {
                clearInterval(interval);
                this.finishScouting();
            }
        }, 50);
    }

    finishScouting() {
        const names = ["Nico Jr", "Crypto Pelé", "Solana Messi", "Chain Vinicius", "Block Mbappe"];
        const newProspects = [];

        for (let i = 0; i < 5; i++) {
            const p = {
                id: this.scoutedCount + i,
                name: names[Math.floor(Math.random() * names.length)] + " #" + (this.scoutedCount + i),
                rarity: "Prospect",
                potential: Math.floor(Math.random() * 50) + 50
            };
            newProspects.push(p);
            this.myProspects.push(p);
        }

        this.scoutedCount += 5;
        this.merkleStatus.innerText = `Merkle Tree: ${this.scoutedCount}/1,000,000`;
        this.merkleRoot.innerText = `Root: 0x${Math.random().toString(16).slice(2, 10)}...${Math.random().toString(16).slice(2, 6)}`;
        
        this.renderProspects();
        this.scoutBtn.disabled = false;
        this.scoutBtn.innerText = "SCOUTEAR 10 PROSPECTOS";

        if (window.gcDialect) {
            window.gcDialect.notify("🔍 ¡Nuevos Prospectos!", `Has scouteado ${newProspects.length} jugadores vía cNFTs.`);
        }
    }

    renderProspects() {
        if (this.myProspects.length === 0) return;
        
        this.prospectsList.innerHTML = this.myProspects.map(p => `
            <div class="prospect-card" style="background: rgba(255,255,255,0.05); border-radius: 8px; padding: 10px; text-align: center; border: 1px solid rgba(20,241,149,0.2);">
                <div style="font-size: 1.2rem; margin-bottom: 5px;">🏃</div>
                <div style="font-size: 0.6rem; font-weight: 800; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${p.name}</div>
                <div style="font-size: 0.5rem; color: var(--primary);">Pot: ${p.potential}</div>
                <button onclick="window.gcScout.upgrade('${p.id}')" style="margin-top:5px; background:var(--primary); border:none; color:black; font-size:0.5rem; padding:2px 5px; border-radius:4px; cursor:pointer; font-weight:bold;">UPGRADE</button>
            </div>
        `).join('');
    }

    upgrade(id) {
        alert(`¡Iniciando Proceso de Descompresión! \n\nEl jugador #${id} ha sido promocionado. \n\n1. Quema de cNFT (Bubblegum Burn) \n2. Minteo de Genesis NFT (Token Program) \n\nCosto: 0.02 SOL (Costo de Storage Rent)`);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.gcScout = new cNFTScout();
});
