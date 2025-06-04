import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AddPlanttype = () => {
  const navigate = useNavigate();

  const [plantTypes, setPlantTypes] = useState([]);
  const [plantType, setPlantType] = useState('');
  const [newPlantType, setNewPlantType] = useState('');
  const [depth, setDepth] = useState('');
  const [distance, setDistance] = useState('');
  const [error, setError] = useState('');
  const [distanceError, setDistanceError] = useState('');

  useEffect(() => {
    fetch('/api/plant/types')
      .then(res => res.json())
      .then(data => setPlantTypes(data))
      .catch(() => console.error('Failed to fetch plant types'));
  }, []);

  // Load plant data on selection
  const handlePlantClick = (type) => {
    setPlantType(type);
    fetch(`/api/plant/${type}`)
      .then(res => res.json())
      .then(data => {
        setDepth(data.seeding_depth);
        setDistance(data.minimal_distance);
      })
      .catch(() => console.error('Failed to load plant details'));
  };

  const handleDepthChange = (e) => {
    const value = e.target.value;
    setDepth(value);
    const num = Number(value);
    if (value === '' || !Number.isFinite(num) || value.includes(' ') || isNaN(num)) {
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
    if (value === '' || !Number.isFinite(num) || value.includes(' ') || isNaN(num)) {
      setDistanceError('Please enter a valid number between 50 mm and 1000 mm.');
    } else if (num < 50 || num > 1000) {
      setDistanceError('Please enter a value between 50 mm and 1000 mm.');
    } else {
      setDistanceError('');
    }
  };

  const saveAll = async () => {
    if (!depth || !distance) {
      alert('Please fill in all fields.');
      return;
    }

    const depthNum = Number(depth);
    const distNum = Number(distance);
    if (isNaN(depthNum) || depthNum > 0 || depthNum < -40 || isNaN(distNum) || distNum < 50 || distNum > 1000) {
      alert('Please enter valid values.');
      return;
    }

    let finalPlantType = plantType;

    if (newPlantType.trim()) {
      try {
        const res = await fetch('/api/plant/add-type', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ plant_type: newPlantType.trim() }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to add new plant type.');
        alert(data.message);
        finalPlantType = newPlantType.trim();
        setNewPlantType('');
        const updatedTypes = await fetch('/api/plant/types').then(r => r.json());
        setPlantTypes(updatedTypes);
      } catch (err) {
        alert(err.message);
        return;
      }
    }

    if (!finalPlantType) {
      alert('Please select or enter a plant type.');
      return;
    }

    try {
      const response = await fetch('/api/plant/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plantType: finalPlantType,
          seeding_depth: depth,
          minimal_distance: distance,
        }),
      });
      const data = await response.json();
      if (response.ok) {
        alert('Data saved successfully!');
        setPlantType('');
        setDepth('');
        setDistance('');
      } else {
        alert(data.error || 'Failed to save data.');
      }
    } catch (err) {
      alert('Network error.');
    }
  };

  return (
    <div style={styles.wrapper}>
      <div style={styles.container}>
        <label style={styles.label}>
          Choose existing plant type:
        </label>
        <div style={styles.buttonGroup}>
          {plantTypes.map(type => (
            <button
              key={type}
              onClick={() => handlePlantClick(type)}
              style={{
                ...styles.plantButton,
                backgroundColor: plantType === type ? '#15803d' : '#bbf7d0',
                color: plantType === type ? 'white' : '#064e3b'
              }}
            >
              {type}
            </button>
          ))}
        </div>

        <label style={styles.label}>
          Add new plant type:
          <input
            type="text"
            value={newPlantType}
            onChange={(e) => setNewPlantType(e.target.value)}
            style={styles.input}
          />
        </label>

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

        <button onClick={saveAll} style={styles.button}>
          Save
        </button>

        <button onClick={() => navigate('/')} style={styles.backButton}>
          ← Back to Home
        </button>
      </div>
    </div>
  );
};

const styles = {
  wrapper: {
    display: 'flex',
    justifyContent: 'flex-start',
    padding: '40px',
  },
  container: {
    width: '400px',
    backgroundColor: '#ecfdf5',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
    padding: '24px',
    borderRadius: '12px',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  label: {
    color: '#14532d',
    fontWeight: 'bold',
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
  backButton: {
    padding: '10px',
    backgroundColor: '#e5e7eb',
    color: '#111827',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontWeight: 'bold',
  },
  buttonGroup: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px',
    marginBottom: '8px',
  },
  plantButton: {
    padding: '6px 12px',
    border: 'none',
    borderRadius: '8px',
    fontWeight: 'bold',
    cursor: 'pointer',
  },
};

export default AddPlanttype;
