// Remove duplicates by AlertID only
// Remove duplicates by AlertID + SourceIP + Timestamp
export const removeDuplicates = (alerts) => {
  const seen = new Set();
  return alerts.filter((a) => {
    const key = `${a.AlertID}-${a.SourceIP}-${a.Timestamp}`;
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
};

// Remove fake alerts (invalid/false positives)
export function removeFakeAlerts(alerts) {
  return alerts.filter((a) => {
    return a.Score > 0 && a.Priority !== "LowFake";
  });
}
