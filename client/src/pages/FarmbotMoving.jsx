import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FaArrowUp, FaArrowDown, FaArrowLeft, FaArrowRight, FaArrowsAltV } from 'react-icons/fa';

const FarmbotMoving = () => {
  const navigate = useNavigate();
  const [isMoving, setIsMoving] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPanel, setShowPanel] = useState(true);

  useEffect(() => {
    const token = sessionStorage.getItem("token");
    if (!token) {
      navigate("/login");
    }
  }, [navigate]);

  const handleMove = async (direction) => {
    setError('');
    setLoading(true);
    setIsMoving(true);
    try {
      const response = await axios.post('http://localhost:5000/farmbot/move', { direction });
      console.log('Move success:', response.data);
    } catch (err) {
      console.error('Move failed:', err);
      setError(err.response?.data?.message || 'Move failed. Please try again.');
    } finally {
      setLoading(false);
      setIsMoving(false);
    }
  };

  // Double-click tab to toggle panel
  const handleTabDoubleClick = () => setShowPanel((prev) => !prev);

  return (
    <div style={styles.page}>
      <div style={styles.header}>FarmBot Moving</div>
      <div
        style={{
          ...styles.tabButton,
          backgroundColor: showPanel ? '#22c55e' : '#16a34a',
        }}
        onDoubleClick={handleTabDoubleClick}
        title="Double-click to expand/collapse"
      >
        <span role="img" aria-label="move">🤖</span> Movement Panel
      </div>
      {showPanel && (
        <div style={styles.panel}>
          {error && <p style={styles.error}>{error}</p>}
          <div style={styles.moveGrid}>
            {/* Z Up */}
            <button
              style={styles.zButton}
              onClick={() => handleMove('z-up')}
              disabled={loading}
              title="Z Up"
            >
              <FaArrowsAltV style={{ transform: 'rotate(-90deg)' }} /> Z+
            </button>
            {/* XY Grid */}
            <div style={styles.xyGrid}>
              <button
                style={styles.arrowButton}
                onClick={() => handleMove('y-up')}
                disabled={loading}
                title="Y Up"
              >
                <FaArrowUp />
              </button>
              <div style={styles.middleRow}>
                <button
                  style={styles.arrowButton}
                  onClick={() => handleMove('x-left')}
                  disabled={loading}
                  title="X Left"
                >
                  <FaArrowLeft />
                </button>
                <div style={styles.centerDot}></div>
                <button
                  style={styles.arrowButton}
                  onClick={() => handleMove('x-right')}
                  disabled={loading}
                  title="X Right"
                >
                  <FaArrowRight />
                </button>
              </div>
              <button
                style={styles.arrowButton}
                onClick={() => handleMove('y-down')}
                disabled={loading}
                title="Y Down"
              >
                <FaArrowDown />
              </button>
            </div>
            {/* Z Down */}
            <button
              style={styles.zButton}
              onClick={() => handleMove('z-down')}
              disabled={loading}
              title="Z Down"
            >
              <FaArrowsAltV style={{ transform: 'rotate(90deg)' }} /> Z-
            </button>
          </div>
          {isMoving && <p style={styles.moving}>Moving...</p>}
        </div>
      )}
    </div>
  );
};

export default FarmbotMoving;

// --- Styles ---
const styles = {
  page: {
    minHeight: '100vh',
    background: '#f8fafc',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  header: {
    width: '100%',
    background: '#16a34a',
    color: 'white',
    fontWeight: 'bold',
    fontSize: '2rem',
    padding: '18px 0',
    textAlign: 'center',
    letterSpacing: '1px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
    position: 'fixed',
    top: 0,
    left: 0,
    zIndex: 10,
  },
  tabButton: {
    marginTop: 80,
    marginBottom: 24,
    padding: '12px 32px',
    borderRadius: '8px 8px 0 0',
    color: 'white',
    fontWeight: 'bold',
    fontSize: '1.1rem',
    cursor: 'pointer',
    userSelect: 'none',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
    transition: 'background 0.2s',
  },
  panel: {
    background: '#ecfdf5',
    borderRadius: '0 0 16px 16px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.10)',
    padding: '32px 48px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    minWidth: 340,
    marginBottom: 40,
  },
  moveGrid: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 40,
  },
  xyGrid: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 12,
  },
  middleRow: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  arrowButton: {
    padding: '18px',
    fontSize: '2rem',
    borderRadius: '50%',
    border: '2px solid #22c55e',
    backgroundColor: '#fff',
    color: '#14532d',
    cursor: 'pointer',
    minWidth: '56px',
    minHeight: '56px',
    boxShadow: '0 1px 4px rgba(34,197,94,0.08)',
    transition: 'background 0.2s, color 0.2s',
  },
  zButton: {
    padding: '12px 18px',
    fontSize: '1.2rem',
    borderRadius: '8px',
    border: '2px solid #22c55e',
    backgroundColor: '#e0ffe0',
    color: '#14532d',
    cursor: 'pointer',
    minWidth: '60px',
    minHeight: '60px',
    boxShadow: '0 1px 4px rgba(34,197,94,0.08)',
    transition: 'background 0.2s, color 0.2s',
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  centerDot: {
    width: '18px',
    height: '18px',
    borderRadius: '50%',
    backgroundColor: '#22c55e',
    margin: '0 10px',
  },
  error: {
    color: '#dc2626',
    fontWeight: 'bold',
    marginBottom: 12,
  },
  moving: {
    color: '#14532d',
    fontWeight: 'bold',
    marginTop: 16,
  },
};