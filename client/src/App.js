import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import PlantForm from './Frontend_Plants/PlantForm.jsx'

function App() {
  return (
      <Router>
        <Routes>
          <Route path="/" element={<PlantForm/>}/>
        </Routes>
      </Router>
  );
}

export default App;
