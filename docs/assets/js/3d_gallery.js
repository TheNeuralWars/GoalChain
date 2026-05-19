/**
 * GoalChain Genesis Squad 3D Gallery (Parallax Engine)
 * Renderiza los NFTs mutables utilizando capas HTML separadas con profundidad Z.
 */

window.activeYoyoVideos = window.activeYoyoVideos || new Map();

window.makeVideoYoyo = window.makeVideoYoyo || function(videoElement) {
    if (window.activeYoyoVideos.has(videoElement)) return;
    
    let reversing = false;
    let rafId = null;

    function step() {
        if (!videoElement || videoElement.paused) {
            cancelAnimationFrame(rafId);
            window.activeYoyoVideos.delete(videoElement);
            return;
        }

        if (reversing) {
            videoElement.currentTime -= 0.033; // ~30fps reverse
            if (videoElement.currentTime <= 0.1) {
                videoElement.currentTime = 0;
                reversing = false;
                videoElement.play().catch(() => {});
            }
        } else {
            if (videoElement.currentTime >= videoElement.duration - 0.1) {
                reversing = true;
            }
        }
        rafId = requestAnimationFrame(step);
    }

    const playHandler = () => {
        cancelAnimationFrame(rafId);
        reversing = false;
        rafId = requestAnimationFrame(step);
    };

    const pauseHandler = () => {
        cancelAnimationFrame(rafId);
    };

    videoElement.loop = false; // Disable native loop
    videoElement.addEventListener('play', playHandler);
    videoElement.addEventListener('pause', pauseHandler);
    
    videoElement.cleanupYoyo = () => {
        cancelAnimationFrame(rafId);
        videoElement.removeEventListener('play', playHandler);
        videoElement.removeEventListener('pause', pauseHandler);
        window.activeYoyoVideos.delete(videoElement);
    };

    window.activeYoyoVideos.set(videoElement, step);
    
    if (!videoElement.paused) {
        rafId = requestAnimationFrame(step);
    }
};

const RARITY_COLORS = {
    "mythic": "#ffcc00",
    "legendary": "#14f195",
    "epic": "#9945ff",
    "rare": "#00c8ff",
    "common": "#c8c8c8"
};

const BG_IMAGE_MAP = {
    "BG-MYT": "neo_olympus_vertical.mp4",
    "BG-LEG": "titanium_coliseum.mp4",
    "BG-EPI": "aether_dome.mp4",
    "BG-RAR": "obsidian_arena.mp4",
    "BG-COM": "dome_kronos_vertical.mp4"
};

const BATCH_SIZE = 8; // Cards loaded per batch

async function initGalleryView() {
    const container = document.getElementById('galleryContainer');
    if (!container || container.children.length > 0) return;
    container.innerHTML = '<div style="color: var(--text-dim); width: 100%; text-align: center; padding: 40px;">Conectando con el Oráculo 3D...</div>';

    try {
        const response = await fetch(`assets/data/players.json?v=${new Date().getTime()}`);
        const players = await response.json();
        
        container.innerHTML = '';
        container._players = players.slice(0, 48); // Cap at 48 for performance
        container._loaded = 0;

        // Load first batch immediately
        loadNextBatch(container);

        // Sentinel element at the bottom triggers more loads
        const sentinel = document.createElement('div');
        sentinel.id = 'gallerySentinel';
        sentinel.style.height = '40px';
        container.parentElement.appendChild(sentinel);

        const observer = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting && container._loaded < container._players.length) {
                loadNextBatch(container);
            }
        }, { rootMargin: '200px' });
        observer.observe(sentinel);

    } catch (err) {
        console.error("Error cargando jugadores para la Galería 3D:", err);
        container.innerHTML = '<div style="color: #ff3366;">Error cargando la base de datos de jugadores.</div>';
    }
}

function loadNextBatch(container) {
    const players = container._players;
    const start = container._loaded;
    const end = Math.min(start + BATCH_SIZE, players.length);
    for (let i = start; i < end; i++) {
        renderParallaxCard(container, players[i]);
    }
    container._loaded = end;
}

