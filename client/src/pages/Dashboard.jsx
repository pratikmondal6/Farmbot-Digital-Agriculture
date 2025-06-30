import React, { useState } from 'react';
import Header from '../components/Dashboard/Header';
import '../styles/farmbot-dashboard.css';
import Sidebar from '../components/Dashboard/Sidebar';
import FieldMap from '../components/FieldMap';
import SeedingPage from './SeedingPage';
import HumidityCheckPage from './HumidityCheckPage';
import FarmbotMoving from './FarmbotMoving';
import AddPlanttype from './AddPlanttype';
import WateringJobPage from './WateringJobPage';


export default function FarmBotDashboard() {
    const [visibleComponent, setVisibleComponent] = useState("")

    const handleComponentSelection = (visibleComp) => {
        setVisibleComponent(visibleComp);
    };

    return (
        <div className="dashboard-container">
            <Header />
            <div className="dashboard-items">
                <Sidebar onSelectComponent={handleComponentSelection}/>
                {visibleComponent=="seedingJob" && <SeedingPage />}
                {visibleComponent=="humidityCheckPage" && <HumidityCheckPage />}
                {visibleComponent=="botControlPanel" && <FarmbotMoving />}
                {visibleComponent=="addPlantType" && <AddPlanttype />}
                {visibleComponent=="c" && <SeedingPage />}
                {visibleComponent=="wateringJobPage" && <WateringJobPage />}
                <FieldMap activeComponent={visibleComponent} />
            </div>
        </div>
    );
}
