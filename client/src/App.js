import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import SeedingDistanceDepth from './components/seedingdistancedepth.jsx';
import FarmBotDashboard from './components/FarmBotDashboard';

import './App.css';
import WorkArea from "./components/workarea";

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<FarmBotDashboard />} />
                <Route path="/seeding/parameters" element={<SeedingDistanceDepth />} />
                <Route path="/seeding/workarea" element={<WorkArea />} />
            </Routes>
        </Router>
    );
}

export default App;