// Open Faremeter modal with player-specific data
function openFaremeterForPlayer(playerName, rarity, price, yieldPerDay) {
    // Update card preview inside modal
    const previewArea = document.querySelector('#faremeterModal [style*="width:70px"]');
    const infoArea = document.querySelector('#faremeterModal [style*="flex-direction:column;justify-content:center"]');
    if (previewArea) previewArea.innerHTML = `<div style="font-size:0.55rem;color:#fff;">${playerName.substring(0,8)}</div><div style="font-size:0.5rem;color:var(--primary);font-weight:bold;text-align:center;">${rarity.toUpperCase()}</div>`;
    if (infoArea) infoArea.innerHTML = `<span style="color:#fff;font-size:0.8rem;font-weight:bold;">${playerName} (Genesis NFT)</span><span style="color:var(--primary);font-size:0.75rem;font-weight:bold;margin-top:3px;">Precio: ${price} USDC / SOL (o $${price} USD Cash)</span><span style="color:var(--text-dim);font-size:0.6rem;margin-top:2px;">Rendimiento estimado: <b>+${yieldPerDay} GCH/d</b> en Vault</span>`;
    openFaremeterCheckout();
}



function sanitizeFilename(name) {
    return name.toLowerCase().replace(/ /g, '_').replace(/[^a-z0-9_\-]/g, '');
}

