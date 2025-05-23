import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import SeedingDistanceDepth from './components/seedingdistancedepth.jsx'; // adjust path if needed
import './App.css';
import LoginPage from './components/loginPage.jsx';


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/dashboard" element={<SeedingDistanceDepth />} />
      </Routes>
    </Router>
  );
}

export default App;