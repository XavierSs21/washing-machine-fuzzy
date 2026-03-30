import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const MembershipChart = ({ data, title }) => {
  return (
    <div style={{ width: "100%", height: 300 }}>
      <h3>{title}</h3>

      <ResponsiveContainer>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />

          <XAxis dataKey="x" />

          <YAxis domain={[0, 1]} />

          <Tooltip />

          <Legend />

          <Line
            type="monotone"
            dataKey="low"
            stroke="#8884d8"
            name="Low"
          />

          <Line
            type="monotone"
            dataKey="medium"
            stroke="#82ca9d"
            name="Medium"
          />

          <Line
            type="monotone"
            dataKey="high"
            stroke="#ff7300"
            name="High"
          />

        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default MembershipChart;