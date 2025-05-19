import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import SeedingDistanceDepth from './components/seedingdistancedepth.jsx'; // adjust path if needed
import './App.css';


function App() {
  return (
<<<<<<< HEAD
      <Router>
        <Routes>
          <Route path="/" />
        </Routes>
      </Router>
=======
    <Router>
      <Routes>
        <Route path="/" element={<SeedingDistanceDepth />} />
      </Routes>
    </Router>
>>>>>>> b8b0405290688515b26becffa0794bc5edfed96c
  );
}

export default App;