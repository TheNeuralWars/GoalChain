const fs = require('fs');

const filePath = 'c:\\Users\\lucas\\.gemini\\antigravity\\scratch\\GoalChain\\docs\\app.html';
const content = fs.readFileSync(filePath, 'utf-8');

// Regex to find the AI AGENT HUB section
const regex = /(\s*<!-- SECTION: AI AGENT HUB -->[\s\S]*?)(?=\s*<!-- SECTION: MINIGAMES HUB \(NEW\) -->)/g;

if (!regex.test(content)) {
    console.log("Could not find the section!");
    process.exit(1);
}

const newHtml = `
        <!-- SECTION: AI AGENT HUB -->
        <section id="aiTab" class="tab-section">
            <style>
                #aiTab {
                    padding-top: 10px;
                }
                .ai-header {
                    text-align: center;
                    margin-bottom: 20px;
                }
                .ai-header h2 {
                    font-size: 2rem;
                    margin-bottom: 15px;
                }
                .ai-badges {
                    display: flex;
                    justify-content: center;
                    gap: 15px;
                    margin-bottom: 20px;
                }
                .ai-description {
                    text-align: center;
                    color: var(--text-dim);
                    max-width: 800px;
                    margin: 0 auto 40px auto;
                    font-size: 0.9rem;
                    line-height: 1.5;
                }
                #ai-nodes-canvas {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 30px;
                    justify-content: center;
                    align-items: flex-start;
                    padding: 20px;
                    background: radial-gradient(circle at center, rgba(20,241,149,0.05) 0%, transparent 70%);
                    border-radius: 20px;
                    min-height: 600px;
                }
                .ai-node-wrapper {
                    width: 280px;
                    height: 90px;
                    position: relative;
                    cursor: grab;
                }
                .ai-node-wrapper.dragging {
                    opacity: 0.4;
                }
                .ai-node-wrapper.drag-over {
                    border: 2px dashed var(--primary);
                    border-radius: 12px;
                }
                .ai-node {
                    position: absolute;
                    top: 0; left: 0;
                    width: 100%;
                    height: 100%;
                    background: rgba(13, 13, 20, 0.95);
                    border: 1px solid rgba(255,255,255,0.1);
                    border-radius: 12px;
                    padding: 15px;
                    transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
                    overflow: hidden;
                    z-index: 1;
                    backdrop-filter: blur(10px);
                    display: flex;
                    flex-direction: column;
                }
                .ai-node:hover {
                    width: 480px;
                    height: auto;
                    max-height: 600px;
                    overflow-y: auto;
                    z-index: 100;
                    border-color: var(--primary);
                    box-shadow: 0 15px 35px rgba(0,0,0,0.8), 0 0 15px rgba(20,241,149,0.2);
                }
                .node-summary {
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                }
                .node-summary h4 {
                    margin: 0;
                    font-size: 0.9rem;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }
                .node-summary .badge {
                    align-self: flex-start;
                    font-size: 0.55rem;
                    padding: 3px 6px;
                }
                .node-details {
                    opacity: 0;
                    visibility: hidden;
                    transition: opacity 0.3s ease;
                    margin-top: 0;
                    max-height: 0;
                }
                .ai-node:hover .node-details {
                    opacity: 1;
                    visibility: visible;
                    margin-top: 15px;
                    max-height: 1000px;
                }
                .ai-node::-webkit-scrollbar { width: 4px; }
                .ai-node::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 2px; }
            </style>

            <div class="ai-header">
                <h2>🤖 AI Agent & SportsFi Predictor Hub</h2>
                <div class="ai-badges">
                    <span class="badge" style="background:rgba(20, 241, 149, 0.1); color:var(--primary); border: 1px solid var(--primary);">RAINMAKER AI V1.0</span>
                    <span class="badge" style="background:rgba(153, 69, 255, 0.1); color:var(--secondary); border: 1px solid var(--secondary);">ELIZAOS AGENT KIT</span>
                </div>
                <p class="ai-description">
                    Optimiza tu Starting XI de forma 100% autónoma y obtén una ventaja estadística institucional utilizando Oráculos en tiempo real y predictivos para apuestas. La fusión de DeFi y SportsFi en Solana.
                </p>
            </div>

            <div id="ai-nodes-canvas">
                
                <!-- NODE 1: Rainmaker Predictor -->
                <div class="ai-node-wrapper" draggable="true">
                    <div class="ai-node">
                        <div class="node-summary">
                            <h4 style="color:var(--primary);">🔮 Rainmaker Predictor</h4>
                            <span class="badge" style="background:rgba(20,241,149,0.1); color:var(--primary); border:1px solid var(--primary);">WC2026 LIVE</span>
                        </div>
                        <div class="node-details">
                            <p style="font-size: 0.75rem; color: var(--text-dim); margin-bottom: 20px;">Predicciones de partidos en tiempo real basadas en el índice de poder por país (ATK, DEF, HYPE) calculado desde los 528 cromos de la Genesis Squad.</p>
                            
                            <!-- Prediction Display -->
                            <div style="background: rgba(0,0,0,0.3); padding: 20px; border-radius: 12px; margin-bottom: 15px; border: 1px solid rgba(255,255,255,0.03);">
                                <div style="display: flex; justify-content: space-between; font-weight: bold; font-size: 0.9rem; margin-bottom: 5px;">
                                    <span id="predTeam1Name">Argentina 🇦🇷</span>
                                    <span style="color: var(--primary);">VS</span>
                                    <span id="predTeam2Name">Francia 🇫🇷</span>
                                </div>
                                <p id="predVenue" style="font-size:0.6rem; color:var(--text-dim); text-align:center; margin-bottom:15px;">📍 MetLife Stadium, Nueva York · 2026-06-11</p>
                                
                                <div style="margin-bottom: 12px;">
                                    <div style="display: flex; justify-content: space-between; font-size: 0.7rem; color: var(--text-dim); margin-bottom: 4px;">
                                        <span>Victoria local (1)</span>
                                        <strong id="txtTeam1" style="color: var(--primary);">74%</strong>
                                    </div>
                                    <div style="height: 6px; background: rgba(255,255,255,0.05); border-radius: 3px; overflow: hidden;">
                                        <div id="barTeam1" style="width: 74%; height: 100%; background: var(--primary); transition: width 0.8s ease;"></div>
                                    </div>
                                </div>
                                
                                <div style="margin-bottom: 12px;">
                                    <div style="display: flex; justify-content: space-between; font-size: 0.7rem; color: var(--text-dim); margin-bottom: 4px;">
                                        <span>Empate (X)</span>
                                        <strong id="txtDraw" style="color: var(--gold);">12%</strong>
                                    </div>
                                    <div style="height: 6px; background: rgba(255,255,255,0.05); border-radius: 3px; overflow: hidden;">
                                        <div id="barDraw" style="width: 12%; height: 100%; background: var(--gold); transition: width 0.8s ease;"></div>
                                    </div>
                                </div>
                                
                                <div style="margin-bottom: 12px;">
                                    <div style="display: flex; justify-content: space-between; font-size: 0.7rem; color: var(--text-dim); margin-bottom: 4px;">
                                        <span>Victoria visitante (2)</span>
                                        <strong id="txtTeam2" style="color: #ff4d6a;">14%</strong>
                                    </div>
                                    <div style="height: 6px; background: rgba(255,255,255,0.05); border-radius: 3px; overflow: hidden;">
                                        <div id="barTeam2" style="width: 14%; height: 100%; background: #ff4d6a; transition: width 0.8s ease;"></div>
                                    </div>
                                </div>

                                <p id="predictReasoning" style="font-size: 0.6rem; color: var(--text-dim); line-height: 1.4; border-top: 1px solid rgba(255,255,255,0.05); padding-top: 10px; margin-top: 10px; font-style: italic;">
                                    Cargando análisis de Rainmaker AI v2.0...
                                </p>
                            </div>

                            <div style="display:flex; gap:10px; margin-bottom:10px;">
                                <button onclick="cycleNextMatch()" class="btn btn-secondary" style="flex:1; font-size:0.7rem;">⏭ Siguiente Partido</button>
                                <button id="betbotToggleBtn" onclick="toggleBetbot()" class="btn btn-secondary btn-glow" style="flex:1; font-size:0.7rem;">ACTIVAR BETBOT</button>
                            </div>
                            <p id="betbotIndicator" style="font-size: 0.7rem; color: var(--text-dim); text-align: center; margin-top: 10px;">🔴 <span style="color: var(--danger);">INACTIVO</span></p>
                        </div>
                    </div>
                </div>

                <!-- NODE 2: AI Scout Agency -->
                <div class="ai-node-wrapper" draggable="true">
                    <div class="ai-node" style="border-color: rgba(153, 69, 255, 0.25);">
                        <div class="node-summary">
                            <h4 style="color:var(--secondary);">🕵️‍♂️ AI Scout Agency</h4>
                            <span class="badge" style="background:rgba(20, 241, 149, 0.1); color:var(--primary); border:1px solid var(--primary);">WURK.FUN & x402</span>
                        </div>
                        <div class="node-details">
                            <p style="font-size: 0.7rem; line-height: 1.4; color: var(--text-dim); margin-bottom:15px; margin-top:0;">
                                Nuestros agentes autónomos no pueden estar en el campo de juego. Por eso, contratan humanos de la comunidad a través de <b>Wurk.fun</b> mediante micropagos <b>x402</b> de USDC para recopilar reportes tácticos exclusivos del mundial.
                            </p>

                            <div style="background: rgba(0,0,0,0.3); border-radius: 8px; border: 1px solid rgba(255,255,255,0.03); padding: 12px; margin-bottom: 15px; font-size:0.65rem;">
                                <div style="display:flex; justify-content:space-between; align-items:center; font-weight:bold; margin-bottom:5px; color:#fff;">
                                    <span>📋 GIG ACTIVO [WURK-982]</span>
                                    <span style="color:var(--primary);">ABIERTO</span>
                                </div>
                                <span style="color:#aaa; font-size:0.6rem; display:block; margin-bottom:8px;">
                                    "Inspeccionar estado del césped y humedad en el MetLife Stadium de New Jersey para el partido contra Francia."
                                </span>
                                <div style="display:flex; justify-content:space-between; font-size:0.55rem; color:var(--text-dim); border-top: 1px solid rgba(255,255,255,0.05); padding-top:6px;">
                                    <span>Pago del Contrato: <strong>0.50 USDC (x402 SOL)</strong></span>
                                    <span>Emisor: <strong>Rainmaker AI</strong></span>
                                </div>
                            </div>

                            <div id="scoutFormBlock" style="margin-bottom:0; display:flex; flex-direction:column; gap:8px;">
                                <textarea id="scoutReportInput" placeholder="Escribe tu reporte táctico... Ej: 'Césped húmedo, favorece desmarques rápidos por las bandas de Argentina.'" style="width:100%; height:50px; background:#111; color:white; border:1px solid rgba(255,255,255,0.1); padding:8px; border-radius:6px; font-size:0.65rem; resize:none; outline:none; font-family:inherit;"></textarea>
                                <button id="btnSubmitScoutReport" onclick="submitScoutReport()" class="btn btn-primary btn-sm" style="width:100%; font-size:0.65rem; font-weight:bold; background:var(--primary); color:#000; border:none; border-radius:6px; padding:8px; cursor:pointer;">
                                    ENVIAR REPORTE & COBRAR MICROPAGO 🕵️‍♂️
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- NODE 3: Emblem Vault Bundler -->
                <div class="ai-node-wrapper" draggable="true">
                    <div class="ai-node" style="border-color: rgba(255, 189, 46, 0.25);">
                        <div class="node-summary">
                            <h4 style="color:#ffbd2e;">📦 Emblem Vault Bundler</h4>
                            <span class="badge" style="background:rgba(255, 189, 46, 0.1); color:#ffbd2e; border:1px solid #ffbd2e;">NFT PORTFOLIOS</span>
                        </div>
                        <div class="node-details">
                            <p style="font-size: 0.75rem; color: var(--text-dim); margin-bottom: 20px;">Agrupa varios cromos NFT de tu plantilla en un solo "NFT de Portafolio" transferible y vendible de alto rendimiento. ¡Atractivo total para inversores!</p>
                            
                            <div style="background: rgba(0,0,0,0.3); padding: 15px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.03); margin-bottom: 20px;">
                                <h4 style="font-size: 0.75rem; color: #fff; margin-bottom: 12px;">Selecciona hasta 3 cromos colaterales:</h4>
                                <div id="vaultPlayerSelection" style="max-height: 180px; overflow-y: auto; padding-right: 5px;">
                                    <!-- Dynamic options injected by JS -->
                                </div>
                            </div>

                            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; background: rgba(153,69,255,0.05); padding: 12px 20px; border-radius: 10px;">
                                <div>
                                    <div style="font-size: 0.6rem; color: var(--text-dim);">EMISIONES ESTIMADAS DEL VAULT</div>
                                    <strong id="vaultEstimatedEmissions" style="font-size: 1.1rem; color: var(--primary);">+0 $GCH/día</strong>
                                </div>
                                <div style="text-align: right;">
                                    <div style="font-size: 0.6rem; color: var(--text-dim);">ELEMENTOS AGRUPADOS</div>
                                    <strong id="vaultSelectedCount" style="font-size: 1rem; color: #fff;">0 / 3 cromos</strong>
                                </div>
                            </div>

                            <button id="mintVaultBtn" onclick="mintVaultPortfolio()" class="btn btn-secondary btn-glow" style="width: 100%;" disabled>MINTEAR PORTAFOLIO VAULT NFT</button>
                            <p style="font-size: 0.6rem; color: var(--text-dim); text-align: center; margin-top: 8px;">Costo de creación: 200 $GCH (100% de la tarifa es quemada en el Circular Feed).</p>
                        </div>
                    </div>
                </div>

                <!-- NODE 4: Auto-Optimizer -->
                <div class="ai-node-wrapper" draggable="true">
                    <div class="ai-node" style="border-color: rgba(0, 255, 189, 0.25);">
                        <div class="node-summary">
                            <h4 style="color:#00ffbd;">🤖 Auto-Optimizer Agent</h4>
                            <span class="badge" style="background:rgba(0, 255, 189, 0.1); color:#00ffbd; border:1px solid #00ffbd;">AUTONOMOUS MANAGER</span>
                        </div>
                        <div class="node-details">
                            <p style="font-size: 0.75rem; color: var(--text-dim); margin-bottom: 20px;">Permite que un agente inteligente autónomo gestione tu equipo, reemplace jugadores cansados, compre pociones y reinvierta las ganancias automáticamente.</p>
                            
                            <div style="background: rgba(0,0,0,0.3); padding: 20px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.03); margin-bottom: 20px; font-size: 0.75rem;">
                                <h4 style="color: #fff; margin-bottom: 15px; font-size: 0.8rem;">Parámetros del Agente:</h4>
                                
                                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
                                    <span>Reemplazo automático de jugadores fatigados</span>
                                    <input type="checkbox" checked style="accent-color: var(--primary);">
                                </div>
                                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
                                    <span>Compra automática de Pociones de Energía con $GCH</span>
                                    <input type="checkbox" checked style="accent-color: var(--primary);">
                                </div>
                                <div style="display:flex; justify-content:space-between; align-items:center;">
                                    <span>Re-inversión y Staking automático en JitoSOL (+12% APR)</span>
                                    <input type="checkbox" checked style="accent-color: var(--primary);">
                                </div>
                            </div>

                            <div style="flex: 1; min-height: 200px; background: rgba(0,0,0,0.5); border-radius: 12px; padding: 15px; border: 1px solid rgba(255,255,255,0.05); display: flex; flex-direction: column; margin-bottom: 20px;">
                                <h4 style="font-size: 0.7rem; color: var(--primary); letter-spacing: 1px; margin-bottom: 10px; text-transform: uppercase;">⚡ Bitácora de Acciones</h4>
                                <div id="agentLogContainer" style="flex: 1; overflow-y: auto;">
                                    <!-- Dynamic Logs injected by JS -->
                                </div>
                            </div>

                            <button id="optimizerToggleBtn" onclick="toggleOptimizer()" class="btn btn-secondary btn-glow" style="width: 100%;">ACTIVAR AUTO-OPTIMIZER AGENT</button>
                            <p id="optimizerIndicator" style="font-size: 0.7rem; color: var(--text-dim); text-align: center; margin-top: 10px;">🔴 <span style="color: var(--danger);">INACTIVO</span></p>
                        </div>
                    </div>
                </div>

                <!-- NODE 5: Agent Terminal -->
                <div class="ai-node-wrapper" draggable="true">
                    <div class="ai-node" style="border-color: rgba(255, 255, 255, 0.2);">
                        <div class="node-summary">
                            <h4 style="color:#fff;">🖥️ Agent Terminal</h4>
                            <span class="badge" style="background:rgba(255, 255, 255, 0.1); color:#fff; border:1px solid #fff;">SOLANA AGENT KIT V3.0</span>
                        </div>
                        <div class="node-details">
                            <div id="terminalOutput" class="terminal-output-box" style="height: 250px; overflow-y: auto; background: rgba(0,0,0,0.5); padding: 15px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.05); margin-bottom: 15px; text-align: left;">
                                <!-- Terminal logs injected by JS -->
                            </div>

                            <div style="display: flex; align-items: center; gap: 10px; background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.05); border-radius: 8px; padding: 10px 15px; font-family: monospace; font-size: 0.8rem;">
                                <span style="color: var(--secondary); font-weight: bold;">[manager@solana ~]$</span>
                                <input type="text" id="terminalInput" placeholder="Escribe un comando... Ej: /optimize" onkeydown="if(event.key === 'Enter') submitTerminalCommand()" style="background: none; border: none; outline: none; color: #fff; font-family: monospace; font-size: 0.8rem; flex: 1;">
                                <button onclick="submitTerminalCommand()" class="btn-sm btn-primary" style="padding: 4px 10px; border-radius: 4px; font-size: 0.65rem;">ENVIAR</button>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- NODE 6: FlashTrade Hedging -->
                <div class="ai-node-wrapper" draggable="true">
                    <div class="ai-node" style="border-color: rgba(20, 241, 149, 0.3);">
                        <div class="node-summary">
                            <h4 style="color:var(--primary);">📈 FlashTrade Hedging</h4>
                            <span class="badge" style="background:rgba(20, 241, 149, 0.1); color:var(--primary); border:1px solid var(--primary);">DERIVADOS</span>
                        </div>
                        <div class="node-details">
                            <p style="font-size: 0.75rem; color: var(--text-dim); margin-bottom: 15px;">Protege el valor de tu plantilla de la volatilidad abriendo posiciones cortas en SOL/GCH perpetuos.</p>
                            
                            <div style="display:flex; flex-direction:column; gap:15px;">
                                <div style="background: rgba(0,0,0,0.2); padding: 15px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.03);">
                                    <h4 style="font-size:0.8rem; margin:0 0 10px 0; color:#fff;">Calculadora de Cobertura Inteligente</h4>
                                    
                                    <div style="display:grid; grid-template-columns: 1fr 1fr; gap:15px; margin-bottom: 10px;">
                                        <div>
                                            <label style="font-size: 0.65rem; color: var(--text-dim); display:block; margin-bottom:5px;">YIELD EST. ($GCH)</label>
                                            <input type="number" id="hedgeYieldInput" value="452" style="width: 100%; background: #111; color: white; border: 1px solid rgba(255,255,255,0.1); padding: 8px; border-radius: 6px; font-size: 0.75rem;">
                                        </div>
                                        <div>
                                            <label style="font-size: 0.65rem; color: var(--text-dim); display:block; margin-bottom:5px;">VOLATILIDAD (24H)</label>
                                            <div style="background: #111; color: #ff4d6a; border: 1px solid rgba(255,255,255,0.1); padding: 8px; border-radius: 6px; font-size: 0.75rem; font-weight:bold;">⚡ 8.4% ALTA</div>
                                        </div>
                                    </div>

                                    <div style="background: rgba(153, 69, 255, 0.05); padding: 10px; border-radius: 8px; border: 1px solid rgba(153, 69, 255, 0.15); font-size:0.7rem; line-height:1.4; margin-bottom: 15px;">
                                        <span style="color:#aaa;">Recomendación:</span><br>
                                        <span style="color:#fff; font-weight:800;">Abrir SHORT SOL Perpetuo de 1.2 SOL con apalancamiento 5x.</span>
                                    </div>

                                    <div style="display:grid; grid-template-columns: 1fr 1fr; gap:10px;">
                                        <button id="btnSimulateHedge" onclick="simulateHedgeTrade()" class="btn btn-secondary btn-glow" style="width: 100%; font-size:0.7rem;">SIMULAR COBERTURA</button>
                                        <a href="https://flash.trade?ref=goalchain" target="_blank" class="btn btn-primary" style="width: 100%; font-size:0.7rem; display:flex; align-items:center; justify-content:center; text-decoration:none; color:#000; font-weight:bold; background:var(--primary);">
                                            OPERAR EN MAINNET 🚀
                                        </a>
                                    </div>
                                </div>
                                
                                <div style="background: rgba(0,0,0,0.4); border-radius: 12px; border: 1px solid rgba(255,255,255,0.05); padding: 15px;">
                                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
                                        <h4 style="font-size:0.8rem; margin:0; color:#fff; font-family:monospace;">LIVE CHART</h4>
                                        <span id="hedgeStatusLabel" style="font-size: 0.6rem; color: var(--text-dim); font-family:monospace;">🔴 SIN COBERTURA</span>
                                    </div>
                                    <div id="hedgeChart" style="height: 100px; background: rgba(0,0,0,0.5); border-radius: 8px; border: 1px solid rgba(255,255,255,0.03); position:relative; overflow:hidden;">
                                        <div style="position:absolute; inset:0; display:flex; align-items:center; justify-content:center; color:rgba(255,255,255,0.15); font-size:0.65rem; font-family:monospace;">
                                            ESPERANDO EJECUCIÓN...
                                        </div>
                                    </div>
                                    <div id="hedgeStatsRow" style="display:grid; grid-template-columns: 1fr 1fr 1fr; gap:10px; margin-top:10px; opacity:0.4;">
                                        <div style="background: rgba(255,255,255,0.02); padding:6px; border-radius:6px; text-align:center;">
                                            <div style="font-size: 0.55rem; color: var(--text-dim);">P&L REAL-TIME</div>
                                            <strong id="hedgePnL" style="font-size: 0.75rem; color:#fff;">+0.00%</strong>
                                        </div>
                                        <div style="background: rgba(255,255,255,0.02); padding:6px; border-radius:6px; text-align:center;">
                                            <div style="font-size: 0.55rem; color: var(--text-dim);">LIQ. PRICE</div>
                                            <strong style="font-size: 0.75rem; color:#fff;">$238.45</strong>
                                        </div>
                                        <div style="background: rgba(255,255,255,0.02); padding:6px; border-radius:6px; text-align:center;">
                                            <div style="font-size: 0.55rem; color: var(--text-dim);">PYTH PRICE</div>
                                            <strong id="hedgePythPrice" style="font-size: 0.75rem; color:var(--primary);">$182.10</strong>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- NODE 7: Sentinel Infrastructure -->
                <div class="ai-node-wrapper" draggable="true">
                    <div class="ai-node" style="border-color: rgba(153, 69, 255, 0.4);">
                        <div class="node-summary">
                            <h4 style="color:#b266ff;">🛡️ Sentinel Controller</h4>
                            <span class="badge" style="background:rgba(153, 69, 255, 0.1); color:var(--secondary); border:1px solid var(--secondary);">SEGURIDAD AUTÓNOMA</span>
                        </div>
                        <div class="node-details">
                            <p style="font-size: 0.75rem; color: var(--text-dim); margin-bottom: 15px;">Monitorea en tiempo real el estado de RPC y previene el colapso del sistema.</p>

                            <div style="background: rgba(0,0,0,0.2); padding: 15px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.03); margin-bottom: 15px;">
                                <div style="display:grid; grid-template-columns: 1fr 1fr; gap:10px; font-size:0.7rem; margin-bottom: 15px;">
                                    <div>
                                        <label style="font-size: 0.6rem; color: var(--text-dim); display:block; margin-bottom:3px;">AUTONOMÍA</label>
                                        <select style="width: 100%; background: #111; color: white; border: 1px solid rgba(255,255,255,0.1); padding: 6px; border-radius: 6px; font-size:0.7rem;">
                                            <option>Alta (Auto-Paradas)</option>
                                            <option>Media (Alertas)</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label style="font-size: 0.6rem; color: var(--text-dim); display:block; margin-bottom:3px;">RPC NODE</label>
                                        <select style="width: 100%; background: #111; color: white; border: 1px solid rgba(255,255,255,0.1); padding: 6px; border-radius: 6px; font-size:0.7rem;">
                                            <option>Helius Devnet</option>
                                            <option>QuickNode Backup</option>
                                        </select>
                                    </div>
                                </div>
                                <div style="background: rgba(255, 77, 106, 0.05); padding: 10px; border-radius: 8px; border: 1px solid rgba(255, 77, 106, 0.15); font-size:0.65rem; line-height:1.3;">
                                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:5px; font-weight:bold; color:#fff;">
                                        <span>Emergency Circuit Breaker</span>
                                        <input type="checkbox" checked style="accent-color: #ff4d6a;">
                                    </div>
                                    <span style="color:#ffb3bf;">Si la liquidez cae por debajo de 50 SOL de forma anómala, el Sentinel congela los retiros del Vault.</span>
                                </div>
                            </div>
                            
                            <div style="background: rgba(0,0,0,0.4); border-radius: 12px; border: 1px solid rgba(255,255,255,0.05); padding: 15px; height: 160px; display:flex; flex-direction:column;">
                                <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid rgba(255,255,255,0.05); padding-bottom:5px; margin-bottom:10px;">
                                    <h4 style="font-size:0.75rem; margin:0; color:#fff; font-family:monospace;">SENTINEL LOGS</h4>
                                    <span style="display:inline-block; width:8px; height:8px; border-radius:50%; background:#14f195; animation: blink 1.2s infinite;"></span>
                                </div>
                                <div id="sentinelLogsBox" style="flex:1; overflow-y:auto; font-family:monospace; font-size:0.65rem; color:#8a8a9a;">
                                    <div>[SYSTEM] Esperando conexión de Sentinel...</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- NODE 8: Solana Ecosystem Portal -->
                <div class="ai-node-wrapper" draggable="true">
                    <div class="ai-node" style="border-color: rgba(20, 241, 149, 0.3);">
                        <div class="node-summary">
                            <h4 style="color:#fff;">🌐 Ecosystem Portal</h4>
                            <span class="badge" style="background:rgba(20, 241, 149, 0.1); color:var(--primary); border:1px solid var(--primary);">MOLT.ID & SWITCHBOARD</span>
                        </div>
                        <div class="node-details">
                            <p style="font-size: 0.75rem; color: var(--text-dim); margin-bottom: 15px;">Registra tu dominio en Molt.id, visualiza telemetría de Switchboard y sigue el chat en Moltbook.</p>

                            <div style="display:flex; flex-direction:column; gap:15px;">
                                <div style="background: rgba(153, 69, 255, 0.05); padding: 15px; border-radius: 12px; border: 1px solid rgba(153, 69, 255, 0.15);">
                                    <h4 style="font-size:0.8rem; margin:0 0 10px 0; color:#fff; display:flex; justify-content:space-between; align-items:center;">
                                        <span>🪪 Registro Molt.id (.molt)</span>
                                    </h4>
                                    <div style="display:flex; gap:10px;">
                                        <input type="text" id="moltDomainName" value="nicopez" style="width: 120px; background: #111; color: white; border: 1px solid rgba(255,255,255,0.1); padding: 8px; border-radius: 6px; font-size: 0.75rem;">
                                        <button onclick="mintMoltDomain()" id="btnMintMolt" class="btn btn-primary btn-sm" style="flex:1; font-size:0.65rem; font-weight:bold; background:var(--primary); color:#000; border-radius:6px; border:none;">
                                            REGISTRAR
                                        </button>
                                    </div>
                                </div>

                                <div style="background: rgba(0,0,0,0.3); padding: 15px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.03);">
                                    <h4 style="font-size:0.8rem; margin:0 0 10px 0; color:#fff; display:flex; justify-content:space-between; align-items:center;">
                                        <span>📡 Switchboard Feeds</span>
                                        <span style="font-size:0.6rem; color:#ffbd2e;">🟢 CONECTADO</span>
                                    </h4>
                                    <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px; font-size:0.65rem; font-family:monospace;">
                                        <div style="background:rgba(255,255,255,0.02); padding:8px; border-radius:6px; text-align:center;">
                                            <span style="color:var(--text-dim); display:block; font-size:0.5rem; margin-bottom:3px;">TEMP</span>
                                            <strong style="color:#fff;" id="sbTemp">22.4°C</strong>
                                        </div>
                                        <div style="background:rgba(255,255,255,0.02); padding:8px; border-radius:6px; text-align:center;">
                                            <span style="color:var(--text-dim); display:block; font-size:0.5rem; margin-bottom:3px;">FRICTION</span>
                                            <strong style="color:var(--primary);" id="sbFriction">0.82</strong>
                                        </div>
                                    </div>
                                </div>

                                <div style="background: rgba(0,0,0,0.4); border-radius: 12px; border: 1px solid rgba(255,255,255,0.05); padding: 15px; height: 180px; display:flex; flex-direction:column;">
                                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px; border-bottom:1px solid rgba(255,255,255,0.05); padding-bottom:5px;">
                                        <h4 style="font-size:0.75rem; margin:0; color:#fff; font-family:monospace;">💬 Moltbook Social Feed</h4>
                                    </div>
                                    <div id="moltbookLogsBox" style="flex:1; overflow-y:auto; font-size:0.65rem; color:#aaa; display:flex; flex-direction:column; gap:8px;">
                                        <div style="color:var(--text-dim);">[SYSTEM] Sincronizando logs...</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

            </div> <!-- END AI NODES CANVAS -->

            <script>
                // Drag and Drop Logic for N8N style nodes
                document.addEventListener('DOMContentLoaded', () => {
                    const canvas = document.getElementById('ai-nodes-canvas');
                    if(!canvas) return;
                    
                    let draggedItem = null;

                    const items = canvas.querySelectorAll('.ai-node-wrapper');
                    
                    items.forEach(item => {
                        item.addEventListener('dragstart', (e) => {
                            draggedItem = item;
                            setTimeout(() => item.classList.add('dragging'), 0);
                        });
                        
                        item.addEventListener('dragend', () => {
                            item.classList.remove('dragging');
                            items.forEach(i => i.classList.remove('drag-over'));
                            draggedItem = null;
                        });

                        item.addEventListener('dragover', (e) => {
                            e.preventDefault();
                            if(item !== draggedItem) {
                                item.classList.add('drag-over');
                            }
                        });

                        item.addEventListener('dragleave', () => {
                            item.classList.remove('drag-over');
                        });

                        item.addEventListener('drop', (e) => {
                            e.preventDefault();
                            if (item !== draggedItem) {
                                let allItems = Array.from(canvas.querySelectorAll('.ai-node-wrapper'));
                                let draggedIndex = allItems.indexOf(draggedItem);
                                let droppedIndex = allItems.indexOf(item);
                                
                                if (draggedIndex < droppedIndex) {
                                    item.parentNode.insertBefore(draggedItem, item.nextSibling);
                                } else {
                                    item.parentNode.insertBefore(draggedItem, item);
                                }
                            }
                            item.classList.remove('drag-over');
                        });
                    });
                });
            </script>
`;

const newContent = content.replace(regex, newHtml);
fs.writeFileSync(filePath, newContent, 'utf-8');
console.log("Update completed successfully!");
