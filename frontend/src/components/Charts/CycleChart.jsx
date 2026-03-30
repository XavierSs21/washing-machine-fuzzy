import React, { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from "recharts";

function CycleChart() {

  const [data, setData] = useState([]);

  useEffect(() => {

    const socket = new WebSocket("ws://localhost:5000/ws");

    socket.onmessage = (event) => {

      const newData = JSON.parse(event.data);

      setData(prev => [...prev, newData]);

    };

    return () => socket.close();

  }, []);

  return (

    <LineChart
      width={600}
      height={300}
      data={data}
    >

      <CartesianGrid strokeDasharray="3 3" />

      <XAxis dataKey="time" />

      <YAxis />

      <Tooltip />

      <Legend />

      <Line
        type="monotone"
        dataKey="temperature"
        dot={false}
      />

      <Line
        type="monotone"
        dataKey="speed"
        dot={false}
      />

    </LineChart>

  );

}
//
export default CycleChart;