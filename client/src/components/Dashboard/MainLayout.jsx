import React from 'react';
import Sidebar from './Sidebar';
import Card from './Card';
import StatusCard from './StatusCard';
import ActivityCard from './ActivityCard';
import { Link } from 'react-router-dom';

export default function MainLayout() {
    return (
        <div className="dashboard-layout">
            <Sidebar />
            <main className="dashboard-main">
                <Card icon="🌱" title="Seeding">
                    <Link to="/seeding/parameters">
                        <button className="card-button">View Jobs</button>
                    </Link>
                </Card>
                {/*<Card icon="💧" title="Watering">
                    <button className="card-button">View Jobs</button>
                </Card>
                <Card icon="🌿" title="Weed Control">
                    <button className="card-button">View Jobs</button>
                </Card>
                <Card icon="💨" title="Humidity">
                    <button className="card-button">View Jobs</button>
                // </Card>*/}
                <StatusCard />
                {/*<ActivityCard />*/}
            </main>
        </div>
    );
}
