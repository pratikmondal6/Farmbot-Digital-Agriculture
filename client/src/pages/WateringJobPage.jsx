import React, { useState, useEffect } from "react";
import api from '../utils/api';

// Dummy data for plant positions/types (replace with real DB/API call)
const defaultPlants = [
  { id: 1, x: 100, y: 200, type: "radish" },
  { id: 2, x: 300, y: 400, type: "lettuce" },
];

const defaultWaterAmounts = {
  radish: 50,
  lettuce: 80,
};

const defaultZ = -100;
const defaultDate = new Date().toISOString().slice(0, 16); // yyyy-MM-ddTHH:mm
const defaultInterval = 24;

const WateringJobPage = () => {
  const [plants, setPlants] = useState([]);
  const [selectedPlants, setSelectedPlants] = useState([]);
  const [waterAmounts, setWaterAmounts] = useState(defaultWaterAmounts);
  const [z, setZ] = useState(defaultZ);
  const [date, setDate] = useState(defaultDate);
  const [interval, setInterval] = useState(defaultInterval);

  // Load plant positions/types (simulate API)
  useEffect(() => {
    setPlants(defaultPlants);
    setSelectedPlants(defaultPlants.map(p => p.id));
  }, []);

  const handlePlantSelect = (id) => {
    setSelectedPlants((prev) =>
      prev.includes(id) ? prev.filter(pid => pid !== id) : [...prev, id]
    );
  };

  const handleWaterAmountChange = (type, value) => {
    setWaterAmounts((prev) => ({
      ...prev,
      [type]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Here you would send the job to your backend
    alert(
      `Watering job created!\nPlants: ${selectedPlants.join(", ")}\nAmounts: ${JSON.stringify(
        waterAmounts
      )}\nZ: ${z} mm\nDate: ${date}\nInterval: ${interval} h`
    );
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.header}>Create Watering Job</h2>
      <form onSubmit={handleSubmit} style={styles.form}>
        <div style={styles.section}>
          <label style={styles.label}>Select Plants:</label>
          <div style={styles.plantList}>
            {plants.map((plant) => (
              <div
                key={plant.id}
                style={{
                  ...styles.plantItem,
                  background: selectedPlants.includes(plant.id)
                    ? "#bbf7d0"
                    : "#f1f5f9",
                }}
                onClick={() => handlePlantSelect(plant.id)}
              >
                {plant.type} ({plant.x}, {plant.y})
              </div>
            ))}
          </div>
        </div>
        <div style={styles.section}>
          <label style={styles.label}>Water Amount per Plant Type:</label>
          {Object.keys(waterAmounts).map((type) => (
            <div key={type} style={styles.inputRow}>
              <span style={styles.inputLabel}>{type}:</span>
              <input
                type="number"
                min={0}
                value={waterAmounts[type]}
                onChange={(e) => handleWaterAmountChange(type, e.target.value)}
                style={styles.input}
              />
              <span style={styles.unit}>[ml]</span>
            </div>
          ))}
        </div>
        <div style={styles.section}>
          <label style={styles.label}>Z Coordinate (height):</label>
          <input
            type="number"
            value={z}
            onChange={(e) => setZ(e.target.value)}
            style={styles.input}
          />
          <span style={styles.unit}>[mm]</span>
        </div>
        <div style={styles.section}>
          <label style={styles.label}>First Execution:</label>
          <input
            type="datetime-local"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            style={styles.input}
          />
        </div>
        <div style={styles.section}>
          <label style={styles.label}>Interval:</label>
          <input
            type="number"
            min={1}
            value={interval}
            onChange={(e) => setInterval(e.target.value)}
            style={styles.input}
          />
          <span style={styles.unit}>[h]</span>
        </div>
        <button type="submit" style={styles.submitButton}>
          Create Watering Job
        </button>
      </form>
    </div>
  );
};

const styles = {
  container: {
    maxWidth: 600,
    margin: "40px auto",
    background: "#f0fdf4",
    borderRadius: 12,
    padding: 32,
    boxShadow: "0 2px 8px #0001",
  },
  header: {
    color: "#14532d",
    marginBottom: 24,
    textAlign: "center",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: 24,
  },
  section: {
    marginBottom: 12,
  },
  label: {
    fontWeight: "bold",
    color: "#14532d",
    marginBottom: 8,
    display: "block",
  },
  plantList: {
    display: "flex",
    gap: 8,
    flexWrap: "wrap",
  },
  plantItem: {
    padding: "8px 12px",
    borderRadius: 8,
    cursor: "pointer",
    border: "1px solid #22c55e",
    marginBottom: 4,
    userSelect: "none",
  },
  inputRow: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    marginBottom: 4,
  },
  inputLabel: {
    minWidth: 60,
    textTransform: "capitalize",
  },
  input: {
    width: 80,
    padding: "4px 8px",
    borderRadius: 4,
    border: "1px solid #22c55e",
  },
  unit: {
    color: "#16a34a",
    marginLeft: 4,
  },
  submitButton: {
    background: "#22c55e",
    color: "#fff",
    border: "none",
    borderRadius: 8,
    padding: "12px 0",
    fontWeight: "bold",
    fontSize: "1rem",
    cursor: "pointer",
    marginTop: 16,
  },
};

export default WateringJobPage;