/**
 * ⚡ GOALCHAIN LIVE ENGINE v2
 * Simulates real-time economic activity and visual effects.
 * Handles DAO proposals and interactive discovery.
 */

class LiveEngine {
  constructor() {
    this.burnVal = 148920;
    this.tickerElement = document.getElementById("globalTicker");
    this.burnElement = document.getElementById("liveBurnVal");
    this.detailText = document.getElementById("gameDetailText");
    this.detailBox = document.getElementById("gameDetailBox");

    // Stats Elements
    this.statStaked = document.getElementById("statStaked");
    this.statMarketCap = document.getElementById("statMarketCap");
    this.statHolders = document.getElementById("statHolders");

    this.stakedVal = 48290.4;
    this.marketCapVal = 14.8;
    this.holdersVal = 18294;

    this.defaultDAOText = "BE PART OF THE DAO AND PROPOSE A NEW GAME 🏛️";

    this.init();
  }

  init() {
    // Start economic simulations
    this.startBurnSimulation();
    this.applyHolographicEffects();
    this.initGameHover();
    this.startStatsSimulation();

    console.log("🚀 GoalChain Live Engine Initialized");
  }

  /**
   * 🎮 Handles hover effects for future games list with full bilingual support
   */
  initGameHover() {
    const items = document.querySelectorAll(".future-game-item");
    if (!items.length || !this.detailText) return;

    const detailBtn = this.detailBox
      ? this.detailBox.querySelector(".btn")
      : null;

    items.forEach((item) => {
      item.style.transition = "all 0.25s ease";
      item.style.cursor = "pointer";

      item.addEventListener("mouseenter", () => {
        item.style.transform = "translateX(8px)";

        // Detect active language
        const isEn = typeof currentLang !== "undefined" && currentLang === "en";
        const desc = isEn
          ? item.getAttribute("data-desc-en")
          : item.getAttribute("data-desc-es");
        const color = window.getComputedStyle(item).color;

        this.detailText.innerHTML = desc || "";
        this.detailBox.style.borderStyle = "solid";
        this.detailBox.style.borderColor = color || "var(--secondary)";
        this.detailBox.style.boxShadow =
          "0 10px 25px rgba(255, 255, 255, 0.05)";

        if (detailBtn) detailBtn.style.display = "none";
      });

      item.addEventListener("mouseleave", () => {
        item.style.transform = "translateX(0)";

        // Restore localized default DAO text
        if (typeof t === "function") {
          this.detailText.textContent = t("dao_title");
          if (detailBtn) {
            detailBtn.textContent = t("dao_btn");
            detailBtn.style.display = "inline-block";
          }
        } else {
          this.detailText.textContent = this.defaultDAOText;
          if (detailBtn) detailBtn.style.display = "inline-block";
        }

        this.detailBox.style.borderStyle = "dashed";
        this.detailBox.style.borderColor = "var(--secondary)";
        this.detailBox.style.boxShadow = "none";
      });
    });
  }

  /**
   * 🔥 Simulates real-time burn updates from the Vault
   */
  startBurnSimulation() {
    if (window.goalchainBurnTrackerLoaded) return;
    setInterval(() => {
      const increment = Math.floor(Math.random() * 5) + 1;
      this.burnVal += increment;
      if (this.burnElement) {
        this.burnElement.innerText = this.burnVal.toLocaleString();
        this.burnElement.style.textShadow = "0 0 30px rgba(255, 77, 106, 0.8)";
        setTimeout(() => {
          this.burnElement.style.textShadow =
            "0 0 15px rgba(255, 77, 106, 0.4)";
        }, 200);
      }
    }, 3000);
  }

