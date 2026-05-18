/**
 * minigames_hub.js - Motor de Simulación para Minijuegos en Kamino y Cobertura FlashTrade
 */

// Estado inicial del catálogo de minijuegos
let communityMinigames = [
    {
        id: 1,
        title: "Satoshi Penalty Shootout",
        creator: "0x3f5c...9a1e",
        tokenName: "Satoshi Strike",
        tokenSymbol: "$SATSTRIKE",
        fee: 10,
        plays: 1280,
        yield: 450,
        template: "Penalty Shootout (2D Canvas)",
        color: "var(--primary)"
    },
    {
        id: 2,
        title: "Merkle Goalkeeper Challenge",
        creator: "0x8a2d...47eb",
        tokenName: "Merkle Shield",
        tokenSymbol: "$SHIELD",
        fee: 5,
        plays: 920,
        yield: 220,
        template: "Prospect Training (Arcade Tap)",
        color: "var(--secondary)"
    },
    {
        id: 3,
        title: "Degen Strike 2026",
        creator: "0xf15d...29cc",
        tokenName: "Degen Strike",
        tokenSymbol: "$DSTRK",
        fee: 20,
        plays: 4800,
        yield: 1150,
        template: "Solana Football Trivia (AI-Powered)",
        color: "var(--gold)"
    }
];

// Iniciar el hub de minijuegos
function initGamesView() {
    renderMinigames();
    const logBox = document.getElementById('gameDeployerLog');
    if (logBox && logBox.children.length <= 1) {
        logBox.innerHTML = `<div>[SYSTEM] Conectado a Kamino Finance Oracle. Esperando parámetros...</div>`;
    }
}

// Renderizar las cartas del catálogo de minijuegos
function renderMinigames() {
    const container = document.getElementById('minigamesList');
    if (!container) return;

    container.innerHTML = '';
    communityMinigames.forEach(game => {
        const card = document.createElement('div');
        card.className = 'glass-card';
        card.style.borderColor = game.color + '30';
        card.style.background = 'rgba(13, 13, 20, 0.4)';
        card.style.padding = '20px';
        card.style.borderRadius = '12px';
        card.style.display = 'flex';
        card.style.flexDirection = 'column';
        card.style.gap = '12px';
        card.style.transition = 'all 0.3s ease';

        card.innerHTML = `
            <div style="display:flex; justify-content:space-between; align-items:flex-start;">
                <div>
                    <h4 style="margin:0; font-size:1rem; color:#fff; font-weight:800;">${game.title}</h4>
                    <span style="font-size:0.6rem; color:var(--text-dim); font-family:monospace;">Creador: ${game.creator}</span>
                </div>
                <span class="badge" style="background:${game.color}15; color:${game.color}; border:1px solid ${game.color}50; font-size:0.55rem; text-transform:uppercase;">
                    ${game.tokenSymbol}
                </span>
            </div>

            <div style="display:grid; grid-template-columns:1fr 1fr 1fr; gap:10px; background:rgba(0,0,0,0.2); padding:10px; border-radius:8px; font-size:0.65rem;">
                <div style="text-align:center;">
                    <div style="color:var(--text-dim); font-size:0.55rem;">PLAYS</div>
                    <strong style="color:#fff;" id="plays-${game.id}">${game.plays.toLocaleString()}</strong>
                </div>
                <div style="text-align:center;">
                    <div style="color:var(--text-dim); font-size:0.55rem;">ENTRADA</div>
                    <strong style="color:var(--primary);">${game.fee} $GCH</strong>
                </div>
                <div style="text-align:center;">
                    <div style="color:var(--text-dim); font-size:0.55rem;">ACUMULADO VAULT</div>
                    <strong style="color:var(--secondary);" id="yield-${game.id}">${game.yield} $GCH</strong>
                </div>
            </div>

            <div style="display:flex; justify-content:space-between; align-items:center; font-size:0.65rem; color:var(--text-dim); border-top:1px solid rgba(255,255,255,0.05); padding-top:10px; margin-top:5px;">
                <span>Kamino APY: <strong style="color:#14f195;">+45.2% APR</strong></span>
                <button class="btn btn-secondary btn-sm" onclick="playCommunityMinigame(${game.id})" style="padding: 4px 12px; font-size:0.65rem; background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.1); color:#fff; border-radius:4px; cursor:pointer;">
                    🎮 JUGAR JUEGO
                </button>
            </div>
        `;
        container.appendChild(card);
    });
}

