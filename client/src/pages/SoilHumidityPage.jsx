import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { FaWater, FaMapMarkerAlt, FaInfoCircle, FaTint } from 'react-icons/fa';
import { GiEarthSpit } from 'react-icons/gi';
import { WiHumidity } from 'react-icons/wi';

// Component for soil humidity checking

const SoilHumidityPage = ({ seedLocation }) => {
  const [isChecking, setIsChecking] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [humidityData, setHumidityData] = useState(null);
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
      // Get the auth token - assuming it's stored in sessionStorage
      const token = sessionStorage.getItem('token');

      if (!token) {
        setError('Authentication token not found. Please log in again.');
        setLoading(false);
        setIsChecking(false);
        return;
      }

      // Set headers with auth token
      const headers = {
        'auth-token': token
      };

      // Use the new read-sensor endpoint that handles the entire sequence in one request
      const response = await api.post('/api/soilHumidity/read-sensor', {
        targetX: selectedLocation.x,
        targetY: selectedLocation.y,
        targetZ: SOIL_SENSOR_ATTACH_Z
      }, { headers });

      // Check if there's a warning in the response
      if (response.data.warning) {
        setError(`Warning: ${response.data.warning}`);
      }

      setHumidityData(response.data);

    } catch (err) {
      console.error('Error checking humidity:', err);
      setError(
        err.response?.data?.error || 
        err.response?.data?.message || 
        'Failed to check soil humidity. Please try again.'
      );
    } finally {
      setLoading(false);
      setIsChecking(false);
    }
  };

  // New styles for enhanced UI
  const enhancedStyles = {
    container: {
      maxWidth: '800px',
      margin: '0 auto',
      padding: '2rem',
      backgroundColor: '#f8fafc',
      borderRadius: '12px',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    },
    header: {
      display: 'flex',
      alignItems: 'center',
      marginBottom: '2rem',
      borderBottom: '2px solid #e2e8f0',
      paddingBottom: '1rem',
    },
    headerIcon: {
      fontSize: '2rem',
      color: '#3b82f6',
      marginRight: '1rem',
    },
    headerTitle: {
      fontSize: '1.8rem',
      fontWeight: 'bold',
      color: '#1e40af',
      margin: 0,
    },
    panel: {
      backgroundColor: 'white',
      borderRadius: '8px',
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
      overflow: 'hidden',
    },
    panelHeader: {
      backgroundColor: '#3b82f6',
      color: 'white',
      padding: '1rem',
      fontWeight: 'bold',
      fontSize: '1.2rem',
    },
    panelContent: {
      padding: '1.5rem',
    },
    locationContainer: {
      display: 'flex',
      alignItems: 'center',
      backgroundColor: '#f1f5f9',
      padding: '1rem',
      borderRadius: '6px',
      marginBottom: '1.5rem',
    },
    locationIcon: {
      color: '#f97316',
      fontSize: '1.5rem',
      marginRight: '0.75rem',
    },
    locationText: {
      margin: 0,
      fontWeight: 'bold',
    },
    locationCoords: {
      margin: '0.5rem 0 0 0',
      color: '#64748b',
    },
    noLocationText: {
      color: '#94a3b8',
      fontStyle: 'italic',
      margin: '0 0 1.5rem 0',
    },
    button: {
      backgroundColor: '#3b82f6',
      color: 'white',
      border: 'none',
      padding: '0.75rem 1.5rem',
      borderRadius: '6px',
      fontWeight: 'bold',
      cursor: 'pointer',
      transition: 'background-color 0.2s',
      width: '100%',
      fontSize: '1rem',
      marginBottom: '1.5rem',
    },
    buttonHover: {
      backgroundColor: '#2563eb',
    },
    buttonDisabled: {
      backgroundColor: '#94a3b8',
      cursor: 'not-allowed',
    },
    errorMessage: {
      backgroundColor: '#fee2e2',
      color: '#b91c1c',
      padding: '0.75rem',
      borderRadius: '6px',
      marginBottom: '1.5rem',
      display: 'flex',
      alignItems: 'center',
    },
    errorIcon: {
      marginRight: '0.5rem',
      color: '#ef4444',
    },
    humidityResult: {
      backgroundColor: '#f0f9ff',
      borderRadius: '8px',
      padding: '1.5rem',
      border: '1px solid #bae6fd',
    },
    humidityHeader: {
      display: 'flex',
      alignItems: 'center',
      marginBottom: '1rem',
      color: '#0369a1',
      fontWeight: 'bold',
      fontSize: '1.2rem',
    },
    humidityIcon: {
      marginRight: '0.75rem',
      fontSize: '1.5rem',
      color: '#0ea5e9',
    },
    humidityValue: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      marginBottom: '1rem',
    },
    percentageDisplay: {
      fontSize: '3rem',
      fontWeight: 'bold',
      color: '#0369a1',
      margin: '0.5rem 0',
    },
    moistureLevel: {
      padding: '0.5rem 1rem',
      borderRadius: '20px',
      fontWeight: 'bold',
      marginBottom: '1rem',
      textAlign: 'center',
      width: 'fit-content',
      margin: '0 auto',
    },
    timestamp: {
      color: '#64748b',
      fontSize: '0.9rem',
      textAlign: 'center',
      marginTop: '1rem',
    },
  };

  // Function to get moisture level style based on humidity percentage
  const getMoistureLevelStyle = (humidity) => {
    if (humidity >= 80) {
      return {
        backgroundColor: '#dcfce7',
        color: '#166534',
        border: '1px solid #86efac',
      };
    } else if (humidity >= 60) {
      return {
        backgroundColor: '#d1fae5',
        color: '#065f46',
        border: '1px solid #6ee7b7',
      };
    } else if (humidity >= 40) {
      return {
        backgroundColor: '#ecfccb',
        color: '#3f6212',
        border: '1px solid #bef264',
      };
    } else if (humidity >= 20) {
      return {
        backgroundColor: '#fef9c3',
        color: '#854d0e',
        border: '1px solid #fde047',
      };
    } else {
      return {
        backgroundColor: '#fee2e2',
        color: '#b91c1c',
        border: '1px solid #fca5a5',
      };
    }
  };

  // Function to get moisture level text based on humidity percentage
  const getMoistureLevelText = (humidity) => {
    if (humidity >= 80) return 'Very Wet';
    if (humidity >= 60) return 'Wet';
    if (humidity >= 40) return 'Moist';
    if (humidity >= 20) return 'Dry';
    return 'Very Dry';
  };

  return (
    <div style={enhancedStyles.container}>
      <div style={enhancedStyles.header}>
        <GiEarthSpit style={enhancedStyles.headerIcon} />
        <h2 style={enhancedStyles.headerTitle}>Soil Humidity Check</h2>
      </div>

      <div style={enhancedStyles.panel}>
        <div style={enhancedStyles.panelHeader}>
          <h3 style={{ margin: 0 }}>Check Soil Humidity</h3>
        </div>

        <div style={enhancedStyles.panelContent}>
          {selectedLocation ? (
            <div style={enhancedStyles.locationContainer}>
              <FaMapMarkerAlt style={enhancedStyles.locationIcon} />
              <div>
                <p style={enhancedStyles.locationText}>Selected Location</p>
                <p style={enhancedStyles.locationCoords}>X: {selectedLocation.x}, Y: {selectedLocation.y}</p>
              </div>
            </div>
          ) : (
            <div style={enhancedStyles.noLocationText}>
              <p>Please select a location on the field map.</p>
            </div>
          )}

          <button 
            style={{
              ...enhancedStyles.button,
              ...(loading || !selectedLocation ? enhancedStyles.buttonDisabled : {}),
              ':hover': enhancedStyles.buttonHover
            }}
            onClick={handleCheckHumidity}
            disabled={loading || !selectedLocation}
          >
            {loading ? 'Checking...' : 'Check Humidity'}
          </button>

          {error && (
            <div style={enhancedStyles.errorMessage}>
              <FaInfoCircle style={enhancedStyles.errorIcon} />
              {error}
            </div>
          )}

          {humidityData && (
            <div style={enhancedStyles.humidityResult}>
              <div style={enhancedStyles.humidityHeader}>
                <WiHumidity style={enhancedStyles.humidityIcon} />
                <span>Soil Moisture at Selected Location</span>
              </div>

              <div style={enhancedStyles.humidityValue}>
                <span style={enhancedStyles.percentageDisplay}>
                  {humidityData.humidity}%
                </span>
                <div 
                  style={{
                    ...enhancedStyles.moistureLevel,
                    ...getMoistureLevelStyle(humidityData.humidity)
                  }}
                >
                  {getMoistureLevelText(humidityData.humidity)}
                </div>
              </div>

              <p style={enhancedStyles.timestamp}>
                Checked at: {new Date(humidityData.timestamp).toLocaleString()}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SoilHumidityPage;
