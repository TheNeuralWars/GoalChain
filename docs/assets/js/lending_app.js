/**
 * GoalChain Lending Prototype (Finance Dashboard)
 * Simulation of NFT collateralized loans via Sharky.fi / Banx logic.
 */

class LendingApp {
    constructor() {
        this.inventoryContainer = document.getElementById('lendingInventory');
        this.solAvailableEl = document.getElementById('solAvailable');
        this.activeLoansEl = document.getElementById('activeLoans');
        this.loanBtn = document.getElementById('requestLoanBtn');
        
        this.mockNfts = [
            { id: 10, name: "Lionel Bitcoin", rarity: "Legendary", ltv: 1.5, img: "assets/data/assets/10.png" },
            { id: 42, name: "Satoshi Pelé", rarity: "Epic", ltv: 0.75, img: "assets/data/assets/42.png" },
            { id: 88, name: "Crypto Neymar", rarity: "Rare", ltv: 0.3, img: "assets/data/assets/88.png" }
        ];

        this.selectedNft = null;
        this.init();
    }

    init() {
        console.log("GoalChain Finance: Iniciando prototipo de Lending...");
        this.renderInventory();
        this.setupListeners();
    }

    renderInventory() {
        if (!this.inventoryContainer) return;
        
        this.inventoryContainer.innerHTML = '';
        this.mockNfts.forEach(nft => {
            const card = document.createElement('div');
            card.className = 'glass-card nft-mini-card';
            card.style = "display: flex; align-items: center; gap: 15px; margin-bottom: 10px; cursor: pointer; transition: 0.2s; border: 1px solid rgba(255,255,255,0.05); padding: 10px;";
            card.innerHTML = `
                <div style="width: 40px; height: 40px; background: #222; border-radius: 6px; overflow: hidden;">
                    <div class="nft-placeholder-mini" style="width:100%; height:100%; background: linear-gradient(45deg, #14f195, #9945ff); opacity: 0.5;"></div>
                </div>
                <div style="flex: 1;">
                    <div style="font-size: 0.8rem; font-weight: 800;">${nft.name}</div>
                    <div style="font-size: 0.6rem; color: var(--primary);">${nft.rarity} | Val: ${nft.ltv} SOL</div>
                </div>
                <div class="select-indicator" style="width: 12px; height: 12px; border: 2px solid var(--primary); border-radius: 50%;"></div>
            `;

            card.onclick = () => this.selectNft(nft, card);
            this.inventoryContainer.appendChild(card);
        });
    }

    selectNft(nft, card) {
        document.querySelectorAll('.nft-mini-card').forEach(c => {
            c.style.borderColor = "rgba(255,255,255,0.05)";
            c.querySelector('.select-indicator').style.background = "transparent";
        });

        card.style.borderColor = "var(--primary)";
        card.querySelector('.select-indicator').style.background = "var(--primary)";
        
        this.selectedNft = nft;
        this.solAvailableEl.innerText = `${nft.ltv.toFixed(2)} SOL`;
        this.loanBtn.disabled = false;
        this.loanBtn.innerText = `SOLICITAR ${nft.ltv} SOL AHORA`;
    }

    setupListeners() {
        if (!this.loanBtn) return;
        this.loanBtn.onclick = () => this.executeLoan();
    }

    async executeLoan() {
        if (!this.selectedNft) return;

        const walletAddress = localStorage.getItem('goalchain_wallet');
        if (!walletAddress) {
            alert("Conecta tu wallet de Solana primero en la barra superior.");
            return;
        }

        this.loanBtn.innerText = "PROCESANDO EN SOLANA...";
        this.loanBtn.disabled = true;

        if (walletAddress.startsWith("DevGoaL")) {
            // Mock mode simulation
            setTimeout(() => {
                alert(`[Modo Simulación] ¡Préstamo de ${this.selectedNft.ltv} SOL aprobado! \n\nTu NFT "${this.selectedNft.name}" ha sido enviado al Escrow de GoalChain/Sharky. El SOL se ha depositado en tu balance.`);
                this.finalizeLoanUI();
            }, 1500);
            return;
        }

        try {
            alert(`¡Iniciando Solicitud de Préstamo con Colateral para "${this.selectedNft.name}"!\n\nSe te solicitará firmar la transacción de 0.001 SOL para registrar el depósito de colateral en el Escrow de GoalChain/Sharky.`);

            const connection = new solanaWeb3.Connection("https://api.devnet.solana.com", "confirmed");
            const fromPubkey = new solanaWeb3.PublicKey(walletAddress);
            const toPubkey = new solanaWeb3.PublicKey("FbDhM4itBS2Cco7c7PbNvC98Fx7Y5HxqXS1JuXdNcBwg");

            const transaction = new solanaWeb3.Transaction().add(
                solanaWeb3.SystemProgram.transfer({
                    fromPubkey: fromPubkey,
                    toPubkey: toPubkey,
                    lamports: 0.001 * 10**9 // 0.001 SOL
                })
            );

            const { blockhash } = await connection.getLatestBlockhash();
            transaction.recentBlockhash = blockhash;
            transaction.feePayer = fromPubkey;

            const provider = window.solana;
            if (!provider) throw new Error("Phantom o Solflare no encontrado.");

            const { signature } = await provider.signAndSendTransaction(transaction);
            
            alert(`Transacción de colateral enviada. Confirmando en Solana Devnet...`);
            await connection.confirmTransaction(signature, "confirmed");

            alert(`¡Préstamo de ${this.selectedNft.ltv} SOL Aprobado! 🎉\n\nEl NFT ha quedado bloqueado en depósito de garantía.\n\nTx ID: ${signature.substring(0, 10)}...\n\nPuedes verla en Solana Explorer.`);
            window.open(`https://explorer.solana.com/tx/${signature}?cluster=devnet`, '_blank');
            
            this.finalizeLoanUI();
        } catch (error) {
            console.error("Error executing loan transaction:", error);
            alert("La transacción fue cancelada o falló por falta de fondos (Devnet SOL).");
            this.loanBtn.innerText = `SOLICITAR ${this.selectedNft.ltv} SOL AHORA`;
            this.loanBtn.disabled = false;
        }
    }

    finalizeLoanUI() {
        this.activeLoansEl.innerText = "1";
        this.solAvailableEl.innerText = "0.00 SOL";
        this.loanBtn.innerText = "PRÉSTAMO ACTIVO";
        
        // Actualizamos balance ficticio en el Dashboard
        const currentBal = parseInt(localStorage.getItem('gch_balance') || '1000');
        localStorage.setItem('gch_balance', currentBal + (this.selectedNft.ltv * 100)); // conversión
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    window.goalchainFinance = new LendingApp();
});
