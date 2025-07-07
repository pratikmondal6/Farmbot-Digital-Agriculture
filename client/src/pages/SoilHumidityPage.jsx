import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { FaWater, FaMapMarkerAlt, FaInfoCircle, FaClipboardList, FaRegLightbulb } from 'react-icons/fa';
import { GiEarthSpit, GiWaterDrop } from 'react-icons/gi';

// CSS styles for the component
const styles = {
  emptyHistoryContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '2rem',
    backgroundColor: '#f9fafb',
    borderRadius: '8px',
    textAlign: 'center',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    margin: '1rem 0'
  },
  emptyHistoryIcon: {
    marginBottom: '1rem',
    backgroundColor: '#e0f2fe',
    borderRadius: '50%',
    width: '80px',
    height: '80px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  emptyHistoryTitle: {
    fontSize: '1.5rem',
    fontWeight: 'bold',
    color: '#1e40af',
    margin: '0.5rem 0'
  },
  emptyHistoryMessage: {
    color: '#4b5563',
    marginBottom: '1.5rem',
    maxWidth: '500px'
  },
  emptyHistoryTips: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
    backgroundColor: '#fff',
    padding: '1rem',
    borderRadius: '6px',
    border: '1px solid #e5e7eb',
    width: '100%',
    maxWidth: '500px',
    marginBottom: '1.5rem'
  },
  tip: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    textAlign: 'left'
  },
  tipIcon: {
    color: '#3b82f6',
    minWidth: '20px'
  },
  emptyHistoryNote: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '0.75rem',
    backgroundColor: '#fffbeb',
    padding: '1rem',
    borderRadius: '6px',
    border: '1px solid #fef3c7',
    width: '100%',
    maxWidth: '500px',
    textAlign: 'left'
  },
  noteIcon: {
    color: '#d97706',
    marginTop: '3px',
    minWidth: '20px'
  }
};

