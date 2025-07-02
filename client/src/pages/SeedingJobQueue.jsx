import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import api from "../utils/api";

const SeedingJobQueue = ({setIsLoggedIn}) => {
  const [isHoveredEdit, setIsHoveredEdit] = useState(false);
  const [isHoveredDelete, setIsHoveredDelete] = useState(false);
  const [seedingJobs, setSeedingJobs] = useState([]);
  const [editPage, setEditPage] = useState(false);
  const [EditSeedingJob, setEditSeedingJob] = useState({});
  const [deleting, setDeleting] = useState(false);

  const [plant, setPlant] = useState('');
  const [X, setX] = useState('');
  const [Y, setY] = useState('');
  const [SeedX, setSeedX] = useState('');
  const [SeedY, setSeedY] = useState('');
  const [ScheduledDate, setDate] = useState('');
  const [Time, setTime] = useState('');
  const [isHovered, setIsHovered] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPanel, setShowPanel] = useState('seeding'); // 'seeding', 'queue', 'history', 'schedule
  const [plantTypes, setPlantTypes] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const response1 = await api.get('/seedingJob/seeds'); // 🔁 Replace with your real backend URL
      setSeedingJobs(response1.data);

      const response2 = await api.get('/plant/all'); // 🔁 Replace with your real backend URL
      setPlantTypes(response2.data);
    }
    fetchData();
  }, [editPage, deleting]);

  const handleSubmit = async (e) => {
    console.log("Staaaarting submitting")
    e.preventDefault();
    setError('');
    setLoading(true);

    const datetimeString = `${ScheduledDate}T${Time}:00`; // "2025-07-02T14:30:00"
    const timestamp = new Date(datetimeString).getTime();

    try {
      let data = {
        seed_name: plant,
        seedX: SeedX,
        seedY: SeedY,
        x: X,
        y: Y,
        z: 50,
        seeding_date: timestamp
      }

      console.log('/seedingJob/' + EditSeedingJob._id)
      await api.put('/seedingJob/' + EditSeedingJob._id, data);

      setEditPage(false)
    } catch (err) {
      console.error('An error occured while seeding:', err);
      setError(
        err.response?.data?.message || 'An error occured while seeding:' + err
      );
    } finally {
      setLoading(false);
    }
  };

  const chooseSeedingJobToEdit = (id) => {
    for (let seedingJob of seedingJobs) {
      if (seedingJob._id === id) {
        setEditSeedingJob(seedingJob)
        setPlant(seedingJob.seed_name)
        setSeedX(seedingJob.seedX)
        setSeedY(seedingJob.seedY)
        setX(seedingJob.x)
        setY(seedingJob.y)

        const dateObj = new Date(seedingJob.seeding_date);

        // Format for input type="date"
        const dateStr = dateObj.toISOString().split('T')[0]; // → "2025-07-02"
        setDate(dateStr)

        // Format for input type="time"
        const timeStr = dateObj.toTimeString().slice(0, 5); // → "14:30"
        setTime(timeStr)
      }
    }
  }

  const deleteSeedingJob = async (id) => {
    try {
      setDeleting(true)
      await api.delete('/seedingJob/' + id);
      setDeleting(true)
    } catch (err) {
      console.error('An error occured while seeding:', err);
      setError(
        err.response?.data?.message || 'An error occured while seeding:' + err
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={styles.container}>
    {editPage === false && (
      <div>
        {seedingJobs.map(seedingJob => (
          <div style={styles.seedingJob} key={seedingJob._id}>
            <div style={styles.details}>
              <h2 style={styles.detailsHeader}>{seedingJob.seed_name}</h2>
              <p  style={styles.detailsTime}>{seedingJob.seeding_date}</p>
            </div>
            <div>
              <button 
                style={{
                  ...styles.button,
                  ...styles.buttonEdit,
                  ...(isHoveredEdit ? styles.buttonHover : {}),
                }}
                onMouseEnter={() => setIsHoveredEdit(true)}
                onMouseLeave={() => setIsHoveredEdit(false)}
                onClick={() => {
                  chooseSeedingJobToEdit(seedingJob._id)
                  setEditPage(true)
                }}
                >
                  Edit
              </button>
              <button 
                style={{
                  ...styles.button,
                  ...styles.buttonDelete,
                  ...(isHoveredDelete ? styles.buttonHover : {}),
                }}
                onMouseEnter={() => setIsHoveredDelete(true)}
                onMouseLeave={() => setIsHoveredDelete(false)}
                onClick={() => {
                  deleteSeedingJob(seedingJob._id)
                }}
                >
                  Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    )}

    {editPage === true && (
      <div>
        <form onSubmit={handleSubmit} style={styles.form}>
          <h2 style={styles.title}>Seeding Details</h2>
          {error && <p style={styles.error}>Seeding done!</p>}

          <label style={styles.label}>Plant Type:</label>
          <select
              name="plant"
              value={plant}
              onChange={(e) => setPlant(e.target.value)}
              placeholder="Choose plant type"
              style={styles.input}
              required
          >
          <option value={EditSeedingJob.seed_name}>{EditSeedingJob.seed_name}</option>
          {plantTypes.map(plantType => (
            <option key={plantType.plant_type} value={plantType.plant_type}>
              {plantType.plant_type}
            </option>
          ))}
          </select>

          <label style={styles.label}>Seed Plate Position</label>
          <div style={{display: 'flex', justifyContent: 'left'}}>
              <input
                  type="number"
                  name="coordinate"
                  value={SeedX}
                  onChange={(e) => setSeedX(e.target.value)}
                  placeholder="Seed X"
                  style={{...styles.input, width: '40%', marginRight: '1rem'}}
                  required
              />
              <input
                  type="number"
                  name="coordinate"
                  value={SeedY}
                  onChange={(e) => setSeedY(e.target.value)}
                  placeholder="Seed Y"
                  style={{...styles.input, width: '40%'}}
              />
          </div>
          <label style={styles.label}>Seed Destination</label>
          <div style={{display: 'flex', justifyContent: 'left', }}>
              <input
                  type="number"
                  name="coordinate"
                  value={X}
                  onChange={(e) => setX(e.target.value)}
                  placeholder="X"
                  style={{...styles.input, width: '40%', marginRight: '1rem'}}
                  required
              />
              <input
                  type="number"
                  name="coordinate"
                  value={EditSeedingJob.y}
                  onChange={(e) => setY(e.target.value)}
                  placeholder="Y"
                  style={{...styles.input, width: '40%'}}
                  required
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
                  style={{
                  ...styles.button2,
                  ...(isHovered ? styles.buttonHover : {}),
                  ...( (!plant || !X || !Y|| ScheduledDate || Time || loading) ? styles.buttonDisabled : {} )
                  }}
                  onMouseEnter={() => setIsHovered(true)}
                  onMouseLeave={() => setIsHovered(false)}
              >
                  Edit
              </button>
          </div>
        </form>
    </div>)}
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
  seedingJob: {
    padding: '1rem',
    margin: '10px 0',
    borderRadius: '10px',
    boxShadow: '0 0 10px rgba(0,0,0,0.1)',
    backgroundColor: '#ecfdf5',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  button: {
    padding: '2px 5px',
    fontSize: '1rem',
    fontWeight: 'bold',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    transitionDuration: '0.3s',
    opacity: '0.8'
  },
  buttonEdit: {
    backgroundColor:'#22c55e' ,
    margin: '0 0 5px 5px',
  },
  buttonDelete: {
    backgroundColor:'red' ,
    margin: '0 0 0 5px',
  },
  buttonHover: {
    opacity: '1',
    transform: 'scale(1.05)',
  },
  button2: {
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
  details: {
    whiteSpace: 'nowrap',
    marginRight: '10px',
  },
  detailsHeader: {
    fontWeight: 'bold',
  },
  detailsTime: {
    fontSize: '0.7rem'
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

export default SeedingJobQueue;