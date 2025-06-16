import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { saveToken } from '../utils/tokenManager';

const LoginPage = ({setIsLoggedIn}) => {
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isHovered, setIsHovered] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const token = sessionStorage.getItem("token");
    if (token) {
      navigate("/dashboard");
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await axios.post('http://localhost:5000/login', {
        email,
        password,
      });

      // console.log('Login success:', response.data);
      sessionStorage.setItem('token', response.data.token);
      saveToken(response.data.token);
      setIsLoggedIn(true);
      navigate('/dashboard');

    } catch (err) {
      console.error('Login failed:', err);
      setError(
        err.response?.data?.message || 'Login failed. Please check your credentials.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    
    <div style={styles.container}>
        
      <div style={styles.navbar}>
        <p>Farm bot</p>
      </div>
      <form  onSubmit={handleSubmit} style={styles.form}>
        <h2 style={styles.title}>Login</h2>
        {error && <p style={styles.error}>Login failed!</p>}

        <label style={styles.label}>Email:</label>
        <input
            type="email"
            name="username"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            style={styles.input}
            required
        />

        <label style={styles.label}>Password:</label>
        <input
            type="password"
            name="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            style={styles.input}
            required
        />

        <button
          type="submit"
          disabled={!email || !password || loading}
          style={{
            ...styles.button,
            ...(isHovered ? styles.buttonHover : {}),
            ...( (!email || !password || loading) ? styles.buttonDisabled : {} )
          }}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>
    </div>
  );
};

const styles = {
  container: {
    height: '100vh',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
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
  error: {
    color: '#ff4d4d',
    width: '50%',
    marginLeft: '22%',
    backgroundColor: '#ffe6e6',
    border: '1px solid #ff9999',
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

export default LoginPage;
