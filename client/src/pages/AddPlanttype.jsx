import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import FieldMap from '../components/FieldMap';


const AddPlanttype = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(true);
  const [plantTypes, setPlantTypes] = useState([]);
  const [plantType, setPlantType] = useState('');
  const [newPlantType, setNewPlantType] = useState('');
  const [depth, setDepth] = useState('');
  const [distance, setDistance] = useState('');
  const [error, setError] = useState('');
  const [distanceError, setDistanceError] = useState('');
  const [allPlants, setAllPlants] = useState([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [selectedPlantType, setSelectedPlantType] = useState('');

  const loadAllPlants = async () => {
    try {
      const response = await api.get('/api/plant/all');
      setAllPlants(response.data);
    } catch (err) {
      console.error('Error while loading plant list:', err);
    }
  };

  useEffect(() => {
    if (isOpen) loadPlantTypes();{
      loadPlantTypes();
    }
    loadAllPlants();
  }, [isOpen]);

  const loadPlantTypes = async () => {
    try {
      const response = await api.get('/api/plant/types');
      setPlantTypes(response.data);
    } catch {
      console.error('Error while loading plant types');
    }
  };

  const handlePlantClick = async (type) => {
  setPlantType(type);
  setNewPlantType(type);
  try {
    const res = await api.get(`/api/plant/details/${type}`);
    const data = res.data;

    setDepth(data?.seeding_depth?.toString() ?? '');
    setDistance(data?.minimal_distance?.toString() ?? '');
  } catch (err) {
    console.error('Error while loading plant details:', err);
    setDepth('');
    setDistance('');
  }
};

  const handleDepthChange = (e) => {
    const val = e.target.value;
    setDepth(val);
    const num = Number(val);
    setError((val === '' || isNaN(num) || num < 0 || num > 40)
      ? 'Please enter valid value between 0 and 40mm'
      : '');
  };

  const handleDistanceChange = (e) => {
    const val = e.target.value;
    setDistance(val);
    const num = Number(val);
    setDistanceError((val === '' || isNaN(num) || num < 50 || num > 1000)
      ? 'Please enter a valid number between 50 and 1000mm'
      : '');
  };

  const saveAll = async () => {
  if (!depth || !distance || error || distanceError) {
    alert('Please enter all fields correctly');
    return;
  }

  try {
    if (plantType) {
      // UPDATE-Mode
      await api.put('/api/plant/update', {
        plantType,
        newPlantType: newPlantType.trim(),
        seeding_depth: Number(depth),
        minimal_distance: Number(distance),
      });
      alert('Plant type updated');
    } else {
      // CREATE-Mode
      await api.post('/api/plant/add-type', {
        plant_type: newPlantType.trim(),
        minimal_distance: Number(distance),
        seeding_depth: Number(depth),
      });
      alert('New plant type created');
      // After adding, show "+ Add new plant type..." in dropdown
      setSelectedPlantType('');
      setPlantType('');
    }

    setNewPlantType('');
    setDepth('');
    setDistance('');

    await loadPlantTypes();
    await loadAllPlants();

  } catch (err) {
    alert(err.response?.data?.error || 'Saving Error');
    console.error(err);
  }
};

  // Replace the buttonGroup with dropdown
  return (
  <div style={styles.wholedesign}>

    <div style={styles.contentRow}>
      <div style={styles.wrapper}>
        {/* <button onClick={() => setIsOpen(!isOpen)} style={styles.toggleButton}>
          {isOpen ? 'Close' : 'Create Planttype'}
        </button> */}

        {isOpen && (
          <div style={styles.container}>
            <label style={{ ...styles.label, marginTop: "24px", fontSize: 22}}>
              Create a new plant type or select an existing type:
            </label>
            <div style={{ position: "relative", marginTop: 3 }}>
              <div
                style={{
                  border: "1px solid #22c55e",
                  borderRadius: 6,
                  padding: "6px 8px",
                  background: "#fff",
                  cursor: "pointer",
                  minWidth: 120,
                  color: "#14532d",
                }}
                onClick={() => setDropdownOpen((open) => !open)}
              >
                {selectedPlantType
                  ? selectedPlantType
                  : "Select plant type"}
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
                  {/* Add new plant type option at the top */}
                  <div
                    style={{
                      padding: "8px 12px",
                      cursor: "pointer",
                      background: "#f0fdf4",
                      color: "#14532d",
                      borderBottom: "1px solid #22c55e",
                      fontStyle: "italic"
                    }}
                    onClick={() => {
                      setSelectedPlantType('');
                      setPlantType('');
                      setNewPlantType('');
                      setDepth('0');        // <-- Default depth 0 mm
                      setDistance('50');    // <-- Default minimal distance 50 mm
                      setDropdownOpen(false);
                    }}
                  >
                    + Add new plant type...
                  </div>
                  {plantTypes.map((type) => (
                    <div
                      key={type}
                      style={{
                        padding: "8px 12px",
                        cursor: "pointer",
                        background: selectedPlantType === type ? "#bbf7d0" : "#fff",
                        color: "#14532d",
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                      }}
                      onClick={() => {
                        setSelectedPlantType(type);
                        setPlantType(type);
                        setNewPlantType(type);
                        setDropdownOpen(false);
                        handlePlantClick(type);
                      }}
                    >
                      {type}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <label style={styles.label}>
              New plant type:
              <input
                type="text"
                value={newPlantType}
                onChange={(e) => setNewPlantType(e.target.value)}
                style={{ ...styles.input, backgroundColor: plantType ? '#f3f4f6' : 'white' }}
              />
            </label>

            <label style={styles.label}>
              Seeding depth (mm):
              <input
                type="number"
                value={depth}
                onChange={handleDepthChange}
                min={0}
                max={40}
                style={styles.input}
              />
            </label>
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

            <label style={styles.label}>
              Minimal distance (mm):
              <input
                type="number"
                value={distance}
                onChange={handleDistanceChange}
                min={50}
                max={1000}
                style={styles.input}
              />
            </label>
            {distanceError && (
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
    {distanceError}
  </div>
)}

            <button onClick={saveAll} style={styles.button}>Save</button>
          </div>
        )}
              {/* <button onClick={() => navigate('/')} style={styles.backButton}>← Back to Dashboard</button> */}

      </div>

      {/* <div style={styles.tableWrapper}>
        <h3 style={{ color: '#065f46' }}>Saved Planttype</h3>
        {allPlants.length === 0 ? (
          <p>No planttypes saved</p>
        ) : (
          <table style={styles.table}>
            <thead>
              <tr>
                <th>Name</th>
                <th>Seeding Depth (mm)</th>
                <th>Minimal Distance (mm)</th>
              </tr>
            </thead>
            <tbody>
              {allPlants.map((plant, index) => (
                <tr key={index}>
                  <td>{plant.plant_type}</td>
                  <td>{plant.seeding_depth}</td>
                  <td>{plant.minimal_distance}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div> */}
    </div>
  </div>
);
};

const styles = {

    contentRow: {
    display: 'flex',
    flexDirection: 'row',
    gap: '40px',
    alignItems: 'flex-start',
    margin: '10px',
  },
  tableWrapper: {
    backgroundColor: '#f0fdf4',
    padding: '16px',
    borderRadius: '10px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
    minWidth: '400px'
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
  },
  'th, td': {
    padding: '8px',
    border: '1px solid #ccc',
    textAlign: 'left',
  },

  wholedesign: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: '40px',
    // padding: '20px',
  },
  wrapper: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    // minWidth: '320px',
  },
  toggleButton: {
    padding: '10px 16px',
    backgroundColor: '#22c55e',
    color: 'white',
    fontWeight: 'bold',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    marginBottom: '10px',
  },
  container: {
    backgroundColor: '#f0fdf4',
    borderRadius: '10px',
    padding: '5px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
    width: '100%',
    maxWidth: '300px',
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
  },
  label: { fontWeight: 'bold', color: '#14532d' },
  input: {
    width: '100%',
    padding: '8px',
    borderRadius: '4px',
    border: '1px solid #ccc',
    marginTop: '4px'
  },
  error: {
    color: '#dc2626',
    fontWeight: 'bold',
    fontSize: '0.85rem'
  },
  buttonGroup: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px',
  },
  plantButton: {
    padding: '6px 10px',
    border: 'none',
    borderRadius: '6px',
    fontWeight: 'bold',
    cursor: 'pointer',
  },
  button: {
    backgroundColor: '#22c55e',
    color: 'white',
    padding: '10px',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontWeight: 'bold',
  },
  backButton: {
    padding: '10px',
    backgroundColor: '#e5e7eb',
    color: '#111827',
    border: 'none',
    borderRadius: '5px',
    fontWeight: 'bold',
    cursor: 'pointer',
  },
};

export default AddPlanttype;
