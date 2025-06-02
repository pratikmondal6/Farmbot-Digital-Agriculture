import React, { useState, useEffect } from 'react';

const AddPlanttype = () => {
  const [plantTypes, setPlantTypes] = useState([]);
  const [plantType, setPlantType] = useState('');
  const [newPlantType, setNewPlantType] = useState('');
  const [depth, setDepth] = useState('');
  const [distance, setDistance] = useState('');
  const [error, setError] = useState('');
  const [distanceError, setDistanceError] = useState('');
  const [addError, setAddError] = useState('');

  // 🔗 Backend: GET /api/plant/types
  useEffect(() => {
    fetch('/api/plant/types')
      .then(res => res.json())
      .then(data => setPlantTypes(data))
      .catch(() => console.error('Failed to fetch plant types'));
  }, []);

  // 🔗 Backend: GET /api/plant/:type
  const handlePlantSelect = (e) => {
    const selected = e.target.value;
    setPlantType(selected);

    if (selected === '') {
      setDepth('');
      setDistance('');
      return;
    }

    fetch(`/api/plant/${selected}`)
      .then(res => res.json())
      .then(data => {
        setDepth(data.seeding_depth);
        setDistance(data.minimal_distance);
      })
      .catch(() => console.error('Failed to load details'));
  };

  const handleDepthChange = (e) => {
    const value = e.target.value;
    setDepth(value);
    const num = Number(value);
    if (
      value === '' || !Number.isFinite(num) || value.includes(' ') || isNaN(num)
    ) {
      setError('Please enter a valid number between 0 mm and -40 mm.');
    } else if (num > 0 || num < -40) {
      setError('Please enter a value between 0 mm and -40 mm.');
    } else {
      setError('');
    }
  };

  const handleDistanceChange = (e) => {
    const value = e.target.value;
    setDistance(value);
    const num = Number(value);
    if (
      value === '' || !Number.isFinite(num) || value.includes(' ') || isNaN(num)
    ) {
      setDistanceError('Please enter a valid number between 50 mm and 1000 mm.');
    } else if (num < 50 || num > 1000) {
      setDistanceError('Please enter a value between 50 mm and 1000 mm.');
    } else {
      setDistanceError('');
    }
  };

  // 🔗 Backend: POST /api/plant/save
  const saveToDatabase = async () => {
    if (!plantType || !depth || !distance) {
      alert('Please fill in all fields.');
      return;
    }
    try {
      const response = await fetch('/api/plant/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plantType,
          seeding_depth: depth,
          minimal_distance: distance,
        }),
      });
      const data = await response.json();
      if (response.ok) {
        alert('Saved successfully!');
      } else {
        alert(data.error || 'Save failed.');
      }
    } catch (err) {
      alert('Network error.');
    }
  };

  // 🔗 Backend: POST /api/plant/add-type
  const addPlantType = async () => {
    if (!newPlantType) {
      setAddError('Please enter a plant type.');
      return;
    }
    setAddError('');
    await fetch('/api/plant/add-type', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ plant_type: newPlantType }),
    })
      .then(res => res.json())
      .then(data => {
        alert(data.message);
        setNewPlantType('');
        fetch('/api/plant/types')
          .then(res => res.json())
          .then(data => setPlantTypes(data));
      });
  };

  return (
    <div style={styles.container}>
      <label style={styles.label}>
        Select plant type:
        <select
          value={plantType}
          onChange={handlePlantSelect}
          style={styles.select}
        >
          <option value="">-- Select --</option>
          {plantTypes.map(type => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>
      </label>

      <label style={styles.label}>
        Or add new plant type:
        <input
          type="text"
          value={newPlantType}
          onChange={(e) => setNewPlantType(e.target.value)}
          style={styles.input}
        />
      </label>
      {addError && <div style={styles.error}>{addError}</div>}
      <button onClick={addPlantType} style={styles.button}>Add Plant Type</button>

      <label style={styles.label}>
        Seeding depth (mm):
        <input
          type="number"
          value={depth}
          onChange={handleDepthChange}
          min={-40}
          max={0}
          style={styles.input}
        />
      </label>
      {error && <div style={styles.error}>{error}</div>}

      <label style={styles.label}>
        Minimum distance (mm):
        <input
          type="number"
          value={distance}
          onChange={handleDistanceChange}
          min={50}
          max={1000}
          style={styles.input}
        />
      </label>
      {distanceError && <div style={styles.error}>{distanceError}</div>}

      <button onClick={saveToDatabase} style={styles.button}>
        Save Values
      </button>
    </div>
  );
};

const styles = {
  container: {
    position: 'absolute',
    top: '60px',
    left: '20px',
    width: '350px',
    backgroundColor: '#ecfdf5',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
    padding: '24px',
    borderRadius: '12px',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    zIndex: 9,
  },
  label: {
    color: '#14532d',
    fontWeight: 'bold',
  },
  select: {
    width: '100%',
    padding: '8px',
    marginTop: '4px',
    border: '1px solid #ccc',
    borderRadius: '4px',
    marginBottom: '8px',
  },
  input: {
    width: '100%',
    padding: '8px',
    marginTop: '4px',
    border: '1px solid #ccc',
    borderRadius: '4px',
    marginBottom: '4px',
  },
  error: {
    color: '#dc2626',
    fontWeight: 'bold',
  },
  button: {
    padding: '10px',
    backgroundColor: '#22c55e',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontWeight: 'bold',
  },
};

export default AddPlanttype;
