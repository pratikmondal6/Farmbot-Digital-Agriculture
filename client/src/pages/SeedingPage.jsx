import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import api from "../utils/api";

// const now = new Date();
// const defaultDate = now.toISOString().slice(0, 10); // "YYYY-MM-DD"
// const defaultTime = now.toTimeString().slice(0, 5); // "HH:MM"

const SeedingPage = ({setIsLoggedIn, seedLocation, selectArea, setSelectArea, seedingAreaLocation, onDone}) => {
  const navigate = useNavigate();

  const [plant, setPlant] = useState('');
  const [SeedX, setSeedX] = useState('');
  const [SeedY, setSeedY] = useState('');
  const [ScheduledDate, setDate] = useState('');
  const [Time, setTime] = useState('');
  const [isHovered, setIsHovered] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPanel, setShowPanel] = useState('seeding'); // 'seeding', 'queue', 'history', 'schedule
  const [plantTypes, setPlantTypes] = useState([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    // if (seedLocation && seedLocation != {}) {
    //   setSeedX(seedLocation.x)
    //   setSeedY(seedLocation.y)
    // }

    const fetchData = async () => {
      const response = await api.get('/plant/all'); // 🔁 Replace with your real backend URL
      setPlantTypes(response.data);
    }
    fetchData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      let data = {
        seed_name: plant,
        seedX: seedLocation.x,
        seedY: seedLocation.y,
        z: 50,
        ...seedingAreaLocation,
      }

      await api.post('/seedingJob/start', data);
      
      navigate('/dashboard');

    } catch (err) {
      console.error('An error occured while seeding:', err);
      setError(
        err.response?.data?.message || 'An error occured while seeding:' + err
      );
    } finally {
      setLoading(false);
    }
  };

  const scheduleSeedingJob = async () => {
    setError('');
    setLoading(true);

    const datetimeString = `${ScheduledDate}T${Time}:00`; // "2025-07-02T14:30:00"
    const timestamp = new Date(datetimeString).getTime();

    console.log(seedingAreaLocation)

    try {
      let data = {
        seed_name: plant,
        seeding_date: timestamp,
        seedX: seedLocation.x,
        seedY: seedLocation.y,
        z: 50,
        ...seedingAreaLocation,
      }

      await api.post('/seedingJob/schedule', data);
      
      alert("Seeding job scheduled successfully")

    } catch (err) {
      console.error('An error occured while scheduling:', err);
      setError(
        err.response?.data?.message || 'An error occured while scheduling:' + err
      );
    } finally {
      setLoading(false);
      // window.location.reload()
      onDone()
    }
  }

  return (
    <div style={styles.container}>
      {/* <div style={styles.navbar}>
        <button
          style={{
            ...styles.navbarbutton
          }}
          onClick={() => setShowPanel('seeding')}
          >
          New seeding job
        </button>
        <button
          style={{
            ...styles.navbarbutton
          }}
          onClick={() => setShowPanel('queue')}
          >
          Seeding queue
        </button>
        <button
          style={{
            ...styles.navbarbutton
          }}
          onClick={() => setShowPanel('history')}
          >
          Seeding history
        </button>
      </div> */}
    {showPanel === 'seeding' && (
      <div>
        <form  onSubmit={handleSubmit} style={styles.form}>
        <h2 style={styles.title}>Seeding Details</h2>
        {error && <p style={styles.error}>Seeding done!</p>}

        <label style={styles.label}>Plant Type:</label>
        <div style={{ position: "relative", marginTop: 8 }}>
          <div
            style={{
              border: "1px solid #22c55e",
              borderRadius: 6,
              padding: "6px 8px",
              background: "#fff",
              cursor: "pointer",
              minWidth: 120,
              color: "#14532d",
            }}
            onClick={() => setDropdownOpen((open) => !open)}
          >
            {plant ? plant : "Select plant type"}
            <span style={{ float: "right" }}>▼</span>
          </div>
          {dropdownOpen && (
            <div
              style={{
                position: "absolute",
                top: "100%",
                left: 0,
                right: 0,
                background: "#fff",
                border: "1px solid #22c55e",
                borderRadius: 6,
                zIndex: 10,
                boxShadow: "0 2px 8px #0001",
                maxHeight: 180,
                overflowY: "auto",
              }}
            >
              {plantTypes.map((plantType) => (
                <div
                  key={plantType.plant_type}
                  style={{
                    padding: "8px 12px",
                    cursor: "pointer",
                    background: plant === plantType.plant_type ? "#bbf7d0" : "#fff",
                    color: "#14532d",
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                  }}
                  onClick={() => {
                    setPlant(plantType.plant_type);
                    setDropdownOpen(false);
                  }}
                >
                  {plantType.plant_type}
                </div>
              ))}
            </div>
          )}
        </div>

        <label style={styles.label}>Seed Plate Position</label>
        <div style={{ display: 'flex', gap: '12px', marginBottom: '1rem' }}>
          <input
            type="number"
            name="coordinate"
            value={seedLocation.x}
            onChange={(e) => setSeedX(e.target.value)}
            disabled
            placeholder="X"
            style={{
              ...styles.input,
              width: '100px',
              minWidth: '80px',
              maxWidth: '120px',
              textAlign: 'center',
              marginBottom: 0,
              border: "1px solid #22c55e",
              borderRadius: 6,
            }}
            required
          />
          <input
            type="number"
            name="coordinate"
            value={seedLocation.y}
            onChange={(e) => setSeedY(e.target.value)}
            disabled
            placeholder="Y"
            style={{
              ...styles.input,
              width: '100px',
              minWidth: '80px',
              maxWidth: '120px',
              textAlign: 'center',
              marginBottom: 0,
              border: "1px solid #22c55e",
              borderRadius: 6,
            }}
          />
        </div>
        <label style={styles.label}>Seed Destination</label>
        <div style={{display: 'flex', flexDirection: 'column', justifyContent: 'left', alignItems: 'left', gap:'10px'}}>
            {/* <input
                type="number"
                name="coordinate"
                value={X}
                onChange={(e) => setX(e.target.value)}
                placeholder="X"
                style={{...styles.input, width: '40%', marginRight: '1rem'}}
                required
            /> */}
            {/* <input
                type="number"
                name="coordinate"
                value={Y}
                onChange={(e) => setY(e.target.value)}
                placeholder="Y"
                style={{...styles.input, width: '40%'}}
                required
            /> */}
            <button 
              type='button'
              style={styles.buttonSelect}
              onClick={() => {
                setSelectArea(!selectArea)
              }}
            >
              Select
            </button>
            <input 
              value={seedingAreaLocation? "(" + seedingAreaLocation.topLeft.x + ", " + seedingAreaLocation.topLeft.y + ") to " + "(" + seedingAreaLocation.bottomRight.x + ", " + seedingAreaLocation.bottomRight.y + ")": ''} 
              disabled 
              type="text" 
              style={{width:'100%'}}
            />
        </div>
        <label style={styles.label}>Date</label>
        <input
            type="date"
            name="date"
            value={ScheduledDate}
            onChange={(e) => setDate(e.target.value)}
            style={styles.input}
        />
        <label style={styles.label}>Time</label>
        <input
            type="time"
            name="time"
            value={Time}
            onChange={(e) => setTime(e.target.value)}
            style={styles.input}
        />
        <div style={{display: 'flex', justifyContent: 'space-evenly'}}>
            <button
                type="submit"
                disabled={!plant || ScheduledDate || Time || loading}
                style={{
                ...styles.button,
                ...(isHovered ? styles.buttonHover : {}),
                ...( (!plant ||  ScheduledDate || Time || loading) ? styles.buttonDisabled : {} )
                }}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                {loading ? 'Seeding...' : showPanel == 'schedule' ? 'Schedule' : 'Start now'}
            </button>
            <button
                type='button'
                disabled={!plant || !ScheduledDate || !Time || loading}
                style={{
                ...styles.button,
                ...(isHovered ? styles.buttonHover : {}),
                ...( (!plant || !ScheduledDate || !Time || loading) ? styles.buttonDisabled : {} )
                }}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                onClick={() => scheduleSeedingJob()}
                >
                Schedule
            </button>
        </div>
        </form>
    </div>)}

    {showPanel === 'queue' && (
      <div>
        <h style={{ margin: 0, color: '#14532d' }}>queue</h>
      </div>)}
    {showPanel === 'history' && (
      <div>
        <h style={{ margin: 0, color: '#14532d' }}>history</h>
      </div>)}
    {showPanel === 'scheduled' && (
        <div>
            <h2>Seeding job scheduled successfully</h2>
        </div>
    )}

    </div>
    );
};

const styles = {
  container: {
    // height: '100vh',
    margin: "10px",
    // display: 'flex',
    // justifyContent: 'center',
    // alignItems: 'center',
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
    backgroundColor: 'rgb(0, 163, 60)',
    transform: 'scale(1.05)',
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
    backgroundColor:'#22c55e' ,
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    transitionDuration: '0.3s'
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
  buttonSelect: {
    padding: '10px 10px',
    fontSize: '0.8rem',
    fontWeight: 'bold',
    backgroundColor:'#22c55e' ,
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    transitionDuration: '0.3s'
  },
  error: {
    color: '#14532d',
    width: '50%',
    marginLeft: '22%',
    backgroundColor: 'rgb(211, 245, 204)',
    border: '1px solid #22c55e',
    padding: '0.6rem',
    borderRadius: '5px',
    fontSize: '0.9rem',
    marginBottom: '1rem',
    textAlign: 'center',
    transition: '0.3s'
  },
  loggedInHeader: {
    fontSize: '1.5rem',
    fontWeight: 'bold'
  }
};

export default SeedingPage;