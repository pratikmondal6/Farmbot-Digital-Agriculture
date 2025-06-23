import React, { useState, useEffect } from "react";
import { FaTint, FaRegCalendarAlt } from "react-icons/fa";
import api from '../utils/api'; 

const DEFAULT_Z = -100;
const DEFAULT_INTERVAL = 24;

const WateringJobPage = () => {
  const [showCreatePanel, setShowCreatePanel] = useState(false);
  const [showJobsPanel, setShowJobsPanel] = useState(false);
  const [plantTypes, setPlantTypes] = useState([]);
  const [selectedPlantTypes, setSelectedPlantTypes] = useState([]);
  const [waterAmounts, setWaterAmounts] = useState({});
  const [z, setZ] = useState(DEFAULT_Z);
  const [date, setDate] = useState(new Date().toISOString().slice(0, 16));
  const [interval, setInterval] = useState(DEFAULT_INTERVAL);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [wateringJobs, setWateringJobs] = useState([]);
  const [plants, setPlants] = useState([]);
  const [selectedPlantIds, setSelectedPlantIds] = useState([]);
  const [editingJobId, setEditingJobId] = useState(null);

  // Fetch plant types from the API
  useEffect(() => {
    api.get("/api/plant/all")
      .then((res) => {
        const types = res.data.map(pt => ({
          id: pt._id,
          name: pt.plant_type
        }));
        setPlantTypes(types);
        // Do NOT select any plant type by default:
        // setSelectedPlantTypes([]); // This is already the default
        // Set default water amounts for all types
        const defaults = {};
        types.forEach(pt => { defaults[pt.id] = 50; });
        setWaterAmounts(defaults);
      })
      .catch(() => setPlantTypes([]));
  }, []);

  // Fetch existing watering jobs
  useEffect(() => {
    api.get("/api/watering-jobs")
      .then((res) => setWateringJobs(res.data))
      .catch(() => setWateringJobs([]));
  }, []);

  // TODO get the x y Position from seeding job
  // Fetch all seeded plants with x, y, and type
  useEffect(() => {
    api.get("/api/plants/seeded") // Dummy endpoint, replace with actual
      // This should return seeded plants with their x, y, and plant_type
      .then(res => setPlants(res.data))
      .catch(() => setPlants([]));
  }, []);

  const handlePlantTypeToggle = (id) => {
    setSelectedPlantTypes((prev) =>
      prev.includes(id)
        ? prev.filter(pid => pid !== id)
        : [...prev, id]
    );
  };

  // Water amount per plant type
  const handleWaterAmountChange = (id, value) => {
    setWaterAmounts((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = {
      plantTypes: selectedPlantTypes,
      waterAmounts,
      z,
      date,
      interval,
    };
    if (editingJobId) {
      api.put(`/api/watering-jobs/${editingJobId}`, payload)
        .then(() => api.get("/api/watering-jobs"))
        .then(res => {
          setWateringJobs(res.data);
          setEditingJobId(null);
          // Optionally reset form
        });
    } else {
      api.post("/api/watering-jobs", payload)
        .then(() => api.get("/api/watering-jobs"))
        .then(res => setWateringJobs(res.data));
    }
  };

  const togglePlant = (id) => {
    setSelectedPlantIds((prev) =>
      prev.includes(id)
        ? prev.filter(pid => pid !== id)
        : [...prev, id]
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
        {/* Blue water icon */}
        <div
          style={{
            marginLeft: "auto",
            marginRight: 8,
            display: "flex",
            gap: 8,
            alignItems: "center",
            position: "relative",
            zIndex: 200,
          }}
        >
          {/* Watering Job Panel */}
          <div style={{ position: "relative", display: "inline-block" }}>
            <button
              style={{
                width: 40,
                height: 40,
                borderRadius: "50%",
                backgroundColor: showCreatePanel ? "#bae6fd" : "#38bdf8",
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
              onMouseEnter={() => setShowCreatePanel(true)}
              onMouseLeave={() => setShowCreatePanel(false)}
            >
              <FaTint />
            </button>
            {showCreatePanel && (
              <div
                style={{
                  position: "fixed",
                  top: 56, // exactly below the green bar
                  right: 0,
                  background: "#f0fdf4",
                  border: "1px solid #22c55e",
                  borderRadius: 12,
                  padding: 24,
                  minWidth: 340,
                  boxShadow: "0 2px 8px #0002",
                  zIndex: 301,
                }}
                onMouseEnter={() => setShowCreatePanel(true)}
                onMouseLeave={() => setShowCreatePanel(false)}
              >
                <h3 style={{ fontWeight: "bold", color: "#14532d" }}>Create Watering Job</h3>
                <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  {/* Plant type selection dropdown */}
                  <div>
                    <label style={{ color: "#14532d" }}>Plant Types:</label>
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
                        {selectedPlantTypes.length === plantTypes.length
                          ? "All plant types selected"
                          : selectedPlantTypes.length === 0
                          ? "Select plant types"
                          : plantTypes
                              .filter(pt => selectedPlantTypes.includes(pt.id))
                              .map(pt => pt.name)
                              .join(", ")}
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
                                background: selectedPlantTypes.includes(type.id) ? "#bbf7d0" : "#fff",
                                color: "#14532d",
                                display: "flex",
                                alignItems: "center",
                                gap: 8,
                              }}
                              onClick={() => handlePlantTypeToggle(type.id)}
                            >
                              <input
                                type="checkbox"
                                checked={selectedPlantTypes.includes(type.id)}
                                readOnly
                              />
                              {type.name}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  {/* Water amount input per plant type */}
                  <div>
                    <label style={{ fontWeight: "bold", color: "#14532d" }}>Water Amount per Plant Type:</label>
                    {plantTypes
                      .filter(pt => selectedPlantTypes.includes(pt.id))
                      .map((type) => (
                        <div key={type.id} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                          <span style={{ minWidth: 60, textTransform: "capitalize" }}>{type.name}:</span>
                          <input
                            type="number"
                            min={0}
                            value={waterAmounts[type.id] || 50}
                            onChange={(e) => handleWaterAmountChange(type.id, e.target.value)}
                            style={{
                              width: 80,
                              padding: "4px 8px",
                              borderRadius: 4,
                              border: "1px solid #22c55e",
                            }}
                          />
                          <span style={{ color: "#2563eb" }}>[ml]</span>
                        </div>
                      ))}
                  </div>
                  {/* Z coordinate */}
                  <div>
                    <label style={{ fontWeight: "bold", color: "#14532d" }}>Z Coordinate (height):</label>
                    <input
                      type="number"
                      value={z}
                      onChange={(e) => setZ(e.target.value)}
                      style={{
                        width: 80,
                        padding: "4px 8px",
                        borderRadius: 4,
                        border: "1px solid #22c55e",
                        marginLeft: 8,
                      }}
                    />
                    <span style={{ color: "#16a34a", marginLeft: 4 }}>[mm]</span>
                  </div>
                  {/* Date/time */}
                  <div>
                    <label style={{ fontWeight: "bold", color: "#14532d" }}>First Execution:</label>
                    <input
                      type="datetime-local"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      style={{
                        width: 200,
                        padding: "4px 8px",
                        borderRadius: 4,
                        border: "1px solid #22c55e",
                        marginLeft: 8,
                      }}
                    />
                  </div>
                  {/* Interval */}
                  <div>
                    <label style={{ fontWeight: "bold", color: "#14532d" }}>Interval:</label>
                    <input
                      type="number"
                      min={1}
                      value={interval}
                      onChange={(e) => setInterval(e.target.value)}
                      style={{
                        width: 80,
                        padding: "4px 8px",
                        borderRadius: 4,
                        border: "1px solid #22c55e",
                        marginLeft: 8,
                      }}
                    />
                    <span style={{ color: "#16a34a", marginLeft: 4 }}>[h]</span>
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
                    Save
                  </button>
                </form>
              </div>
            )}
          </div>

          {/* Existing Jobs Panel */}
          <div style={{ position: "relative", display: "inline-block" }}>
            <button
              style={{
                width: 40,
                height: 40,
                borderRadius: "50%",
                backgroundColor: showJobsPanel ? "#fef9c3" : "#fde047",
                color: "#b45309",
                border: "none",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 24,
                cursor: "pointer",
                boxShadow: "0 2px 8px #0002",
                transition: "background 0.2s",
              }}
              title="Show existing watering jobs"
              onMouseEnter={() => setShowJobsPanel(true)}
              onMouseLeave={() => setShowJobsPanel(false)}
            >
              <FaRegCalendarAlt />
            </button>
            {showJobsPanel && (
              <div
                style={{
                  position: "absolute",
                  top: 48,
                  right: 0,
                  background: "#fefce8",
                  border: "1px solid #fde047",
                  borderRadius: 12,
                  padding: 24,
                  minWidth: 400,
                  boxShadow: "0 2px 8px #0002",
                  zIndex: 301,
                }}
                onMouseEnter={() => setShowJobsPanel(true)}
                onMouseLeave={() => setShowJobsPanel(false)}
              >
                <h3 style={{ color: "#b45309" }}>Existing Watering Jobs</h3>
                {wateringJobs.length === 0 ? (
                  <p>No watering jobs found.</p>
                ) : (
                  <table style={{ width: "100%", borderCollapse: "collapse", background: "#fff" }}>
                    <thead>
                      <tr style={{ background: "#fef9c3" }}>
                        <th style={{ padding: 8, border: "1px solid #fde047" }}>Plant Types</th>
                        <th style={{ padding: 8, border: "1px solid #fde047" }}>Water Amounts [ml]</th>
                        <th style={{ padding: 8, border: "1px solid #fde047" }}>Z [mm]</th>
                        <th style={{ padding: 8, border: "1px solid #fde047" }}>First Execution</th>
                        <th style={{ padding: 8, border: "1px solid #fde047" }}>Interval [h]</th>
                        <th style={{ padding: 8, border: "1px solid #fde047" }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {wateringJobs.map((job, idx) => (
                        <tr key={idx}>
                          <td style={{ padding: 8, border: "1px solid #fde047" }}>
                            {(job.plantTypes || []).join(", ")}
                          </td>
                          <td style={{ padding: 8, border: "1px solid #fde047" }}>
                            {job.waterAmounts
                              ? Object.entries(job.waterAmounts)
                                  .map(([type, amt]) => `${type}: ${amt}`)
                                  .join(", ")
                              : ""}
                          </td>
                          <td style={{ padding: 8, border: "1px solid #fde047" }}>{job.z}</td>
                          <td style={{ padding: 8, border: "1px solid #fde047" }}>{job.date}</td>
                          <td style={{ padding: 8, border: "1px solid #fde047" }}>{job.interval}</td>
                          <td style={{ padding: 8, border: "1px solid #fde047" }}>
                            <button
                              style={{
                                background: "#ef4444",
                                color: "#fff",
                                border: "none",
                                borderRadius: 4,
                                padding: "4px 8px",
                                cursor: "pointer",
                                marginLeft: 8,
                              }}
                              onClick={() => {
                                api.delete(`/api/watering-jobs/${job._id}`).then(() => {
                                  setWateringJobs(wateringJobs.filter(j => j._id !== job._id));
                                });
                              }}
                            >
                              Delete
                            </button>
                            <button
                              style={{
                                background: "#fbbf24",
                                color: "#fff",
                                border: "none",
                                borderRadius: 4,
                                padding: "4px 8px",
                                cursor: "pointer",
                                marginLeft: 8,
                              }}
                              onClick={() => {
                                setEditingJobId(job._id);
                                setSelectedPlantTypes(job.plantTypes);
                                setWaterAmounts(job.waterAmounts);
                                setZ(job.z);
                                setDate(job.date);
                                setInterval(job.interval);
                                setShowCreatePanel(true);
                              }}
                            >
                              Edit
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}
          </div>
        </div>
      </div>


      {/* Main content (add marginTop to avoid overlap with green bar) */}
      <div style={{ marginTop: 70, padding: 24 }}>
        {/* ...rest of your page content... */}
        
      </div>
    </div>
  );
};

export default WateringJobPage;