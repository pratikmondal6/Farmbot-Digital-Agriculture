import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';

const AddPlanttype = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [plantTypes, setPlantTypes] = useState([]);
  const [plantType, setPlantType] = useState('');
  const [newPlantType, setNewPlantType] = useState('');
  const [depth, setDepth] = useState('');
  const [distance, setDistance] = useState('');
  const [error, setError] = useState('');
  const [distanceError, setDistanceError] = useState('');

  useEffect(() => {
    if (isOpen) {
      loadPlantTypes();
    }
  }, [isOpen]);

  const loadPlantTypes = async () => {
    try {
      const response = await api.get('/api/plant/types');
      setPlantTypes(response.data);
    } catch {
      console.error('Error while loading Planttypes');
    }
  };

  const handlePlantClick = async (type) => {
    setPlantType(type);
    setNewPlantType(type);
    try {
      const res = await api.get(`/api/plant/details/${type}`);
      setDepth(res.data.seeding_depth);
      setDistance(res.data.minimal_distance);
    } catch {
      console.error('Error while loading plant details');
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
      if (plantTypes.includes(newPlantType)) {
        // Update existing plant type
        const response = await api.put('/api/plant/update', {
          plantType: plantType,
          newPlantType: newPlantType,
          depth: Number(depth),
          distance: Number(distance),
        });
        const result = response.data;
        alert('Planttype changed');
      } else {
        // Add new plant type with all details
        const response = await api.post('/api/plant/add-type', {
          plant_type: newPlantType.trim(),
          minimal_distance: Number(distance),
          seeding_depth: Number(depth)
        });
        const result = response.data;
        alert('New Planttype created');
      }

      setPlantType('');
      setNewPlantType('');
      setDepth('');
      setDistance('');
      loadPlantTypes();
    } catch (err) {
      alert(err.response?.data?.error || 'Fehler beim Speichern');
    }
  };

  return (
    <div style={styles.wrapper}>
      <button onClick={() => setIsOpen(!isOpen)} style={styles.toggleButton}>
        {isOpen ? '✖ Close' : '➕ Create Planttype'}
      </button>

      {isOpen && (
        <div style={styles.container}>
          <label style={styles.label}>Choose Planttype:</label>
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
            New Planttype:
            <input
              type="text"
              value={newPlantType}
              onChange={(e) => setNewPlantType(e.target.value)}
              style={{ ...styles.input, backgroundColor: plantType ? '#f3f4f6' : 'white' }}
              disabled={!!plantType}
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
          {error && <div style={styles.error}>{error}</div>}

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
          {distanceError && <div style={styles.error}>{distanceError}</div>}

          <button onClick={saveAll} style={styles.button}>Speichern</button>
          <button onClick={() => navigate('/')} style={styles.backButton}>← Zurück</button>
        </div>
      )}
    </div>
  );
};

const styles = {
  wrapper: {
    padding: '10px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
  },
  toggleButton: {
    padding: '10px 16px',
    backgroundColor: '#14b8a6',
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
