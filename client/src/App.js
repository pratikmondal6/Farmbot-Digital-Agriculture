import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import SeedingJobManager from './pages/SeedingJobManager';
import './App.css';
import LoginPage from "./pages/LoginPage";
import NotFoundPage from './pages/NotFoundPage.jsx';
import FieldMap from "./components/FieldMap";
import Dashboard from './pages/Dashboard.jsx';

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
                {isLoggedIn && <Route path="/dashboard" element={<Dashboard />} />}
                {/* {isLoggedIn && <Route path="/seedingJob" element={<SeedingPage />} />}
                {isLoggedIn && <Route path="/seeding/parameters" element={<AddPlanttype />} />}
                {isLoggedIn && <Route path="/seeding/workarea" element={<WorkArea />} />}
                {isLoggedIn && <Route path="/settings" element={<Settings/>}/>}
                {isLoggedIn && <Route path="/farmbot-moving" element={<FarmbotMoving />} />}
                {isLoggedIn && <Route path="/humidity-check" element={<HumidityCheckPage />} />} */}
                <Route path="*" element={<NotFoundPage/>}/>
                <Route path="/seeding/jobs" element={<SeedingJobManager />} />
                <Route path="/fieldmap" element={<FieldMap />} />
            </Routes>
        </Router>
    );
}

export default App;