  /**
   * 💎 Adds holographic mouse-tracking to cards
   */
  applyHolographicEffects() {
    document.addEventListener("mousemove", (e) => {
      const cards = document.querySelectorAll(".nft-card-3d");
      cards.forEach((card) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        if (x > -50 && x < rect.width + 50 && y > -50 && y < rect.height + 50) {
          const xPct = (x / rect.width) * 100;
          const yPct = (y / rect.height) * 100;
          card.style.setProperty("--x", `${xPct}%`);
          card.style.setProperty("--y", `${yPct}%`);
        }
      });
    });
  }

  /**
   * 📊 Simulates real-time growth for ecosystem metrics
   */
  startStatsSimulation() {
    if (window.goalchainBurnTrackerLoaded) return;
    setInterval(() => {
      // Staked SOL growth
      this.stakedVal += Math.random() * 0.5;
      if (this.statStaked)
        this.statStaked.innerText = `◎ ${this.stakedVal.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 })}`;

      // Market Cap growth
      this.marketCapVal += Math.random() * 0.01;
      if (this.statMarketCap)
        this.statMarketCap.innerText = `$${this.marketCapVal.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 })}M`;

      // Active Managers growth
      if (Math.random() > 0.7) {
        this.holdersVal += Math.floor(Math.random() * 2) + 1;
        if (this.statHolders)
          this.statHolders.innerText = this.holdersVal.toLocaleString();
      }
    }, 5000);
  }
}

// ==========================================
// 🏟️ GOALCHAIN LIVE MATCH ARENA SIMULATOR
// ==========================================

class LiveMatchArena {
  constructor() {
    this.currentMin = 1;
    this.scoreA = 0;
    this.scoreB = 0;
    this.selectedBet = null; // 'teamA' or 'teamB'
    this.activeBet = null; // Active placed bet: { team, amount }
    this.isMarketOpen = true;
    this.logsContainer = document.getElementById("oracleLiveLogs");
    this.timeEl = document.getElementById("liveMatchTime");
    this.scoreEl = document.getElementById("liveMatchScore");
    this.phaseEl = document.getElementById("liveMatchPhase");
    this.marketStatusEl = document.getElementById("liveMarketStatus");
    this.btnPlaceBet = document.getElementById("btnPlaceLiveBet");

    this.init();
  }

  init() {
    if (!this.logsContainer) return;

    this.log("[Oracle] 📡 Connection to Solana validator established.");
    this.log(
      "[Oracle] 🛡️ Oracle Authority verificado: E4hdW2ba7B6x2rPdNd9msmPFv86UtAUgGQuPePTHL2Ra",
    );
    this.log(
      "[Oracle] 🏟️ Inicializando fixture: Argentina vs Francia (WC2026_FINAL_1779057765)",
    );
    this.log(
      "[Oracle] ✅ Fixture inicializado en la blockchain. Tx: 3qV7dotrrqQiB...",
    );

    // Start simulated timer (1 minute in-game = 3 seconds real-time)
    this.gameLoop = setInterval(() => {
      this.currentMin += 2; // Increments fast for demo purposes

      if (this.currentMin >= 90) {
        this.currentMin = 90;
        clearInterval(this.gameLoop);
        this.finishMatch();
        return;
      }

      // Update UI elements
      if (this.timeEl) this.timeEl.innerText = `Min ${this.currentMin}'`;

      // Trigger events at specific minutes
      this.handleMatchEvents();
    }, 3000);
  }

  log(msg, color = "#a0aec0") {
    if (!this.logsContainer) return;
    const div = document.createElement("div");
    div.style.color = color;
    div.innerText = msg;
    this.logsContainer.appendChild(div);
    this.logsContainer.scrollTop = this.logsContainer.scrollHeight;
  }