function renderParallaxCard(container, player) {
    const rarityColor = RARITY_COLORS[player.rarity] || "#ffffff";
    const bgFilename = BG_IMAGE_MAP[player.bg_type || "BG-COM"];
    const paddedId = String(player.id).padStart(3, '0');
    const safeName = sanitizeFilename(player.name);
    
    // Corregido: Las siluetas recortadas están en la raíz de nfts/
    const playerImgUrl = player.filename ? `assets/img/nfts/${player.filename}` : `assets/img/nfts/${paddedId}_${safeName}.webp`;
    const bgImgUrl = `assets/video/stadiums/${bgFilename}`;

    // --- On-Chain Mock Data (Simulando lo que llega del Smart Contract) ---
    const stamina = player.current_stamina !== undefined ? player.current_stamina : Math.floor(Math.random() * 100);
    const isEliminated = player.is_eliminated || false;
    const baseYield = player.base_yield_rate || (player.stats.hype * 10);
    
    const isLowBattery = stamina < 30 && !isEliminated;

    // Efectos visuales de estado
    const filterStyle = isEliminated ? "grayscale(100%) opacity(0.6)" : (isLowBattery ? "hue-rotate(320deg) saturate(150%)" : "drop-shadow(0 15px 15px rgba(0,0,0,0.6))");
    const warningLayer = isLowBattery ? `<div style="position: absolute; inset: 0; background: rgba(255,0,0,0.1); border: 2px solid red; border-radius: 16px; animation: pulseRed 1.5s infinite; transform: translateZ(50px); pointer-events: none; z-index: 5;"></div>` : '';
    const eliminatedOverlay = isEliminated ? `<div style="position: absolute; inset: 0; background: rgba(0,0,0,0.7); display: flex; align-items: center; justify-content: center; transform: translateZ(70px); pointer-events: none; z-index: 6;"><h2 style="color: red; border: 4px solid red; padding: 10px; transform: rotate(-15deg); text-shadow: 0 0 10px black; font-weight: 900; letter-spacing: 2px;">ELIMINATED</h2></div>` : '';

    const cardPrice = Math.max(5, Math.round(baseYield / 10));

    const cardHTML = `
        <style>
            @keyframes pulseRed { 0% { opacity: 0.2; } 50% { opacity: 0.8; box-shadow: inset 0 0 30px red; } 100% { opacity: 0.2; } }
            .stamina-bar-container { width: 100%; height: 4px; background: rgba(255,255,255,0.2); border-radius: 2px; margin-top: 4px; overflow: hidden; }
            .stamina-bar { height: 100%; background: ${isLowBattery ? 'red' : '#14f195'}; width: ${stamina}%; transition: width 0.3s; }
        </style>
        <div class="nft-card-container" data-card-player-id="${player.id}" style="perspective: 1000px; margin-bottom: 20px;">
            <div class="nft-card-3d parallax-card" style="
                position: relative;
                width: 100%;
                aspect-ratio: 2/3;
                border-radius: 16px;
                transition: transform 0.1s ease-out, border-color 0.5s ease, box-shadow 0.5s ease;
                transform-style: preserve-3d;
                cursor: pointer;
                box-shadow: 0 10px 30px rgba(0,0,0,0.5);
                ${isEliminated ? 'pointer-events: none;' : ''}
            " onmousemove="handleParallaxMove(event, this)" onmouseleave="handleParallaxLeave(this)"
               onclick="if(!window._dragging) openFaremeterForPlayer('${player.name}', '${player.rarity}', ${cardPrice}, ${baseYield})">
                
                <!-- CAPA 0: Estadio de Fondo (Profundidad: -30px) -->
                ${bgFilename.endsWith('.mp4') || bgFilename.endsWith('.webm') ? `
                <video class="layer layer-bg" autoplay loop muted playsinline preload="none" style="
                    position: absolute; inset: -10px; border-radius: 16px;
                    width: calc(100% + 20px); height: calc(100% + 20px); object-fit: cover;
                    transform: translateZ(-30px);
                    box-shadow: inset 0 0 50px rgba(0,0,0,0.8);
                    pointer-events: none;
                    z-index: 1;
                    ${isEliminated ? 'filter: grayscale(100%);' : ''}
                " onerror="this.style.display='none'; this.insertAdjacentHTML('afterend', '<div style=\'position:absolute;inset:-10px;border-radius:16px;background:linear-gradient(135deg,#1a1a2e,#06060a);z-index:1;\'></div>')">
                    <source src="${bgImgUrl}" type="video/${bgFilename.endsWith('.webm') ? 'webm' : 'mp4'}">
                </video>
                ` : `
                <div class="layer layer-bg" style="
                    position: absolute; inset: -10px; border-radius: 16px;
                    background: url('${bgImgUrl}') center/cover;
                    transform: translateZ(-30px);
                    box-shadow: inset 0 0 50px rgba(0,0,0,0.8);
                    z-index: 1;
                    ${isEliminated ? 'filter: grayscale(100%);' : ''}
                "></div>
                `}
                
                <!-- CAPA 1: Jugador Transparente (Profundidad: +30px) -->
                <div class="layer layer-player" style="
                    position: absolute; inset: 0; display: flex; align-items: flex-end; justify-content: center;
                    transform: translateZ(30px);
                    z-index: 3;
                ">
                    <img src="${playerImgUrl}" loading="lazy" style="
                        width: 95%; height: 95%; object-fit: contain; pointer-events: none;
                        filter: ${filterStyle};
                    " onerror="this.src='assets/img/mock/player_placeholder.webp'; this.style.opacity='0.2';">
                </div>
                
                <!-- CAPA FX: Low Battery Warning -->
                ${warningLayer}
                
                <!-- CAPA 2: Marco de Rareza (Profundidad: +10px) -->
                <div class="layer layer-frame" style="
                    position: absolute; inset: 0; border-radius: 16px; pointer-events: none;
                    border: 3px solid ${isEliminated ? '#333' : rarityColor};
                    box-shadow: inset 0 0 20px ${isEliminated ? '#000' : rarityColor + '40'}, 0 0 20px ${isEliminated ? '#000' : rarityColor + '40'};
                    transform: translateZ(10px);
                    z-index: 2;
                "></div>
                
                <!-- CAPA 3: Interfaz y Textos (Profundidad: +60px) -->
                <div class="layer layer-ui" style="
                    position: absolute; inset: 0; display: flex; flex-direction: column; justify-content: space-between;
                    padding: 15px; transform: translateZ(60px); pointer-events: none;
                    z-index: 4;
                ">
                    <!-- Top Panel -->
                    <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                        <span style="font-weight: 900; color: white; font-size: 1.2rem; text-shadow: 0 2px 4px rgba(0,0,0,0.8); background: rgba(0,0,0,0.5); padding: 2px 6px; border-radius: 4px;">#${paddedId}</span>
                        <div style="text-align: right;">
                            <div style="background: ${isEliminated ? '#555' : rarityColor}; color: black; padding: 3px 8px; border-radius: 4px; font-weight: 900; font-size: 0.6rem; text-transform: uppercase; box-shadow: 0 4px 10px rgba(0,0,0,0.5); margin-bottom: 5px;">
                                ${player.rarity}
                            </div>
                            <!-- Yield Pill -->
                            <div class="yield-pill-badge" style="background: rgba(0,0,0,0.8); border: 1px solid #14f195; color: #14f195; padding: 2px 6px; border-radius: 4px; font-weight: 900; font-size: 0.6rem;">
                                💸 <span class="yield-val">${isEliminated ? '0' : baseYield}</span> GCH/d
                            </div>
                        </div>
                    </div>
                    
                    <!-- Bottom Panel: Ultra-sleek, compact and glassmorphic (reduces height by 55%) -->
                    <div style="
                        background: rgba(6, 6, 10, 0.45); backdrop-filter: blur(4px);
                        padding: 8px 10px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.08);
                        box-shadow: 0 4px 15px rgba(0,0,0,0.4);
                    ">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
                            <div>
                                <h3 style="margin: 0; color: white; font-size: 0.95rem; text-shadow: 0 1px 3px rgba(0,0,0,0.9); font-weight: 900; line-height: 1.1;">${player.name}</h3>
                                <div style="color: ${isEliminated ? '#777' : rarityColor}; font-size: 0.55rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px;">${player.real_name || 'Verified Athlete'}</div>
                            </div>
                            
                            <!-- Mini Stats Inline Badge -->
                            <div style="display: flex; gap: 8px; background: rgba(0,0,0,0.4); padding: 3px 6px; border-radius: 4px; border: 1px solid rgba(255,255,255,0.05);">
                                <div style="text-align: center; line-height: 1;"><span style="color: #aaa; font-size: 0.45rem; font-weight: 700;">ATK</span><br><span class="stat-atk-val" style="color: white; font-weight: 900; font-size: 0.75rem;">${player.stats.atk}</span></div>
                                <div style="text-align: center; line-height: 1;"><span style="color: #aaa; font-size: 0.45rem; font-weight: 700;">DEF</span><br><span class="stat-def-val" style="color: white; font-weight: 900; font-size: 0.75rem;">${player.stats.def}</span></div>
                                <div style="text-align: center; line-height: 1;"><span style="color: ${isEliminated ? '#555' : rarityColor}; font-size: 0.45rem; font-weight: 700;">HYP</span><br><span class="stat-hype-val" style="color: ${isEliminated ? '#555' : rarityColor}; font-weight: 900; font-size: 0.75rem; text-shadow: 0 0 5px ${rarityColor}80;">${player.stats.hype}</span></div>
                            </div>
                        </div>

                        <!-- Sleek energy laser bar -->
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 4px;">
                            <span style="color: #888; font-size: 0.45rem; font-weight: 900; letter-spacing: 0.5px;">⚡ ENERGY</span>
                            <span style="color: ${isLowBattery ? 'red' : 'white'}; font-size: 0.45rem; font-weight: 900;">${stamina}%</span>
                        </div>
                        <div class="stamina-bar-container" style="margin-top: 2px; height: 2px; background: rgba(255,255,255,0.1);">
                            <div class="stamina-bar" style="height: 100%; background: ${isLowBattery ? 'red' : '#14f195'}; width: ${stamina}%;"></div>
                        </div>
                    </div>
                </div>

                <!-- CAPA FX: Eliminado -->
                ${eliminatedOverlay}

                <!-- CAPA 4: Brillo Holográfico -->
                <div class="holo-glare" style="
                    position: absolute; inset: 0; z-index: 10; pointer-events: none; opacity: 0; mix-blend-mode: overlay;
                    border-radius: 16px; transition: opacity 0.3s;
                "></div>
            </div>
        </div>
    `;
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = cardHTML;
    const cardElement = tempDiv.querySelector('.nft-card-container');
    
    while (tempDiv.firstChild) {
        container.appendChild(tempDiv.firstChild);
    }

    // Apply Yoyo loop to the background video of this 3D card
    const video = cardElement ? cardElement.querySelector('.layer-bg') : null;
    if (video && video.tagName === 'VIDEO') {
        if (window.makeVideoYoyo) {
            window.makeVideoYoyo(video);
        }
    }
}

