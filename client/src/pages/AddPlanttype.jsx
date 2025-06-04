import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AddPlanttype = () => {
  const navigate = useNavigate(); // React Router for navigation

  // States
  const [plantTypes, setPlantTypes] = useState([]);
  const [plantType, setPlantType] = useState('');
  const [newPlantType, setNewPlantType] = useState('');
  const [depth, setDepth] = useState('');
  const [distance, setDistance] = useState('');
  const [error, setError] = useState('');
  const [distanceError, setDistanceError] = useState('');

  // Fetch plant types on mount
  useEffect(() => {
    fetch('/api/plant/types')
      .then(res => res.json())
      .then(data => setPlantTypes(data))
      .catch(() => console.error('Failed to fetch plant types'));
  }, []);

  // Handle plant selection from dropdown
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

  // Validate depth input
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

  // Validate distance input
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

  // Save everything (optionally add new plant type first)
  const saveAll = async () => {
    if (!depth || !distance) {
      alert('Please fill in all fields.');
      return;
    }

    const depthNum = Number(depth);
    const distNum = Number(distance);
    if (
      isNaN(depthNum) || depthNum > 0 || depthNum < -40 ||
      isNaN(distNum) || distNum < 50 || distNum > 1000
    ) {
      alert('Please enter valid values.');
      return;
    }

    let finalPlantType = plantType;

    // Add new plant type if entered
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

    // Save plant data
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
      {/* Left: Form */}
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

      {/* Right: List of plant types */}
      <div style={styles.list}>
        <h3 style={styles.listTitle}>Saved Plant Types</h3>
        <ul style={styles.ul}>
          {plantTypes.map((type) => (
            <li key={type} style={styles.li}>🌱 {type}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

// Styles
const styles = {
  wrapper: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '40px',
    padding: '40px',
  },
  container: {
    width: '350px',
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
  backButton: {
    padding: '10px',
    backgroundColor: '#e5e7eb',
    color: '#111827',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontWeight: 'bold',
  },
  list: {
    backgroundColor: '#f0fdf4',
    padding: '20px',
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
    minWidth: '220px',
    maxHeight: '500px',
    overflowY: 'auto',
  },
  listTitle: {
    fontSize: '18px',
    marginBottom: '10px',
    color: '#14532d',
    fontWeight: 'bold',
  },
  ul: {
    listStyleType: 'none',
    padding: 0,
    margin: 0,
  },
  li: {
    backgroundColor: '#dcfce7',
    marginBottom: '8px',
    padding: '6px 10px',
    borderRadius: '6px',
    fontWeight: '500',
    color: '#065f46',
  },
};

export default AddPlanttype;
