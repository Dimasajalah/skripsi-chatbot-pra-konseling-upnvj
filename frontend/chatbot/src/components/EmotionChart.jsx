//frontend/chatbot/src/components/EmotionChart.jsx
import React from "react";
import { PieChart, Pie, Tooltip, Legend } from "recharts";

export default function EmotionChart({ data }) {
  if (!data || data.length === 0) {
    return <p style={{ color: "#777" }}>Belum ada data emosi.</p>;
  }

  const chartData = data.map((item) => ({
    name: item._id,
    value: item.count,
  }));

  return (
    <div style={{ marginTop: "20px" }}>
      <h4>Grafik Emosi Mahasiswa</h4>
      <PieChart width={350} height={300}>
        <Pie
          dataKey="value"
          data={chartData}
          cx="50%"
          cy="50%"
          outerRadius={100}
        />
        <Tooltip />
        <Legend />
      </PieChart>
    </div>
  );
}
