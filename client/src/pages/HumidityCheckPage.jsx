import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from "../utils/api";

const HumidityCheckPage = () => {
  const navigate = useNavigate();

  const [X, setX] = useState('');
  const [Y, setY] = useState('');
  const [Z, setZ] = useState('-50'); // Default Z value for soil level
  const [SeedX, setSeedX] = useState('');
  const [SeedY, setSeedY] = useState('');
  const [isHovered, setIsHovered] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [humidityReading, setHumidityReading] = useState(null);
  const [humidityReadings, setHumidityReadings] = useState([]);
  const [showPanel, setShowPanel] = useState('check'); // 'check', 'history'

  // Fetch humidity readings when the history panel is shown
  const fetchHumidityReadings = async () => {
    try {
      const response = await api.get('/humidityCheck/readings');
      setHumidityReadings(response.data);
    } catch (err) {
      console.error('Error fetching humidity readings:', err);
      setError('Failed to fetch humidity readings');
    }
  };

  // Handle panel change
  const handlePanelChange = (panel) => {
    setShowPanel(panel);
    if (panel === 'history') {
      fetchHumidityReadings();
    }
  };

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

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  return (
    <div style={styles.container}>
      {showPanel === 'check' && (
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

          </form>
        </div>
      )}

      {showPanel === 'history' && (
        <div style={styles.historyContainer}>
          <h2 style={styles.title}>Humidity Reading History</h2>

          {humidityReadings.length === 0 ? (
            <p style={styles.noReadings}>No humidity readings found.</p>
          ) : (
            <div style={styles.readingsTable}>
              <div style={styles.tableHeader}>
                <div style={styles.tableCell}>Date</div>
                <div style={styles.tableCell}>Location (X, Y, Z)</div>
                <div style={styles.tableCell}>Seed Position (X, Y)</div>
                <div style={styles.tableCell}>Humidity</div>
              </div>

              {humidityReadings.map((reading, index) => (
                <div key={index} style={styles.tableRow}>
                  <div style={styles.tableCell}>{formatDate(reading.reading_date)}</div>
                  <div style={styles.tableCell}>
                    ({reading.x}, {reading.y}, {reading.z})
                  </div>
                  <div style={styles.tableCell}>
                    ({reading.seed_position_x}, {reading.seed_position_y})
                  </div>
                  <div style={styles.tableCell}>{reading.reading_value}%</div>
                </div>
              ))}
            </div>
          )}

        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    // height: '100vh',
    // display: 'flex',
    // flexDirection: 'column',
    // alignItems: 'center',
    margin: "10px",
    backgroundColor: '#f8fafc',
  },
  navbar: {
    width: '100%',
    backgroundColor: '#16a34a',
    color: 'white',
    fontSize: '1.8rem',
    fontWeight: 'bold',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '60px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
    position: 'fixed',
    top: 0,
    left: 0,
    zIndex: 10,
  },
  navbarbutton: {
    padding: '0.7rem',
    fontSize: '1rem',
    fontWeight: 'bold',
    color: 'white',
    cursor: 'pointer',
    border: 'none',
    margin: '0 0.5rem',
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
  historyContainer: {
    background: 'white',
    padding: '2rem',
    borderRadius: '10px',
    boxShadow: '0 0 10px rgba(0,0,0,0.1)',
    backgroundColor: '#ecfdf5',
    width: '80%',
    maxWidth: '800px',
    display: 'flex',
    flexDirection: 'column',
    marginTop: '80px',
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
  backButton: {
    padding: '0.7rem',
    fontSize: '1rem',
    fontWeight: 'bold',
    backgroundColor: '#64748b',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    transitionDuration: '0.3s',
    alignSelf: 'center',
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
  },
  readingsTable: {
    width: '100%',
    borderCollapse: 'collapse',
    marginTop: '1rem',
  },
  tableHeader: {
    display: 'flex',
    backgroundColor: '#dcfce7',
    fontWeight: 'bold',
    borderBottom: '2px solid #22c55e',
  },
  tableRow: {
    display: 'flex',
    borderBottom: '1px solid #d1fae5',
  },
  tableCell: {
    flex: 1,
    padding: '0.75rem',
    textAlign: 'center',
  },
  noReadings: {
    textAlign: 'center',
    color: '#64748b',
    marginTop: '1rem',
    marginBottom: '1rem',
  }
};

export default HumidityCheckPage;