  handleMatchEvents() {
    const min = this.currentMin;

    if (min === 15) {
      this.log(
        "[Oracle] 📈 Creating 'Next Goal' Live Market on the Blockchain...",
      );
      this.log(
        "[Oracle] ✅ Live Market ID 1 abierto exitosamente. Tx: 571LEZF...",
      );
    } else if (min === 23) {
      this.scoreA = 1;
      if (this.scoreEl)
        this.scoreEl.innerText = `${this.scoreA} - ${this.scoreB}`;
      this.log("[Oracle] ⚽ GOOOOOAL FOR ARGENTINA! (Min 23)", "#14f195");
      this.log("[Oracle] 📈 Cerrando Live Market ID 1...");
      this.resolveMarket("teamA");
    } else if (min === 45) {
      if (this.phaseEl) this.phaseEl.innerText = "Half Time (HT)";
      this.log(
        "[Oracle] ⏳ End of the first half. Fixture state updated.",
      );
    } else if (min === 47) {
      if (this.phaseEl) this.phaseEl.innerText = "Second Half";
      this.log(
        "[Oracle] 📈 Opening Live Market ID 2 ('Next Goal'). Status: OPEN",
      );
      this.reopenMarket();
    } else if (min === 68) {
      this.scoreB = 1;
      if (this.scoreEl)
        this.scoreEl.innerText = `${this.scoreA} - ${this.scoreB}`;
      this.log("[Oracle] ⚽ GOOOOOAL FOR FRANCE! (Min 68)", "#ff4d6a");
      this.log("[Oracle] 📈 Cerrando Live Market ID 2...");
      this.resolveMarket("teamB");
    }
  }

  resolveMarket(winningTeam) {
    this.isMarketOpen = false;
    if (this.marketStatusEl) {
      this.marketStatusEl.innerText = "RESOLVED / CLOSED";
      this.marketStatusEl.style.color = "#ff4d6a";
      this.marketStatusEl.style.background = "rgba(255, 77, 106, 0.1)";
      this.marketStatusEl.style.borderColor = "rgba(255, 77, 106, 0.2)";
    }

    this.log(
      `[Oracle] ⚖️ Resolving Live Market for ${winningTeam === "teamA" ? "Argentina" : "Francia"}...`,
    );
    this.log(
      "[Oracle] ✅ Settling betting pools and distributing $GCH atomically.",
    );

    if (this.activeBet) {
      if (this.activeBet.team === winningTeam) {
        const multiplier = winningTeam === "teamA" ? 2.15 : 1.85;
        const winAmount = Math.floor(this.activeBet.amount * multiplier);

        // Reward user!
        let balance = parseInt(localStorage.getItem("gch_balance") || "1000");
        balance += winAmount;
        localStorage.setItem("gch_balance", balance);

        // Add GoalPoints for successful betting!
        let pts = parseInt(localStorage.getItem("goalpoints") || "0");
        pts += 500;
        localStorage.setItem("goalpoints", pts);

        if (window.updateGoalPoints) window.updateGoalPoints();
        if (window.game) {
          window.game.balance = balance;
          window.game.updateStatsUI();
        }

        this.log(
          `[User] 🎉 YOU WON YOUR BET! You received +${winAmount} $GCH and +500 GoalPoints.`,
          "#14f195",
        );

        if (window.confetti) {
          confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 },
          });
        }
      } else {
        this.log(
          "[User] ❌ Bet lost. Better luck next time!",
          "#ff4d6a",
        );
      }
      this.activeBet = null;
    }
  }

  reopenMarket() {
    this.isMarketOpen = true;
    if (this.marketStatusEl) {
      this.marketStatusEl.innerText = "ABIERTO";
      this.marketStatusEl.style.color = "#14f195";
      this.marketStatusEl.style.background = "rgba(20, 241, 149, 0.1)";
      this.marketStatusEl.style.borderColor = "rgba(20, 241, 149, 0.2)";
    }

    // Reset selections
    const buttons = document.querySelectorAll(".btn-live-select");
    buttons.forEach((btn) => btn.classList.remove("selected"));
    this.selectedBet = null;
  }

  finishMatch() {
    if (this.phaseEl) this.phaseEl.innerText = "Full Time (FT)";
    this.log(
      "[Oracle] 🏁 FULL TIME! Resolving general pre-match pools...",
    );
    this.log(
      "[Oracle] 🏆 Fixture completado exitosamente en Blockchain. Tx: 2cgzGm6MKcz...",
    );
    this.log("====================================================");
    this.log("🟢 ORACLE WAITING FOR NEW LIVE MATCH.");
  }
}

