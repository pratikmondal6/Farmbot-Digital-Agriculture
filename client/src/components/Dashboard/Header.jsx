import React, { useState } from 'react';
import Settings from '../../pages/Setting';
import '../../styles/header.css';
import { useNavigate } from 'react-router-dom';

export default function Header() {
    const navigate = useNavigate();
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

    const handleRefreshClick = () => {
        window.location.reload(); // Reload the entire page
    };

    const handleLogoutClick = () => {
        setShowLogoutConfirm(true);
    };

    const handleLogoutConfirm = () => {
        // Clear session token
        sessionStorage.removeItem('token');
        // Redirect to login page
        navigate('/');
        setShowLogoutConfirm(false);
    };

    const handleLogoutCancel = () => {
        setShowLogoutConfirm(false);
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
                <div className="header-item" onClick={handleLogoutClick}>
                    🚪
                    <span>Logout</span>
                </div>
            </div>

            {showLogoutConfirm && (
                <div className="logout-confirm-overlay">
                    <div className="logout-confirm-dialog">
                        <p>Are you sure you want to logout?</p>
                        <div className="logout-confirm-buttons">
                            <button onClick={handleLogoutConfirm}>Yes</button>
                            <button onClick={handleLogoutCancel}>No</button>
                        </div>
                    </div>
                </div>
            )}
        </header>
    );
}
