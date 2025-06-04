import React from 'react';

export default function Card({ icon, title, children }) {
    return (
        <div className="dashboard-card">
            <div className="card-icon">{icon}</div>
            <h2 className="card-title">{title}</h2>
            {children}
        </div>
    );
}
