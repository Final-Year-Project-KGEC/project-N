export function calculateScore(alert) {
  const rec = parseFloat(alert.Recency || 0);
  const trust = parseFloat(alert.SourceTrust || 0);
  const assetCrit = parseFloat(alert.AssetCriticality || 0);
  const match = parseFloat(alert.AssetMatch || 0);
  const exploit = parseFloat(alert.ExploitPressure || 0);
  const ttp = parseFloat(alert.TTPSeverity || 0);
  const sightings = parseFloat(alert.SightingsScore || 0);
  const penalty = parseFloat(alert.BenignPenalty || 0);

  return Math.round(
    rec * 20 +
    trust * 15 +
    assetCrit * 10 +
    match * 15 +
    exploit * 15 +
    ttp * 8 +
    sightings * 10 -
    penalty * 10
  );
}

export function getPriority(score) {
  if (score >= 80) return "Critical";
  if (score >= 60) return "High";
  if (score >= 40) return "Medium";
  return "Low";
}