const SoilHumidityPage = ({ seedLocation }) => {
  const [isChecking, setIsChecking] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [humidityData, setHumidityData] = useState(null);
  const [humidityHistory, setHumidityHistory] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState(null);

  // Constants for soil sensor location
  const SOIL_SENSOR_X = 2630;
  const SOIL_SENSOR_Y = 350;
  const SOIL_SENSOR_APPROACH_Z = -350;
  const SOIL_SENSOR_ATTACH_Z = -410;
  const SOIL_SENSOR_X_OFFSET = 2580; // X position after attaching

  useEffect(() => {
    // Update selected location when seedLocation changes
    if (seedLocation && seedLocation.x && seedLocation.y) {
      setSelectedLocation(seedLocation);
    }
  }, [seedLocation]);

  useEffect(() => {
    // Fetch humidity history when component mounts
    fetchHumidityHistory();
  }, []);

  const fetchHumidityHistory = async () => {
    try {
      const response = await api.get('/api/soilHumidity');
      setHumidityHistory(response.data);
    } catch (err) {
      console.error('Failed to fetch humidity history:', err);
    }
  };

  const handleCheckHumidity = async () => {
    if (!selectedLocation) {
      setError('Please select a location on the field map first.');
      return;
    }

    setError('');
    setLoading(true);
    setIsChecking(true);
    setHumidityData(null);

    try {
      // Step 1: Move to soil sensor approach position
      await api.post('/move', { 
        x: SOIL_SENSOR_X, 
        y: SOIL_SENSOR_Y, 
        z: SOIL_SENSOR_APPROACH_Z 
      });

      // Step 2: Move to soil sensor attach position
      await api.post('/move', { 
        x: SOIL_SENSOR_X, 
        y: SOIL_SENSOR_Y, 
        z: SOIL_SENSOR_ATTACH_Z 
      });

      // Step 3: Wait 2 seconds
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Step 4: Move X to offset position (keeping Y and Z the same)
      await api.post('/move', { 
        x: SOIL_SENSOR_X_OFFSET, 
        y: SOIL_SENSOR_Y, 
        z: SOIL_SENSOR_ATTACH_Z 
      });

      // Step 5: Move to selected location
      await api.post('/move', { 
        x: selectedLocation.x, 
        y: selectedLocation.y, 
        z: SOIL_SENSOR_ATTACH_Z 
      });

      // Step 6: Check humidity at selected location
      const response = await api.post('/api/soilHumidity/check', {
        x: selectedLocation.x,
        y: selectedLocation.y,
        z: SOIL_SENSOR_ATTACH_Z
      });

      setHumidityData(response.data);

      // Refresh humidity history
      fetchHumidityHistory();

    } catch (err) {
      setError(err.response?.data?.message || 'Failed to check soil humidity. Please try again.');
    } finally {
      setLoading(false);
      setIsChecking(false);
    }
  };

  return (
    <div className="soil-humidity-page">
      <div className="soil-humidity-header">
        <h2><GiEarthSpit /> Soil Humidity Check</h2>
      </div>

      <div className="soil-humidity-content">
        <div className="soil-humidity-panel">
          <div className="panel-header">
            <h3>Check Soil Humidity</h3>
          </div>

          <div className="panel-content">
            {selectedLocation ? (
              <div className="selected-location">
                <h4><FaMapMarkerAlt /> Selected Location</h4>
                <p>X: {selectedLocation.x}, Y: {selectedLocation.y}</p>
              </div>
            ) : (
              <div className="no-location">
                <p>Please select a location on the field map.</p>
              </div>
            )}

            <button 
              className="check-humidity-btn"
              onClick={handleCheckHumidity}
              disabled={loading || !selectedLocation}
            >
              {loading ? 'Checking...' : 'Check Humidity'}
            </button>

            {error && <div className="error-message">{error}</div>}

            {humidityData && (
              <div className="humidity-result">
                <h4><FaWater /> Humidity Result</h4>
                <p className="humidity-value">{humidityData.humidity}%</p>
                <p className="humidity-timestamp">
                  Checked at: {new Date(humidityData.timestamp).toLocaleString()}
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="humidity-history-panel">
          <div className="panel-header">
            <h3>Humidity History</h3>
          </div>

          <div className="panel-content">
            {humidityHistory.length > 0 ? (
              <table className="humidity-table">
                <thead>
                  <tr>
                    <th>Location</th>
                    <th>Humidity</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {humidityHistory.map((record, index) => (
                    <tr key={index}>
                      <td>X: {record.x}, Y: {record.y}</td>
                      <td>{record.humidity}%</td>
                      <td>{new Date(record.timestamp).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div style={styles.emptyHistoryContainer}>
                <div style={styles.emptyHistoryIcon}>
                  <GiWaterDrop size={50} color="#3b82f6" />
                </div>
                <h4 style={styles.emptyHistoryTitle}>No Humidity Records Found</h4>
                <p style={styles.emptyHistoryMessage}>
                  You haven't checked soil humidity yet. Start by selecting a location on the field map and clicking the "Check Humidity" button.
                </p>
                <div style={styles.emptyHistoryTips}>
                  <div style={styles.tip}>
                    <FaMapMarkerAlt style={styles.tipIcon} size={18} />
                    <span>Select a location on the map</span>
                  </div>
                  <div style={styles.tip}>
                    <FaWater style={styles.tipIcon} size={18} />
                    <span>Click "Check Humidity" to measure soil moisture</span>
                  </div>
                  <div style={styles.tip}>
                    <FaClipboardList style={styles.tipIcon} size={18} />
                    <span>View your results in the history table</span>
                  </div>
                </div>
                <div style={styles.emptyHistoryNote}>
                  <FaRegLightbulb style={styles.noteIcon} size={18} />
                  <p>Regular soil humidity checks help optimize watering schedules and improve plant health.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SoilHumidityPage;
