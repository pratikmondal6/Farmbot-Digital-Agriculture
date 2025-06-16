import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function FarmBotControlPanel() {
    const navigate = useNavigate();

    const handleClick = () => {
        navigate('/farmbot-moving');
    };


    return (
        <div className="dashboard-card">
            <div className="card-icon">🕹️</div>
            <h3 className="card-title">Bot Control Panel</h3>
            <button className="card-button" onClick={handleClick}>
                Go to Control
            </button>
        </div>
    );
}
