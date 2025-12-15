// Helper: normalize a value into a weighted range
function normalize(value, max = 10, weight = 20) {
  const v = parseFloat(value) || 0;
  return Math.min((v / max) * weight, weight);
}

// Calculate alert risk score (0–100)
export function calculateScore(alert) {
  let score = 0;

  // 🔹 Asset Criticality (how important the system is) → weight 25
  score += normalize(alert.AssetCriticality, 10, 25);

  // 🔹 TTP Severity (sophistication of attacker techniques) → weight 25
  score += normalize(alert.TTPSeverity, 10, 25);

  // 🔹 Exploit Pressure (active exploitation in wild) → weight 20
  score += normalize(alert.ExploitPressure, 10, 20);

  // 🔹 Sightings Score (how often observed globally) → weight 15
  score += normalize(alert.SightingsScore, 10, 15);

  // 🔹 Recency (days since last seen) → newer = riskier (0 days = full weight)
  const recencyDays = parseInt(alert.Recency) || 0;
  score += recencyDays === 0 ? 15 : Math.max(0, 15 - recencyDays);

  // ✅ Clamp final score between 0–100
  return Math.min(100, Math.round(score));
}

// Convert numeric score into Priority label
export function getPriority(score) {
  if (score >= 70) return "Critical";
  if (score >= 50) return "High";
  if (score >= 30) return "Medium";
  return "Low";
}
