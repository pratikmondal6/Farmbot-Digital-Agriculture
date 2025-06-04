import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../farmbot-dashboard.css';

const SeedingJobManager = () => {
  const [jobs, setJobs] = useState([]);
  const navigate = useNavigate();

  // Load all jobs on component mount
  useEffect(() => {
    fetch('/api/seeding-jobs')
      .then(res => res.json())
      .then(data => setJobs(data))
      .catch(err => console.error('Failed to fetch jobs:', err));
  }, []);

  // Execute a specific job by ID
  const executeJob = async (jobId) => {
    try {
      const res = await fetch(`/api/seeding-jobs/${jobId}/execute`, { method: 'POST' });
      if (res.ok) {
        alert('Job started!');
        // Optional: Refresh job list
      } else {
        const data = await res.json();
        alert(data.error || 'Execution failed.');
      }
    } catch (err) {
      alert('Network error.');
    }
  };

  return (
    <div
      className="dashboard-main"
      style={{
        padding: '24px',
        maxWidth: '800px',
        margin: '0 auto',
      }}
    >
      <h2 className="card-title" style={{ marginBottom: '24px' }}>🌱 Seeding Jobs</h2>

      {jobs.length === 0 ? (
        <div
          className="dashboard-card"
          style={{
            maxWidth: '500px',
            textAlign: 'center',
            padding: '40px',
            border: '2px solid #22c55e',
            backgroundColor: '#f0fdf4',
            borderRadius: '12px',
            marginBottom: '24px',
          }}
        >
          <p style={{ fontSize: '18px', color: '#14532d' }}>No jobs found.</p>
        </div>
      ) : (
        jobs.map(job => (
          <div
            key={job.id}
            className="dashboard-card"
            style={{
              maxWidth: '500px',
              border: '2px solid #22c55e',
              borderRadius: '12px',
              boxShadow: '0 2px 6px rgba(0, 0, 0, 0.05)',
              padding: '16px',
              marginBottom: '20px',
              backgroundColor: '#f0fdf4',
            }}
          >
            <div className="card-icon">🪴</div>
            <h3 className="card-title" style={{ marginBottom: '8px' }}>{job.name}</h3>

            <p>
              Status:{' '}
              <strong
                style={{
                  color:
                    job.status === 'running'
                      ? '#facc15'
                      : job.status === 'queued'
                      ? '#3b82f6'
                      : job.status === 'done'
                      ? '#22c55e'
                      : '#ef4444',
                }}
              >
                {job.status}
              </strong>
            </p>

            <p>Plant Type: <em>{job.plant_type}</em></p>
            <p>Distance: {job.minimal_distance} mm</p>

            <button
              className="card-button"
              onClick={() => executeJob(job.id)}
              disabled={job.status === 'running'}
              style={{
                marginTop: '12px',
                opacity: job.status === 'running' ? 0.6 : 1,
                cursor: job.status === 'running' ? 'not-allowed' : 'pointer',
              }}
            >
              {job.status === 'running' ? 'Running...' : 'Execute Job'}
            </button>
          </div>
        ))
      )}

      {/* Zurück-Button unterhalb, zentriert */}
      <div style={{ textAlign: 'center', marginTop: '40px' }}>
        <button
          onClick={() => navigate('/dashboard')}
          style={{
            padding: '10px 16px',
            backgroundColor: '#e5e7eb',
            color: '#111827',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: 'bold',
          }}
        >
          ← Back to Home
        </button>
      </div>
    </div>
  );
};

export default SeedingJobManager;
