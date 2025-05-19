import React, { useState } from 'react';

const WorkArea = () => {
  const [coords, setCoords] = useState({
    ax: '',
    ay: '',
    bx: '',
    by: '',
  });
  const [visible, setVisible] = useState(false);

  const togglePanel = () => setVisible((prev) => !prev);
  const handleChange = (key, value) => {
    setCoords((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    console.log('Saved work area:', coords);
    alert('Work area saved:\n' + JSON.stringify(coords, null, 2));
  };

  return (
    <>
      {/* Toggle Button – fixiert in der Topbar */}
      <div
        style={{
          position: 'fixed',
          top: '10px',
          right: '500px',
          zIndex: 20,
        }}
      >
        <button
          onClick={togglePanel}
          style={{
            backgroundColor: '#22c55e',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            padding: '10px 24px',
            fontWeight: 'bold',
            cursor: 'pointer',
            fontSize: '16px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          }}
        >
          {visible ? 'Hide Work Area' : 'Show Work Area'}
        </button>
      </div>

      {/* Panel – gleich gestylt wie andere */}
      {visible && (
        <div
          style={{
            position: 'absolute',
            top: '60px',
            left: '20px',
            width: '350px',
            backgroundColor: '#ecfdf5',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
            padding: '24px',
            borderRadius: '12px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            zIndex: 19,
          }}
        >
          <h2 style={{ margin: 0, color: '#14532d' }}>Define Working Area</h2>

          <label style={{ color: '#14532d', fontWeight: 'bold' }}>
            Point A (X, Y):
            <div style={{ display: 'flex', gap: '4%' }}>
              <input
                type="number"
                placeholder="X"
                value={coords.ax}
                onChange={(e) => handleChange('ax', e.target.value)}
                style={inputStyle}
              />
              <input
                type="number"
                placeholder="Y"
                value={coords.ay}
                onChange={(e) => handleChange('ay', e.target.value)}
                style={inputStyle}
              />
            </div>
          </label>

          <label style={{ color: '#14532d', fontWeight: 'bold' }}>
            Point B (X, Y):
            <div style={{ display: 'flex', gap: '4%' }}>
              <input
                type="number"
                placeholder="X"
                value={coords.bx}
                onChange={(e) => handleChange('bx', e.target.value)}
                style={inputStyle}
              />
              <input
                type="number"
                placeholder="Y"
                value={coords.by}
                onChange={(e) => handleChange('by', e.target.value)}
                style={inputStyle}
              />
            </div>
          </label>

          <button
            onClick={handleSave}
            style={{
              padding: '10px',
              backgroundColor: '#22c55e',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              fontWeight: 'bold',
            }}
          >
            Save Work Area
          </button>
        </div>
      )}
    </>
  );
};

const inputStyle = {
  width: '48%',
  padding: '8px',
  borderRadius: '4px',
  border: '1px solid #ccc',
};

export default WorkArea;
