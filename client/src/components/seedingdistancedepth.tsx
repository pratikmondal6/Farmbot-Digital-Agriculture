import React, { useState } from 'react';

const plantTypes = [
  'Radishes',
  'Lettuce',
  'Carrots',
  'Beets',
  'Peas',
  'Beans',
  'Kohlrabi',
  'Fennel',
  'Pumpkin',
  'Zucchini',
];

const SeedingDistanceDepth = () => {
  const [depth, setDepth] = useState('');
  const [error, setError] = useState('');
  const [showPanel, setShowPanel] = useState(true);
  const [plantType, setPlantType] = useState('');

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setDepth(value);

    const num = Number(value);
    if (value === '' || (num >= 5 && num <= 20)) {
      setError('');
    } else {
      setError('Please enter a value between 5 mm and 20 mm.');
    }
  };

  // Toggle panel on double click
  const handleButtonDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowPanel((prev) => !prev);
  };

  return (
    <div style={{ height: '100vh', background: '#f8fafc', position: 'relative' }}>
      {/* Top Bar with Seeding Button */}
      <div
        style={{
          width: '100%',
          backgroundColor: '#16a34a',
          display: 'flex',
          alignItems: 'center',
          padding: '0 20px',
          height: '60px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          position: 'fixed',
          top: 0,
          left: 0,
          zIndex: 10,
        }}
      >
        <button
          style={{
            backgroundColor: '#22c55e',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            padding: '10px 24px',
            fontWeight: 'bold',
            cursor: 'pointer',
            fontSize: '16px',
            transition: 'background 0.2s',
          }}
          onDoubleClick={handleButtonDoubleClick}
          title="Double-click to hide/show panel"
        >
          Seeding
        </button>
      </div>

      {/* Seeding Panel */}
      {showPanel && (
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
            zIndex: 9,
          }}
        >
          <h2 style={{ margin: 0, color: '#14532d' }}>Set seeding depth [in mm]</h2>
          <div style={{ color: '#14532d', fontSize: '15px', lineHeight: 1.7 }}>
            Typical seeding depth values in millimeters are:<br /><br />
            <b>Radishes & Lettuce:</b> 5 - 10 mm<br />
            <b>Carrots & Beets:</b> 10 - 20 mm<br />
            <b>Peas & Beans:</b> 30 - 50 mm<br />
            <b>Kohlrabi & Fennel:</b> 10 - 20 mm<br />
            <b>Pumpkin & Zucchini:</b> 30 - 40 mm
          </div>
          <label style={{ color: '#14532d', fontWeight: 'bold' }}>
            Plant type:
            <select
              value={plantType}
              onChange={e => setPlantType(e.target.value)}
              style={{
                width: '100%',
                padding: '8px',
                marginTop: '4px',
                border: '1px solid #ccc',
                borderRadius: '4px',
                marginBottom: '8px',
              }}
            >
              <option value="">Select plant type</option>
              {plantTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </label>
          <label style={{ color: '#14532d', fontWeight: 'bold' }}>
            Your seeding depth (mm):
            <input
              type="number"
              value={depth}
              onChange={handleInput}
              min={5}
              max={20}
              style={{
                width: '100%',
                padding: '8px',
                marginTop: '4px',
                border: '1px solid #ccc',
                borderRadius: '4px',
                marginBottom: '4px',
              }}
            />
          </label>
          {error && (
            <div style={{ color: '#dc2626', fontWeight: 'bold' }}>{error}</div>
          )}
        </div>
      )}
    </div>
  );
};

export default SeedingDistanceDepth;