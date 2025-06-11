import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { useNavigate } from 'react-router-dom';
import { FaArrowUp, FaArrowDown, FaArrowLeft, FaArrowRight, FaHome } from 'react-icons/fa';

const MOVE_UNITS = [1, 10, 100, 1000];

const FarmbotMoving = () => {
  const navigate = useNavigate();
  const [isMoving, setIsMoving] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPanel, setShowPanel] = useState(true);
  const [moveUnit, setMoveUnit] = useState(10);
  const [coord, setCoord] = useState({ x: '', y: '', z: '' });
  const [coordError, setCoordError] = useState({ x: '', y: '', z: '' });

  useEffect(() => {
    const token = sessionStorage.getItem("token");
    if (!token) {
      navigate("/login");
    }
  }, [navigate]);

  const handleTabDoubleClick = () => setShowPanel((prev) => !prev);

  const handleCoordChange = (axis, value) => {
    setCoord((prev) => ({ ...prev, [axis]: value }));

    let error = '';
    const num = Number(value);
    if (value === '' || isNaN(num)) {
      error = 'Please enter a number.';
    } else {
      if (axis === 'x' && (num < 0 || num > 2600)) error = 'Length must be 0 - 2600 mm';
      if (axis === 'y' && (num < 0 || num > 1200)) error = 'Width must be 0 - 1200 mm';
      if (axis === 'z' && (num > 0 || num < -1000)) error = 'Height must be 0 to -1000 mm';
    }
    setCoordError((prev) => ({ ...prev, [axis]: error }));
  };

  const handleMoveToCoord = async (customCoord) => {
    setError('');
    setLoading(true);
    setIsMoving(true);
    try {
      const { x, y, z } = customCoord || coord;
      const nx = Number(x);
      const ny = Number(y);
      const nz = Number(z);

      // Restriction checks
      if (
        isNaN(nx) || isNaN(ny) || isNaN(nz) ||
        nx < 0 || nx > 2600 ||
        ny < 0 || ny > 1200 ||
        nz > 0 || nz < -1000
      ) {
        setError('Please enter valid numbers for Length (0 - 2600), Width (0 - 1200), Height (0 to -1000).');
        setLoading(false);
        setIsMoving(false);
        return;
      }
      const response = await api.post('/move', { x: nx, y: ny, z: nz });
      const result = response.data;
      console.log('Move to coordinate success:', result);
    } catch (err) {
      setError(err.response?.data?.message || 'Move to coordinate failed. Please try again.');
    } finally {
      setLoading(false);
      setIsMoving(false);
    }
  };

  const handleMoveRelative = (axis, delta) => {
    const x = Number(coord.x) || 0;
    const y = Number(coord.y) || 0;
    const z = Number(coord.z) || 0;
    let newCoord = { x, y, z };
    newCoord[axis] += delta;
    setCoord(newCoord);
    handleMoveToCoord(newCoord);
  };

  return (
    <>
      <div style={styles.header}>
        <span></span>
        <button
          style={{
            ...styles.tabButton,
            width: 48,
            height: 48,
            minWidth: 48,
            minHeight: 48,
            marginRight: 16,
            padding: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: showPanel ? '#22c55e' : '#16a34a',
          }}
          onClick={handleTabDoubleClick}
          title="Expand/collapse movement panel"
        >
          <span role="img" aria-label="control-panel" style={{ fontSize: 24 }}>🕹️</span>
        </button>
      </div>
      {showPanel && (
        <div style={styles.fixedPanel}>
          <div style={styles.panel}>
            {/* Units Selection */}
            <div style={styles.unitsPanel}>
              <div style={styles.unitsLabel}>Select a unit:</div>
              <div style={styles.unitsList}>
                {MOVE_UNITS.map(unit => (
                  <button
                    key={unit}
                    style={{
                      ...styles.unitButton,
                      backgroundColor: moveUnit === unit ? '#22c55e' : '#fff',
                      color: moveUnit === unit ? '#fff' : '#14532d',
                      borderColor: moveUnit === unit ? '#22c55e' : '#22c55e',
                    }}
                    onClick={() => setMoveUnit(unit)}
                    disabled={loading}
                  >
                    {unit} mm
                  </button>
                ))}
              </div>
            </div>
            {/* Movement Grid */}
            <div style={styles.moveGrid}>
              {/* XY Grid */}
              <div style={styles.xyGrid}>
                {/* Add label for length and width control */}
                <div style={{ fontWeight: 'bold', color: '#14532d', marginBottom: 4, fontSize: '1rem' }}>
                  Control length and width:
                </div>
                <div style={styles.labelRow}>
                  {/* (no axis label) */}
                </div>
                <button
                  style={styles.arrowButton}
                  onClick={() => handleMoveRelative('y', moveUnit)}
                  disabled={loading}
                  title="Move up (width)"
                >
                  <FaArrowUp />
                </button>
                <div style={styles.middleRow}>
                  <button
                    style={styles.arrowButton}
                    onClick={() => handleMoveRelative('x', -moveUnit)}
                    disabled={loading}
                    title="Move left (length)"
                  >
                    <FaArrowLeft />
                  </button>
                  <div style={styles.centerDot}></div>
                  <button
                    style={styles.arrowButton}
                    onClick={() => handleMoveRelative('x', moveUnit)}
                    disabled={loading}
                    title="Move right (length)"
                  >
                    <FaArrowRight />
                  </button>
                </div>
                <button
                  style={styles.arrowButton}
                  onClick={() => handleMoveRelative('y', -moveUnit)}
                  disabled={loading}
                  title="Move down (width)"
                >
                  <FaArrowDown />
                </button>
                <div style={styles.labelRow}>
                  {/* (no axis label) */}
                </div>
              </div>
              {/* Z Axis Panel */}
              <div style={styles.zPanel}>
                {/* Add label for height control */}
                <div style={{ fontWeight: 'bold', color: '#14532d', marginBottom: 4, fontSize: '1rem' }}>
                  Control height:
                </div>
                <button
                  style={styles.arrowButton}
                  onClick={() => handleMoveRelative('z', moveUnit)}
                  disabled={loading}
                  title="Move up (Height)"
                >
                  <FaArrowUp />
                </button>
                <button
                  style={styles.arrowButton}
                  onClick={() => handleMoveRelative('z', -moveUnit)}
                  disabled={loading}
                  title="Move down (Height)"
                >
                  <FaArrowDown />
                </button>
                <button
                  style={{
                    ...styles.arrowButton,
                    borderRadius: '50%',
                    padding: 8,
                    fontSize: '1.2rem',
                    minWidth: 40,
                    minHeight: 40,
                    marginTop: 12
                  }}
                  onClick={() => {
                    setCoord({ x: 0, y: 0, z: 0 });
                    handleMoveToCoord({ x: 0, y: 0, z: 0 });
                  }}
                  disabled={loading}
                  title="Move to Home Position"
                >
                  <FaHome />
                </button>
              </div>
            </div>
            {/* Move to coordinate */}
            <div style={styles.coordPanel}>
              <div style={styles.coordLabel}>Move to coordinate:</div>
              <div style={styles.coordInputs}>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <input
                    style={styles.coordInput}
                    type="number"
                    placeholder="Length"
                    value={coord.x}
                    onChange={e => handleCoordChange('x', e.target.value)}
                    disabled={loading}
                    min={0}
                    max={2600}
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <input
                    style={styles.coordInput}
                    type="number"
                    placeholder="Width"
                    value={coord.y}
                    onChange={e => handleCoordChange('y', e.target.value)}
                    disabled={loading}
                    min={0}
                    max={1200}
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <input
                    style={styles.coordInput}
                    type="number"
                    placeholder="Height"
                    value={coord.z}
                    onChange={e => handleCoordChange('z', e.target.value)}
                    disabled={loading}
                    min={-800}
                    max={0}
                  />
                </div>
                <button
                  style={styles.coordButton}
                  onClick={handleMoveToCoord}
                  disabled={loading || coordError.x || coordError.y || coordError.z}
                >
                  Move
                </button>
              </div>
              {(coordError.x || coordError.y || coordError.z) && (
                <div style={styles.coordErrorMsgGroup}>
                  {[coordError.x, coordError.y, coordError.z]
                    .filter(Boolean)
                    .map((msg, idx) => (
                      <div key={idx}>{msg}</div>
                    ))}
                </div>
              )}
            </div>
            {/* Status messages INSIDE the panel */}
            {error && <p style={styles.error}>{error}</p>}
            {isMoving && <p style={styles.moving}>Moving...</p>}
            
          </div>
        </div>
      )}
    </>
  );
};

