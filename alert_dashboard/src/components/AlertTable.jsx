import React, { useState } from "react";
import { motion } from "framer-motion";
import { jsPDF } from "jspdf";

export default function AlertTable({ alerts }) {
  if (!alerts || alerts.length === 0) return null;

  // Sorting: Critical > High > Medium > Low, then Score
  const priorityOrder = { Critical: 4, High: 3, Medium: 2, Low: 1 };

  const sortedAlerts = [...alerts].sort((a, b) => {
    const pA = priorityOrder[a.Priority] || 0;
    const pB = priorityOrder[b.Priority] || 0;

    if (pA === pB) {
      return (Number(b.Score) || 0) - (Number(a.Score) || 0);
    }
    return pB - pA;
  });

  // Dynamically get all CSV columns
  const csvColumns = Object.keys(sortedAlerts[0]).filter(
    (col) => col !== "Score" && col !== "Priority"
  );

  // Local state for search and filter
  const [search, setSearch] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("All");

  // ---- Filtering ----
  const filteredAlerts = sortedAlerts.filter((a) => {
    const matchesSearch = Object.values(a)
      .join(" ")
      .toLowerCase()
      .includes(search.toLowerCase());

    const matchesPriority =
      priorityFilter === "All" || a.Priority === priorityFilter;

    return matchesSearch && matchesPriority;
  });

  // ---- Export Functions ----
  const exportCSV = () => {
    const headers = [...csvColumns, "Score", "Priority"];
    const rows = filteredAlerts.map((a) =>
      headers.map((h) => (a[h] !== undefined ? a[h] : ""))
    );

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");

    const link = document.createElement("a");
    link.href = encodeURI(csvContent);
    link.download = "alerts_export.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(14);
    doc.text("Threat Intelligence Alerts Table", 14, 20);

    const headers = [...csvColumns, "Score", "Priority"];
    let y = 35;

    doc.setFontSize(10);
    doc.text(headers.join(" | "), 14, y);
    y += 10;

    filteredAlerts.forEach((a, i) => {
      const row = headers.map((h) => (a[h] !== undefined ? a[h] : "")).join(" | ");
      doc.text(row, 14, y);
      y += 8;
      if (y > 280) {
        doc.addPage();
        y = 20;
      }
    });

    doc.save("alerts_export.pdf");
  };

  const exportText = () => {
    const headers = [...csvColumns, "Score", "Priority"];
    const rows = filteredAlerts.map((a) =>
      headers.map((h) => `${h}: ${a[h] !== undefined ? a[h] : ""}`).join(" | ")
    );

    const textContent = [headers.join(" | "), ...rows].join("\n");

    const blob = new Blob([textContent], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "alerts_export.txt";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-4 border rounded-2xl shadow bg-white dark:bg-gray-800 dark:border-gray-700">
      {/* Top Bar: Title + Export + Search + Filter */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-4 space-y-2 md:space-y-0">
        <h2 className="text-lg font-semibold">📋 Alerts Table</h2>

        <div className="flex flex-wrap gap-2">
          {/* Search */}
          <input
            type="text"
            placeholder="🔎 Search alerts..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="px-3 py-1 border rounded-md dark:bg-gray-700 dark:text-white"
          />

          {/* Priority Filter */}
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-3 py-1 border rounded-md dark:bg-gray-700 dark:text-white"
          >
            <option value="All">All Priorities</option>
            <option value="Critical">Critical</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>

          {/* Export Buttons */}
          <button
            onClick={exportCSV}
            className="px-3 py-1 rounded-md bg-green-600 hover:bg-green-700 text-white"
          >
            📊 CSV
          </button>
          <button
            onClick={exportPDF}
            className="px-3 py-1 rounded-md bg-blue-600 hover:bg-blue-700 text-white"
          >
            📄 PDF
          </button>
          <button
            onClick={exportText}
            className="px-3 py-1 rounded-md bg-gray-600 hover:bg-gray-700 text-white"
          >
            📜 Text
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm border border-gray-200 dark:border-gray-700 rounded-lg">
          <thead className="sticky top-0 bg-gray-200 dark:bg-gray-700">
            <tr>
              {csvColumns.map((col) => (
                <th key={col} className="p-2 border">
                  {col}
                </th>
              ))}
              <th className="p-2 border">Score</th>
              <th className="p-2 border">Priority</th>
            </tr>
          </thead>
          <tbody>
            {filteredAlerts.map((alert, i) => {
              const isCritical = alert.Priority === "Critical";

              return (
                <motion.tr
                  key={alert.AlertID + i}
                  initial={{ backgroundColor: "#fef3c7" }}
                  animate={
                    isCritical
                      ? {
                          backgroundColor: [
                            "#fee2e2",
                            "#fecaca",
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
                  {csvColumns.map((col) => (
                    <td key={col} className="p-2 border">
                      {alert[col] || "N/A"}
                    </td>
                  ))}
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
                </motion.tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
