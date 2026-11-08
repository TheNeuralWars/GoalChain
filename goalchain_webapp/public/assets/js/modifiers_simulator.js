/**
 * GoalChain Economy & Modifiers Simulator (V2.0)
 * Interacciones interactivas de fusión de Locker Room, alquileres y coeficientes de sueldo.
 */

class ModifiersSimulator {
  constructor() {
    this.economyConfig = {
      potionCostGch: 100,
      rarityBaseYieldGch: {
        mythic: 5000,
        legendary: 1000,
        epic: 250,
        rare: 50,
        common: 100,
      },
    };
    this.selectedPlayer = null;

    // Estado de simulación del jugador
    this.stamina = 100;
    this.maxStamina = 100;
    this.equippedJersey = null; // null, 'argentina_home_2026' or 'miami_pink_2026'
    this.equippedBoots = null;
    this.hasShield = false;

    // Multiplicadores dinámicos
    this.lastMatchResult = "win";
    this.winStreak = 0;

    // Licencias y Química
    this.hasCountryLicense = false;
    this.sameCountryCount = 1;
    this.sameClubCount = 1;
    this.stadiumTheme = "desert"; // matches player visualbg for home advantage

    // Liga / Torneo Activo
    this.activeLeague = "world_cup"; // 'world_cup' or 'mls'

    // Alquileres
    this.rentalStatus = "none"; // 'none', 'listed', 'rented'
    this.rentalPrice = 200; // $GCH
    this.currentBorrower = "@DegenManager42";
    this.nextBorrower = "@WhaleTrader";

    // Economía de usuario simulada
    this.userBalance = 1240;
    this.totalGchBurned = 0;

    this.init();
  }

  init() {
    console.log(
      "GoalChain Simulator: Cargando simulador de modificadores V2.1 (Multi-League)..."
    );
    this.setupSelectors();
    this.setupListeners();
    this.resetSimState();
    this.logToConsole(
      "⚡ [Sistema] Modifiers Sim V2.1 (Multi-League) cargado. Conectado a Solana Devnet (Simulado)."
    );
    this.logToConsole(
      "ℹ️ Selecciona un jugador y cambia su camiseta en el Locker Room según el torneo activo."
    );
  }

  setupSelectors() {
    // Enlazar los elementos DOM principales
    this.playerSelect = document.getElementById("simPlayerSelect");
    this.staminaSlider = document.getElementById("simStaminaSlider");
    this.staminaVal = document.getElementById("simStaminaVal");

    this.activeLeagueSelect = document.getElementById("simActiveLeague");
    this.fuseItemSelect = document.getElementById("simFuseItem");

    this.licenseCheck = document.getElementById("simLicenseCheck");
    this.synergyCountSelect = document.getElementById("simSynergyCount");
    this.clubSynergyCountSelect = document.getElementById(
      "simClubSynergyCount"
    );
    this.stadiumSelect = document.getElementById("simStadiumSelect");

    this.rentalStatusText = document.getElementById("simRentalStatusText");
    this.rentalPriceInput = document.getElementById("simRentalPrice");
    this.borrowerInput = document.getElementById("simBorrower");
    this.nextBorrowerInput = document.getElementById("simNextBorrower");

    this.consoleLog = document.getElementById("simConsoleLog");

    // UI del Cromo 3D y Yield
    this.cardRarityBadge = document.getElementById("simCardRarityBadge");
    this.cardYieldText = document.getElementById("simCardYieldText");
    this.cardImg = document.getElementById("simCardImg");
    this.cardName = document.getElementById("simCardName");
    this.cardRealName = document.getElementById("simCardRealName");
    this.cardFlag = document.getElementById("simCardFlag");

    // Stats numéricos en el cromo
    this.atkStat = document.getElementById("simAtkStat");
    this.defStat = document.getElementById("simDefStat");
    this.spdStat = document.getElementById("simSpdStat");
    this.hypStat = document.getElementById("simHypStat");

    // Atributos de vestuario
    this.jerseyBadge = document.getElementById("simJerseyBadge");
    this.bootsBadge = document.getElementById("simBootsBadge");
    this.shieldIcon = document.getElementById("simShieldIcon");

    // Bonding Curve
    this.curveWins = document.getElementById("curveWins");
    this.curveLosses = document.getElementById("curveLosses");
    this.curveChampion = document.getElementById("curveChampion");
    this.curvePriceText = document.getElementById("curvePriceText");
  }

