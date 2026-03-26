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

function MembershipChart() {

  const [data, setData] = useState({});
  const [selectedVar, setSelectedVar] = useState("");

  useEffect(() => {

    fetch("http://localhost:5000/api/membership")
      .then(res => res.json())
      .then(json => {
        setData(json);
        setSelectedVar(Object.keys(json)[0]);
      })
      .catch(err => console.error(err));

  }, []);

  if (!selectedVar) return <p>Cargando...</p>;

  const variable = data[selectedVar];

  const chartData = variable.universe.map((x, i) => {

    let obj = { x };

    Object.keys(variable.terms).forEach(term => {

      obj[term] = variable.terms[term][i];

    });

    return obj;

  });

  return (

    <div>

      <h2>Funciones de Membresía</h2>

      <select
        value={selectedVar}
        onChange={(e) => setSelectedVar(e.target.value)}
      >

        {Object.keys(data).map(key => (

          <option key={key} value={key}>
            {key}
          </option>

        ))}

      </select>

      <LineChart
        width={600}
        height={300}
        data={chartData}
      >

        <CartesianGrid strokeDasharray="3 3" />

        <XAxis dataKey="x" />

        <YAxis />

        <Tooltip />

        <Legend />

        {Object.keys(variable.terms).map(term => (

          <Line
            key={term}
            type="monotone"
            dataKey={term}
            dot={false}
          />

        ))}

      </LineChart>

    </div>

  );

}

export default MembershipChart;