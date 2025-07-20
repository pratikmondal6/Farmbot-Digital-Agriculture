import React, { useState } from 'react';
import Header from '../components/Dashboard/Header';
import '../styles/farmbot-dashboard.css';
import Sidebar from '../components/Dashboard/Sidebar';
import FieldMap from '../components/FieldMap';
import SeedingPage from './SeedingPage';
import FarmbotMoving from './FarmbotMoving';
import AddPlanttype from './AddPlanttype';
import SeedingJobQueue from './SeedingJobQueue';
import WateringJobPage from './WateringJobPage';
import SoilHumidityPage from './SoilHumidityPage';


export default function FarmBotDashboard() {
    const [visibleComponent, setVisibleComponent] = useState("")
    const [seedPoints, setSeedPoints] = useState({})
    const [selectArea, setSelectArea] = useState(false)
    const [seedingAreaLocation, setSeedingAreaLocation] = useState(null)
    const [reloadCounter, setReloadCounter] = useState(0);
    const [selectedPlantType, setSelectedPlantType] = useState(null);

    const triggerReload = () => setReloadCounter(prev => prev + 1);


    const handleComponentSelection = (visibleComp) => {
        setVisibleComponent(visibleComp);
        setSeedingAreaLocation(null)
        triggerReload()
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
                {visibleComponent=="seedingJob" && <SeedingPage seedLocation={seedPoints} selectArea={selectArea} setSelectArea={setSelectArea} seedingAreaLocation={seedingAreaLocation} setSeedingAreaLocation={setSeedingAreaLocation} setVisibleComponent={handleComponentSelection} onDone={triggerReload} setSelectedPlantType={setSelectedPlantType}/>}
                {visibleComponent=="seedingJobQueue" && <SeedingJobQueue seedLocation={seedPoints} selectArea={selectArea} setSelectArea={setSelectArea} seedingAreaLocation={seedingAreaLocation} setSeedingAreaLocation={setSeedingAreaLocation} onDone={triggerReload} setSelectedPlantType={setSelectedPlantType}/>}
                {visibleComponent=="botControlPanel" && <FarmbotMoving />}
                {visibleComponent=="addPlantType" && <AddPlanttype />}
                {visibleComponent=="c" && <SeedingPage />}
                {visibleComponent=="wateringJobPage" && <WateringJobPage />}
                {visibleComponent=="soilHumidityPage" && <SoilHumidityPage selectArea={selectArea} setSelectArea={setSelectArea} selectedAreaLocation={seedingAreaLocation} setSelectedAreaLocation={setSeedingAreaLocation} />}
                <FieldMap activeComponent={visibleComponent} onAreaSelect={handleAreaSelect} selectArea={selectArea} onElementClick={handleClickElement} reloadTrigger={reloadCounter} plantType={selectedPlantType}/>
            </div>
        </div>
    );
}
