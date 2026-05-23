(function () {
  function setText(id, value) {
    var el = document.getElementById(id);
    if (!el) return;
    el.textContent = value;
  }

  function formatNumber(value, decimals) {
    if (!Number.isFinite(value)) return "--";
    return value.toLocaleString("en-US", {
      maximumFractionDigits: decimals,
      minimumFractionDigits: decimals,
    });
  }

  async function loadEconomyMetrics() {
    try {
      var res = await fetch("http://localhost:3001/api/economy/metrics", {
        cache: "no-store",
      });
      if (!res.ok) return;
      var payload = await res.json();
      var kpis = payload && payload.kpis ? payload.kpis : {};
      var flow24h = payload && payload.flow_24h ? payload.flow_24h : {};

      setText("kpiEmitBurnRatio", formatNumber(Number(kpis.emit_burn_ratio_7d || 0), 3));
      setText(
        "kpiSinkCoverage",
        formatNumber(Number(kpis.onchain_sink_coverage || 0), 1) + "%",
      );
      setText("kpiConfigDrift", String(Number(kpis.config_drift || 0)));
      setText(
        "kpiNetEmission24h",
        formatNumber(Number(flow24h.net_emission_gch || 0), 0) + " GCH",
      );

      var ts = payload && payload.timestamp_iso ? payload.timestamp_iso : null;
      if (ts) {
        var date = new Date(ts);
        setText("kpiUpdatedAt", date.toLocaleString());
      }

      var healthRes = await fetch("http://localhost:3001/api/economy/health", {
        cache: "no-store",
      });
      if (healthRes.ok) {
        var health = await healthRes.json();
        var failingCount =
          health && Array.isArray(health.failing_checks)
            ? health.failing_checks.length
            : 0;
        var label =
          health && health.status === "healthy"
            ? "healthy"
            : "warning (" + failingCount + " checks)";
        setText("kpiHealthStatus", label);
      } else {
        setText("kpiHealthStatus", "unavailable");
      }
    } catch (_err) {
      // Keep docs resilient when API is offline.
      setText("kpiHealthStatus", "offline");
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () {
      loadEconomyMetrics();
      setInterval(loadEconomyMetrics, 30000);
    });
  } else {
    loadEconomyMetrics();
    setInterval(loadEconomyMetrics, 30000);
  }
})();
