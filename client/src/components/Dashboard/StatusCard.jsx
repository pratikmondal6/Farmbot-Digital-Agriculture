import React from 'react';

export default function StatusCard() {
    return (
        <div className="dashboard-card">
            <div className="status-card-icon">🤖</div>
            <h3 className="status-card-title">Bot Status</h3>
            <p className="status-online">Online</p>
        </div>
    );
}
