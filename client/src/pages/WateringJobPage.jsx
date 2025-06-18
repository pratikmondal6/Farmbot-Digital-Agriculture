import React, { useState, useEffect } from "react";
import { FaTint } from "react-icons/fa";
import api from '../utils/api';

const WateringJobPage = () => {
  const [showPanel, setShowPanel] = useState(false);
  const [plantTypes, setPlantTypes] = useState([]);
  const [selectedPlantType, setSelectedPlantType] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [waterAmount, setWaterAmount] = useState(50);

  useEffect(() => {
    api.get("/api/plant/all")
      .then((res) => {
        const types = res.data.map(pt => ({
          id: pt._id,
          name: pt.plant_type
        }));
        setPlantTypes(types);
        if (types.length > 0) setSelectedPlantType(types[0]);
      })
      .catch(() => setPlantTypes([]));
  }, []);

  const handleSelect = (type) => {
    setSelectedPlantType(type);
    setDropdownOpen(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert(
      `Watering job created!\nPlant type: ${selectedPlantType?.name}\nAmount: ${waterAmount} ml`
    );
  };

  return (
    <div>
      {/* Green bar at the top */}
      <div
        style={{
          width: "100%",
          padding: "10px 0 10px 24px",
          backgroundColor: "#16a34a",
          borderBottom: "1px solid #22c55e",
          display: "flex",
          alignItems: "center",
          position: "fixed",
          top: 0,
          left: 0,
          zIndex: 100,
          height: 56,
        }}
      >
        <span style={{ color: "#fff", fontWeight: "bold", fontSize: "1.2rem" }}>
          Watering Jobs
        </span>
        {/* Blue water icon, sized to match the bar */}
        <div style={{ marginLeft: "auto", marginRight: 24 }}>
          <button
            style={{
              width: 40,
              height: 40,
              borderRadius: "50%",
              backgroundColor: showPanel ? "#bae6fd" : "#38bdf8",
              color: "#2563eb",
              border: "none",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 28,
              cursor: "pointer",
              boxShadow: "0 2px 8px #0002",
              transition: "background 0.2s",
            }}
            title="Open watering panel"
            onMouseEnter={() => setShowPanel(true)}
          >
            <FaTint />
          </button>
        </div>
      </div>

      {/* Watering panel */}
      {showPanel && (
        <div
          style={{
            position: "fixed",
            top: 66,
            right: 24,
            background: "#f0fdf4",
            border: "1px solid #22c55e",
            borderRadius: 12,
            padding: 24,
            minWidth: 320,
            boxShadow: "0 2px 8px #0002",
            zIndex: 200,
          }}
          onMouseEnter={() => setShowPanel(true)}
          onMouseLeave={() => setShowPanel(false)}
        >
          <h3 style={{ color: "#14532d" }}>Create Watering Job</h3>
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {/* Plant type selection dropdown */}
            <div>
              <label style={{ fontWeight: "bold", color: "#14532d" }}>Plant Type:</label>
              <div style={{ position: "relative", marginTop: 4 }}>
                <div
                  style={{
                    border: "1px solid #22c55e",
                    borderRadius: 6,
                    padding: "8px 12px",
                    background: "#fff",
                    cursor: "pointer",
                    minWidth: 160,
                    color: "#14532d",
                  }}
                  onClick={() => setDropdownOpen((open) => !open)}
                >
                  {selectedPlantType ? selectedPlantType.name : "Select plant type"}
                  <span style={{ float: "right" }}>▼</span>
                </div>
                {dropdownOpen && (
                  <div
                    style={{
                      position: "absolute",
                      top: "100%",
                      left: 0,
                      right: 0,
                      background: "#fff",
                      border: "1px solid #22c55e",
                      borderRadius: 6,
                      zIndex: 10,
                      boxShadow: "0 2px 8px #0001",
                      maxHeight: 180,
                      overflowY: "auto",
                    }}
                  >
                    {plantTypes.map((type) => (
                      <div
                        key={type.id}
                        style={{
                          padding: "8px 12px",
                          cursor: "pointer",
                          background: selectedPlantType?.id === type.id ? "#bbf7d0" : "#fff",
                          color: "#14532d",
                        }}
                        onClick={() => handleSelect(type)}
                      >
                        {type.name}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            {/* Water amount input */}
            <div>
              <label style={{ fontWeight: "bold", color: "#14532d" }}>Water Amount:</label>
              <input
                type="number"
                min={0}
                value={waterAmount}
                onChange={(e) => setWaterAmount(e.target.value)}
                style={{
                  width: 80,
                  padding: "4px 8px",
                  borderRadius: 4,
                  border: "1px solid #22c55e",
                  marginLeft: 8,
                }}
              />
              <span style={{ color: "#2563eb", marginLeft: 4 }}>[ml]</span>
            </div>
            <button
              type="submit"
              style={{
                background: "#22c55e",
                color: "#fff",
                border: "none",
                borderRadius: 8,
                padding: "12px 0",
                fontWeight: "bold",
                fontSize: "1rem",
                cursor: "pointer",
                marginTop: 8,
              }}
            >
              Create Watering Job
            </button>
          </form>
        </div>
      )}

      {/* Main content (add marginTop to avoid overlap with green bar) */}
      <div style={{ marginTop: 70, padding: 24 }}>
        {/* ...rest of your page content... */}
      </div>
    </div>
  );
};

export default WateringJobPage;