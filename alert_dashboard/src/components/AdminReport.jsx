import React from "react";
import { jsPDF } from "jspdf";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";
import toast, { Toaster } from "react-hot-toast";

export default function AdminReport({ report }) {
  if (!report) return null;

  // Export PDF
  const exportPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("Threat Intelligence Report", 14, 20);

    doc.setFontSize(12);
    doc.text(`📂 File: ${report.fileName}`, 14, 35);
    doc.text(`⏰ Uploaded At: ${report.uploadedAt}`, 14, 45);
    doc.text(`📊 Total Alerts: ${report.totalAlerts}`, 14, 55);
    doc.text(`✅ After Cleaning: ${report.afterCleaning}`, 14, 65);
    doc.text(`🗑️ Duplicates Removed: ${report.duplicatesRemoved}`, 14, 75);
    doc.text(`🚫 Fake Alerts Removed: ${report.fakeRemoved || 0}`, 14, 85);
    doc.text(`🔒 Blocked IPs: ${report.blockedIPs.join(", ") || "None"}`, 14, 95);

    doc.text("📌 Priority Breakdown", 14, 115);
    doc.text(`Critical: ${report.criticalCount}`, 20, 125);
    doc.text(`High: ${report.highCount}`, 20, 135);
    doc.text(`Medium: ${report.mediumCount}`, 20, 145);
    doc.text(`Low: ${report.lowCount}`, 20, 155);

    if (report.incidentTypes) {
      doc.text("🛡 Incident Types:", 14, 175);
      let y = 185;
      Object.entries(report.incidentTypes).forEach(([type, count]) => {
        doc.text(`${type}: ${count}`, 20, y);
        y += 10;
      });
    }

    doc.save("threat_report.pdf");
  };

  // Export CSV
  const exportCSV = () => {
    const rows = [
      ["File", report.fileName],
      ["Uploaded At", report.uploadedAt],
      ["Total Alerts", report.totalAlerts],
      ["After Cleaning", report.afterCleaning],
      ["Duplicates Removed", report.duplicatesRemoved],
      ["Fake Alerts Removed", report.fakeRemoved || 0],
      ["Blocked IPs", report.blockedIPs.join("; ") || "None"],
      ["Critical", report.criticalCount],
      ["High", report.highCount],
      ["Medium", report.mediumCount],
      ["Low", report.lowCount],
    ];

    if (report.incidentTypes) {
      rows.push(["Incident Types", "Count"]);
      Object.entries(report.incidentTypes).forEach(([type, count]) =>
        rows.push([type, count])
      );
    }

    const csvContent =
      "data:text/csv;charset=utf-8," +
      rows.map((e) => e.join(",")).join("\n");

    const link = document.createElement("a");
    link.href = encodeURI(csvContent);
    link.download = "threat_report.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export JSON
  const exportJSON = () => {
    const jsonContent =
      "data:application/json;charset=utf-8," +
      encodeURIComponent(JSON.stringify(report, null, 2));

    const link = document.createElement("a");
    link.href = jsonContent;
    link.download = "threat_report.json";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Copy JSON to clipboard with bounce + fade toast
  const copyJSON = () => {
    navigator.clipboard.writeText(JSON.stringify(report, null, 2))
      .then(() =>
        toast.success("✅ JSON copied to clipboard!", {
          duration: 3000,
          position: "bottom-right",
          className: "bounce-toast",
          icon: "📋",
        })
      )
      .catch(() =>
        toast.error("❌ Failed to copy JSON.", {
          duration: 3000,
          position: "bottom-right",
          className: "bounce-toast",
        })
      );
  };

  // Chart data
  const priorityData = [
    { name: "Critical", value: report.criticalCount },
    { name: "High", value: report.highCount },
    { name: "Medium", value: report.mediumCount },
    { name: "Low", value: report.lowCount },
  ];

  const incidentTypeData = Object.entries(report.incidentTypes || {}).map(
    ([type, count]) => ({ name: type, value: count })
  );

  const COLORS = ["#FF0000", "#FF8C00", "#FFD700", "#00C49F", "#0088FE", "#9932CC"];

  return (
    <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 space-y-6">
      {/* Toaster container */}
      <Toaster
        position="bottom-right"
        reverseOrder={false}
        containerStyle={{ gap: "0.5rem" }}
        toastOptions={{
          success: { duration: 3000, className: "bounce-toast" },
          error: { duration: 3000, className: "bounce-toast" },
        }}
      />

      <h2 className="text-lg font-bold">📑 Admin Report</h2>

      {/* File Info */}
      <ul className="space-y-2 text-sm">
        <li><strong>📂 File:</strong> {report.fileName}</li>
        <li><strong>⏰ Uploaded At:</strong> {report.uploadedAt}</li>
        <li><strong>📊 Total Alerts:</strong> {report.totalAlerts}</li>
        <li><strong>✅ After Cleaning:</strong> {report.afterCleaning}</li>
        <li><strong>🗑️ Duplicates Removed:</strong> {report.duplicatesRemoved}</li>
        <li><strong>🚫 Fake Alerts Removed:</strong> {report.fakeRemoved || 0}</li>
        <li><strong>🔒 Blocked IPs:</strong> {report.blockedIPs.join(", ") || "None"}</li>
      </ul>

      {/* Charts */}
      <div>
        <h3 className="font-bold mb-2">📌 Priority & Incident Type Breakdown</h3>
  <div className="flex flex-col gap-6">
          {/* Priority Pie */}
          <div className="flex-1">
            <h4 className="font-semibold mb-2">Priority Distribution</h4>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={priorityData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label
                >
                  {priorityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Incident Type Pie */}
          {/* <div className="flex-1">
            <h4 className="font-semibold mb-2">Incident Types</h4>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={incidentTypeData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label
                >
                  {incidentTypeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div> */}
        </div>
      </div>

      {/* Export & Toast Buttons */}
      <div className="mt-4 flex flex-wrap gap-2">
        <button
          onClick={exportPDF}
          className="px-3 py-1 rounded-md bg-blue-600 hover:bg-blue-700 text-white"
        >
          📄 Export PDF
        </button>
        <button
          onClick={exportCSV}
          className="px-3 py-1 rounded-md bg-green-600 hover:bg-green-700 text-white"
        >
          📊 Export CSV
        </button>
        <button
          onClick={exportJSON}
          className="px-3 py-1 rounded-md bg-gray-700 hover:bg-gray-900 text-white"
        >
          🗂 Export JSON
        </button>
        <button
          onClick={copyJSON}
          className="px-3 py-1 rounded-md bg-purple-600 hover:bg-purple-700 text-white"
        >
          📋 Copy JSON
        </button>
        {/* <button
          onClick={() => {
            if (window.confirm("Are you sure you want to dismiss all notifications?")) {
              toast.dismiss();
            }
          }}
          className="px-3 py-1 rounded-md bg-red-600 hover:bg-red-700 text-white bounce-on-hover"
        >
          ❌ Dismiss All
        </button> */}

      </div>
    </div>
  );
}
