import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from "../utils/api";

// This component has been updated to remove the humidity check table
// and add a button to put back the sensor

const HumidityCheckPage = () => {
  const navigate = useNavigate();

  const [X, setX] = useState('');
  const [Y, setY] = useState('');
  const [Z, setZ] = useState('-50'); // Default Z value for soil level
  const [SeedX, setSeedX] = useState('');
  const [SeedY, setSeedY] = useState('');
  const [isHovered, setIsHovered] = useState(false);
  const [isSensorButtonHovered, setIsSensorButtonHovered] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [sensorLoading, setSensorLoading] = useState(false);
  const [humidityReading, setHumidityReading] = useState(null);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setHumidityReading(null);
    setLoading(true);

    try {
      const data = {
        x: X,
        y: Y,
        z: Z,
        seedX: SeedX,
        seedY: SeedY
      };

      const response = await api.post('/humidityCheck/check', data);
      setSuccess('Humidity check completed successfully!');
      setHumidityReading(response.data.reading);
    } catch (err) {
      console.error('An error occurred during humidity check:', err);
      setError(
        err.response?.data?.message || 'An error occurred during humidity check: ' + err
      );
    } finally {
      setLoading(false);
    }
  };

  // Handle put back sensor button click
  const handlePutBackSensor = async () => {
    setError('');
    setSuccess('');
    setSensorLoading(true);

    try {
      // First move to the coordinates where the sensor was used
      const moveToCoordinatesData = {
        x: parseInt(X),
        y: parseInt(Y),
        z: parseInt(Z)
      };

      await api.post('/moveRelative', moveToCoordinatesData);

      // Then move to depth of 300
      const moveToDepthData = {
        z: 300
      };

      await api.post('/moveRelative', moveToDepthData);

      setSuccess('Sensor put back successfully!');
    } catch (err) {
      console.error('An error occurred while putting back the sensor:', err);
      setError(
        err.response?.data?.message || 'An error occurred while putting back the sensor: ' + err
      );
    } finally {
      setSensorLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div>
        <form onSubmit={handleSubmit} style={styles.form}>
          <h2 style={styles.title}>Soil Humidity Check</h2>

          {error && <p style={styles.error}>{error}</p>}
          {success && <p style={styles.success}>{success}</p>}

          {humidityReading !== null && (
            <div style={styles.readingContainer}>
              <h3 style={styles.readingTitle}>Humidity Reading</h3>
              <p style={styles.readingValue}>{humidityReading}%</p>
            </div>
          )}

          <label style={styles.label}>Seed Plate Position</label>
          <div style={{display: 'flex', justifyContent: 'left'}}>
            <input
              type="number"
              name="seedX"
              value={SeedX}
              onChange={(e) => setSeedX(e.target.value)}
              placeholder="Seed X"
              style={{...styles.input, width: '40%', marginRight: '1rem'}}
              required
            />
            <input
              type="number"
              name="seedY"
              value={SeedY}
              onChange={(e) => setSeedY(e.target.value)}
              placeholder="Seed Y"
              style={{...styles.input, width: '40%'}}
              required
            />
          </div>

          <label style={styles.label}>Check Location</label>
          <div style={{display: 'flex', justifyContent: 'left'}}>
            <input
              type="number"
              name="X"
              value={X}
              onChange={(e) => setX(e.target.value)}
              placeholder="X"
              style={{...styles.input, width: '40%', marginRight: '1rem'}}
              required
            />
            <input
              type="number"
              name="Y"
              value={Y}
              onChange={(e) => setY(e.target.value)}
              placeholder="Y"
              style={{...styles.input, width: '40%'}}
              required
            />
          </div>

          <label style={styles.label}>Depth (Z)</label>
          <input
            type="number"
            name="Z"
            value={Z}
            onChange={(e) => setZ(e.target.value)}
            placeholder="Z"
            style={styles.input}
            required
          />

          <button
            type="submit"
            disabled={!X || !Y || !Z || !SeedX || !SeedY || loading}
            style={{
              ...styles.button,
              ...(isHovered ? styles.buttonHover : {}),
              ...(!X || !Y || !Z || !SeedX || !SeedY || loading ? styles.buttonDisabled : {})
            }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            {loading ? 'Checking...' : 'Check Humidity'}
          </button>

          <button
            type="button"
            onClick={handlePutBackSensor}
            disabled={sensorLoading}
            style={{
              ...styles.button,
              marginTop: '1rem',
              backgroundColor: '#3b82f6',
              ...(isSensorButtonHovered ? styles.buttonHover : {}),
              ...(sensorLoading ? styles.buttonDisabled : {})
            }}
            onMouseEnter={() => setIsSensorButtonHovered(true)}
            onMouseLeave={() => setIsSensorButtonHovered(false)}
          >
            {sensorLoading ? 'Moving Sensor...' : 'Put Back Sensor'}
          </button>
        </form>
      </div>
    </div>
  );
};

const styles = {
  // Styles have been cleaned up to remove any table-related styles
  container: {
    margin: "10px",
    backgroundColor: '#f8fafc',
  },
  form: {
    background: 'white',
    padding: '2rem',
    borderRadius: '10px',
    boxShadow: '0 0 10px rgba(0,0,0,0.1)',
    backgroundColor: '#ecfdf5',
    width: '300px',
    display: 'flex',
    flexDirection: 'column',
  },
  title: {
    marginBottom: '1rem',
    fontSize: '1.3rem',
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#14532d'
  },
  label: {
    margin: '0.5rem 0 0.2rem',
    fontWeight: 'bold',
    color: '#14532d',
    transition: 'color 0.3s ease',
  },
  input: {
    padding: '0.5rem',
    fontSize: '1rem',
    fontWeight: 'bold',
    borderRadius: '5px',
    border: '1px solid #ccc',
    marginBottom: '1rem',
  },
  button: {
    padding: '0.7rem',
    fontSize: '1rem',
    fontWeight: 'bold',
    backgroundColor: '#22c55e',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    transitionDuration: '0.3s'
  },
  buttonHover: {
    backgroundColor: 'rgb(0, 163, 60)',
    transform: 'scale(1.05)',
  },
  buttonDisabled: {
    backgroundColor: '#cccccc',
    cursor: 'not-allowed',
    transform: 'none',
  },
  error: {
    color: '#ef4444',
    backgroundColor: '#fee2e2',
    border: '1px solid #ef4444',
    padding: '0.6rem',
    borderRadius: '5px',
    fontSize: '0.9rem',
    marginBottom: '1rem',
    textAlign: 'center',
    transition: '0.3s'
  },
  success: {
    color: '#14532d',
    backgroundColor: 'rgb(211, 245, 204)',
    border: '1px solid #22c55e',
    padding: '0.6rem',
    borderRadius: '5px',
    fontSize: '0.9rem',
    marginBottom: '1rem',
    textAlign: 'center',
    transition: '0.3s'
  },
  readingContainer: {
    backgroundColor: '#f0fdfa',
    border: '2px solid #0d9488',
    borderRadius: '8px',
    padding: '1rem',
    marginBottom: '1.5rem',
    textAlign: 'center',
  },
  readingTitle: {
    color: '#0f766e',
    fontSize: '1.1rem',
    marginBottom: '0.5rem',
  },
  readingValue: {
    color: '#0f766e',
    fontSize: '2rem',
    fontWeight: 'bold',
  }
};

export default HumidityCheckPage;
