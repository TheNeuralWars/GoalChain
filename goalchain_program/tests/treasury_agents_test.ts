import * as anchor from "@coral-xyz/anchor";
import { assert } from "chai";

// === SDK MOCKS ===

// 1. Raydium CLMM Mock SDK
class RaydiumClmmMock {
  public poolAddress: string;
  public currentPrice: number;
  public rangeLower: number;
  public rangeUpper: number;
  public feesCollectedSol: number;

  constructor(poolAddress: string, initialPrice: number) {
    this.poolAddress = poolAddress;
    this.currentPrice = initialPrice;
    this.rangeLower = initialPrice * 0.8;
    this.rangeUpper = initialPrice * 1.2;
    this.feesCollectedSol = 0;
  }

  // Simulates concentrated range rebalancing
  public rebalanceRange(tightness: "wide" | "tight") {
    if (tightness === "tight") {
      this.rangeLower = this.currentPrice * 0.95;
      this.rangeUpper = this.currentPrice * 1.05;
    } else {
      this.rangeLower = this.currentPrice * 0.8;
      this.rangeUpper = this.currentPrice * 1.2;
    }
  }

  // Simulates fee harvesting
  public harvestFees(volume: number): number {
    // 0.3% fee tier
    const baseFee = volume * 0.003;
    // Tight range captures more fees per volume
    const efficiencyMultiplier =
      this.rangeUpper - this.rangeLower < this.currentPrice * 0.1 ? 2.5 : 1.0;
    const harvested = baseFee * efficiencyMultiplier;
    this.feesCollectedSol += harvested;
    return harvested;
  }
}

// 2. Drift Protocol Mock SDK
class DriftPerpMock {
  public userAccount: string;
  public balanceUsd: number;
  public activePositions: Array<{
    marketIndex: number;
    size: number;
    entryPrice: number;
    leverage: number;
    direction: "long" | "short";
  }> = [];

  constructor(userAccount: string, initialDepositUsd: number) {
    this.userAccount = userAccount;
    this.balanceUsd = initialDepositUsd;
  }

  public depositCollateral(amountUsd: number) {
    this.balanceUsd += amountUsd;
  }

  public openPerpPosition(
    marketIndex: number,
    direction: "long" | "short",
    sizeUsd: number,
    leverage: number,
    entryPrice: number
  ) {
    if (sizeUsd > this.balanceUsd * leverage) {
      throw new Error("Insufficient margin for selected leverage");
    }
    this.activePositions.push({
      marketIndex,
      size: sizeUsd,
      entryPrice,
      leverage,
      direction,
    });
  }

  public calculatePnL(marketIndex: number, currentPrice: number): number {
    const pos = this.activePositions.find((p) => p.marketIndex === marketIndex);
    if (!pos) return 0;

    const priceDiff = currentPrice - pos.entryPrice;
    const returnRatio = priceDiff / pos.entryPrice;
    const pnl = pos.size * returnRatio * (pos.direction === "long" ? 1 : -1);
    return pnl;
  }

  public closePosition(marketIndex: number, currentPrice: number): number {
    const posIdx = this.activePositions.findIndex(
      (p) => p.marketIndex === marketIndex
    );
    if (posIdx === -1) return 0;

    const pnl = this.calculatePnL(marketIndex, currentPrice);
    this.balanceUsd += pnl;
    this.activePositions.splice(posIdx, 1);
    return pnl;
  }
}

// 3. FlashTrade Mock SDK
class FlashTradeMock {
  public poolAddress: string;
  public collateralSol: number;
  public shortPositions: Array<{
    asset: string;
    sizeUsd: number;
    entryPrice: number;
    leverage: number;
  }> = [];

  constructor(poolAddress: string, initialCollateralSol: number) {
    this.poolAddress = poolAddress;
    this.collateralSol = initialCollateralSol;
  }

  public openShortHedge(
    asset: string,
    sizeUsd: number,
    leverage: number,
    entryPrice: number
  ) {
    this.shortPositions.push({
      asset,
      sizeUsd,
      entryPrice,
      leverage,
    });
  }

  public getHedgingValue(asset: string, currentPrice: number): number {
    const pos = this.shortPositions.find((p) => p.asset === asset);
    if (!pos) return 0;

    const priceDiffRatio = (pos.entryPrice - currentPrice) / pos.entryPrice;
    return pos.sizeUsd * priceDiffRatio * pos.leverage;
  }
}

