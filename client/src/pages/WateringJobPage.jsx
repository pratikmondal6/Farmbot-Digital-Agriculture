import React, { useState, useEffect } from "react";
import { FaTint, FaRegCalendarAlt, FaShower } from "react-icons/fa";
import api from "../utils/api";


const DEFAULT_Z = 300;
const DEFAULT_INTERVAL = 24;

const WateringJobPage = () => {
  const [showCreatePanel, setShowCreatePanel] = useState(false);
  const [showJobsPanel, setShowJobsPanel] = useState(true); // Show jobs by default
  const [plantTypes, setPlantTypes] = useState([]);
  const [selectedPlantType, setSelectedPlantType] = useState(""); // Only one type
  const [waterAmounts, setWaterAmounts] = useState({});
 
  const [z, setZ] = useState(DEFAULT_Z);
  const [date, setDate] = useState(new Date().toISOString().slice(0, 16));
  const [interval, setInterval] = useState(DEFAULT_INTERVAL);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [dropdownOpenUnit, setDropdownOpenUnit] = useState(false);
  const [wateringJobs, setWateringJobs] = useState([]);
  const [editingJobId, setEditingJobId] = useState(null);
  const [error, setError] = useState("");
  const [timezone, setTimezone] = useState("UTC");
  const [isWatering, setIsWatering] = useState(false);
  const [waterUnit, setWaterUnit] = useState("ml");

  // Helper for local datetime-local string
  const getLocalDateTimeString = () => {
    const now = new Date();
    now.setSeconds(0, 0);
    const offset = now.getTimezoneOffset();
    const local = new Date(now.getTime() - offset * 60000);
    return local.toISOString().slice(0, 16);
  };

  const handleStartWatering = async () => {
    setIsWatering(true);
    if (selectedPlantType) {
      await api.post("/api/watering/start", {
        plantType: selectedPlantType,
        waterAmount: waterAmounts[selectedPlantType]
      });
    }
    setIsWatering(false);
  }

  // Fetch plant types from the API
  useEffect(() => {
    const fetchSeededPlantTypes = async () => {
      try {
        const response = await api.get("/seedingJob/seeds");
        // Get unique seed names
        const uniqueTypes = [];
        const seen = new Set();
        response.data.forEach(seed => {
          if (!seen.has(seed.seed_name)) {
            uniqueTypes.push({
              id: seed.seed_name, // Use seed_name as id
              name: seed.seed_name
            });
            seen.add(seed.seed_name);
          }
        });
        setPlantTypes(uniqueTypes);
        // Set default water amounts as string "100"
        const defaults = {};
        uniqueTypes.forEach(pt => { defaults[pt.id] = "100"; });
        setWaterAmounts(defaults);
      } catch {
        setPlantTypes([]);
      }
    };
    fetchSeededPlantTypes();
  }, []);

  // Fetch existing watering jobs
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const response = await api.get("/api/watering");
        const result = response.data;
        setWateringJobs(result);
      } catch {
        setWateringJobs([]);
      }
    };
    fetchJobs();
  }, []);

  // Fetch timezone from the API
  useEffect(() => {
    const fetchTimezone = async () => {
      try {
        const response = await api.get("/farmbotConfig");
        setTimezone(response.data.data.timezone || "UTC");
      } catch {
        setTimezone("UTC");
      }
    };
    fetchTimezone();
  }, []);

  // Reset form to default "create" mode
  const resetForm = () => {
    setEditingJobId(null);
    setSelectedPlantType("");
    // Default water amount 100 ml
    const defaults = {};
    plantTypes.forEach(pt => { defaults[pt.id] = "100"; });
    setWaterAmounts(defaults);
    setWaterUnit("ml"); // default unit
    setZ(DEFAULT_Z);
    setDate(getLocalDateTimeString());
    setInterval(DEFAULT_INTERVAL);
    setDropdownOpen(false);
  };

  const handleEdit = (job) => {
    setEditingJobId(job._id);

    const pt = plantTypes.find(pt => pt.name === job.plantType);
    setSelectedPlantType(pt ? pt.id : "");

    const wa = {};
    if (pt && job.waterAmount !== undefined) {
      wa[pt.id] = String(job.waterAmount);
    }
    setWaterAmounts(wa);

    setWaterUnit(job.waterUnit || "ml"); // <-- set unit from job

    setZ(job.z);

    // Convert UTC date to local datetime-local string
    if (job.date) {
      const d = new Date(job.date);
      const offset = d.getTimezoneOffset();
      const local = new Date(d.getTime() - offset * 60000);
      setDate(local.toISOString().slice(0, 16));
    } else {
      setDate(getLocalDateTimeString());
    }
    setInterval(job.interval);
    setShowCreatePanel(true);
    setShowJobsPanel(false);
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/api/watering/${id}`);
      setWateringJobs(wateringJobs.filter(j => j._id !== id));
    } catch {}
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Check: First execution is not in the past
    const now = new Date();
    const selectedDate = new Date(date);
    if (selectedDate < now) {
      setError("First execution cannot be in the past.");
      return;
    }

    // Check: No other job exists at the same date/time (for any seed)
    const selectedDateTime = new Date(date).getTime();
    const conflict = wateringJobs.some(job =>
      new Date(job.date).getTime() === selectedDateTime &&
      (!editingJobId || job._id !== editingJobId)
    );
    if (conflict) {
      setError("Another seed is already scheduled to be watered at this date and time. Only one seed can be watered at a time.");
      return;
    }

    // Only check for one plant type
    const alreadyScheduled = wateringJobs.some(job =>
      job.plantType === selectedPlantType &&
      (!editingJobId || job._id !== editingJobId)
    );
    if (alreadyScheduled) {
      setError("This plant type already has a watering job scheduled. Edit job in calendar to change.");
      return;
    }

    // Convert local datetime-local value to UTC ISO string
    let utcDate = date;
    if (date) {
      utcDate = new Date(date).toISOString();
    }

    const payload = {
      plantType: selectedPlantType,
      waterAmount: Number(waterAmounts[selectedPlantType]),
      waterUnit, // "ml" or "ms"
      z,
      date: utcDate,
      interval,
    };
    console.log("Submitting payload:", payload);
    try {
      if (editingJobId) {
        await api.put(`/api/watering/${editingJobId}`, payload);
      } else {
        await api.post("/api/watering", payload);
      }
      const jobsResponse = await api.get("/api/watering");
      console.log("Fetched jobs after submit:", jobsResponse.data); // <-- Add this
      setWateringJobs(jobsResponse.data);
      setShowJobsPanel(true);
      setShowCreatePanel(false);
      resetForm();
    } catch (err) {
      setError(err.response?.data?.message || "Could not save watering job.");
      console.error(err);
    }
  };





  return (
    <section style={{ maxWidth: 450, margin: "0", padding: "0px 10px 24px 10px" }}>
      <div style={{ display: "flex", gap: 16, marginBottom: 10 }}>
                
      </div>

      {showCreatePanel && 
        <div
          style={{
            background: "#f0fdf4",
            border: "none",
            borderRadius: 12,
            padding: 10,
            minWidth: 280,
            maxWidth: 450,
            boxShadow: "0 2px 8px #0002",
            margin: "0", // <-- left align
            marginBottom: 24,
            maxHeight: "90vh",
            overflowY: "auto",
          }}
        >
          
          <h3 style={{ color: "#14532d", fontWeight: "bold", fontSize: 20 }}>{editingJobId ? "Edit Watering Job" : "Create Watering Job"}</h3>
          <h3 style={{height: 16}}></h3>
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {/* Plant type selection dropdown */}
            <div>
              <label style={{ fontWeight: "bold", color: "#14532d" }}>Select seed:</label>
              <div style={{ position: "relative", marginTop: 8 }}>
                <div
                  style={{
                    border: "1px solid #22c55e",
                    borderRadius: 6,
                    padding: "6px 8px", // smaller padding
                    background: "#fff",
                    cursor: "pointer",
                    minWidth: 120, // smaller dropdown
                    color: "#14532d",
                  }}
                  onClick={() => setDropdownOpen((open) => !open)}
                >
                  {selectedPlantType
                    ? plantTypes.find(pt => pt.id === selectedPlantType)?.name
                    : "Select seed"}
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
                          background: selectedPlantType === type.id ? "#bbf7d0" : "#fff",
                          color: "#14532d",
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                        }}
                        onClick={() => {
                          setSelectedPlantType(type.id);
                          setDropdownOpen(false);
                        }}
                      >
                        {type.name}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            {/* Water amount input per plant type */}
            <div>
              <label style={{ fontWeight: "bold", color: "#14532d" }}>Water Amount per Seed:</label>
              {selectedPlantType && (
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                  <span style={{ minWidth: 60, textTransform: "capitalize" }}>
                    {plantTypes.find(pt => pt.id === selectedPlantType)?.name}:
                  </span>
                  <input
                    type="number"
                    min={0}
                    value={
                      waterAmounts[selectedPlantType] ??
                      (waterUnit === "ml" ? "100" : "1000")
                    }
                    onChange={(e) => {
                      setWaterAmounts(prev => ({
                        ...prev,
                        [selectedPlantType]: e.target.value
                      }));
                    }}
                    style={{
                      width: 100,
                      padding: "4px 8px",
                      borderRadius: 4,
                      border: "1px solid #22c55e",
                    }}
                  />
                  <div style={{ position: "relative", marginTop: 0 }}>
                    <div
                      style={{
                        border: "1px solid #22c55e",
                        borderRadius: 6,
                        padding: "6px 8px",
                        background: "#fff",
                        cursor: "pointer",
                        minWidth: 60,
                        color: "#14532d",
                        width: 80,
                        marginRight: 8,
                        display: "inline-block"
                      }}
                      onClick={() => setDropdownOpenUnit((open) => !open)}
                    >
                      {waterUnit === "ml" ? "ml" : "ms"}
                      <span style={{ float: "right" }}>▼</span>
                    </div>
                    {dropdownOpenUnit && (
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
                          maxHeight: 100,
                          overflowY: "auto",
                        }}
                      >
                        {["ml", "ms"].map((unit) => (
                          <div
                            key={unit}
                            style={{
                              padding: "8px 12px",
                              cursor: "pointer",
                              background: waterUnit === unit ? "#bbf7d0" : "#fff",
                              color: "#14532d",
                            }}
                            onClick={() => {
                              setWaterUnit(unit);
                              setDropdownOpenUnit(false);
                              // Reset default value for input when unit changes
                              setWaterAmounts(prev => ({
                                ...prev,
                                [selectedPlantType]: unit === "ml" ? "100" : "1000"
                              }));
                            }}
                          >
                            {unit}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
            {/* Z coordinate */}
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
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
                  margin: 0
                }}
              />
              <span style={{ color: "#16a34a", marginLeft: 4, whiteSpace: "nowrap" }}>[mm]</span>
            </div>
            {/* Date/time */}
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
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
            
            {error && (
              <div
                style={{
                  color: "#dc2626",
                  background: "#fee2e2",
                  padding: "4px 6px",
                  borderRadius: 4,
                  marginBottom: 8,
                  fontSize: "0.85rem",
                  maxWidth: 440,
                  wordBreak: "break-word",
                  whiteSpace: "pre-line",
                  lineHeight: 1.2,
                }}
              >
                {error}
              </div>
            )}
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
              {editingJobId ? "Update Watering Job" : "Create Watering Job"}
            </button>
            <button
              type="button"
              disabled = {isWatering}
              style={{
                background: isWatering ? "#94a3b8" : "#22c55e",
                color: "#fff",
                border: "none",
                borderRadius: 8,
                padding: "12px 0",
                fontWeight: "bold",
                fontSize: "1rem",
                cursor: isWatering ? "not-allowed" : "pointer",
                marginTop: 8,
                opacity: isWatering ? 0.6 : 1
              }}
              onClick={() => {
                setIsWatering(true);
                handleStartWatering();
              }}
            >
              {isWatering ? "Watering..." : "Start Now (Once)"}
            </button>
            {/* Watering Schedule button below submit */}
            <div style={{ display: "flex", justifyContent: "center" }}>
              <button
                type="button"
                style={{
                  background: "#22c55e",
                  color: "#fdfdfdff",
                  border: "none",
                  borderRadius: 8,
                  padding: "12px 0",
                  fontWeight: "bold",
                  fontSize: "1rem",
                  cursor: "pointer",
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  boxShadow: "0 2px 8px #0002",
                  marginTop: 8,
                }}
                onClick={() => { setShowJobsPanel(true); setShowCreatePanel(false); }}
              >
                <FaRegCalendarAlt style={{ color: "#fdfdfdff", fontSize: 18 }} />
                See Watering Schedule
              </button>
            </div>
          </form>
        </div>
      }

      {showJobsPanel && (
        <div
          style={{
            background: "#f0fdf4", // <-- match create panel green
            border: "none",
            borderRadius: 12,
            padding: 10,
            minWidth: 280,
            maxWidth: 450,
            boxShadow: "0 2px 8px #0002",
            margin: "0",
            marginBottom: 16,
            maxHeight: "70vh",
            overflowY: "auto",
            position: "static",
            display: "flex",
            flexDirection: "column"
          }}
        >
          
          <h3 style={{ color: "#14532d", fontSize: 20, fontWeight: "bold" }}>Watering Schedule</h3>
          <h3 style={{ height: 16 }}></h3>
          <h3 style={{ color: "#14532d", fontSize: 16, fontWeight: "bold" }}>Existing Watering Jobs:</h3>
          {wateringJobs.length === 0 ? (
            <p style={{ fontSize: "0.85rem" }}>No watering jobs found.</p>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse", background: "#fff", fontSize: "0.80rem" }}>
              <thead>
                <tr style={{ background: "#e1f6ddff" }}>
                  <th style={{ padding: "2px 1px", border: "1px solid #22c55e", fontSize: "0.75rem", width: 55 }}>Seed</th>
                  <th style={{ padding: "2px 1px", border: "1px solid #22c55e", fontSize: "0.75rem", width: 38 }}>Water</th>
                  <th style={{ padding: "2px 1px", border: "1px solid #22c55e", fontSize: "0.75rem", width: 38 }}>Z</th>
                  <th style={{ padding: "2px 1px", border: "1px solid #22c55e", fontSize: "0.75rem", width: 80 }}>First Execution</th>
                  <th style={{ padding: "2px 1px", border: "1px solid #22c55e", fontSize: "0.75rem", width: 38 }}>Interval</th>
                  <th style={{ padding: "2px 1px", border: "1px solid #22c55e", fontSize: "0.75rem", width: 60 }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {[...wateringJobs]
                  .sort((a, b) => new Date(a.date) - new Date(b.date))
                  .map((job, idx) => (
                    <tr key={job._id || idx}>
                      <td
                        style={{
                          padding: "2px 1px",
                          border: "1px solid #22c55e",
                          fontSize: "0.80rem",
                          width: 55,
                          wordBreak: "break-all",
                          hyphens: "auto"
                        }}
                      >
                        {job.plantType
                          ? job.plantType.split('-').map((part, idx, arr) =>
                              idx < arr.length - 1
                                ? <React.Fragment key={idx}>{part}-<br /></React.Fragment>
                                : <React.Fragment key={idx}>{part}</React.Fragment>
                            )
                          : "-"}
                      </td>
                      <td style={{ padding: "2px 1px", border: "1px solid #22c55e", fontSize: "0.80rem", width: 38 }}>
                        {job.waterAmount !== undefined
                          ? `${job.waterAmount} ${job.waterUnit || "ml"}`
                          : "-"}
                      </td>
                      <td style={{ padding: "2px 1px", border: "1px solid #22c55e", fontSize: "0.80rem", width: 38 }}>
                        {job.z}
                      </td>
                      <td
                        style={{
                          padding: "2px 1px",
                          border: "1px solid #22c55e",
                          fontSize: "0.80rem",
                          width: 80,
                          wordBreak: "break-all",
                          hyphens: "auto",
                          textAlign: "center"
                        }}
                      >
                        {job.date
                          ? (() => {
                              const d = new Date(job.date);
                              const dateStr = d.toLocaleDateString();
                              const timeStr = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                              return (
                                <>
                                  <span>{dateStr}</span>
                                  <br />
                                  <span>{timeStr}</span>
                                </>
                              );
                            })()
                          : "-"}
                      </td>
                      <td style={{ padding: "2px 1px", border: "1px solid #22c55e", fontSize: "0.80rem", width: 38 }}>
                        {job.interval}
                      </td>
                      <td style={{ padding: "2px 1px", border: "1px solid #22c55e", fontSize: "0.80rem", width: 60 }}>
                        <button
                          style={{
                            background: "#ebf21bdc",
                            color: "#090909ff",
                            border: "none",
                            borderRadius: 4,
                            padding: "1px 4px",
                            cursor: "pointer",
                            marginRight: 2,
                            fontSize: "0.80rem"
                          }}
                          onClick={() => handleEdit(job)}
                        >
                          Edit
                        </button>
                        <button
                          style={{
                            background: "#e73030ff",
                            color: "#ffffffff",
                            border: "none",
                            borderRadius: 4,
                            padding: "1px 4px",
                            cursor: "pointer",
                            fontSize: "0.80rem"
                          }}
                          onClick={() => handleDelete(job._id)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          )}
          {/* Move Create Watering Job button here, always at the bottom */}
          <button
            style={{
              background: "#22c55e",
              color: "#fff",
              border: "none",
              borderRadius: 8,
              padding: "8px 16px",
              fontWeight: "bold",
              fontSize: "1rem",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              boxShadow: "0 2px 8px #0002",
              marginTop: 15,
              marginBottom: 0
            }}
            onClick={() => { setShowCreatePanel(true); setShowJobsPanel(false); resetForm(); }}
          >
            <FaShower style={{ color: "#f3f3f3ff", fontSize: 16 }} />
            Create Watering Job
          </button>
        </div>
      )}
    </section>
  );
};

export default WateringJobPage;