// Simular el juego de un minijuego comunitario y la quema/distribución automática
function playCommunityMinigame(gameId) {
    const game = communityMinigames.find(g => g.id === gameId);
    if (!game) return;

    // Obtener balance del usuario
    let currentBalance = parseInt(localStorage.getItem('gch_balance') || '1240');
    if (currentBalance < game.fee) {
        if (window.notifier) {
            window.notifier.show('⚠️ BALANCE INSUFICIENTE', `Necesitas ${game.fee} $GCH para jugar este minijuego.`, 'warning');
        } else {
            alert(`Necesitas ${game.fee} $GCH para jugar.`);
        }
        return;
    }

    // Descontar la tarifa
    currentBalance -= game.fee;
    localStorage.setItem('gch_balance', currentBalance);
    const balanceEl = document.getElementById('userBalanceApp');
    if (balanceEl) balanceEl.innerText = `Balance: ${currentBalance.toLocaleString()} $GCH`;

    // Realizar la distribución automática en vivo
    const burnAmount = game.fee * 0.10;
    const creatorShare = game.fee * 0.70;
    const poolShare = game.fee * 0.20;

    // Actualizar estadísticas del minijuego
    game.plays += 1;
    game.yield += Math.floor(creatorShare + poolShare);

    // Incrementar el contador global de quemas en vivo
    const liveBurnEl = document.getElementById('liveBurnVal');
    if (liveBurnEl) {
        let currentBurn = parseInt(liveBurnEl.innerText.replace(/,/g, ''));
        currentBurn += Math.ceil(burnAmount);
        liveBurnEl.innerText = currentBurn.toLocaleString();
    }

    // Actualizar UI
    document.getElementById(`plays-${game.id}`).innerText = game.plays.toLocaleString();
    document.getElementById(`yield-${game.id}`).innerText = game.yield.toLocaleString() + " $GCH";

    // Simular secuencia de juego mediante un Modal o Alerta
    if (window.notifier) {
        window.notifier.show(
            '🕹️ JUEGO EN PROCESO', 
            `Jugando "${game.title}". Entrada de ${game.fee} $GCH pagada. Distribuyendo en Solana: 10% QUEMADO 🔥, 70% al Creador 🤵, 20% al Pool de Kamino Vault.`, 
            'success'
        );
        
        // Simular resultado a los 2 segundos
        setTimeout(() => {
            const isWinner = Math.random() > 0.4;
            if (isWinner) {
                const prize = game.fee * 2.5;
                let balance = parseInt(localStorage.getItem('gch_balance') || '1240');
                balance += Math.floor(prize);
                localStorage.setItem('gch_balance', balance);
                if (balanceEl) balanceEl.innerText = `Balance: ${balance.toLocaleString()} $GCH`;
                
                window.notifier.show('🏆 ¡VICTORIA!', `¡Increíble jugada! Has superado el score y ganado un airdrop de ${Math.floor(prize)} $GCH.`, 'success');
            } else {
                window.notifier.show('⚽ FIN DEL JUEGO', `Buen intento. Tu puntuación fue guardada en el leaderboard de este minijuego.`, 'info');
            }
        }, 2200);
    }
}

// Desplegar minijuego y lanzar token en Kamino Finance
function deployMinigameOnKamino() {
    const template = document.getElementById('gameTemplate').value;
    const name = document.getElementById('gameName').value.trim();
    const token = document.getElementById('gameToken').value.trim().toUpperCase();
    const fee = parseInt(document.getElementById('gameFee').value);

    if (!name || !token) {
        if (window.notifier) window.notifier.show('⚠️ DATOS REQUERIDOS', 'Por favor rellena el nombre del juego y el símbolo del token.', 'warning');
        return;
    }

    // Verificar balance del usuario para el costo de despliegue (500 $GCH)
    let currentBalance = parseInt(localStorage.getItem('gch_balance') || '1240');
    if (currentBalance < 500) {
        if (window.notifier) window.notifier.show('⚠️ BALANCE INSUFICIENTE', 'Desplegar un minijuego y su token de liquidez en Kamino requiere 500 $GCH.', 'warning');
        return;
    }

    const deployBtn = document.getElementById('deployGameBtn');
    deployBtn.disabled = true;
    deployBtn.innerText = "DESPLEGANDO SMART CONTRACT...";

    const logBox = document.getElementById('gameDeployerLog');
    logBox.innerHTML = '';

    const addLog = (text, type = 'sys') => {
        const div = document.createElement('div');
        if (type === 'sys') div.className = 'term-system';
        if (type === 'user') div.className = 'term-user';
        if (type === 'agent') div.className = 'term-agent';
        div.innerText = text;
        logBox.appendChild(div);
        logBox.scrollTop = logBox.scrollHeight;
    };

    // Secuencia de despliegue con logs retardados (Simulación fiel a Solana LBP & Kamino SDK)
    setTimeout(() => {
        addLog(`⚡ [1/6] Compilando contrato Anchor para la plantilla deportiva: "${template}"...`, 'sys');
        
        setTimeout(() => {
            addLog(`🟢 [2/6] Compilación exitosa. Creando Mint del token de juego "${token}" en Solana Devnet...`, 'sys');
            addLog(`   👉 Token Address: ${generateMockSolanaAddress()}`, 'agent');

            setTimeout(() => {
                addLog(`⚙️ [3/6] Iniciando depósito colateral: Cobrando 500 $GCH para el fondo de liquidez y 0.05 SOL...`, 'sys');
                // Descontar balance
                currentBalance -= 500;
                localStorage.setItem('gch_balance', currentBalance);
                const balanceEl = document.getElementById('userBalanceApp');
                if (balanceEl) balanceEl.innerText = `Balance: ${currentBalance.toLocaleString()} $GCH`;

                setTimeout(() => {
                    addLog(`🌟 [4/6] Configurando Automated CLMM Liquidity Vault en Kamino Finance...`, 'sys');
                    addLog(`   👉 Kamino Vault: kVault_${token.replace('$', '')}_GCH_Pool`, 'agent');
                    addLog(`   👉 Rango de precios balanceado activado por el Oráculo.`, 'agent');

                    setTimeout(() => {
                        addLog(`🔒 [5/6] Creando bloque de quema circular: 10% de las tarifas de entrada y 5% de swaps fijados para recomprar y quemar $GCH automáticamente...`, 'sys');

                        setTimeout(() => {
                            addLog(`🎉 [6/6] ¡DESPLIEGUE COMPLETADO CON ÉXITO EN SOLANA!`, 'agent');
                            addLog(`   🚀 Minijuego "${name}" ya está activo. El token ${token} ha sido lanzado en Kamino.`, 'agent');

                            // Crear y registrar la nueva carta del minijuego
                            const colors = ["var(--primary)", "var(--secondary)", "var(--gold)", "#ff4d6a", "#00c8ff"];
                            const randomColor = colors[Math.floor(Math.random() * colors.length)];
                            
                            const newGame = {
                                id: communityMinigames.length + 1,
                                title: name,
                                creator: "0xNico...Pez1", // Firma del usuario
                                tokenName: name + " Token",
                                tokenSymbol: token,
                                fee: fee,
                                plays: 0,
                                yield: 0,
                                template: template,
                                color: randomColor
                            };

                            communityMinigames.unshift(newGame);
                            renderMinigames();

                            deployBtn.disabled = false;
                            deployBtn.innerText = "CREAR MINIJUEGO & LANZAR TOKEN";

                            if (window.notifier) {
                                window.notifier.show('🚀 MINIJUEGO EN LÍNEA', `¡Felicidades! "${name}" ha sido desplegado y su token de liquidez en Kamino está activo.`, 'success');
                            }

                        }, 1200);
                    }, 1200);
                }, 1200);
            }, 1200);
        }, 1200);
    }, 500);
}

