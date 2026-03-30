import React from "react";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from "recharts";

const CycleChart = ({ data, title }) => {
  return (
    <div style={{ width: "100%", height: 350 }}>
      <h3>{title}</h3>

      <ResponsiveContainer>
        <RadarChart data={data}>
          <PolarGrid />

          <PolarAngleAxis dataKey="cycle" />

          <PolarRadiusAxis />

          <Radar
            name="Cycles"
            dataKey="value"
            stroke="#8884d8"
            fill="#8884d8"
            fillOpacity={0.6}
          />

        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default CycleChart;