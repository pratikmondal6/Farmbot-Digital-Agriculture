import React from 'react';
import Settings from '../../pages/Setting';
import '../../styles/header.css';

export default function Header() {
    const handleRefreshClick = () => {
        window.location.reload(); // Reload the entire page
    };

    return (
        <header className="header">
            <h1 className="header-title">🚜 FarmBot</h1>
            <div className="header-status-bar">
                <div className="header-item">
                    <span className="status-dot">●</span>
                    <span>Online</span>
                </div>
                <div className="header-item" onClick={handleRefreshClick} style={{ cursor: 'pointer' }}>
                    🔄
                    <span>Refresh</span>
                </div>
                <div className="header-item">
                    <Settings />
                </div>
            </div>
        </header>
    );
}