  setupListeners() {
    // Listener de selector de jugador
    if (this.playerSelect) {
      this.playerSelect.addEventListener("change", (e) => {
        this.loadPlayer(parseInt(e.target.value));
      });
    }

    // Listener de slider de estamina
    if (this.staminaSlider) {
      this.staminaSlider.addEventListener("input", (e) => {
        this.stamina = parseInt(e.target.value);
        if (this.staminaVal) this.staminaVal.innerText = `${this.stamina}%`;
        this.updateYieldAndUI();
      });
    }

    // Liga / Torneo Activo Switcher
    if (this.activeLeagueSelect) {
      this.activeLeagueSelect.addEventListener("change", (e) => {
        this.activeLeague = e.target.value;
        this.logToConsole(
          `🏆 [Torneo] Torneo activo cambiado a: ${
            this.activeLeague === "world_cup"
              ? "Copa del Mundo 🌍"
              : "MLS Club Cup ⚽"
          }.`
        );
        this.updateYieldAndUI();
      });
    }

    // Licencias y Química
    if (this.licenseCheck) {
      this.licenseCheck.addEventListener("change", (e) => {
        this.hasCountryLicense = e.target.checked;
        this.logToConsole(
          `🏛️ [Licencia] Multiplicador de País ${
            this.hasCountryLicense
              ? "ACTIVADO (+5% Yield, +10% Stats)"
              : "desactivado"
          }.`
        );
        this.updateYieldAndUI();
      });
    }

    if (this.synergyCountSelect) {
      this.synergyCountSelect.addEventListener("change", (e) => {
        this.sameCountryCount = parseInt(e.target.value);
        let msg = `🧪 [Química] Alineados ${this.sameCountryCount} jugadores del mismo país. `;
        if (this.sameCountryCount >= 11)
          msg += "Sinergia de Full Squad (+15% Yield, +25% Stats) activa!";
        else if (this.sameCountryCount >= 5)
          msg += "Sinergia de 5 Jugadores (+12% Stats) activa.";
        else if (this.sameCountryCount >= 3)
          msg += "Sinergia de 3 Jugadores (+5% Stats) activa.";
        this.logToConsole(msg);
        this.updateYieldAndUI();
      });
    }

    if (this.clubSynergyCountSelect) {
      this.clubSynergyCountSelect.addEventListener("change", (e) => {
        this.sameClubCount = parseInt(e.target.value);
        const pairs = Math.floor(this.sameClubCount / 2);
        let msg = `🛡️ [Química Club] Alineados ${this.sameClubCount} jugadores del mismo Club (${pairs} parejas). `;
        if (this.sameClubCount >= 11)
          msg +=
            "Sinergia de Club Completo (+25% Stats, +15% Yield 🔥) activa!";
        else if (this.sameClubCount >= 2)
          msg += `Bono por parejas: +${pairs * 5}% en ATK y DEF.`;
        this.logToConsole(msg);
        this.updateYieldAndUI();
      });
    }

    if (this.stadiumSelect) {
      this.stadiumSelect.addEventListener("change", (e) => {
        this.stadiumTheme = e.target.value;
        this.logToConsole(
          `🏟️ [Estadio] Clima de localía cambiado a: "${this.stadiumTheme.toUpperCase()}".`
        );
        this.updateYieldAndUI();
      });
    }

    // Win Streak y Momentum en el panel derecho
    document.querySelectorAll('input[name="simResult"]').forEach((radio) => {
      radio.addEventListener("change", (e) => {
        this.lastMatchResult = e.target.value;
        this.logToConsole(
          `⚽ [Oráculo] Último resultado de selección resuelto como: ${this.lastMatchResult.toUpperCase()}.`
        );
        this.updateYieldAndUI();
      });
    });

    document.querySelectorAll('input[name="simStreak"]').forEach((radio) => {
      radio.addEventListener("change", (e) => {
        this.winStreak = parseInt(e.target.value);
        let modeText =
          this.winStreak >= 4
            ? "¡🔥 ON FIRE 🔥!"
            : `${this.winStreak} victorias`;
        this.logToConsole(
          `🔥 [Oráculo] Racha de victorias cambiada a: ${modeText}.`
        );
        this.updateYieldAndUI();
      });
    });

    // Bonding Curve inputs
    if (this.curveWins || this.curveLosses || this.curveChampion) {
      const updateCurve = () => this.calculateBondingCurve();
      if (this.curveWins) this.curveWins.addEventListener("input", updateCurve);
      if (this.curveLosses)
        this.curveLosses.addEventListener("input", updateCurve);
      if (this.curveChampion)
        this.curveChampion.addEventListener("change", updateCurve);
    }
  }

  resetSimState() {
    this.stamina = 100;
    this.maxStamina = 100;
    this.equippedJersey = null;
    this.equippedBoots = null;
    this.hasShield = false;
    this.rentalStatus = "none";

    if (this.staminaSlider) this.staminaSlider.value = 100;
    if (this.staminaVal) this.staminaVal.innerText = "100%";
    if (this.licenseCheck) this.licenseCheck.checked = false;
    this.hasCountryLicense = false;

    if (this.synergyCountSelect) this.synergyCountSelect.value = "1";
    this.sameCountryCount = 1;

    if (this.clubSynergyCountSelect) this.clubSynergyCountSelect.value = "1";
    this.sameClubCount = 1;

    // Reset inputs de renta
    if (this.rentalPriceInput) this.rentalPriceInput.value = "200";
    if (this.borrowerInput) this.borrowerInput.value = "@DegenManager42";
    if (this.nextBorrowerInput) this.nextBorrowerInput.value = "@WhaleTrader";

    this.updateRentalUI();
  }

