import React from 'react';

export default function ActivityCard() {
    return (
        <div className="dashboard-card">
            <div className="status-card-icon">📋</div>
            <h3 className="activity-card-title">Recent Activity</h3>
            <ul className="activity-list">
                <li>✅ Seeding job finished at 02:55</li>
                <li>💧 Watering started at 03:00</li>
                <li>🤖 Bot resumed from idle</li>
            </ul>
        </div>
    );
}
