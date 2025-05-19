import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import SeedingDistanceDepth from './components/seedingdistancedepth.jsx'; // adjust path if needed
import './App.css';
import Dashboard from "./pages/Dashboard";
import Settings from "./pages/Setting";

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/dashboard" element={<Dashboard/>}/>
                <Route path="/settings" element={<Settings/>}/>
                <Route path="/" element={<SeedingDistanceDepth />} />
            </Routes>
        </Router>
    );
}

export default App;
