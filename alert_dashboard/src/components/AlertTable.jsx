import React from "react";
import { motion } from "framer-motion";

export default function AlertTable({ alerts }) {
  // Sorting function: Critical > High > Medium > Low, then by Score
  const priorityOrder = { Critical: 4, High: 3, Medium: 2, Low: 1 };

  const sortedAlerts = (alerts || []).sort((a, b) => {
    const pA = priorityOrder[a.Priority] || 0;
    const pB = priorityOrder[b.Priority] || 0;

    // If same priority (especially Critical), sort by Score (descending)
    if (pA === pB) {
      return (Number(b.Score) || 0) - (Number(a.Score) || 0);
    }
    return pB - pA; // otherwise sort by priority
  });

  return (
    <div className="p-4 border rounded-2xl shadow bg-white dark:bg-gray-800 dark:border-gray-700">
      <h2 className="text-lg font-semibold mb-4">📋 Alerts Table</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm border border-gray-200 dark:border-gray-700 rounded-lg">
          <thead className="sticky top-0 bg-gray-200 dark:bg-gray-700">
            <tr>
              <th className="p-2 border">AlertID</th>
              <th className="p-2 border">SourceIP</th>
              <th className="p-2 border">Incident Type</th>
              <th className="p-2 border">Score</th>
              <th className="p-2 border">Priority</th>
              <th className="p-2 border">Timestamp</th>
            </tr>
          </thead>
          <tbody>
            {sortedAlerts.map((alert, i) => {
              const isCritical = alert.Priority === "Critical";

              return (
                <motion.tr
                  key={alert.AlertID + i}
                  initial={{ backgroundColor: "#fef3c7" }} // flash yellow when new
                  animate={
                    isCritical
                      ? {
                          backgroundColor: [
                            "#fee2e2", // light red
                            "#fecaca", // medium red
                            "#fee2e2",
                          ],
                        }
                      : { backgroundColor: "transparent" }
                  }
                  transition={
                    isCritical
                      ? { duration: 2, repeat: Infinity, ease: "easeInOut" }
                      : { duration: 2 }
                  }
                  className="hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <td className="p-2 border">{alert.AlertID || "N/A"}</td>
                  <td className="p-2 border">{alert.SourceIP || "N/A"}</td>
                  <td className="p-2 border">{alert.IncidentType || "Unknown"}</td>
                  <td className="p-2 border">{alert.Score || 0}</td>
                  <td
                    className={`p-2 border font-bold ${
                      isCritical
                        ? "text-red-700"
                        : alert.Priority === "High"
                        ? "text-orange-500"
                        : alert.Priority === "Medium"
                        ? "text-yellow-500"
                        : "text-green-600"
                    }`}
                  >
                    {alert.Priority || "N/A"}
                  </td>
                  <td className="p-2 border">{alert.Timestamp || "N/A"}</td>
                </motion.tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