  loadPlayer(playerId) {
    if (!window.masterPlayers || window.masterPlayers.length === 0) {
      // Cargar datos simulados de fallback por si no se ha llamado initNFTGallery
      this.selectedPlayer = {
        id: playerId,
        name:
          playerId === 1
            ? "Lionel Satoshi"
            : playerId === 53
            ? "Kylian M-bag-pé"
            : "Cristiano Holdaldo",
        real_name:
          playerId === 1
            ? "Lionel Messi"
            : playerId === 53
            ? "Kylian Mbappé"
            : "Cristiano Ronaldo",
        country:
          playerId === 1
            ? "Argentina"
            : playerId === 53
            ? "Francia"
            : "Portugal",
        rarity: "mythic",
        stats: { atk: 95, def: 42, speed: 90, hype: 99 },
        bg_type: "BG-MYT",
        base_yield_rate: this.economyConfig.rarityBaseYieldGch.mythic,
      };
    } else {
      const found = window.masterPlayers.find((p) => p.id === playerId);
      if (found) {
        // Hacer una copia profunda del objeto para no alterar el registro maestro directamente
        this.selectedPlayer = JSON.parse(JSON.stringify(found));
        // Asegurar tasa base según rareza si no la tiene
        const yieldMap = this.economyConfig.rarityBaseYieldGch;
        this.selectedPlayer.base_yield_rate =
          yieldMap[this.selectedPlayer.rarity] || yieldMap.common;
      }
    }

    if (!this.selectedPlayer) return;

    this.resetSimState();
    this.logToConsole(
      `👤 [Jugador] Cargado: ${this.selectedPlayer.name} (${
        this.selectedPlayer.country
      }) | Rareza: ${this.selectedPlayer.rarity.toUpperCase()}`
    );

    // Actualizar datos del cromo
    if (this.cardName) this.cardName.innerText = this.selectedPlayer.name;
    if (this.cardRealName)
      this.cardRealName.innerText =
        this.selectedPlayer.real_name || "Verified Athlete";
    if (this.cardRarityBadge) {
      this.cardRarityBadge.innerText = this.selectedPlayer.rarity.toUpperCase();
      this.cardRarityBadge.className = `badge rarity-${this.selectedPlayer.rarity}`;
    }

    // Imagen del jugador
    if (this.cardImg && typeof getPlayerImagePath === "function") {
      this.cardImg.src = getPlayerImagePath(this.selectedPlayer);
    } else if (this.cardImg) {
      const mappedName = this.selectedPlayer.name
        .toLowerCase()
        .replace(/ /g, "_")
        .replace(/[^a-z0-9_\-]/g, "");
      this.cardImg.src = `assets/img/nfts/${String(
        this.selectedPlayer.id
      ).padStart(3, "0")}_${mappedName}.webp`;
    }

    // Banderas
    if (this.cardFlag && typeof getCountryFlag === "function") {
      this.cardFlag.innerText = getCountryFlag(this.selectedPlayer.country);
    }

    // Actualizar estadísticas iniciales en el cromo
    this.updateStatsUI();

    // Actualizar dinámicamente las etiquetas del selector del Locker Room (Panel 2)
    if (this.fuseItemSelect) {
      const optSelection = this.fuseItemSelect.querySelector(
        'option[value="jersey_arg"]'
      );
      if (optSelection) {
        optSelection.innerText = `👕 Camiseta Selección ${this.selectedPlayer.country} (+5 Max Stamina, +3% Yield en Copa del Mundo)`;
      }
      const optClub = this.fuseItemSelect.querySelector(
        'option[value="jersey_club"]'
      );
      if (optClub) {
        const clubName =
          this.selectedPlayer.meta && this.selectedPlayer.meta.parody_club
            ? this.selectedPlayer.meta.parody_club
            : "Club Oficial";
        optClub.innerText = `💗 Camiseta Club ${clubName} (+5 Max Stamina, +5% Yield en MLS)`;
      }
    }

    this.updateYieldAndUI();
  }

  updateStatsUI() {
    if (!this.selectedPlayer) return;

    // Multiplicadores de Sinergia y Licencia a Stats
    let clubStatBonus = 0.0;
    if (this.sameClubCount >= 11) {
      clubStatBonus = 0.25; // +25%
    } else {
      clubStatBonus = Math.floor(this.sameClubCount / 2) * 0.05; // +5% por pareja
    }

    let statMultiplier = 1.0 + clubStatBonus;
    if (this.hasCountryLicense) statMultiplier += 0.1; // +10%
    if (this.sameCountryCount >= 11) statMultiplier += 0.25; // +25%
    else if (this.sameCountryCount >= 5) statMultiplier += 0.12; // +12%
    else if (this.sameCountryCount >= 3) statMultiplier += 0.05; // +5%

    // Locker Room boosts planos
    let atkBoost = 0;
    let speedBoost = 0;
    let hypeBoost = 0;

    if (this.equippedBoots) atkBoost += 8; // Botines de Oro da +8 atk
    if (this.equippedBoots) speedBoost += 8; // Da velocidad
    if (this.hasShield) hypeBoost += 10; // Armband da Hype

    const baseAtk = this.selectedPlayer.stats.atk;
    const baseDef = this.selectedPlayer.stats.def;
    const baseSpeed =
      this.selectedPlayer.stats.speed || this.selectedPlayer.stats.spd || 75;
    const baseHype = this.selectedPlayer.stats.hype;

    if (this.atkStat)
      this.atkStat.innerText = Math.round(
        (baseAtk + atkBoost) * statMultiplier
      );
    if (this.defStat)
      this.defStat.innerText = Math.round(baseDef * statMultiplier);
    if (this.spdStat)
      this.spdStat.innerText = Math.round(
        (baseSpeed + speedBoost) * statMultiplier
      );
    if (this.hypStat)
      this.hypStat.innerText = Math.round(
        (baseHype + hypeBoost) * statMultiplier
      );
  }

