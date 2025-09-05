import React from "react";
import { PieChart, Pie, Cell, Tooltip, Legend } from "recharts";

export default function ChartView({ alerts }) {
  const counts = alerts.reduce((acc, a) => {
    acc[a.Priority] = (acc[a.Priority] || 0) + 1;
    return acc;
  }, {});

  const data = Object.keys(counts).map((key) => ({
    name: key,
    value: counts[key],
  }));

  const COLORS = ["#FF0000", "#FF7F00", "#FFD700", "#00BFFF"];

  return (
    <div className="p-4 border rounded-xl shadow">
      <h2 className="text-lg font-bold mb-2">Priority Distribution</h2>
      <PieChart width={400} height={300}>
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          outerRadius={100}
          label
        >
          {data.map((_, i) => (
            <Cell key={i} fill={COLORS[i % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip />
        <Legend />
      </PieChart>
    </div>
  );
}
