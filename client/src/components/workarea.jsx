import React, { useState } from 'react';

const WorkArea = ({ showPanel, setShowPanel }) => {
  const [area_name, setArea_name] =useState({name: ''});
  const [pointA, setPointA] = useState({ x: '', y: '' });
  const [pointB, setPointB] = useState({ x: '', y: '' });

  

  

  const saveWorkArea = () => {
    console.log('Saved Work Area:', {area_name, pointA, pointB });
    alert(`Work Area saved: A(${pointA.x}, ${pointA.y}) to B(${pointB.x}, ${pointB.y})`);
  };

  return (
    <>
      {/* Button should be rendered inside the same toolbar div as the others in main component */}
      {showPanel === 'workarea' && (
        <div
          style={{
            position: 'fixed',
            top: '80px',
            left: '20px',
            width: '400px',
            backgroundColor: '#ecfdf5',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
            padding: '24px',
            borderRadius: '12px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            zIndex: 100,
          }}
        >
          <h2 style={{ margin: 0, color: '#14532d' }}>Define Working Area</h2>
          
          <div>
            <label style={{ color: '#14532d', fontWeight: 'bold' }}>Area Name:</label>
            <div style={{ display: 'flex', gap: '12px' }}>
              <input
                type="string"
                placeholder="Name"
                value={area_name.name}
                onChange={e => setArea_name({ ...area_name, name: e.target.value })}
                style={{ flex: 1, padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
              />
            </div>
          </div>


          <div>
            <label style={{ color: '#14532d', fontWeight: 'bold' }}>Point A (X, Y):</label>
            <div style={{ display: 'flex', gap: '12px' }}>
              <input
                type="number"
                placeholder="X"
                value={pointA.x}
                onChange={e => setPointA({ ...pointA, x: e.target.value })}
                style={{ flex: 1, padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
              />
              <input
                type="number"
                placeholder="Y"
                value={pointA.y}
                onChange={e => setPointA({ ...pointA, y: e.target.value })}
                style={{ flex: 1, padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
              />
            </div>
          </div>

          <div>
            <label style={{ color: '#14532d', fontWeight: 'bold' }}>Point B (X, Y):</label>
            <div style={{ display: 'flex', gap: '12px' }}>
              <input
                type="number"
                placeholder="X"
                value={pointB.x}
                onChange={e => setPointB({ ...pointB, x: e.target.value })}
                style={{ flex: 1, padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
              />
              <input
                type="number"
                placeholder="Y"
                value={pointB.y}
                onChange={e => setPointB({ ...pointB, y: e.target.value })}
                style={{ flex: 1, padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
              />
            </div>
          </div>

          <button
            onClick={saveWorkArea}
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

export default WorkArea;