/**
 * agents.js — Lógica de visualización y simulación de la Bóveda de Agentes de IA
 * IIFE namespaced. Sin const/let a nivel de ámbito global para proteger el namespace.
 * Carga configuraciones de ECONOMIC_CANONICAL_CONFIG.json si existen y actualiza el ledger.
 */
(function () {
  var AGENTS_DATA = [
    {
      id: "hermes",
      name: "Hermes (Operator)",
      role: "Intake Agent, log generator, prioritizer",
      category: "Operator",
      status: "Active",
      apy: "15%",
      burnedGCH: 4500000,
      virtualsLink: "https://app.virtuals.io/detective/hermes-goalchain",
      split: { holder: 40, vault: 30, treasury: 20, maint: 10 }
    },
    {
      id: "sentinel",
      name: "Vault Sentinel",
      role: "Yield monitor, automated buyback crank, health check alerts",
      category: "Vault",
      status: "Active",
      apy: "28%",
      burnedGCH: 12300000,
      virtualsLink: "https://app.virtuals.io/detective/sentinel-goalchain",
      split: { holder: 30, vault: 50, treasury: 10, maint: 10 }
    },
    {
      id: "oracle",
      name: "Devnet Oracle",
      role: "Sports data scraper, bet outcome simulation validator",
      category: "Oracle",
      status: "Idle",
      apy: "12%",
      burnedGCH: 2100000,
      virtualsLink: "https://app.virtuals.io/detective/oracle-goalchain",
      split: { holder: 35, vault: 35, treasury: 20, maint: 10 }
    }
  ];

  async function initAgentsPortal() {
    try {
      // Intentar leer configuración canónica por si existen parámetros extras
      var configRes = await fetch("ECONOMIC_CANONICAL_CONFIG.json");
      if (configRes.ok) {
        var config = await configRes.json();
        console.log("Configuración económica cargada en agentes:", config);
        // Si hay una política de oráculo o quema, la podemos usar para enriquecer la vista
      }
    } catch (e) {
      console.warn("No se pudo cargar ECONOMIC_CANONICAL_CONFIG.json, usando parámetros fallback.");
    }

    renderAgentsGrid();
    setupSplitCalculator();
  }

  function renderAgentsGrid() {
    var grid = document.getElementById("agentsGrid");
    if (!grid) return;

    grid.innerHTML = AGENTS_DATA.map(function (agent) {
      var statusClass = agent.status === "Active" ? "status-healthy" : "status-offline";
      return `
        <div class="metric-card" style="display:flex; flex-direction:column; justify-content:space-between; min-height:300px;">
          <div class="glow-sphere"></div>
          <div>
            <div class="metric-title">
              <span>${agent.category}</span>
              <span class="status-indicator ${statusClass}">● ${agent.status}</span>
            </div>
            <h3 style="margin: 5px 0 10px; font-weight:800; font-size:1.3rem; color:#fff;">${agent.name}</h3>
            <p style="color:#9ca3af; font-size:0.8rem; margin:0 0 15px; min-height:40px;">${agent.role}</p>
            
            <div style="display:grid; grid-template-columns: 1fr 1fr; gap:10px; margin-bottom:15px; background:rgba(255,255,255,0.02); padding:10px; border-radius:12px;">
              <div>
                <span style="font-size:0.65rem; color:#6b7280; text-transform:uppercase;">Est. APY</span>
                <div style="font-size:1.1rem; font-weight:900; color:#14f195;">${agent.apy}</div>
              </div>
              <div>
                <span style="font-size:0.65rem; color:#6b7280; text-transform:uppercase;">Total Burned</span>
                <div style="font-size:1.1rem; font-weight:900; color:#ffd700;">${agent.burnedGCH.toLocaleString()} GCH</div>
              </div>
            </div>
          </div>

          <div>
            <a href="${agent.virtualsLink}" target="_blank" class="btn btn-secondary" style="width:100%; display:block; text-align:center; padding:10px 0; border-radius:10px; font-weight:700; font-size:0.8rem; text-decoration:none; background:rgba(153,69,255,0.1); border:1px solid rgba(153,69,255,0.3); color:#a5b4fc; transition:all 0.2s;">
              Virtuals.io Market ↗
            </a>
          </div>
        </div>
      `;
    }).join("");
  }

  function setupSplitCalculator() {
    var select = document.getElementById("agentSelector");
    if (!select) return;

    // Poblar selector
    select.innerHTML = AGENTS_DATA.map(function (a) {
      return `<option value="${a.id}">${a.name}</option>`;
    }).join("");

    select.addEventListener("change", function () {
      updateLedger(select.value);
    });

    // Cargar inicial
    updateLedger(AGENTS_DATA[0].id);
  }

  function updateLedger(agentId) {
    var agent = AGENTS_DATA.find(function (a) { return a.id === agentId; });
    if (!agent) return;

    var holderVal = document.getElementById("ledgerHolder");
    var vaultVal = document.getElementById("ledgerVault");
    var treasuryVal = document.getElementById("ledgerTreasury");
    var maintVal = document.getElementById("ledgerMaint");

    if (holderVal) holderVal.innerText = agent.split.holder + "%";
    if (vaultVal) vaultVal.innerText = agent.split.vault + "%";
    if (treasuryVal) treasuryVal.innerText = agent.split.treasury + "%";
    if (maintVal) maintVal.innerText = agent.split.maint + "%";

    // Actualizar barras de progreso si existen
    updateProgressBar("barHolder", agent.split.holder);
    updateProgressBar("barVault", agent.split.vault);
    updateProgressBar("barTreasury", agent.split.treasury);
    updateProgressBar("barMaint", agent.split.maint);
  }

  function updateProgressBar(id, value) {
    var bar = document.getElementById(id);
    if (bar) {
      bar.style.width = value + "%";
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initAgentsPortal);
  } else {
    initAgentsPortal();
  }
})();
