import React from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

export default function ChartView({ alerts }) {
  if (!alerts || alerts.length === 0) return null;

  // Count alerts by Priority
  const counts = {
    Critical: alerts.filter((a) => a.Priority === "Critical").length,
    High: alerts.filter((a) => a.Priority === "High").length,
    Medium: alerts.filter((a) => a.Priority === "Medium").length,
    Low: alerts.filter((a) => a.Priority === "Low").length,
  };

  const data = [
    { name: "Critical", value: counts.Critical },
    { name: "High", value: counts.High },
    { name: "Medium", value: counts.Medium },
    { name: "Low", value: counts.Low },
  ];

  const COLORS = ["#e11d48", "#f97316", "#facc15", "#22c55e"]; // red, orange, yellow, green

  return (
    <div className="bg-white dark:bg-gray-800 shadow rounded-2xl p-4">
      <h2 className="text-lg font-semibold mb-4 dark:text-white">
        📊 Alert Distribution
      </h2>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, value }) => `${name}: ${value}`}
            outerRadius={100}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
