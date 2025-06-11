import React from 'react';

export default function Sidebar() {
    const handleDashboardClick = (e) => {
        e.preventDefault(); // Prevent default link behavior
        window.location.href = '/dashboard'; // Navigate to /dashboard and reload
    };

    return (
        <aside className="dashboard-sidebar">
            <nav className="sidebar-nav">
                <a href="/dashboard" className="nav-link-active" onClick={handleDashboardClick}>
                    🏠 Dashboard
                </a>
            </nav>
        </aside>
    );
}
