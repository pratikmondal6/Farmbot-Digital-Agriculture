import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import SeedingDistanceDepth from './components/seedingdistancedepth.jsx';
import FarmBotDashboard from './pages/FarmBotDashboard';

import './App.css';
import WorkArea from "./components/workarea";
import LoginPage from "./pages/LoginPage";
import Settings from "./pages/Setting";
import NotFoundPage from './pages/NotFoundPage.jsx';
import FieldMap from "./components/FieldMap";

function App() {
    const [isLoggedIn, setIsLoggedIn] = useState(!!sessionStorage.getItem("token"));

    useEffect(() => {
        const handleStorageChange = () => {
          setIsLoggedIn(!!sessionStorage.getItem("token"));
        };
    
        window.addEventListener("storage", handleStorageChange);
    
        return () => window.removeEventListener("storage", handleStorageChange);
    }, []);

    return (
        <Router>
            <Routes>
                <Route path="/" element={<LoginPage setIsLoggedIn={setIsLoggedIn} />} />
                <Route path="/login" element={<LoginPage setIsLoggedIn={setIsLoggedIn} />} />
                {isLoggedIn && <Route path="/dashboard" element={<FarmBotDashboard />} />}
                {isLoggedIn && <Route path="/seeding/parameters" element={<SeedingDistanceDepth />} />}
                {isLoggedIn && <Route path="/seeding/workarea" element={<WorkArea />} />}
                {isLoggedIn && <Route path="/settings" element={<Settings/>}/>}
                <Route path="*" element={<NotFoundPage/>}/>
                <Route path="/fieldmap" element={<FieldMap />} />
            </Routes>
        </Router>
    );
}

export default App;