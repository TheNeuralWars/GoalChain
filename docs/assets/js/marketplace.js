/**
 * marketplace.js - Lógica del Mercado de Transferencias GoalChain
 */

const marketState = {
    listings: [],
    players: []
};

const RARITY_PRICES = {
    mythic: "25.0 SOL",
    legendary: "12.5 SOL",
    epic: "5.0 SOL",
    rare: "1.5 SOL",
    common: "0.2 SOL"
};

async function initMarketplace() {
    try {
        const response = await fetch('assets/data/players.json');
        marketState.players = await response.json();
        
        // Simular ofertas iniciales si el mercado está vacío
        generateSimulatedListings();
        renderMarket();
    } catch (error) {
        console.error("Error al cargar el mercado:", error);
    }
}

function generateSimulatedListings() {
    // Tomamos 6 jugadores aleatorios para el mercado
    const shuffled = [...marketState.players].sort(() => 0.5 - Math.random());
    marketState.listings = shuffled.slice(0, 8).map(player => ({
        ...player,
        price: RARITY_PRICES[player.rarity],
        seller: `0x${Math.random().toString(16).slice(2, 8)}...${Math.random().toString(16).slice(2, 6)}`
    }));
}

function renderMarket(filter = 'all') {
    const grid = document.getElementById('marketGrid');
    if (!grid) return;

    const filtered = filter === 'all' 
        ? marketState.listings 
        : marketState.listings.filter(p => p.rarity === filter);

    if (filtered.length === 0) {
        grid.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 60px;">
                <p style="color: var(--text-dim);">No hay jugadores de esta categoría a la venta actualmente.</p>
                <button class="btn-solana mt-3" onclick="filterMarket('all')">VER TODO EL MERCADO</button>
            </div>
        `;
        return;
    }

    grid.innerHTML = filtered.map(item => {
        const imgPath = `assets/img/nfts/${item.filename}`;
        return `
            <div class="glass-card market-item reveal" data-rarity="${item.rarity}" style="padding: 0; overflow: hidden; border: 1px solid rgba(255,255,255,0.05);">
                <div style="position: relative; height: 320px; overflow: hidden;">
                    <img src="${imgPath}" alt="${item.name}" style="width: 100%; height: 100%; object-fit: cover;" onerror="this.src='assets/img/nfts/card_placeholder_soon.png'">
                    <div style="position: absolute; top: 15px; right: 15px; background: rgba(0,0,0,0.8); padding: 5px 12px; border-radius: 20px; font-weight: 900; color: #14f195; border: 1px solid #14f195;">
                        ${item.price}
                    </div>
                </div>
                <div style="padding: 20px;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 5px;">
                        <span style="font-size: 0.65rem; color: var(--text-dim); text-transform: uppercase;">Seller: ${item.seller}</span>
                        <span style="font-size: 0.7rem; color: #fff; font-weight: 900;">#${item.number}</span>
                    </div>
                    <h4 style="margin-bottom: 15px; font-size: 1.1rem;">${item.name}</h4>
                    <button class="btn btn-primary w-100" onclick="buyPlayer(${item.id})" style="background: linear-gradient(90deg, #14f195, #9945ff); color: #000; font-weight: 900; border: none; padding: 10px;">
                        BUY NOW
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

window.filterMarket = (rarity) => {
    // UI Update
    document.querySelectorAll('#marketplace .filter-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.innerText.toLowerCase() === rarity) btn.classList.add('active');
    });
    renderMarket(rarity);
};

window.buyPlayer = async (id) => {
    const player = marketState.listings.find(p => p.id === id);
    if (!player) return;

    const walletAddress = localStorage.getItem('goalchain_wallet');
    if (!walletAddress) {
        if (window.notifier) window.notifier.show('ERROR', 'Debes conectar tu wallet para comprar.', 'error');
        return;
    }

    if (window.notifier) {
        window.notifier.show('PROCESANDO', `Iniciando transacción para ${player.name}...`, 'info');
    }

    // Si es una wallet mock, simulamos
    if (walletAddress.startsWith("DevGoaL")) {
        setTimeout(() => {
            if (window.notifier) window.notifier.show('ÉXITO', `¡${player.name} ahora es parte de tu equipo!`, 'success');
            
            const inventory = JSON.parse(localStorage.getItem('goalchain_inventory') || '[]');
            inventory.push(player);
            localStorage.setItem('goalchain_inventory', JSON.stringify(inventory));
            
            marketState.listings = marketState.listings.filter(p => p.id !== id);
            renderMarket();
            
            if (window.renderInventory) window.renderInventory();
        }, 2000);
        return;
    }

    // Transacción real en Devnet
    try {
        const connection = new solanaWeb3.Connection("https://api.devnet.solana.com", "confirmed");
        const fromPubkey = new solanaWeb3.PublicKey(walletAddress);
        const toPubkey = new solanaWeb3.PublicKey("FbDhM4itBS2Cco7c7PbNvC98Fx7Y5HxqXS1JuXdNcBwg"); // Tesorería de GoalChain

        // El precio real del jugador se divide por 1000 para que sea razonable en devnet (ej: 1.5 SOL -> 0.0015 SOL)
        const priceStr = player.price.split(' ')[0];
        const priceSol = parseFloat(priceStr) || 0.1;
        const lamports = Math.floor(priceSol * 1000000); // 1,000,000 lamports = 0.001 SOL por cada 1 SOL de precio listado

        const transaction = new solanaWeb3.Transaction().add(
            solanaWeb3.SystemProgram.transfer({
                fromPubkey: fromPubkey,
                toPubkey: toPubkey,
                lamports: lamports,
            })
        );

        const { blockhash } = await connection.getLatestBlockhash();
        transaction.recentBlockhash = blockhash;
        transaction.feePayer = fromPubkey;

        const provider = window.solana;
        if (!provider) throw new Error("Phantom Wallet no encontrada.");

        const { signature } = await provider.signAndSendTransaction(transaction);
        console.log("Transacción enviada:", signature);

        if (window.notifier) window.notifier.show('CONFIRMANDO', 'Esperando confirmación en Devnet...', 'info');
        await connection.confirmTransaction(signature, "confirmed");
        console.log("Transacción confirmada!");

        if (window.notifier) window.notifier.show('ÉXITO', `¡${player.name} ahora es parte de tu equipo!`, 'success');

        const inventory = JSON.parse(localStorage.getItem('goalchain_inventory') || '[]');
        inventory.push(player);
        localStorage.setItem('goalchain_inventory', JSON.stringify(inventory));
        
        marketState.listings = marketState.listings.filter(p => p.id !== id);
        renderMarket();
        
        if (window.renderInventory) window.renderInventory();

        // Enlace a Solana Explorer
        setTimeout(() => {
            alert(`¡COMPRA CONFIRMADA EN SOLANA! 🎉\n\nEl jugador ${player.name} ha sido transferido.\n\nTx ID: ${signature.substring(0, 10)}...\n\nPuedes ver tu transacción en Solana Explorer.`);
            window.open(`https://explorer.solana.com/tx/${signature}?cluster=devnet`, '_blank');
        }, 500);

    } catch (error) {
        console.error("Error en la transacción real de Solana:", error);
        if (window.notifier) window.notifier.show('ERROR', 'La transacción fue cancelada o falló.', 'error');
    }
};

document.addEventListener('DOMContentLoaded', initMarketplace);
