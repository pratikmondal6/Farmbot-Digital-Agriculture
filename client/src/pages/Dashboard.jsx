import React, { useState } from 'react';
import Header from '../components/Dashboard/Header';
import '../styles/farmbot-dashboard.css';
import Sidebar from '../components/Dashboard/Sidebar';
import FieldMap from '../components/FieldMap';
import SeedingPage from './SeedingPage';
import HumidityCheckPage from './HumidityCheckPage';
import FarmbotMoving from './FarmbotMoving';
import AddPlanttype from './AddPlanttype';
import SeedingJobQueue from './SeedingJobQueue';


export default function FarmBotDashboard() {
    const [visibleComponent, setVisibleComponent] = useState("")
    const [seedPoints, setSeedPoints] = useState({})
    const [selectArea, setSelectArea] = useState(false)
    const [seedingAreaLocation, setSeedingAreaLocation] = useState()

    const handleComponentSelection = (visibleComp) => {
        setVisibleComponent(visibleComp);
    };

    const handleClickElement = ({x, y ,z}) => {
        setSeedPoints({x:x, y:y, z:z})
    }

    const handleAreaSelect = (points) => {
        setSeedingAreaLocation(points)
    }

    return (
        <div className="dashboard-container">
            <Header />
            <div className="dashboard-items">
                <Sidebar onSelectComponent={handleComponentSelection}/>
                {visibleComponent=="seedingJob" && <SeedingPage seedLocation={seedPoints} selectArea={selectArea} setSelectArea={setSelectArea} seedingAreaLocation={seedingAreaLocation}/>}
                {visibleComponent=="seedingJobQueue" && <SeedingJobQueue />}
                {visibleComponent=="humidityCheckPage" && <HumidityCheckPage />}
                {visibleComponent=="botControlPanel" && <FarmbotMoving />}
                {visibleComponent=="addPlantType" && <AddPlanttype />}
                {visibleComponent=="c" && <SeedingPage/>}
                <FieldMap activeComponent={visibleComponent} onAreaSelect={handleAreaSelect} selectArea={selectArea} onElementClick={handleClickElement}/>
            </div>
        </div>
    );
}
