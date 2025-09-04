import React, { useState } from 'react';
import Papa from 'papaparse';
import { PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';

const COLORS = ['#FF0000', '#FF7F00', '#FFD700', '#00C49F'];

function calculateScore(alert) {
  const recency = parseFloat(alert.Recency) || 0;
  const sourceTrust = parseFloat(alert.SourceTrust) || 0;
  const assetCriticality = parseFloat(alert.AssetCriticality) || 0;
  const assetMatch = parseFloat(alert.AssetMatch) || 0;
  const exploitPressure = parseFloat(alert.ExploitPressure) || 0;
  const ttpSeverity = parseFloat(alert.TTPSeverity) || 0;
  const sightingsScore = parseFloat(alert.SightingsScore) || 0;
  const benignPenalty = parseFloat(alert.BenignPenalty) || 0;

  const score = 100 * (
    0.2 * recency +
    0.2 * sourceTrust +
    0.2 * (assetCriticality / 5) +
    0.15 * assetMatch +
    0.15 * exploitPressure +
    0.1 * (ttpSeverity / 5) +
    0.1 * sightingsScore -
    0.1 * benignPenalty
  );
  return Math.round(score);
}

function getPriority(score) {
  if (score >= 85) return 'Critical';
  if (score >= 70) return 'High';
  if (score >= 50) return 'Medium';
  return 'Low';
}

export default function App() {
  const [alerts, setAlerts] = useState([]);
  const [filter, setFilter] = useState("All");

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const priorityOrder = { Critical: 1, High: 2, Medium: 3, Low: 4 };

        const processed = results.data.map((alert) => {
          const score = calculateScore(alert);
          return { ...alert, Score: score, Priority: getPriority(score) };
        });

        // Sort alerts by priority
        processed.sort((a, b) => priorityOrder[a.Priority] - priorityOrder[b.Priority]);

        setAlerts(processed);
      },
    });
  };

  // Apply filter
  const filteredAlerts = filter === "All"
    ? alerts
    : alerts.filter((a) => a.Priority === filter);

  const chartData = ['Critical', 'High', 'Medium', 'Low'].map((level) => ({
    name: level,
    value: alerts.filter((a) => a.Priority === level).length,
  }));

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">🚨 Alert Prioritizer Dashboard</h1>
      <input type="file" accept=".csv" onChange={handleFileUpload} className="mb-4" />

      {alerts.length > 0 && (
        <>
          {/* Dropdown filter */}
          <div className="mb-4">
            <label className="mr-2 font-semibold">Filter by Priority:</label>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="border p-2 rounded"
            >
              <option value="All">All</option>
              <option value="Critical">Critical</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>

          {/* Table */}
          <table className="table-auto w-full border-collapse border border-gray-300 mb-6">
            <thead>
              <tr className="bg-gray-100">
                {Object.keys(filteredAlerts[0]).map((key) => (
                  <th key={key} className="border border-gray-300 px-2 py-1">{key}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredAlerts.map((row, i) => (
                <tr key={i} className="hover:bg-gray-50">
                  {Object.values(row).map((val, j) => (
                    <td key={j} className="border border-gray-300 px-2 py-1">{val}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>

          {/* Chart */}
          <PieChart width={400} height={300}>
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={100}
              fill="#8884d8"
              label
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </>
      )}
    </div>
  );
}
