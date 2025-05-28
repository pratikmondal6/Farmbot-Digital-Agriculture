import React, { useState, useEffect } from 'react';
import WorkArea from './workarea';
// import instance from '../utils/api';
import api from '../utils/api';
/*import Plant from './planttype';*/


const defaultPlantTypes = [
  'Lettuce'
];

const SeedingDistanceDepth = () => {
  const [plantTypes, setPlantTypes] = useState(defaultPlantTypes);
  const [newPlantType, setNewPlantType] = useState('');
  const [addError, setAddError] = useState('');
  const [depth, setDepth] = useState('');
  const [distance, setDistance] = useState('');
  const [error, setError] = useState('');
  const [distanceError, setDistanceError] = useState('');
  const [showPanel, setShowPanel] = useState('seeding'); // 'seeding', 'distance', 'add', or null
  const [plantType, setPlantType] = useState('');
  const [minseedingdistance, setMinSeedingDistance] = useState({ distance: ''});
  const [seedingdepth, setSeedingDepth] = useState({depth: ''});

  // Fetch plant types from the database and merge with defaults
  useEffect(() => {
    fetch('/api/plant/types')
      .then(res => res.json())
      .then(data => setPlantTypes(data))
      .catch(() => setPlantTypes(defaultPlantTypes));
  }, []);

  // Seeding depth input validation
  const handleInput = (e) => {
    const value = e.target.value;
    setDepth(value);

    const num = Number(value);
    if (
      value === '' ||
      !Number.isFinite(num) ||
      value.includes(' ') ||
      isNaN(num)
    ) {
      setError('Please enter a valid number between 0 mm and 40 mm.');
    } else if (num < 0 || num > 40) {
      setError('Please enter a value between 0 mm and 40 mm.');
    } else {
      setError('');
    }
  };

  // Minimum distance input validation (example: 50-1000 mm)
  const handleDistanceInput = (e) => {
    const value = e.target.value;
    setDistance(value);

    const num = Number(value);
    if (
      value === '' ||
      !Number.isFinite(num) ||
      value.includes(' ') ||
      isNaN(num)
    ) {
      setDistanceError('Please enter a valid number between 50 mm and 1000 mm.');
    } else if (num < 50 || num > 1000) {
      setDistanceError('Please enter a value between 50 mm and 1000 mm.');
    } else {
      setDistanceError('');
    }
  };

  // Toggle panel on double click
  const handleButtonDoubleClick = (panel) => (e) => {
    e.stopPropagation();
    setShowPanel((prev) => (prev === panel ? null : panel));
  };

  // Show panel on single click if hidden
  const handleButtonClick = (panel) => () => {
    if (showPanel !== panel) setShowPanel(panel);
  };

  const saveToDatabase = async (valueType, value) => {
    if (!plantType || !valueType || value === '' || isNaN(Number(value))) {
      alert('Please select a plant type and enter a valid value.');
      return;
    }
    try {
      const valueNum = Number(value);
      if (isNaN(valueNum)) {
        alert('Please enter a valid number.');
        return;
      }
      if (valueType === 'depth') {
        // Use /save-depth for seeding depth
        await api.post('/api/plant/save-depth', { plantType, depth: valueNum });
      } else {
        // Use /save for distance
        await api.post('/api/plant/save', { plantType, valueType, value: valueNum });
      }
      alert('Saved successfully!');
    } catch (err) {
      alert('Error saving data: ' + (err.response?.data?.error || err.message));
    }
  };

  const addPlantType = async () => {
    if (!newPlantType) {
      setAddError('Please enter a plant type.');
      return;
    }
    setAddError('');
    try {
      // Add plant type
      const response = await api.post('/api/plant/add-type', {
        plant_type: newPlantType,
        seeding_depth: Number(seedingdepth.depth),
        minimal_distance: Number(minseedingdistance.distance)
      });
      const result = response.data;
      alert(result.message || 'Plant type added!');
      setNewPlantType('');
      // Refresh plant types after adding
      const typesResponse = await api.get('/api/plant/types');
      const typesResult = typesResponse.data;
      setPlantTypes(typesResult);
    } catch (err) {
      setAddError(err.response?.data?.error || err.message || 'Failed to add plant type.');
    }
  };

  // Top Bar with Buttons
  return (
    <div style={{ height: '100vh', background: '#f8fafc', position: 'relative' }}>
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
            backgroundColor: showPanel === 'seeding' ? '#22c55e' : '#16a34a',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            padding: '10px 24px',
            fontWeight: 'bold',
            cursor: 'pointer',
            fontSize: '16px',
            transition: 'background 0.2s',
            marginRight: '10px',
          }}
          onClick={handleButtonClick('seeding')}
          onDoubleClick={handleButtonDoubleClick('seeding')}
          title="Double-click to hide/show panel"
        >
          Seeding Depth
        </button>
        <button
          style={{
            backgroundColor: showPanel === 'distance' ? '#22c55e' : '#16a34a',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            padding: '10px 24px',
            fontWeight: 'bold',
            cursor: 'pointer',
            fontSize: '16px',
            transition: 'background 0.2s',
            marginRight: '10px',
          }}
          onClick={handleButtonClick('distance')}
          onDoubleClick={handleButtonDoubleClick('distance')}
          title="Double-click to hide/show panel"
        >
          Minimum Distance
        </button>


        <button
          style={{
            backgroundColor: showPanel === 'workarea' ? '#22c55e' : '#16a34a',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            padding: '10px 24px',
            fontWeight: 'bold',
            cursor: 'pointer',
            fontSize: '16px',
            transition: 'background 0.2s',
            marginRight: '10px',
          }}
          onClick={handleButtonClick('workarea')}
          onDoubleClick={handleButtonDoubleClick('workarea')}
          title="Double-click to hide/show panel"
        >
          Define Work Area
  	    </button>

        <button
          style={{
            backgroundColor: showPanel === 'add' ? '#22c55e' : '#16a34a',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            padding: '10px 24px',
            fontWeight: 'bold',
            cursor: 'pointer',
            fontSize: '16px',
            transition: 'background 0.2s',
            marginRight: '10px', // <-- use marginRight for spacing, not marginLeft:'auto'
          }}
          onClick={handleButtonClick('add')}
          onDoubleClick={handleButtonDoubleClick('add')}
          title="Double-click to hide/show panel"
        >
          Add Plant Type
        </button>
      </div>

      {/* Seeding Depth Panel */}
      {showPanel === 'seeding' && (
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
            <b>The typical recommended seeding depth values in millimeters are as follows:</b><br /><br />
            <b>Radishes & Lettuce:</b> 5 - 10 mm<br />
            <b>Carrots & Beets:</b> 10 - 20 mm<br />
            <b>Peas & Beans:</b> 30 - 50 mm<br />
            <b>Kohlrabi & Fennel:</b> 10 - 20 mm<br />
            <b>Pumpkin & Zucchini:</b> 30 - 40 mm<br /><br />
            <b>Please enter a number between 0 and 40 mm in the input field below</b><br />
            <b>Note:</b> The seeding depth is the distance from the soil surface to the seed.<br />
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
              min={0}
              max={40}
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
          <button
            onClick={() => saveToDatabase('depth', depth)}
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
            Save
          </button>
        </div>
      )}

      {/* Minimum Distance Panel */}
      {showPanel === 'distance' && (
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
          <h2 style={{ margin: 0, color: '#14532d' }}>Set minimum distance [in mm]</h2>
          <div style={{ color: '#14532d', fontSize: '15px', lineHeight: 1.7 }}>
            The typical recommended seeding minima in millimeters are as follows:<br /><br />
            <b>Radishes & Lettuce:</b> 50 - 100 mm between plants<br />
            <b>Carrots & Beets:</b> 50 - 80 mm between plants<br />
            <b>Peas & Beans:</b> 100 - 150 mm between plants<br />
            <b>Kohlrabi & Fennel:</b> 200 - 300 mm between plants<br />
            <b>Pumpkin & Zucchini:</b> 500 - 1000 mm between plants <br />
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
            Your minimum distance (mm):
            <input
              type="number"
              value={distance}
              onChange={handleDistanceInput}
              min={50}
              max={1000}
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
          {distanceError && (
            <div style={{ color: '#dc2626', fontWeight: 'bold' }}>{distanceError}</div>
          )}
          <button
            onClick={() => saveToDatabase('distance', distance)}
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
            Save
          </button>
        </div>
      )}
      {/* Add Plant Type Panel */}
      {showPanel === 'add' && (
        <div
          style={{
            position: 'absolute',
            top: '60px',
            left: '20px', // <-- Change from right: '20px' to left: '20px'
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
          <h2 style={{ margin: 0, color: '#14532d' }}>Add New Plant Type</h2>
          <label style={{ color: '#14532d', fontWeight: 'bold' }}>
            Plant type:
            <input
              type="text"
              placeholder='Plant Type'
              value={newPlantType}
              onChange={e => setNewPlantType(e.target.value)}
              style={{
                width: '100%',
                padding: '8px',
                marginTop: '4px',
                border: '1px solid #ccc',
                borderRadius: '4px',
                marginBottom: '8px',
              }}
            />
          </label>
                    <label style={{ color: '#14532d', fontWeight: 'bold' }}>
            Seeding depth:
            <input
              type="number"
              value={seedingdepth.depth}
              placeholder='Seedingdepth in mm'
              onChange={e => setSeedingDepth({ depth: Number(e.target.value) })}
              style={{
                width: '100%',
                padding: '8px',
                marginTop: '4px',
                border: '1px solid #ccc',
                borderRadius: '4px',
                marginBottom: '8px',
              }}
            />
          </label>
                    <label style={{ color: '#14532d', fontWeight: 'bold' }}>
            Min seeding Distance:
            <input
              type="number"
              placeholder='Seedingdistance in mm'
              value={minseedingdistance.distance}
              onChange={e => setMinSeedingDistance({ distance: Number(e.target.value) })}
              style={{
                width: '100%',
                padding: '8px',
                marginTop: '4px',
                border: '1px solid #ccc',
                borderRadius: '4px',
                marginBottom: '8px',
              }}
            />
          </label>
          {addError && (
            <div style={{ color: '#dc2626', fontWeight: 'bold' }}>{addError}</div>
          )}
          <button
            onClick={addPlantType}
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
            Add Plant Type
          </button>
        </div>
      )}
      <WorkArea />
      <WorkArea showPanel={showPanel} setShowPanel={setShowPanel} />
    </div>
  );
};



export default SeedingDistanceDepth;