// 4. Sentinel Controller
class SentinelController {
  public isPaused: boolean = false;
  public dailyLossLimitUsd: number = 500; // Hard limit
  public accumulatedLoss24h: number = 0;

  public logPnLAction(pnlUsd: number) {
    if (pnlUsd < 0) {
      this.accumulatedLoss24h += Math.abs(pnlUsd);
    }
    if (this.accumulatedLoss24h >= this.dailyLossLimitUsd) {
      this.isPaused = true;
    }
  }

  public resetDailyLimit() {
    this.accumulatedLoss24h = 0;
    this.isPaused = false;
  }
}

// === mocha tests ===
describe("GoalChain: Treasury AI Engine Integrations & Sentinel", () => {
  it("Debería inicializar correctamente Hyre CLMM y ajustar el rango de liquidez en shocks de oferta", () => {
    const hyre = new RaydiumClmmMock("raydium_gch_sol_pool", 0.01); // Initial price $0.01

    // Volatilidad normal (rango ancho)
    assert.equal(hyre.rangeLower, 0.008);
    assert.equal(hyre.rangeUpper, 0.012);

    // Simula una jornada de juego con alto volumen (rango tight - estrecho a ±4%)
    hyre.rangeLower = 0.0096;
    hyre.rangeUpper = 0.0104;

    // Harvest fees: tight range captures more fees
    const feesWide = new RaydiumClmmMock(
      "raydium_gch_sol_pool",
      0.01
    ).harvestFees(1000); // 1000 SOL volume
    const feesTight = hyre.harvestFees(1000);

    assert.equal(feesWide, 3.0); // 1000 * 0.003 * 1
    assert.equal(feesTight, 7.5); // 1000 * 0.003 * 2.5 (2.5x efficiency)
    assert.isAbove(feesTight, feesWide);
  });

  it("Debería simular Drift Protocol depositando colateral y abriendo un Long 3x en GCH/SOL", () => {
    const drift = new DriftPerpMock("phi_drift_subaccount", 1000); // Initial $1000 deposit
    assert.equal(drift.balanceUsd, 1000);

    // Abre posición 3x long (size $3000)
    drift.openPerpPosition(1, "long", 3000, 3, 0.01);
    assert.equal(drift.activePositions.length, 1);
    assert.equal(drift.activePositions[0].size, 3000);

    // Simula un Rally Alcista a $0.015 (+50%)
    const pnl = drift.calculatePnL(1, 0.015);
    assert.closeTo(pnl, 1500, 0.001); // 3000 * 0.5

    // Cierra la posición
    const finalPnl = drift.closePosition(1, 0.015);
    assert.closeTo(finalPnl, 1500, 0.001);
    assert.closeTo(drift.balanceUsd, 2500, 0.001); // Balance increases to $2500
    assert.equal(drift.activePositions.length, 0);
  });

  it("Debería simular FlashTrade abriendo un Short SOL/USD para proteger el valor de la tesorería (Hedging)", () => {
    const flash = new FlashTradeMock("flash_sol_pool", 10); // 10 SOL collateral

    // Abre Short SOL a $150 con apalancamiento 5x (size $1500)
    flash.openShortHedge("SOL", 1500, 5, 150);

    // Simula caída de SOL a $135 (-10% caída de mercado)
    const hedgeVal = flash.getHedgingValue("SOL", 135);
    assert.equal(hedgeVal, 750); // 1500 * 0.1 * 5 = $150 de ganancia de cobertura

    // El colateral de SOL cayó en valor real, pero el short apalancado compensa la pérdida
    const lostCollateralValue = (150 - 135) * 10; // $150 perdidos en valor del colateral
    assert.equal(hedgeVal, lostCollateralValue * 5); // Cubre con creces la devaluación
  });

  it("Debería pausar las operaciones del Sentinel Circuit Breaker si las pérdidas superan el límite diario", () => {
    const sentinel = new SentinelController();
    assert.isFalse(sentinel.isPaused);

    // Registra ganancia
    sentinel.logPnLAction(150);
    assert.isFalse(sentinel.isPaused);

    // Registra pérdida menor
    sentinel.logPnLAction(-200);
    assert.isFalse(sentinel.isPaused);

    // Registra pérdida que sobrepasa el límite (200 + 400 = 600 > 500)
    sentinel.logPnLAction(-400);
    assert.isTrue(sentinel.isPaused); // Activado el Circuit Breaker!
  });
});
