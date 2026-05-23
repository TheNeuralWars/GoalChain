/**
 * GoalChain Burn Tracker (read-only).
 * Loads latest crank output from docs/data/burn_tracker.json
 * and reflects values in the public stats widgets.
 */
(function () {
  async function loadBurnTracker() {
    try {
      const res = await fetch("data/burn_tracker.json", { cache: "no-store" });
      if (!res.ok) return;
      const data = await res.json();

      const burnEl = document.getElementById("liveBurnVal");
      if (burnEl && Number.isFinite(data.estimated_gch_burned)) {
        burnEl.innerText = Math.floor(
          data.estimated_gch_burned,
        ).toLocaleString();
      }

      const stakedEl = document.getElementById("statStaked");
      if (stakedEl && Number.isFinite(data.current_sol)) {
        stakedEl.innerText = `◎ ${Number(data.current_sol).toLocaleString(
          undefined,
          {
            minimumFractionDigits: 1,
            maximumFractionDigits: 1,
          },
        )}`;
      }

      const marketCapEl = document.getElementById("statMarketCap");
      if (marketCapEl && Number.isFinite(data.estimated_gch_burned)) {
        const syntheticMcap = Math.max(
          1,
          (Number(data.estimated_gch_burned) * 0.01) / 1_000_000,
        );
        marketCapEl.innerText = `$${syntheticMcap.toFixed(1)}M`;
      }

      const tsEl = document.getElementById("burnTrackerTs");
      if (tsEl && data.timestamp_iso) {
        const dt = new Date(data.timestamp_iso);
        tsEl.innerText = dt.toLocaleString();
      }

      window.goalchainBurnTrackerLoaded = true;
    } catch (_err) {
      // Keep page resilient if file is missing.
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", loadBurnTracker);
  } else {
    loadBurnTracker();
  }

  setInterval(loadBurnTracker, 60_000);
})();