// Lógica Matemática del Efecto Parallax
function handleParallaxMove(e, card) {
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left; // Posición X del ratón
    const y = e.clientY - rect.top;  // Posición Y del ratón

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    // Calcular inclinación (max 15 grados)
    const rotateX = ((y - centerY) / centerY) * -15; 
    const rotateY = ((x - centerX) / centerX) * 15;

    // Aplicar rotación a la carta entera
    card.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.05, 1.05, 1.05)`;

    // Aplicar brillo dinámico
    const glare = card.querySelector('.holo-glare');
    if (glare) {
        glare.style.opacity = '0.6';
        const percentageX = (x / rect.width) * 100;
        const percentageY = (y / rect.height) * 100;
        glare.style.background = `radial-gradient(circle at ${percentageX}% ${percentageY}%, rgba(255,255,255,0.8) 0%, transparent 60%)`;
    }
}

function handleParallaxLeave(card) {
    // Resetear rotación con rebote suave
    card.style.transition = 'transform 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
    card.style.transform = `rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
    
    // Remover transición después para que no afecte el mousemove rápido
    setTimeout(() => { card.style.transition = 'transform 0.1s ease-out'; }, 500);

    const glare = card.querySelector('.holo-glare');
    if (glare) {
        glare.style.opacity = '0';
    }
}

