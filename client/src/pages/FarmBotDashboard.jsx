import React from 'react';
import { Link } from 'react-router-dom';
import Settings from "./Setting";
import '../farmbot-dashboard.css';
import '../index.css';

export default function FarmBotDashboard() {
    return (
        <div className="dashboard-container">
            {/* Top Header */}

            {/* Header */}
            <header className="dashboard-header">
                <h1 className="dashboard-title">
                    🚜 <span>FarmBot</span>
                </h1>
                <div className="dashboard-status-bar">
                    <div className="status-indicator-container">
                        <span className="status-dot">●</span>
                        <span>Online</span>
                    </div>
                    <div className="refresh-button-container">
                        <button className="refresh-button" aria-label="Refresh dashboard status">
                            🔄 Refresh
                        </button>
                    </div>

                    <div className="settings-container">
                        <Settings />
                    </div>
                </div>
            </header>

            {/* Main Layout */}
            <div className="dashboard-layout">
                {/* Sidebar */}
                <aside className="dashboard-sidebar">
                    <nav className="sidebar-nav">
                        <a href="#" className="nav-link-active">🏠 Dashboard</a>
                        {/*<a href="#" className="nav-link">🌱 Seeding</a>*/}
                        {/*<a href="#" className="nav-link">💧 Watering</a>*/}
                        <a href="#" className="nav-link">📊 Monitor</a>
                    </nav>
                </aside>

                {/* Content */}
                <main className="dashboard-main">
                    {/* Job Cards */}
                    <div className="dashboard-card">
                        <div className="card-icon">🌱</div>
                        <h2 className="card-title">Seeding</h2>
                        <Link to="/seeding/parameters">
                            <button className="card-button">View Jobs</button>
                        </Link>
                    </div>

                    <div className="dashboard-card">
                        <div className="card-icon">💧</div>
                        <h2 className="card-title">Watering</h2>
                        <button className="card-button">View Jobs</button>
                    </div>

                    <div className="dashboard-card">
                        <div className="card-icon">🌿</div>
                        <h2 className="card-title">Weed Control</h2>
                        <button className="card-button">View Jobs</button>
                    </div>

                    <div className="dashboard-card">
                        <div className="card-icon">💨</div>
                        <h2 className="card-title">Humidity</h2>
                        <button className="card-button">View Jobs</button>
                    </div>

                    {/* Passive Monitoring Panel */}
                    <div className="dashboard-card">
                        <div className="status-card-icon">🤖</div>
                        <h3 className="status-card-title">Bot Status</h3>
                        <p className="status-online">Online</p>
                        <p>Humidity: 51%</p>
                        <p>Next Job: Seeding at 03:00</p>
                    </div>

                    {/* Recent Activity */}
                    <div className="dashboard-card">
                        <div className="status-card-icon">📋</div>
                        <h3 className="activity-card-title">Recent Activity</h3>
                        <ul className="activity-list">
                            <li>✅ Seeding job finished at 02:55</li>
                            <li>💧 Watering started at 03:00</li>
                            <li>🤖 Bot resumed from idle</li>
                        </ul>
                    </div>
                </main>
            </div>
        </div>
    );
}
