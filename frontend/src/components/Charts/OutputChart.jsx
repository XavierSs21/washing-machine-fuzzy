import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const OutputChart = ({ data, title }) => {
  return (
    <div style={{ width: "100%", height: 300 }}>
      <h3>{title}</h3>

      <ResponsiveContainer>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />

          <XAxis dataKey="name" />

          <YAxis />

          <Tooltip />

          <Legend />

          <Bar
            dataKey="value"
            fill="#8884d8"
            name="Output"
          />

        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default OutputChart;