// FAREMETER CHECKOUT MODAL CONTROLLERS
function openFaremeterCheckout() {
    const modal = document.getElementById('faremeterModal');
    if (modal) {
        modal.style.display = 'flex';
        // Reset logs and button
        const stepsBox = document.getElementById('faremeterSteps');
        if (stepsBox) {
            stepsBox.style.display = 'none';
            stepsBox.innerHTML = '';
        }
        const btn = document.getElementById('btnFarePay');
        if (btn) {
            btn.disabled = false;
            btn.innerText = "PROCESAR PAGO 402 CON FAREMETER 💸";
            btn.style.background = 'var(--primary)';
        }
    }
}

function closeFaremeterCheckout() {
    const modal = document.getElementById('faremeterModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

async function executeFaremeterPayment() {
    const emailInput = document.getElementById('fareEmail');
    if (!emailInput || !emailInput.value.trim()) {
        if (window.notifier) {
            window.notifier.show('⚠️ CORREO REQUERIDO', 'Por favor ingresa un correo para la entrega custodial.', 'warning');
        }
        return;
    }

    const btn = document.getElementById('btnFarePay');
    const stepsBox = document.getElementById('faremeterSteps');

    if (btn) {
        btn.disabled = true;
        btn.innerText = "PROCESANDO... 💸";
        btn.style.background = '#333';
    }

    if (stepsBox) {
        stepsBox.style.display = 'flex';
        stepsBox.innerHTML = '<div>⚡ [HTTP 402] Solicitando carga de pago "exact" a faremeter.xyz...</div>';
    }

    try {
        // Step 1
        await new Promise(r => setTimeout(r, 1200));
        if (stepsBox) {
            stepsBox.innerHTML += '<div style="color:var(--secondary);">🟢 [FAREMETER] Intención de cobro x402 validada exitosamente (ID: fm_402_sol_984).</div>';
        }

        // Step 2
        await new Promise(r => setTimeout(r, 1500));
        if (stepsBox) {
            stepsBox.innerHTML += '<div style="color:#ffcc00;">🛰️ [AGENT PROXY] Sentinel Agent firmando transacción de gas en Solana Devnet...</div>';
        }

        // Step 3
        await new Promise(r => setTimeout(r, 1500));
        if (stepsBox) {
            stepsBox.innerHTML += '<div style="color:#fff;">⛓️ [METAPLEX CORE] Mintando Genesis Cromo #004 en billetera custodial vinculada...</div>';
        }

        // Step 4
        await new Promise(r => setTimeout(r, 1200));
        if (stepsBox) {
            stepsBox.innerHTML += '<div style="color:var(--primary); font-weight:bold;">🏆 [EXITO] Pago de $15.00 USD liquidado y NFT transferido en bloque #2847192.</div>';
        }

        // Confetti
        if (window.confetti) {
            confetti({ particleCount: 80, spread: 80, colors: ['#9945ff', '#14f195', '#ffcc00'] });
        }

        if (btn) {
            btn.innerText = "🟢 PAGO COMPLETADO EXITOSAMENTE";
            btn.style.background = 'var(--primary)';
        }

        if (window.notifier) {
            window.notifier.show('⚡ CROMO ADQUIRIDO', `El cromo #004 (L. Messi) ha sido enviado a tu custodia. ¡Revisa tu e-mail!`, 'success');
        }

        // Close after delay
        setTimeout(() => {
            closeFaremeterCheckout();
        }, 3000);

    } catch (err) {
        console.error("Error en pago Faremeter:", err);
        if (btn) {
            btn.disabled = false;
            btn.innerText = "PROCESAR PAGO 402 CON FAREMETER 💸";
            btn.style.background = 'var(--primary)';
        }
    }
}
