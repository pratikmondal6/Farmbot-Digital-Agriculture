import React, {useState} from "react";
import Settings from "./Setting";

function Dashboard() {
    return (
        <div className="dashboard-container">
            <Settings />
            <div className="dashboard-content">
                <h1>Dashboard Content</h1>
                <p>This is the main content of the dashboard. The settings icon is positioned in the top-right corner.</p>
                <p>When clicked, the settings form will appear as an overlay without affecting the layout of this content.</p>
            </div>
        </div>
    );
}

export default Dashboard;
