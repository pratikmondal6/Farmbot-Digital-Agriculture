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

  useEffect(() => {
    const token = sessionStorage.getItem("token");
    if (!token) {
      navigate("/login");
    }
  }, [navigate]);

  const handleTabDoubleClick = () => setShowPanel((prev) => !prev);

  const handleCoordChange = (axis, value) => {
    setCoord((prev) => ({ ...prev, [axis]: value }));
  };

  const handleMoveToCoord = async (customCoord) => {
    setError('');
    setLoading(true);
    setIsMoving(true);
    try {
      // Ensure numbers are sent
      const { x, y, z } = customCoord || coord;
      const nx = Number(x);
      const ny = Number(y);
      const nz = Number(z);
      if (isNaN(nx) || isNaN(ny) || isNaN(nz)) {
        setError('Please enter valid numbers for X, Y, and Z.');
        setLoading(false);
        setIsMoving(false);
        return;
      }
      console.log('Sending to backend:', { x: nx, y: ny, z: nz });
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
            backgroundColor: showPanel ? '#22c55e' : '#16a34a',
          }}
          onClick={handleTabDoubleClick}
          title="Expand/collapse movement panel"
        >
          FarmBot Movement Panel
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
              {/* Home Button */}
              <div style={styles.homePanel}>
                <button
                  style={styles.homeButton}
                  onClick={() => handleMoveToCoord({ x: 0, y: 0, z: 0 })}
                  disabled={loading}
                  title="Move to Home Position"
                >
                  <FaHome style={{ marginRight: 8 }} /> Home
                </button>
              </div>
              {/* XY Grid */}
              <div style={styles.xyGrid}>
                <div style={styles.labelRow}>
                  <span style={styles.axisLabel}>+Y</span>
                </div>
                <button
                  style={styles.arrowButton}
                  onClick={() => handleMoveRelative('y', moveUnit)} // for +Y
                  disabled={loading}
                  title="Y Up"
                >
                  <FaArrowUp />
                </button>
                <div style={styles.middleRow}>
                  <span style={styles.axisLabel}>-X</span>
                  <button
                    style={styles.arrowButton}
                    onClick={() => handleMoveRelative('x', -moveUnit)} // for -X
                    disabled={loading}
                    title="X Left"
                  >
                    <FaArrowLeft />
                  </button>
                  <div style={styles.centerDot}></div>
                  <button
                    style={styles.arrowButton}
                    onClick={() => handleMoveRelative('x', moveUnit)}  // for +X
                    disabled={loading}
                    title="X Right"
                  >
                    <FaArrowRight />
                  </button>
                  <span style={styles.axisLabel}>+X</span>
                </div>
                <button
                  style={styles.arrowButton}
                  onClick={() => handleMoveRelative('y', -moveUnit)} // for -Y
                  disabled={loading}
                  title="Y Down"
                >
                  <FaArrowDown />
                </button>
                <div style={styles.labelRow}>
                  <span style={styles.axisLabel}>-Y</span>
                </div>
              </div>
              {/* Z Axis Panel */}
              <div style={styles.zPanel}>
                <button
                  style={styles.arrowButton}
                  onClick={() => handleMoveRelative('z', moveUnit)} // for +Z
                  disabled={loading}
                  title="Z Up"
                >
                  <div style={styles.axisLabel}>+Z</div>
                  <FaArrowUp />
                </button>
                <button
                  style={styles.arrowButton}
                  onClick={() => handleMoveRelative('z', -moveUnit)} // for -Z
                  disabled={loading}
                  title="Z Down"
                >
                  <div style={styles.axisLabel}>-Z</div>
                  <FaArrowDown />
                </button>
              </div>
            </div>
            {/* Move to coordinate */}
            <div style={styles.coordPanel}>
              <div style={styles.coordLabel}>Move to coordinate:</div>
              <div style={styles.coordInputs}>
                <input
                  style={styles.coordInput}
                  type="number"
                  placeholder="X"
                  value={coord.x}
                  onChange={e => handleCoordChange('x', e.target.value)}
                  disabled={loading}
                />
                <input
                  style={styles.coordInput}
                  type="number"
                  placeholder="Y"
                  value={coord.y}
                  onChange={e => handleCoordChange('y', e.target.value)}
                  disabled={loading}
                />
                <input
                  style={styles.coordInput}
                  type="number"
                  placeholder="Z"
                  value={coord.z}
                  onChange={e => handleCoordChange('z', e.target.value)}
                  disabled={loading}
                />
                <button
                  style={styles.coordButton}
                  onClick={handleMoveToCoord}
                  disabled={loading}
                >
                  Move
                </button>
              </div>
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
    left: 0,
    width: '100%',
    background: '#16a34a',
    color: 'white',
    fontWeight: 'bold',
    fontSize: '2rem',
    padding: '0 0 0 32px',
    height: 72,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    letterSpacing: '1px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
    borderRadius: 0,
    zIndex: 200,
  },
  fixedPanel: {
    position: 'fixed',
    top: 72, // below header
    right: 24,
    zIndex: 100,
    minWidth: 480,
    maxWidth: '90vw',
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
    marginRight: 32,
    padding: '10px 28px',
    borderRadius: '8px',
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
    padding: '32px 32px 24px 32px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    minWidth: 480,
    marginBottom: 0,
  },
  moveGrid: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 32,
    marginTop: 16,
  },
  homePanel: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'flex-start',
    marginRight: 16,
    marginTop: 56, // aligns with +Z
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
    padding: '6px 16px',
    borderRadius: '6px',
    border: '2px solid #22c55e',
    fontWeight: 'bold',
    fontSize: '1rem',
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
    fontSize: '1rem',
    marginBottom: 2,
  },
  middleRow: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  arrowButton: {
    padding: '8px',
    fontSize: '1.2rem',
    borderRadius: '12px',
    border: '2px solid #22c55e',
    backgroundColor: '#fff',
    color: '#14532d',
    cursor: 'pointer',
    minWidth: '64px',
    minHeight: '64px',
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
    padding: '6px 8px',
    borderRadius: '4px',
    border: '1px solid #22c55e',
    fontSize: '1rem',
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
    marginTop: 8,
  },
};