import React from 'react';
import Sidebar from './Sidebar';
import Card from './Card';
import StatusCard from './StatusCard';
import ActivityCard from './ActivityCard';
import { Link } from 'react-router-dom';
import FarmBotControlPanel from "./FarmBotControlPanel";

export default function MainLayout() {
    return (
        <div className="dashboard-layout">
            <Sidebar />
            <main className="dashboard-main">
                <Card icon="🌱" title="Add plant type">
                    <Link to="/seeding/parameters">
                        <button className="card-button">View Jobs</button>
                    </Link>
                </Card>
                <Card icon="🌱" title="Seeding Job">
                    <Link to="/seedingJob">
                        <button className="card-button">View Jobs</button>
                    </Link>
                </Card>
                {/*<Card icon="💧" title="Watering">
                    <button className="card-button">View Jobs</button>
                </Card>
                <Card icon="🌿" title="Weed Control">
                    <button className="card-button">View Jobs</button>
                </Card>*/}
                <Card icon="💧" title="Soil Humidity Check">
                    <Link to="/humidity-check">
                        <button className="card-button">Check Humidity</button>
                    </Link>
                </Card>
                <StatusCard />
                {/*<ActivityCard />*/}
                <FarmBotControlPanel/>
            </main>
        </div>
    );
}
