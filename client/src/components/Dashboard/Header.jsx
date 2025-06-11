import React, { useEffect, useState } from 'react';
import Settings from '../../pages/Setting';
import '../../styles/header.css';
import axios from 'axios';

export default function Header() {
    const [status, setStatus] = useState('unknown');

    const fetchStatus = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/status');
            setStatus(response.data.status);
        } catch (error) {
            console.error('Failed to fetch bot status:', error);
            setStatus('error');
        }
    };

    useEffect(() => {
        fetchStatus();

        // Optional: Polling every 5 seconds for live update
        const interval = setInterval(fetchStatus, 5000);
        return () => clearInterval(interval);
    }, []);

    const handleRefreshClick = () => {
        window.location.reload(); // Refresh the entire page
    };

    const getDotColor = () => {
        if (status === 'online') return 'yellow';
        if (status === 'offline') return 'red';
        return 'gray';
    };

    return (
        <header className="header">
            <h1 className="header-title">🚜 FarmBot</h1>
            <div className="header-status-bar">
                <div className="header-item">
                    <span
                        className="status-dot"
                        style={{ color: getDotColor() }}
                    >
                        ●
                    </span>
                    <span>{status.charAt(0).toUpperCase() + status.slice(1)}</span>
                </div>
                <div
                    className="header-item"
                    onClick={handleRefreshClick}
                    style={{ cursor: 'pointer' }}
                >
                    🔄 <span>Refresh</span>
                </div>
                <div className="header-item">
                    <Settings />
                </div>
            </div>
        </header>
    );
}
