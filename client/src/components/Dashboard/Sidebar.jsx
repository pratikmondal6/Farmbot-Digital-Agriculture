import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';


export default function Sidebar({onSelectComponent}) {
    const [activeClass, setActiveClass] = useState("dashboard")
    const [isHovered, setIsHovered] = useState(false);

    const getClass = (name) => {
        return activeClass === name ? "nav-link-active" : "nav-link";
    };


    return (
        <aside className="dashboard-sidebar" onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}>
            <nav className="sidebar-nav">
                <button className={getClass("dashboard")} onClick={() => {onSelectComponent("dashboard"); setActiveClass("dashboard")}}>
                    🏠 {(activeClass == "dashboard" || isHovered) && <span>Dashboard</span>}
                </button>
                <button className={getClass("addPlantType")} onClick={() => {onSelectComponent("addPlantType"); setActiveClass("addPlantType")}}>
                    🌱 {(activeClass == "dashboard" || isHovered) && <span>Add plant type</span>}
                </button>
                <button className={getClass("seedingJob")} onClick={() => {onSelectComponent("seedingJob"); setActiveClass("seedingJob")}}>
                    🪏 {(activeClass == "dashboard" || isHovered) && <span>Seeding job</span>}
                </button>
                <button className={getClass("seedingJobQueue")} onClick={() => {onSelectComponent("seedingJobQueue"); setActiveClass("seedingJobQueue")}}>
                    🪏 {(activeClass == "dashboard" || isHovered) && <span>Seeding job queue</span>}
                </button>
                <button className={getClass("humidityCheckPage")} onClick={() => {onSelectComponent("humidityCheckPage"); setActiveClass("humidityCheckPage")}}>
                    💧 {(activeClass == "dashboard" || isHovered) && <span>Soil humidity check</span>}
                </button>
                <button className={getClass("botControlPanel")} onClick={() => {onSelectComponent("botControlPanel"); setActiveClass("botControlPanel")}}>
                    🕹️ {(activeClass == "dashboard" || isHovered) && <span>Bot control panel</span>}
                </button>
                <button
                  className={getClass("wateringJobPage")} onClick={() => { onSelectComponent("wateringJobPage"); setActiveClass("wateringJobPage");}}> 
                    🚿 {(activeClass === "dashboard" || isHovered) && <span>Watering jobs</span>}
                </button>
            </nav>
        </aside>
    );
}
