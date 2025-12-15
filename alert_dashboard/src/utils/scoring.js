// Calculate alert risk score exactly like Python logic
export function calculateScore(alert) {
  const exploitPressure = Number(alert.ExploitPressure) || 0;
  const sightingsScore = Number(alert.SightingsScore) || 0;
  const sourceTrust = Number(alert.SourceTrust) || 0;
  const benignPenalty = Number(alert.BenignPenalty) || 0;

  const riskScore =
    (exploitPressure * 0.4) +
    (sightingsScore * 0.3) +
    ((100 - sourceTrust) * 0.2) +
    (benignPenalty * 0.1);

  return Math.round(riskScore);
}
export function getPriority(score) {
  if (score >= 70) return "Critical";
  if (score >= 50) return "High";
  if (score >= 30) return "Medium";
  return "Low";
}