  updateYieldAndUI() {
    if (!this.selectedPlayer) return;

    // FÓRMULA DE YIELD DE GOALCHAIN V2.0
    const baseYield = this.selectedPlayer.base_yield_rate; // GCH por día

    // 1. Modificador de Momentum (M_match)
    let mMatch = 0;
    if (this.lastMatchResult === "win") mMatch = 0.15; // +15%
    else if (this.lastMatchResult === "loss") mMatch = -0.1; // -10%

    // 2. Modificador de Racha (S_streak)
    let sStreak = 0;
    if (this.winStreak === 2) sStreak = 0.05;
    else if (this.winStreak === 3) sStreak = 0.1;
    else if (this.winStreak >= 4) sStreak = 0.2;

    // Coeficiente deportivo total
    const sportsCoef = 1 + mMatch + sStreak;

    // 3. Locker Room boosts permanentes
    let lockerRoomBoost = 0;
    if (this.equippedJersey) {
      if (this.equippedJersey.startsWith("club_jersey"))
        lockerRoomBoost += 0.05; // Camiseta Club da +5%
      else lockerRoomBoost += 0.03; // Camiseta Selección da +3%
    }
    if (this.equippedBoots) lockerRoomBoost += 0.05; // +5%
    if (this.hasShield) lockerRoomBoost += 0.1; // +10%

    // 4. Química de Selección (Synergy Boost)
    let synergyMultiplier = 1.0;
    if (this.sameCountryCount >= 11) synergyMultiplier = 1.15; // +15% de sueldo

    // 4.5 Química de Club (Club Synergy Boost)
    let clubSynergyMultiplier = 1.0;
    if (this.sameClubCount >= 11) clubSynergyMultiplier = 1.15; // +15% de sueldo

    // 5. Licencia de País (Nation License)
    let licenseMultiplier = 1.0;
    if (this.hasCountryLicense) licenseMultiplier = 1.05; // +5% de sueldo

    // 6. Estadio (Home Field Advantage)
    let stadiumMultiplier = 1.05; // Boost base
    const stadiumThemeMap = {
      "BG-MYT": "cyber",
      "BG-LEG": "snow",
      "BG-EPI": "snow",
      "BG-RAR": "desert",
      "BG-COM": "desert",
    };
    const correctTheme =
      stadiumThemeMap[this.selectedPlayer.bg_type] || "desert";
    if (this.stadiumTheme === correctTheme) {
      stadiumMultiplier = 1.15; // Home Field Advantage (+15%)
      if (document.getElementById("stadiumAdvantageBadge")) {
        document.getElementById("stadiumAdvantageBadge").style.display =
          "inline-block";
      }
    } else {
      if (document.getElementById("stadiumAdvantageBadge")) {
        document.getElementById("stadiumAdvantageBadge").style.display = "none";
      }
    }

    // 7. Modificador de Estamina
    let staminaModifier = 1.0;
    if (this.stamina === 100) staminaModifier = 1.0;
    else if (this.stamina >= 50) staminaModifier = 0.8;
    else if (this.stamina >= 1) staminaModifier = 0.4;
    else staminaModifier = 0.0; // 0 Stamina = 0 sueldo

    // 8. Validación de Liga y Camiseta Activa
    let leagueMatchMultiplier = 1.0;
    if (this.activeLeague === "world_cup") {
      if (
        this.equippedJersey &&
        this.equippedJersey.startsWith("selection_jersey")
      ) {
        leagueMatchMultiplier = 1.0;
      } else {
        leagueMatchMultiplier = 0.0; // No califica para Copa del Mundo sin camiseta de selección
      }
    } else if (this.activeLeague === "mls") {
      if (
        this.equippedJersey &&
        this.equippedJersey.startsWith("club_jersey")
      ) {
        leagueMatchMultiplier = 1.0;
      } else {
        leagueMatchMultiplier = 0.0; // No califica para MLS sin camiseta de club
      }
    }

    // 9. Death Pledge (Eliminación) - SOLO aplica en la Copa del Mundo si es derrotado y no tiene escudo
    let deathPledgeMultiplier = 1.0;
    if (this.activeLeague === "world_cup" && leagueMatchMultiplier > 0.0) {
      if (
        this.lastMatchResult === "loss" &&
        this.winStreak === 0 &&
        !this.hasShield
      ) {
        deathPledgeMultiplier = 0.0;
      } else if (
        this.lastMatchResult === "loss" &&
        this.winStreak === 0 &&
        this.hasShield
      ) {
        deathPledgeMultiplier = 0.15; // Escudo activo protege el 15%
      }
    }

    // CÁLCULO FINAL DE YIELD DIARIO
    let dailyGchYield =
      baseYield *
      sportsCoef *
      (1 + lockerRoomBoost) *
      synergyMultiplier *
      clubSynergyMultiplier *
      licenseMultiplier *
      stadiumMultiplier *
      staminaModifier *
      leagueMatchMultiplier *
      deathPledgeMultiplier;
    dailyGchYield = Math.max(0, Math.round(dailyGchYield));

    // Actualizar balance diario mostrado en la UI lateral y en la carta
    if (this.cardYieldText) {
      this.cardYieldText.innerText = `${dailyGchYield} $GCH/día`;
    }

    // Sincronizar stats on-chain modificados en el cromo
    this.updateStatsUI();

    // Mostrar desglose en los indicadores de rendimiento
    this.updateBreakdownUI(
      baseYield,
      sportsCoef,
      lockerRoomBoost,
      synergyMultiplier,
      clubSynergyMultiplier,
      licenseMultiplier,
      stadiumMultiplier,
      staminaModifier,
      deathPledgeMultiplier,
      leagueMatchMultiplier
    );
  }

  updateBreakdownUI(
    base,
    sports,
    locker,
    synergy,
    clubSynergy,
    license,
    stadium,
    stamina,
    death,
    leagueMatch
  ) {
    // Actualizar indicadores HTML para que el usuario entienda la matemática completa
    const setVal = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.innerText = val;
    };

