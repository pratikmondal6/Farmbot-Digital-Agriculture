import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import SeedingDistanceDepth from './components/seedingdistancedepth.jsx';
import FarmBotDashboard from './pages/FarmBotDashboard';

import './App.css';
import WorkArea from "./components/workarea";
import LoginPage from "./components/loginPage";
import Settings from "./pages/Setting";

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<LoginPage />} />
                <Route path="/dashboard" element={<FarmBotDashboard />} />
                <Route path="/seeding/parameters" element={<SeedingDistanceDepth />} />
                <Route path="/seeding/workarea" element={<WorkArea />} />
                <Route path="/settings" element={<Settings/>}/>
            </Routes>
        </Router>
    );
}

export default App;