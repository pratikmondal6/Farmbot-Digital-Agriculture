import React from 'react';
import MainLayout from '../components/Dashboard/MainLayout';
import Header from '../components/Dashboard/Header';
import '../styles/farmbot-dashboard.css';

export default function FarmBotDashboard() {
    return (
        <div className="dashboard-container">
            <Header />
            <MainLayout />
        </div>
    );
}
