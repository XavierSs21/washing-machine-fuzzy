import React from "react";

import MembershipChart from "./components/MembershipChart";
import OutputChart from "./components/OutputChart";
import CycleChart from "./components/CycleChart";

function App() {

  const membershipData = [
    { x: 0, low: 1, medium: 0, high: 0 },
    { x: 5, low: 0.8, medium: 0.2, high: 0 },
    { x: 10, low: 0.5, medium: 0.5, high: 0 },
    { x: 15, low: 0.2, medium: 0.8, high: 0 },
    { x: 20, low: 0, medium: 1, high: 0 },
    { x: 25, low: 0, medium: 0.8, high: 0.2 },
    { x: 30, low: 0, medium: 0.5, high: 0.5 },
  ];

  const outputData = [
    { name: "Wash Time", value: 35 },
    { name: "Spin Time", value: 15 },
  ];

  const cycleData = [
    { cycle: "Quick", value: 40 },
    { cycle: "Normal", value: 80 },
    { cycle: "Heavy", value: 60 },
    { cycle: "Delicate", value: 30 },
  ];

  return (
    <div style={{ padding: "20px" }}>

      <h1>Washing Machine Fuzzy System</h1>

      <MembershipChart
        data={membershipData}
        title="Membership Functions"
      />

      <OutputChart
        data={outputData}
        title="Output Values"
      />

      <CycleChart
        data={cycleData}
        title="Cycle Selection"
      />

    </div>
  );
}

export default App;