// Global scope exposed functions for UI
let liveArenaInstance = null;

window.selectLiveBet = function (team) {
  if (!liveArenaInstance || !liveArenaInstance.isMarketOpen) {
    alert("The market is currently closed or being resolved.");
    return;
  }

  liveArenaInstance.selectedBet = team;

  // Manage active classes
  const buttons = document.querySelectorAll(".btn-live-select");
  buttons.forEach((btn, idx) => {
    const isTeamA = idx === 0;
    const shouldSelect =
      (isTeamA && team === "teamA") || (!isTeamA && team === "teamB");
    btn.classList.toggle("selected", shouldSelect);
  });
};

window.setLiveBetMax = function () {
  const input = document.getElementById("liveBetAmount");
  if (!input) return;

  const balance = localStorage.getItem("gch_balance") || "1000";
  input.value = balance;
};

window.placeLiveBet = function () {
  const wallet = localStorage.getItem("goalchain_wallet");
  if (!wallet) {
    if (window.notifier) {
      window.notifier.show(
        "CONNECT WALLET",
        "Connect your Phantom Wallet first in the top menu.",
        "warning",
      );
    } else {
      alert("Connect your Phantom Wallet first in the top menu.");
    }
    return;
  }

  if (!liveArenaInstance || !liveArenaInstance.isMarketOpen) {
    alert("The betting market is closed right now.");
    return;
  }

  const team = liveArenaInstance.selectedBet;
  if (!team) {
    alert("Select a team (Argentina or Francia) to bet on.");
    return;
  }

  const input = document.getElementById("liveBetAmount");
  const amount = parseInt(input ? input.value : "0");

  if (isNaN(amount) || amount <= 0) {
    alert("Please enter a valid token amount.");
    return;
  }

  let balance = parseInt(localStorage.getItem("gch_balance") || "1000");
  if (amount > balance) {
    alert(`Insufficient balance. Your current balance is ${balance} $GCH.`);
    return;
  }

  // Deduct tokens
  balance -= amount;
  localStorage.setItem("gch_balance", balance);
  if (window.game) {
    window.game.balance = balance;
    window.game.updateStatsUI();
  }
  if (window.updateGoalPoints) window.updateGoalPoints();

  // Save active prediction
  liveArenaInstance.activeBet = { team, amount };

  const teamName = team === "teamA" ? "Argentina" : "Francia";
  liveArenaInstance.log(
    `[User] 💸 Placed a bet of ${amount} $GCH a ${teamName}. Waiting for Oracle resolution...`,
    "#ffd700",
  );

  if (window.notifier) {
    window.notifier.show(
      "BET CONFIRMED ⚽",
      `Betting ${amount} $GCH live on ${teamName}.`,
      "success",
    );
  }
};

// DAO Global Functions
function toggleDAOForm() {
  const form = document.getElementById("daoProposalForm");
  const box = document.getElementById("gameDetailBox");
  if (form.style.display === "none") {
    form.style.display = "block";
    box.style.display = "none";
  } else {
    form.style.display = "none";
    box.style.display = "flex";
  }
}

function submitDAOProposal() {
  const name = document.getElementById("daoGameName").value;
  const desc = document.getElementById("daoGameDesc").value;

  if (!name || !desc) {
    alert("Please fill in the proposal fields.");
    return;
  }

  alert(
    `✅ Proposal sent to the DAO: ${name}\nThank you for contributing to the GoalChain ecosystem.`,
  );

  // Clear and close
  document.getElementById("daoGameName").value = "";
  document.getElementById("daoGameDesc").value = "";
  toggleDAOForm();
}

// Start Engine
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
    new LiveEngine();
    liveArenaInstance = new LiveMatchArena();
  });
} else {
  new LiveEngine();
  liveArenaInstance = new LiveMatchArena();
}