export default FarmbotMoving;

// --- Styles ---
const styles = {
  header: {
    position: 'fixed',
    top: 0,
    right: 0,
    height: '100vh',
    width: 72,
    background: '#16a34a',
    color: 'white',
    fontWeight: 'bold',
    fontSize: '2rem',
    padding: '0',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'flex-start',
    letterSpacing: '1px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
    borderRadius: 0,
    zIndex: 1, // LOWER z-index for background
  },
  fixedPanel: {
    position: 'fixed',
    top: 72, // below header
    right: 0,
    zIndex: 100, // HIGHER z-index for foreground
    minWidth: 320,
    maxWidth: '60vw',
    background: 'transparent',
    paddingTop: 0,
    boxSizing: 'border-box',
  },
  page: {
    minHeight: '100vh',
    background: 'transparent',
    display: 'block',
  },
  tabButton: {
    width: 48,
    height: 48,
    minWidth: 48,
    minHeight: 48,
    marginRight: 16,
    padding: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    fontWeight: 'bold',
    fontSize: '1.1rem',
    cursor: 'pointer',
    userSelect: 'none',
    border: 'none',
    background: '#22c55e',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
    transition: 'background 0.2s',
    zIndex: 201,
  },
  panel: {
    background: '#ecfdf5',
    borderRadius: '0 0 16px 16px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.10)',
    padding: '16px 16px 12px 16px', // was 32px 32px 24px 32px
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end', // align content to the right
    minWidth: 320, // was 480
    marginBottom: 0,
  },
  moveGrid: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12, // was 32, now reduced
    marginTop: 16,
  },
  unitsPanel: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    marginRight: 16,
    marginTop: 0,
    marginBottom: 8,
  },
  unitsLabel: {
    fontWeight: 'bold',
    color: '#14532d',
    fontSize: '1rem',
    marginBottom: 4,
    marginLeft: 0,
  },
  unitsList: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  unitButton: {
    padding: '4px 10px',
    borderRadius: '6px',
    border: '2px solid #22c55e',
    fontWeight: 'bold',
    fontSize: '0.9rem',
    cursor: 'pointer',
    transition: 'background 0.2s, color 0.2s',
  },
  xyGrid: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 8,
    minWidth: 180,
  },
  zPanel: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    marginLeft: 24,
    gap: 12,
    minWidth: 80,
    marginTop: 0,
  },
  depthLabel: {
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#14532d',
    fontSize: '1.1rem',
    letterSpacing: '1px',
  },
  labelRow: {
    height: 18,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  labelCol: {
    width: 28,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  axisLabel: {
    color: '#14532d',
    fontWeight: 'bold',
    fontSize: '0.8rem', // smaller text
    marginBottom: 2,
  },
  middleRow: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  arrowButton: {
    padding: '4px',
    fontSize: '1rem',
    borderRadius: '8px',
    border: '2px solid #22c55e',
    backgroundColor: '#fff',
    color: '#14532d',
    cursor: 'pointer',
    minWidth: '40px',
    minHeight: '40px',
    boxShadow: '0 1px 4px rgba(34,197,94,0.08)',
    transition: 'background 0.2s, color 0.2s',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  centerDot: {
    width: '18px',
    height: '18px',
    borderRadius: '50%',
    backgroundColor: '#22c55e',
    margin: '0 10px',
  },
  homeButton: {
    marginTop: 0,
    padding: '12px 32px',
    borderRadius: '8px',
    border: '2px solid #22c55e',
    backgroundColor: '#fff',
    color: '#14532d',
    fontWeight: 'bold',
    fontSize: '1.1rem',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    boxShadow: '0 1px 4px rgba(34,197,94,0.08)',
    transition: 'background 0.2s, color 0.2s',
  },
  coordPanel: {
    marginTop: 24,
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: 8,
  },
  coordLabel: {
    fontWeight: 'bold',
    color: '#14532d',
    fontSize: '1rem',
    marginBottom: 4,
  },
  coordInputs: {
    display: 'flex',
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  coordInput: {
    width: 60,
    padding: '4px 6px', // slightly smaller
    borderRadius: '4px',
    border: '1px solid #22c55e',
    fontSize: '0.85rem',
  },
  coordButton: {
    padding: '6px 16px',
    borderRadius: '6px',
    border: '2px solid #22c55e',
    fontWeight: 'bold',
    fontSize: '1rem',
    cursor: 'pointer',
    backgroundColor: '#22c55e',
    color: '#fff',
    transition: 'background 0.2s, color 0.2s',
  },
  error: {
    color: '#dc2626',
    fontWeight: 'bold',
    marginBottom: 12,
    marginTop: 8,
  },
  moving: {
    color: '#14532d',
    fontWeight: 'bold',
    textAlign: 'left',
  },
  coordErrorMsgGroup: {
    color: '#dc2626',
    fontWeight: 'bold',
    fontSize: '0.95rem',
    marginTop: '10px',
    marginBottom: '14px',
    textAlign: 'left', // <-- changed from 'right' to 'left'
    minHeight: '20px',
    letterSpacing: '0.2px',
    lineHeight: 1.4,
    width: '100%',
    alignSelf: 'flex-end',
  },
};