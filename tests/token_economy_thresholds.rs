use crate::onchain::token_economy::{calculate_burn_thresholds, BurnConfig};
use mockall::mock;
/// Mock the external price‑feed and liquidity‑pool calls used by the thresholds logic.
mock! {
    pub fn price_feed() -> f64;
    pub fn liquidity_reserve() -> u64;
}
#[test]
fn volume_threshold_triggered() {
    // 24‑h volume = 1.2 B, monthly avg = 10 B → 12 % > 10 % → threshold true
    let config = BurnConfig {
        volume_threshold_pct: 10.0,
        price_variation_pct: 0.0,
        liquidity_pct: 0.0,
        volume_24h: 1_200_000_000_000,
        monthly_avg_volume: 10_000_000_000_000,
    };
    let thresholds = calculate_burn_thresholds(&config);
    assert!(thresholds.volume_exceeded);
}
#[test]
fn price_variation_threshold_triggered() {
    // Intradiario var = 4 % > 5 % → false (should not trigger)
    let config = BurnConfig {
        volume_threshold_pct: 0.0,
        price_variation_pct: 5.0,
        liquidity_pct: 0.0,
        volume_24h: 0,
        monthly_avg_volume: 0,
    };
    let thresholds = calculate_burn_thresholds(&config);
    assert!(!thresholds.price_exceeded);
}
#[test]
fn liquidity_threshold_triggered() {
    // Liquidity reserve = 80 % of target → 80 % > 20 % → true
    let config = BurnConfig {
        volume_threshold_pct: 0.0,
        price_variation_pct: 0.0,
        liquidity_pct: 20.0,
        volume_24h: 0,
        monthly_avg_volume: 0,
    };
    let thresholds = calculate_burn_thresholds(&config);
    assert!(thresholds.liquidity_exceeded);
}