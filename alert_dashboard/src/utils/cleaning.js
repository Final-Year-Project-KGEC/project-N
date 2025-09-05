// Remove duplicates by AlertID+Timestamp
export function removeDuplicates(alerts) {
  const seen = new Set();
  return alerts.filter((a) => {
    const key = `${a.AlertID}-${a.Timestamp || ""}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

// Remove fake alerts (invalid/false positives)
export function removeFakeAlerts(alerts) {
  return alerts.filter((a) => {
    return a.Score > 0 && a.Priority !== "LowFake";
  });
}