    setVal("breakdownBase", `${base} $GCH`);
    setVal("breakdownSports", `${Math.round((sports - 1) * 100)}%`);
    setVal("breakdownLocker", `+${Math.round(locker * 100)}%`);
    setVal("breakdownSynergy", `${Math.round((synergy - 1) * 100)}%`);
    setVal("breakdownClubSynergy", `${Math.round((clubSynergy - 1) * 100)}%`);
    setVal("breakdownLicense", `${Math.round((license - 1) * 100)}%`);
    setVal("breakdownStadium", `+${Math.round((stadium - 1) * 100)}%`);
    setVal("breakdownStamina", `x${stamina}`);

    // Estado del mundial y liga en el desglose
    if (leagueMatch === 0.0) {
      setVal("breakdownDeath", "Camiseta Incorrecta (0%)");
    } else if (this.activeLeague === "mls") {
      setVal("breakdownDeath", "MLS Club Activo (100%)");
    } else {
      setVal(
        "breakdownDeath",
        death === 1.0
          ? "Activo (100%)"
          : death === 0.15
          ? "Escudo (15%)"
          : "ELIMINADO (0%)"
      );
    }

    const deathBadge = document.getElementById("deathPledgeBadge");
    if (deathBadge) {
      if (leagueMatch === 0.0) {
        deathBadge.style.display = "inline-block";
        deathBadge.innerText = "CONFL. CAMISETA/TORNEO (-100%)";
        deathBadge.style.background = "rgba(255, 77, 106, 0.2)";
        deathBadge.style.color = "#ff4d6a";
        deathBadge.style.border = "1px solid #ff4d6a";
      } else if (this.activeLeague === "world_cup" && death < 1.0) {
        deathBadge.style.display = "inline-block";
        deathBadge.innerText =
          death === 0.15
            ? "ESCUDO LEYENDA ACTIVO"
            : "DEATH PLEDGE ACTIVE (-100%)";
        deathBadge.style.background =
          death === 0.15
            ? "rgba(153, 69, 255, 0.2)"
            : "rgba(255, 77, 106, 0.2)";
        deathBadge.style.color =
          death === 0.15 ? "var(--secondary)" : "#ff4d6a";
        deathBadge.style.border =
          death === 0.15 ? "1px solid var(--secondary)" : "1px solid #ff4d6a";
      } else if (this.activeLeague === "mls") {
        deathBadge.style.display = "inline-block";
        deathBadge.innerText = "MLS CUP LEAGUE ACTIVO";
        deathBadge.style.background = "rgba(20, 241, 149, 0.15)";
        deathBadge.style.color = "var(--primary)";
        deathBadge.style.border = "1px solid var(--primary)";
      } else {
        deathBadge.style.display = "none";
      }
    }
  }

  logToConsole(text) {
    if (!this.consoleLog) return;

    const timestamp = new Date().toLocaleTimeString();
    const logItem = document.createElement("div");
    logItem.style.marginBottom = "5px";
    logItem.style.borderBottom = "1px solid rgba(255,255,255,0.02)";
    logItem.style.paddingBottom = "3px";

    if (text.includes("[Sistema]")) logItem.style.color = "var(--primary)";
    else if (
      text.includes("burn") ||
      text.includes("quema") ||
      text.includes("Burns")
    )
      logItem.style.color = "#ff4d6a";
    else if (
      text.includes("ÉXITO") ||
      text.includes("Fusión") ||
      text.includes("fusionado")
    )
      logItem.style.color = "#14f195";
    else if (text.includes("Alquiler") || text.includes("Golden"))
      logItem.style.color = "#ffb703";
    else logItem.style.color = "#a2a2b2";

    logItem.innerHTML = `<span style="color: rgba(255,255,255,0.2); font-size:0.6rem; margin-right:8px;">[${timestamp}]</span> ${text}`;

    this.consoleLog.appendChild(logItem);
    this.consoleLog.scrollTop = this.consoleLog.scrollHeight;
  }

  // OPERACIÓN: Restaurar Estamina (Burns 100 $GCH — alineado con on-chain feed_potion)
  feedSimPotion() {
    if (!this.selectedPlayer) {
      alert("Primero selecciona un jugador.");
      return;
    }

    if (this.stamina >= this.maxStamina) {
      this.logToConsole(
        "⚠️ [Sistema] La estamina del jugador ya está al máximo."
      );
      return;
    }

    const potionCost = this.economyConfig.potionCostGch;
    if (this.userBalance < potionCost) {
      alert(`No tienes suficiente $GCH simulado (Costo: ${potionCost} $GCH).`);
      return;
    }

    // Ejecutar quema
    this.userBalance -= potionCost;
    this.totalGchBurned += potionCost;
    this.stamina = this.maxStamina;

    // Actualizar UI
    if (this.staminaSlider) this.staminaSlider.value = this.maxStamina;
    if (this.staminaVal) this.staminaVal.innerText = `${this.maxStamina}%`;

    this.updateLiveBalanceWidget();
    this.logToConsole(
      `🔥 [Burn Protocol] Quemados ${potionCost} $GCH para Poción de Estamina. Jugador restaurado al ${this.maxStamina}%!`
    );
    this.logToConsole(
      `[Solana Devnet] Instruction called: feed_potion. TX: 5xBt...${Math.random()
        .toString(36)
        .substring(7)
        .toUpperCase()}`
    );

    // Sonido/Partícula de confeti pequeña verde
    if (typeof confetti === "function") {
      confetti({
        particleCount: 30,
        spread: 40,
        colors: ["#14f195", "#00ffcc"],
        origin: { y: 0.6 },
      });
    }

    this.updateYieldAndUI();
  }

  // OPERACIÓN: Equipar Accesorio/Camiseta en Vestuario (Locker Room Equip)
  fuseSimItem() {
    if (!this.selectedPlayer) {
      alert("Selecciona un jugador primero.");
      return;
    }

    const selectedItem = this.fuseItemSelect.value;

    // Validar si ya lo tiene equipado
    if (
      (selectedItem === "jersey_arg" || selectedItem === "jersey_club") &&
      this.equippedJersey
    ) {
      this.logToConsole(
        "⚠️ [Locker Room] Este jugador ya tiene equipada una camiseta. Desequípala antes de equipar una nueva."
      );
      return;
    }
    if (selectedItem === "boots_gold" && this.equippedBoots) {
      this.logToConsole(
        "⚠️ [Locker Room] Este jugador ya tiene equipados los Botines de Oro."
      );
      return;
    }
    if (selectedItem === "armband_cap" && this.hasShield) {
      this.logToConsole(
        "⚠️ [Locker Room] Este jugador ya tiene equipado el Brazalete de Capitán."
      );
      return;
    }

    // Simular firma de transacción en Solana
    this.logToConsole(
      `✍️ [Solana Devnet] Solicitando firma para transferir NFT de equipamiento deportivo al Escrow PDA del programa...`
    );

    setTimeout(() => {
      if (selectedItem === "jersey_arg") {
        const jerseyCode =
          "selection_jersey_" +
          this.selectedPlayer.country.toLowerCase().replace(/ /g, "_");
        this.equippedJersey = jerseyCode;
        this.maxStamina = 105; // Boost temporal de stamina
        this.stamina = 105;
        if (this.staminaSlider) {
          this.staminaSlider.max = 105;
          this.staminaSlider.value = 105;
        }
        if (this.staminaVal) this.staminaVal.innerText = "105%";
        if (this.jerseyBadge) {
          this.jerseyBadge.style.display = "inline-block";
          this.jerseyBadge.innerText = `👕 ${this.selectedPlayer.country} '26`;
          this.jerseyBadge.style.background = "rgba(20, 241, 149, 0.2)";
          this.jerseyBadge.style.color = "var(--primary)";
          this.jerseyBadge.style.border = "1px solid var(--primary)";
        }
        this.logToConsole(
          `🌟 [Locker Room] ¡Camiseta Equipada! Camiseta de Selección (${this.selectedPlayer.country}) depositada en Escrow PDA y acoplada a ${this.selectedPlayer.name}.`
        );
        this.logToConsole(
          `[Metadata on-chain] visual_skin = "${jerseyCode}", max_stamina = 105, yield +3% activo.`
        );
      } else if (selectedItem === "jersey_club") {
        const clubName =
          this.selectedPlayer.meta && this.selectedPlayer.meta.parody_club
            ? this.selectedPlayer.meta.parody_club
            : "Club Oficial";
        const jerseyCode =
          "club_jersey_" + clubName.toLowerCase().replace(/ /g, "_");
        this.equippedJersey = jerseyCode;
        this.maxStamina = 105;
        this.stamina = 105;
        if (this.staminaSlider) {
          this.staminaSlider.max = 105;
          this.staminaSlider.value = 105;
        }
        if (this.staminaVal) this.staminaVal.innerText = "105%";
        if (this.jerseyBadge) {
          this.jerseyBadge.style.display = "inline-block";
          this.jerseyBadge.innerText = `💗 ${clubName}`;
          this.jerseyBadge.style.background = "rgba(255, 77, 106, 0.2)";
          this.jerseyBadge.style.color = "#ff4d6a";
          this.jerseyBadge.style.border = "1px solid #ff4d6a";
        }
        this.logToConsole(
          `🌟 [Locker Room] ¡Camiseta Equipada! Camiseta de Club (${clubName}) depositada en Escrow PDA y acoplada a ${this.selectedPlayer.name}.`
        );
        this.logToConsole(
          `[Metadata on-chain] visual_skin = "${jerseyCode}", max_stamina = 105, yield +5% activo.`
        );
      } else if (selectedItem === "boots_gold") {
        this.equippedBoots = "golden_boots";
        if (this.bootsBadge) {
          this.bootsBadge.style.display = "inline-block";
          this.bootsBadge.innerText = "🪙 Botines Oro";
          this.bootsBadge.style.background = "rgba(255, 183, 3, 0.2)";
          this.bootsBadge.style.color = "#ffb703";
          this.bootsBadge.style.border = "1px solid #ffb703";
        }
        this.logToConsole(
          `🌟 [Locker Room] ¡Botines Equipados! Botines de Oro transferidos al Escrow PDA. Stats: velocidad +8, tiro +8, yield +5% activo.`
        );
      } else if (selectedItem === "armband_cap") {
        this.hasShield = true;
        if (this.shieldIcon) {
          this.shieldIcon.style.display = "inline-block";
        }
        this.logToConsole(
          `🌟 [Locker Room] ¡Brazalete Equipado! Brazalete de Capitán transferido al Escrow PDA. Escudo de Leyenda Activo (Protección del 15% del yield ante eliminación mundialista, +10% Yield).`
        );
      }

      // Burst de confeti de victoria
      if (typeof confetti === "function") {
        confetti({
          particleCount: 100,
          spread: 80,
          colors: ["#14f195", "#9945ff", "#ffb703"],
          origin: { y: 0.5 },
        });
      }

      this.logToConsole(
        `[Solana Devnet] Instruction processed: equip_locker_room_item. NFT en custodia de PDA. TX: 8fKt...${Math.random()
          .toString(36)
          .substring(7)
          .toUpperCase()}`
      );
      this.updateYieldAndUI();
    }, 800);
  }

  // OPERACIÓN: Desequipar Ítem del Vestuario (Locker Room Unequip)
  unequipSimItem() {
    if (!this.selectedPlayer) {
      alert("Selecciona un jugador primero.");
      return;
    }

    const selectedItem = this.fuseItemSelect.value;
    this.logToConsole(
      `✍️ [Solana Devnet] Solicitando firma para retirar NFT desde el Escrow PDA de vuelta a tu wallet...`
    );

    setTimeout(() => {
      if (selectedItem === "jersey_arg" || selectedItem === "jersey_club") {
        if (!this.equippedJersey) {
          this.logToConsole(
            "⚠️ [Locker Room] Este jugador no tiene ninguna camiseta equipada."
          );
          return;
        }
        const oldJersey = this.equippedJersey;
        this.equippedJersey = null;
        this.maxStamina = 100;
        this.stamina = Math.min(this.stamina, 100);
        if (this.staminaSlider) {
          this.staminaSlider.max = 100;
          this.staminaSlider.value = this.stamina;
        }
        if (this.staminaVal) this.staminaVal.innerText = `${this.stamina}%`;
        if (this.jerseyBadge) {
          this.jerseyBadge.style.display = "none";
        }

        let jerseyName = "Camiseta Oficial";
        if (oldJersey.startsWith("selection_jersey")) {
          jerseyName = `Selección ${this.selectedPlayer.country}`;
        } else if (oldJersey.startsWith("club_jersey")) {
          const clubName =
            this.selectedPlayer.meta && this.selectedPlayer.meta.parody_club
              ? this.selectedPlayer.meta.parody_club
              : "Club Oficial";
          jerseyName = `Club ${clubName}`;
        }

        this.logToConsole(
          `🔄 [Locker Room] ¡Desequipamiento Exitoso! Camiseta (${jerseyName}) devuelta desde Escrow PDA a tu wallet.`
        );
        this.logToConsole(
          `[Metadata on-chain] visual_skin = "undergarment_black", max_stamina = 100, stamina corregida.`
        );
      } else if (selectedItem === "boots_gold") {
        if (!this.equippedBoots) {
          this.logToConsole(
            "⚠️ [Locker Room] Este jugador no tiene botines equipados."
          );
          return;
        }
        this.equippedBoots = null;
        if (this.bootsBadge) {
          this.bootsBadge.style.display = "none";
        }
        this.logToConsole(
          `🔄 [Locker Room] ¡Desequipamiento Exitoso! Botines de Oro devueltos a tu wallet. Stats revertidos.`
        );
      } else if (selectedItem === "armband_cap") {
        if (!this.hasShield) {
          this.logToConsole(
            "⚠️ [Locker Room] Este jugador no tiene el Brazalete de Capitán equipado."
          );
          return;
        }
        this.hasShield = false;
        if (this.shieldIcon) {
          this.shieldIcon.style.display = "none";
        }
        this.logToConsole(
          `🔄 [Locker Room] ¡Desequipamiento Exitoso! Brazalete de Capitán devuelto a tu wallet. Escudo de protección desactivado.`
        );
      }

      this.logToConsole(
        `[Solana Devnet] Instruction processed: unequip_locker_room_item. NFT liberado de PDA. TX: 4nRw...${Math.random()
          .toString(36)
          .substring(7)
          .toUpperCase()}`
      );
      this.updateYieldAndUI();
    }, 800);
  }

  // OPERACIÓN: Alquiler (Listar / Rentar)
  toggleRentalListing() {
    if (!this.selectedPlayer) {
      alert("Selecciona un jugador primero.");
      return;
    }

    const price = parseInt(this.rentalPriceInput.value);
    if (isNaN(price) || price <= 0) {
      alert("Ingresa un precio de alquiler válido.");
      return;
    }

    if (this.rentalStatus === "none") {
      this.rentalStatus = "listed";
      this.rentalPrice = price;
      this.logToConsole(
        `🏦 [Alquiler] Jugador listado para renta a un precio de ${this.rentalPrice} $GCH por partido.`
      );
      this.logToConsole(
        `[Solana Devnet] Instruction called: list_nft_rental. PDA Escrow registrado.`
      );
    } else {
      this.rentalStatus = "none";
      this.logToConsole(
        `🏦 [Alquiler] Listado retirado del mercado. Jugador devuelto al Starting XI del dueño.`
      );
    }

    this.updateRentalUI();
  }

  simulateBorrowerRent() {
    if (this.rentalStatus !== "listed") {
      alert("El jugador debe estar en estado LISTADO primero.");
      return;
    }

    const borrower = this.borrowerInput.value || "@DegenManager42";
    this.rentalStatus = "rented";
    this.currentBorrower = borrower;

    // Cobrar alquiler (simulado al dueño)
    this.userBalance += this.rentalPrice;
    this.updateLiveBalanceWidget();

    this.logToConsole(
      `🏦 [Alquiler] ¡Contrato firmado! El manager ${borrower} ha alquilado a ${this.selectedPlayer.name} por 1 partido.`
    );
    this.logToConsole(
      `💰 [Escrow] Recibidos ${this.rentalPrice} $GCH en tu balance (neto de tarifa de protocolo).`
    );
    this.logToConsole(
      `[Solana Devnet] Transfer completed: Inquilino -> Escrow -> Owner. Renter PDA active.`
    );

    this.updateRentalUI();
  }

  // Cláusula de Rescisión Dorada (Golden Recall)
  triggerGoldenRecall() {
    if (this.rentalStatus !== "rented") {
      alert("El jugador no está alquilado por nadie actualmente.");
      return;
    }

    const penalty = Math.round(this.rentalPrice * 0.5);
    if (this.userBalance < penalty) {
      alert(
        `No tienes suficiente $GCH para pagar la rescisión dorada (Costo de multa: ${penalty} $GCH).`
      );
      return;
    }

    // Pagar multa
    this.userBalance -= penalty;
    this.totalGchBurned += penalty; // Se quema o se da al inquilino
    this.rentalStatus = "none";

    this.updateLiveBalanceWidget();

    this.logToConsole(
      `🏆 [Alquiler] ¡Cláusula de Rescisión Dorada ejecutada! Has retirado a tu jugador de forma inmediata del contrato.`
    );
    this.logToConsole(
      `🔥 [Burn Protocol] Penalización aplicada: pagados ${penalty} $GCH al inquilino ${this.currentBorrower} como resarcimiento.`
    );
    this.logToConsole(
      `[Solana Devnet] Instruction resolved: golden_recall. NFT retornado a tu Starting XI. TX: 3rFw...${Math.random()
        .toString(36)
        .substring(7)
        .toUpperCase()}`
    );

    if (typeof confetti === "function") {
      confetti({
        particleCount: 50,
        spread: 60,
        colors: ["#ffb703", "#ffffff"],
      });
    }

    this.updateRentalUI();
    this.updateYieldAndUI();
  }

  updateRentalUI() {
    if (!this.rentalStatusText) return;

    const btnList = document.getElementById("simListBtn");
    const btnRent = document.getElementById("simRentBtn");
    const btnRecall = document.getElementById("simRecallBtn");

    if (this.rentalStatus === "none") {
      this.rentalStatusText.innerHTML =
        '<span style="color:#a2a2b2;">Starting XI (Dueño)</span>';
      if (btnList) btnList.innerText = "LISTAR PARA ALQUILER";
      if (btnRent) btnRent.disabled = true;
      if (btnRecall) btnRecall.disabled = true;
    } else if (this.rentalStatus === "listed") {
      this.rentalStatusText.innerHTML = `<span style="color:#ffb703; font-weight:800;">EN EL MERCADO (${this.rentalPrice} $GCH)</span>`;
      if (btnList) btnList.innerText = "RETIRAR LISTADO";
      if (btnRent) btnRent.disabled = false;
      if (btnRecall) btnRecall.disabled = true;
    } else if (this.rentalStatus === "rented") {
      this.rentalStatusText.innerHTML = `<span style="color:#ff4d6a; font-weight:800;">ALQUILADO por ${this.currentBorrower}</span>`;
      if (btnList) btnList.innerText = "ALQUILADO (BLOQUEADO)";
      if (btnRent) btnRent.disabled = true;
      if (btnRecall) btnRecall.disabled = false;
    }
  }

  updateLiveBalanceWidget() {
    // Sincronizar balances en los widgets de la app
    const widgetBalance = document.querySelector(
      '.sidebar div[style*="Balance:"] span:last-child'
    );
    if (widgetBalance)
      widgetBalance.innerText = `${this.userBalance.toLocaleString()} $GCH`;

    const simBalance = document.getElementById("simUserBalanceText");
    if (simBalance)
      simBalance.innerText = `${this.userBalance.toLocaleString()} $GCH`;

    // Quemado en la UI derecha
    const liveBurn = document.getElementById("liveBurnVal");
    if (liveBurn) {
      let currentVal = parseInt(liveBurn.innerText.replace(/,/g, ""));
      currentVal += this.totalGchBurned;
      liveBurn.innerText = currentVal.toLocaleString();
    }
  }

  calculateBondingCurve() {
    const wins = parseInt(this.curveWins.value) || 0;
    const losses = parseInt(this.curveLosses.value) || 0;
    const isChamp = this.curveChampion.checked;

    let price = 100.0; // Precio Base en GCH

    if (isChamp) {
      price = 450.0; // Congelado al máximo histórico
      if (this.curvePriceText) {
        this.curvePriceText.innerHTML = `<span style="color:var(--solana-green); font-weight:bold;">450 $GCH (MAX - POOL CERRADO 🏆)</span>`;
      }
      return;
    }

    // Fórmula dinámica de Bonding Curve
    price = price * Math.pow(1.15, wins) * Math.pow(0.95, losses);
    price = Math.max(10, Math.round(price));

    if (this.curvePriceText) {
      this.curvePriceText.innerText = `${price} $GCH`;
    }
  }
}

// Iniciar e inyectar en el contexto global cuando el DOM esté listo
let simulatorAppInstance = null;

function initSimulatorView() {
  if (!simulatorAppInstance) {
    simulatorAppInstance = new ModifiersSimulator();
    window.simulatorAppInstance = simulatorAppInstance;
  }

  // Cargar por defecto al primer jugador
  if (simulatorAppInstance && !simulatorAppInstance.selectedPlayer) {
    simulatorAppInstance.loadPlayer(1); // Lionel Satoshi
  }
}

window.initSimulatorView = initSimulatorView;
window.feedSimPotion = () =>
  simulatorAppInstance && simulatorAppInstance.feedSimPotion();
window.fuseSimItem = () =>
  simulatorAppInstance && simulatorAppInstance.fuseSimItem();
window.unequipSimItem = () =>
  simulatorAppInstance && simulatorAppInstance.unequipSimItem();
window.toggleRentalListing = () =>
  simulatorAppInstance && simulatorAppInstance.toggleRentalListing();
window.simulateBorrowerRent = () =>
  simulatorAppInstance && simulatorAppInstance.simulateBorrowerRent();
window.triggerGoldenRecall = () =>
  simulatorAppInstance && simulatorAppInstance.triggerGoldenRecall();
