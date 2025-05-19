import {BrowserRouter as Router, Route, Routes} from 'react-router-dom';
import './App.css';
import Dashboard from "./pages/Dashboard";
import Settings from "./pages/Setting";

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Dashboard/>}/>
                <Route path="/settings" element={<Settings/>}/>
            </Routes>
        </Router>
    );
}

export default App;