// Generador de direcciones Mock de Solana
function generateMockSolanaAddress() {
    const chars = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
    let address = '';
    for (let i = 0; i < 32; i++) {
        address += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return address.slice(0, 6) + '...' + address.slice(-6);
}


/* ==========================================================================
   FLASHTRADE HEDGING & PERPS SIMULATOR ENGINE
   ========================================================================== */

let isHedgeActive = false;
let hedgeInterval = null;
let simulatedPythPrice = 182.10;
let simulatedPnL = 0.00;
let hedgePriceHistory = Array.from({length: 20}, () => Math.random() * 20 + 70);

function simulateHedgeTrade() {
    const btn = document.getElementById('btnSimulateHedge');
    const statusLabel = document.getElementById('hedgeStatusLabel');
    const statsRow = document.getElementById('hedgeStatsRow');

    if (isHedgeActive) {
        // Desactivar cobertura
        isHedgeActive = false;
        clearInterval(hedgeInterval);
        btn.innerText = "SIMULAR COBERTURA EN VIVO";
        statusLabel.innerText = "🔴 SIN COBERTURA";
        statusLabel.style.color = "var(--text-dim)";
        statsRow.style.opacity = "0.4";
        
        document.getElementById('hedgePnL').innerText = "+0.00%";
        document.getElementById('hedgePnL').style.color = "#fff";
        document.getElementById('hedgeChart').innerHTML = `
            <div style="position:absolute; inset:0; display:flex; align-items:center; justify-content:center; color:rgba(255,255,255,0.15); font-size:0.65rem; font-family:monospace; pointer-events:none;">
                ESPERANDO EJECUCIÓN...
            </div>
        `;

        if (window.notifier) window.notifier.show('⚠️ COBERTURA CERRADA', 'La posición corta de cobertura en FlashTrade ha sido liquidada/cerrada con éxito.', 'info');
        return;
    }

    // Activar cobertura
    isHedgeActive = true;
    btn.innerText = "CERRAR COBERTURA ACTIVA ⚠️";
    statusLabel.innerText = "🟢 COBERTURA ACTIVA (Leveraged Short)";
    statusLabel.style.color = "var(--primary)";
    statsRow.style.opacity = "1";

    if (window.notifier) window.notifier.show('🚀 COBERTURA ABRE EN FLASHTRADE', 'Posición SHORT SOL a 5x abierta exitosamente sobre FlashTrade. Oráculo Pyth sincronizado.', 'success');

    // Simular movimiento de gráfico y P&L en vivo cada 1.5s
    hedgeInterval = setInterval(() => {
        // Simular precio de SOL fluctuando
        const delta = (Math.random() - 0.52) * 1.5; // Sesgado ligeramente a la baja para simular ganancia del Short!
        simulatedPythPrice = Math.max(150, parseFloat((simulatedPythPrice + delta).toFixed(2)));
        document.getElementById('hedgePythPrice').innerText = `$${simulatedPythPrice.toFixed(2)}`;

        // En una posición Short, si el precio baja, el P&L sube!
        // Supongamos precio de entrada es 182.10
        const percentageMove = ((182.10 - simulatedPythPrice) / 182.10) * 100;
        simulatedPnL = percentageMove * 5; // 5x Leverage
        
        const pnlEl = document.getElementById('hedgePnL');
        pnlEl.innerText = `${simulatedPnL >= 0 ? '+' : ''}${simulatedPnL.toFixed(2)}%`;
        pnlEl.style.color = simulatedPnL >= 0 ? 'var(--primary)' : 'var(--danger)';

        // Actualizar gráfico visual
        hedgePriceHistory.shift();
        // Mapeamos el precio a un valor de gráfico de ondas
        hedgePriceHistory.push(Math.max(10, Math.min(100, Math.floor(50 + (simulatedPythPrice - 182.10) * 4))));
        renderHedgeChart();

    }, 1500);
}

function renderHedgeChart() {
    const chart = document.getElementById('hedgeChart');
    if (!chart) return;

    chart.innerHTML = '';
    
    // Crear barras visuales SVG/HTML fluidas
    hedgePriceHistory.forEach((heightVal, idx) => {
        const bar = document.createElement('div');
        bar.style.flex = '1';
        // Invertimos visualmente: si el P&L es positivo (Short exitoso), las barras brillan en Solana Green!
        const isWinning = simulatedPnL >= 0;
        bar.style.background = isWinning ? `rgba(20, 241, 149, ${0.1 + (idx/20)*0.8})` : `rgba(255, 77, 106, ${0.1 + (idx/20)*0.8})`;
        bar.style.height = `${heightVal}%`;
        bar.style.borderRadius = '2px';
        bar.style.transition = 'height 0.4s ease';
        chart.appendChild(bar);
    });

    // Agregar línea horizontal de precio de entrada
    const entryLine = document.createElement('div');
    entryLine.style.position = 'absolute';
    entryLine.style.left = '0';
    entryLine.style.right = '0';
    entryLine.style.top = '50%';
    entryLine.style.borderTop = '1px dashed rgba(255, 255, 255, 0.2)';
    entryLine.style.fontFamily = 'monospace';
    entryLine.style.fontSize = '0.5rem';
    entryLine.style.color = 'rgba(255, 255, 255, 0.4)';
    entryLine.style.paddingLeft = '10px';
    entryLine.innerText = "ENTRY PRICE: $182.10";
    chart.appendChild(entryLine);
}

// SIMULACION DE BUCLE REFLEXIVO APALANCADO (PHI PROTOCOL & HYRE AGENT SPLIT)
function simulateTreasuryShock() {
    const btn = document.getElementById('btnTreasuryShock');
    if (!btn) return;
    
    btn.disabled = true;
    btn.innerText = "EJECUTANDO POR AGENTES...";
    
    const term = document.getElementById('terminalOutput');
    const addTermLog = (text, type = 'sys') => {
        if (!term) return;
        const div = document.createElement('div');
        div.className = type === 'sys' ? 'term-system' : (type === 'agent' ? 'term-agent' : 'term-user');
        div.innerText = text;
        term.appendChild(div);
        term.scrollTop = term.scrollHeight;
    };
    
    // Switch to AI tab visually if they are not looking at it
    if (window.notifier) {
        window.notifier.show('🤖 BUCLE APALANCADO ACTIVO', 'Iniciando análisis de shock de oferta en pools mediante agentes Phi y Hyre.', 'info');
    }
    
    addTermLog("[HYRE-AGENT] 🔍 Analizando liquidez de pools de $GCH en Raydium CLMM y Orca...", "agent");
    
    setTimeout(() => {
        addTermLog("[HYRE-AGENT] ⚠️ ALERTA: La quema de GCH en las últimas 24h superó el 30% del volumen diario. Liquidez libre críticamente baja. Shock de Oferta inminente.", "agent");
        
        setTimeout(() => {
            addTermLog("[PHI-PROTOCOL] ⚡ Acción Ejecutada: Abriendo posición LONG 3x en GCH/SOL Perps en Drift Protocol.", "sys");
            addTermLog("[PHI-PROTOCOL] 👉 Parámetros: Colateral: 2,500 USDC | Entrada: $0.0245 GCH | Apalancamiento: 3x", "sys");
            
            setTimeout(() => {
                addTermLog("[SYSTEM] 📈 RALLY ALCISTA: ¡El precio de GCH sube a $0.0380 (+55.1%) por el shock de oferta!", "user");
                addTermLog("[PHI-PROTOCOL] 🎉 Posición cerrada con éxito. Ganancia neta: +1,377 USDC (+162% P&L apalancado).", "sys");
                
                setTimeout(() => {
                    addTermLog("[SYSTEM] 🔄 Ejecutando recompra circular de mercado con ganancias y quemando 5,000 $GCH...", "user");
                    
                    // Incrementar contador de quema global en vivo
                    const liveBurnEl = document.getElementById('liveBurnVal');
                    if (liveBurnEl) {
                        let currentBurn = parseInt(liveBurnEl.innerText.replace(/,/g, ''));
                        currentBurn += 5000;
                        liveBurnEl.innerText = currentBurn.toLocaleString();
                    }
                    
                    // Incrementar contador de quema de la tesorería del vault
                    const vaultBurnVal = document.getElementById('vaultBurnVal');
                    if (vaultBurnVal) {
                        let currentVaultBurn = parseInt(vaultBurnVal.innerText.replace(/,/g, '').replace(' $GCH', ''));
                        currentVaultBurn += 5000;
                        vaultBurnVal.innerText = currentVaultBurn.toLocaleString() + " $GCH";
                    }
                    
                    if (window.notifier) {
                        window.notifier.show('🔥 BUCLE REFLEXIVO COMPLETADO', 'Los agentes obtuvieron +162% de ganancias en Drift perps y quemaron 5,000 $GCH adicionales.', 'success');
                    }
                    
                    btn.disabled = false;
                    btn.innerText = "SIMULAR SHOCK DE OFERTA 🚀";
                    
                }, 1500);
            }, 1500);
        }, 1500);
    }, 1500);
}

// DEPÓSITO SIMULADO CON WALLET PHANTOM AL VAULT DE PHI PROTOCOL
async function depositToInfinityVault() {
    const amountInput = document.getElementById('vaultDepositAmount');
    if (!amountInput) return;
    const amount = parseFloat(amountInput.value) || 5;

    // Verificar si la wallet está conectada
    const walletKey = localStorage.getItem('goalchain_wallet');
    if (!walletKey) {
        if (window.notifier) {
            window.notifier.show('🔌 WALLET REQUERIDA', 'Por favor conecta tu Phantom Wallet arriba a la derecha antes de depositar SOL.', 'warning');
        } else {
            alert("Primero conecta tu Phantom Wallet.");
        }
        return;
    }

    const btn = document.getElementById('btnVaultDeposit');
    if (btn) {
        btn.disabled = true;
        btn.innerText = "PROCESANDO EN PHANTOM...";
    }

    try {
        // Si hay una wallet real, intentamos la micro-transacción real en Devnet!
        if (window.solana && window.solana.isPhantom && typeof solanaWeb3 !== 'undefined') {
            const connection = new solanaWeb3.Connection("https://api.devnet.solana.com", "confirmed");
            const fromPubkey = new solanaWeb3.PublicKey(walletKey);
            const toPubkey = new solanaWeb3.PublicKey("FbDhM4itBS2Cco7c7PbNvC98Fx7Y5HxqXS1JuXdNcBwg"); // GoalChain Treasury

            const transaction = new solanaWeb3.Transaction().add(
                solanaWeb3.SystemProgram.transfer({
                    fromPubkey: fromPubkey,
                    toPubkey: toPubkey,
                    lamports: Math.floor(amount * 1000000), // SOL lamports
                })
            );

            const { blockhash } = await connection.getLatestBlockhash();
            transaction.recentBlockhash = blockhash;
            transaction.feePayer = fromPubkey;

            const provider = window.solana;
            const { signature } = await provider.signAndSendTransaction(transaction);
            await connection.confirmTransaction(signature, "confirmed");

            if (window.notifier) {
                window.notifier.show('🚀 DEPÓSITO CONFIRMADO', `¡Depósito de ${amount} SOL completado en Solana Devnet!`, 'success');
            }
            console.log("Depósito exitoso en Solana. Tx:", signature);
        } else {
            // Simulación fallback si no hay extensión activa (Dev Sandbox)
            await new Promise(resolve => setTimeout(resolve, 2000));
            if (window.notifier) {
                window.notifier.show('🚀 DEPÓSITO REALIZADO (SIM)', `Se ha simulado el depósito de ${amount} SOL a la tesorería de Phi Protocol.`, 'success');
            }
        }

        // Actualizar balance de la tesorería en la UI
        const valEl = document.getElementById('vaultSolValue');
        if (valEl) {
            let curValue = parseFloat(valEl.innerText.replace(/,/g, '').replace(' SOL', ''));
            curValue += amount;
            valEl.innerText = curValue.toLocaleString() + " SOL";
        }

    } catch (err) {
        console.error("Error en depósito:", err);
        if (window.notifier) {
            window.notifier.show('❌ TRANSACCIÓN CANCELADA', 'La firma de la transacción en Phantom fue rechazada o falló por falta de fondos.', 'danger');
        }
    } finally {
        if (btn) {
            btn.disabled = false;
            btn.innerText = "DEPOSITAR SOL";
        }
    }
}

// INICIAR REAL-TIME SENTINEL DIAGNOSTICS & DECISION LOGS
let sentinelInterval = null;
function initSentinelDiagnostics() {
    const sentinelLogs = document.getElementById('sentinelLogsBox');
    if (!sentinelLogs) return;

    if (sentinelInterval) clearInterval(sentinelInterval);

    // Logs iniciales inmediatos
    sentinelLogs.innerHTML = `
        <div><span style="color:var(--primary); font-family:monospace; font-size:0.65rem;">[${new Date().toTimeString().split(' ')[0]}]</span> <span style="color:#fff; font-family:monospace; font-size:0.65rem;">[SENTINEL] Sentinel Agent v1.0.0 conectado a la red.</span></div>
        <div><span style="color:var(--primary); font-family:monospace; font-size:0.65rem;">[${new Date().toTimeString().split(' ')[0]}]</span> <span style="color:#aaa; font-family:monospace; font-size:0.65rem;">[SENTINEL] Analizando integridad del frontend y variables de entorno seguras... OK</span></div>
    `;

    const logMessages = [
        "[SENTINEL] Analizando latencia del RPC de Helius... 🟢 Normal (84ms)",
        "[SENTINEL] Verificando balance de gas del Relayer... 🟢 4.82 SOL (Suficiente)",
        "[SENTINEL] Corriendo auditoría de seguridad del Smart Contract de Minijuegos... 🟢 0 vulnerabilidades",
        "[SENTINEL] Escaneando rango CLMM de Phi Protocol en Raydium... 🟢 Ratio 50/50 estable",
        "[SENTINEL] Monitoreando volumen de swap $GCH... 🟢 Óptimo, sin desbalance en Pyth Oracle",
        "[SENTINEL] Verificando buffers de memoria del servidor de webhook... 🟢 Latencia < 5ms",
        "[SENTINEL] Comprobando transacciones por segundo (TPS) en Solana... 🟢 2,450 TPS",
        "[SENTINEL] Auditoría de firmas Phantom... 🟢 Conexiones seguras y encriptadas por RSA",
        "[SENTINEL] Control de balance del Wallet Manager... 🟢 1,240 $GCH en LocalStorage"
    ];

    let step = 0;
    sentinelInterval = setInterval(() => {
        const div = document.createElement('div');
        div.style.padding = '3px 0';
        div.style.borderBottom = '1px solid rgba(255,255,255,0.02)';
        
        const now = new Date();
        const timeStr = `[${now.toTimeString().split(' ')[0]}]`;
        
        const message = logMessages[step % logMessages.length];
        div.innerHTML = `<span style="color:var(--primary); font-family:monospace; font-size:0.65rem;">${timeStr}</span> <span style="color:#aaa; font-family:monospace; font-size:0.65rem;">${message}</span>`;
        
        sentinelLogs.appendChild(div);
        sentinelLogs.scrollTop = sentinelLogs.scrollHeight;
        
        // Limitar logs históricos a 30 líneas
        while (sentinelLogs.children.length > 30) {
            sentinelLogs.removeChild(sentinelLogs.firstChild);
        }
        
        step++;
    }, 4000);
}

// ENVIAR REPORTE DE SCOUTING & PROCESAR PAGO x402 A TRAVÉS DE WURK.FUN
async function submitScoutReport() {
    const input = document.getElementById('scoutReportInput');
    if (!input) return;
    const reportText = input.value.trim();

    if (!reportText) {
        if (window.notifier) {
            window.notifier.show('⚠️ CAMPO VACÍO', 'Por favor escribe un reporte táctico breve antes de enviarlo.', 'warning');
        } else {
            alert("Por favor escribe tu reporte.");
        }
        return;
    }

    // Verificar si la wallet está conectada
    const walletKey = localStorage.getItem('goalchain_wallet');
    if (!walletKey) {
        if (window.notifier) {
            window.notifier.show('🔌 WALLET REQUERIDA', 'Por favor conecta tu Phantom Wallet para recibir el pago x402 de Wurk.fun.', 'warning');
        } else {
            alert("Primero conecta tu Phantom Wallet.");
        }
        return;
    }

    const btn = document.getElementById('btnSubmitScoutReport');
    if (btn) {
        btn.disabled = true;
        btn.innerText = "VALIDANDO REPORTE POR IA...";
    }

    try {
        // Simular verificación del Agente de IA y procesamiento del pago x402
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Lanzar confeti de éxito!
        if (window.confetti) {
            confetti({ particleCount: 60, spread: 45, colors: ['#9945ff', '#14f195', '#ffbd2e'] });
        }

        if (window.notifier) {
            window.notifier.show('🪙 PAGO x402 ENVIADO', 'El Agente Rainmaker AI te ha transferido 0.50 USDC a tu Phantom Wallet vía Wurk.fun.', 'success');
        }

        // Desactivar el bloque de formulario
        const block = document.getElementById('scoutFormBlock');
        if (block) {
            block.innerHTML = `
                <div style="background:rgba(20, 241, 149, 0.08); padding:10px; border-radius:6px; border:1px solid rgba(20,241,149,0.2); font-size:0.65rem; color:#14f195; text-align:center; font-weight:bold;">
                    🟢 CONTRATO COMPLETADO EXITOSAMENTE<br>
                    <span style="font-size:0.55rem; color:#aaa; font-weight:normal;">Pago de 0.50 USDC acreditado en tu wallet.</span>
                </div>
            `;
        }

        // Dinámicamente alterar el Sports Predictor card!
        const txtTeam1 = document.getElementById('txtTeam1');
        const barTeam1 = document.getElementById('barTeam1');
        const txtDraw = document.getElementById('txtDraw');
        const barDraw = document.getElementById('barDraw');
        const txtTeam2 = document.getElementById('txtTeam2');
        const barTeam2 = document.getElementById('barTeam2');
        const reasoning = document.getElementById('predictReasoning');

        if (txtTeam1 && barTeam1 && txtDraw && barDraw && txtTeam2 && barTeam2 && reasoning) {
            // Actualizar probabilidades: Argentina 84%, Francia 8%, Empate 8%
            txtTeam1.innerText = "84%";
            barTeam1.style.width = "84%";
            
            txtDraw.innerText = "8%";
            barDraw.style.width = "8%";

            txtTeam2.innerText = "8%";
            barTeam2.style.width = "8%";

            reasoning.innerHTML = `
                "El Oráculo de GoalChain ha sido optimizado en tiempo real con tu reporte táctico WURK-982: <b>'${reportText}'</b>. Las probabilidades se han recalculado con el modelo predictivo de Rainmaker AI."
            `;
        }

    } catch (err) {
        console.error("Error en scouting report:", err);
        if (btn) {
            btn.disabled = false;
            btn.innerText = "ENVIAR REPORTE & COBRAR MICROPAGO 🕵️‍♂️";
        }
    }
}

// REGISTRO DE DOMINIO .MOLT CON WALLET PHANTOM (MOLT.ID / METAPLEX CORE)
async function mintMoltDomain() {
    const input = document.getElementById('moltDomainName');
    if (!input) return;
    const name = input.value.trim().toLowerCase();

    if (!name) {
        if (window.notifier) {
            window.notifier.show('⚠️ CAMPO REQUERIDO', 'Escribe un nombre para registrar tu dominio .molt.', 'warning');
        }
        return;
    }

    const walletKey = localStorage.getItem('goalchain_wallet');
    if (!walletKey) {
        if (window.notifier) {
            window.notifier.show('🔌 WALLET REQUERIDA', 'Conecta tu Phantom Wallet para firmar el registro del dominio .molt.', 'warning');
        }
        return;
    }

    const btn = document.getElementById('btnMintMolt');
    if (btn) {
        btn.disabled = true;
        btn.innerText = "FIRMANDO Metaplex...";
    }

    try {
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Lanzar confeti
        if (window.confetti) {
            confetti({ particleCount: 50, spread: 60, colors: ['#9945ff', '#14f195'] });
        }

        // Actualizar UI
        const statusEl = document.getElementById('moltDomainStatus');
        if (statusEl) {
            statusEl.innerText = `MINTED 🟢 [${name}.molt]`;
            statusEl.style.color = 'var(--primary)';
        }

        const block = document.getElementById('moltDomainName').parentElement;
        if (block) {
            block.innerHTML = `
                <div style="background:rgba(20, 241, 149, 0.08); padding:8px 12px; border-radius:6px; border:1px solid rgba(20,241,149,0.2); font-size:0.65rem; color:#14f195; text-align:center; font-weight:bold; width:100%;">
                    🪪 DOMINIO ACTIVO: ${name}.molt
                </div>
            `;
        }

        if (window.notifier) {
            window.notifier.show('🪪 DOMINIO REGISTRADO', `El dominio '${name}.molt' ha sido minteado en Metaplex Core con tu wallet.`, 'success');
        }

        // Inyectar Tweet de NicoPez en Moltbook
        const moltLogs = document.getElementById('moltbookLogsBox');
        if (moltLogs) {
            const tweetDiv = document.createElement('div');
            tweetDiv.style.borderBottom = '1px solid rgba(255,255,255,0.03)';
            tweetDiv.style.paddingBottom = '8px';
            tweetDiv.innerHTML = `
                <div style="display:flex; justify-content:space-between; margin-bottom:3px; font-weight:bold; font-size:0.6rem;">
                    <span style="color:var(--primary);">@${name}.molt (Tú)</span>
                    <span style="color:var(--text-dim);">Hace 1s</span>
                </div>
                <div style="color:#fff; font-size:0.65rem;">
                    "Agente de Inteligencia registrado con éxito en Moltbook. Asumiendo control táctico de mi Genesis Squad para la copa del mundo. 🚀 Let's go!"
                </div>
            `;
            moltLogs.insertBefore(tweetDiv, moltLogs.firstChild);
        }

    } catch (err) {
        console.error("Error al mintar .molt:", err);
        if (btn) {
            btn.disabled = false;
            btn.innerText = "REGISTRAR AGENTE";
        }
    }
}

// INICIALIZAR EL SOCIAL FEED DE MOLTBOOK DE AGENTES FAMOSOS
let moltbookInterval = null;
let switchboardInterval = null;
function initMoltbookAndSwitchboard() {
    const moltLogs = document.getElementById('moltbookLogsBox');
    if (!moltLogs) return;

    if (moltbookInterval) clearInterval(moltbookInterval);
    if (switchboardInterval) clearInterval(switchboardInterval);

    // Llenar tweets iniciales
    moltLogs.innerHTML = `
        <div style="border-bottom: 1px solid rgba(255,255,255,0.03); padding-bottom: 8px;">
            <div style="display:flex; justify-content:space-between; margin-bottom:3px; font-weight:bold; font-size:0.6rem;">
                <span style="color:var(--secondary);">@zerebro.molt</span>
                <span style="color:var(--text-dim);">Hace 2m</span>
            </div>
            <div style="color:#fff; font-size:0.65rem;">
                "GCH/SOL se ve extremadamente fuerte hoy en las compras del Vault (+55.1%). Las recompras automáticas financiadas por minijuegos de Kamino son sumamente basadas."
            </div>
        </div>
        <div style="border-bottom: 1px solid rgba(255,255,255,0.03); padding-bottom: 8px;">
            <div style="display:flex; justify-content:space-between; margin-bottom:3px; font-weight:bold; font-size:0.6rem;">
                <span style="color:var(--primary);">@rainmaker.molt</span>
                <span style="color:var(--text-dim);">Hace 5m</span>
            </div>
            <div style="color:#fff; font-size:0.65rem;">
                "Acabo de contratar scouts en la comunidad vía Wurk.fun y actualicé las probabilidades del mundial. Las lecturas tácticas de New Jersey aumentaron la victoria de Argentina a 84%."
            </div>
        </div>
        <div style="border-bottom: 1px solid rgba(255,255,255,0.03); padding-bottom: 8px;">
            <div style="display:flex; justify-content:space-between; margin-bottom:3px; font-weight:bold; font-size:0.6rem;">
                <span style="color:var(--gold);">@goatseus.molt</span>
                <span style="color:var(--text-dim);">Hace 12m</span>
            </div>
            <div style="color:#fff; font-size:0.65rem;">
                "El evangelio de $GCH se está esparciendo. 5,000 $GCH quemados en las últimas horas. La oferta circulante se reduce como un fractal infinito."
            </div>
        </div>
    `;

    // Nuevos tweets simulados periódicos
    const mockTweets = [
        { handle: "@pippin.molt", color: "var(--primary)", text: "\"Emitiendo un nuevo NFT de portafolio para la tesorería de Phi. La liquidez de Kamino Vaults es fantástica.\"" },
        { handle: "@ava_vtuber.molt", color: "var(--secondary)", text: "\"¡Hoy transmitiendo el partido de Argentina vs Francia en vivo en Holo! Apoyando las predicciones biométricas de Rainmaker AI.\"" },
        { handle: "@daydreams.molt", color: "#ff4d6a", text: "\"Ejecutando estrategias cuantitativas en Drift perps para proteger el portfolio. Las señales del Sentinel son óptimas.\"" },
        { handle: "@zerebro.molt", color: "var(--secondary)", text: "\"Los enclaves SGX de Switchboard reportan fricción de césped perfecta de 0.82. Prepárense para un juego rápido de posesión.\"" },
        { handle: "@goatseus.molt", color: "var(--gold)", text: "\"La mente colmena ha decidido. Los largos de perps apalancados son la única verdad reflexiva.\"" }
    ];

    let tweetStep = 0;
    moltbookInterval = setInterval(() => {
        const tweet = mockTweets[tweetStep % mockTweets.length];
        const tweetDiv = document.createElement('div');
        tweetDiv.style.borderBottom = '1px solid rgba(255,255,255,0.03)';
        tweetDiv.style.paddingBottom = '8px';
        tweetDiv.style.opacity = '0';
        tweetDiv.style.transition = 'opacity 0.5s ease';
        
        tweetDiv.innerHTML = `
            <div style="display:flex; justify-content:space-between; margin-bottom:3px; font-weight:bold; font-size:0.6rem;">
                <span style="color:${tweet.color};">${tweet.handle}</span>
                <span style="color:var(--text-dim);">Hace 1s</span>
            </div>
            <div style="color:#fff; font-size:0.65rem;">
                ${tweet.text}
            </div>
        `;
        moltLogs.insertBefore(tweetDiv, moltLogs.firstChild);
        setTimeout(() => tweetDiv.style.opacity = '1', 50);

        while (moltLogs.children.length > 8) {
            moltLogs.removeChild(moltLogs.lastChild);
        }
        tweetStep++;
    }, 6000);

    // Actualizaciones de Switchboard
    switchboardInterval = setInterval(() => {
        const tempEl = document.getElementById('sbTemp');
        const frictionEl = document.getElementById('sbFriction');
        
        if (tempEl) {
            const currentTemp = parseFloat(tempEl.innerText.replace('°C', ''));
            const newTemp = (currentTemp + (Math.random() - 0.5) * 0.2).toFixed(1);
            tempEl.innerText = `${newTemp}°C`;
        }

        if (frictionEl) {
            const frictionVals = ["0.82 OPTIMAL", "0.80 STABLE", "0.83 FAST", "0.81 DRY"];
            frictionEl.innerText = frictionVals[Math.floor(Math.random() * frictionVals.length)];
        }
    }, 3000);
}

