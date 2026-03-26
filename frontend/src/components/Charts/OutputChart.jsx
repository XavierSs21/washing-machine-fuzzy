import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from "recharts";

function OutputChart({ simulationData }) {

  if (!simulationData) return null;

  const data = [
    {
      name: "Resultados",
      tiempo: simulationData.tiempo_ciclo,
      temperatura: simulationData.temperatura_agua,
      detergente: simulationData.cantidad_detergente,
      velocidad: simulationData.velocidad_agitacion
    }
  ];

  return (

    <BarChart
      width={600}
      height={300}
      data={data}
    >

      <CartesianGrid strokeDasharray="3 3" />

      <XAxis dataKey="name" />

      <YAxis />

      <Tooltip />

      <Legend />

      <Bar dataKey="tiempo" />

      <Bar dataKey="temperatura" />

      <Bar dataKey="detergente" />

      <Bar dataKey="velocidad" />

    </BarChart>

  );

}

export default OutputChart;