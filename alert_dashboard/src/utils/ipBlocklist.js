let blockedIPs = new Set();

export function detectAndBlockIPs(alerts) {
  const ipCount = {};

  alerts.forEach((a) => {
    if (a.SourceIP && a.Priority === "Low") {
      ipCount[a.SourceIP] = (ipCount[a.SourceIP] || 0) + 1;
    }
  });

  Object.keys(ipCount).forEach((ip) => {
    if (ipCount[ip] > 5) {
      blockedIPs.add(ip);
    }
  });

  return Array.from(blockedIPs);
}
