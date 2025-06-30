import React, { useEffect, useState } from 'react';
import axios from 'axios';

export default function StatusCard() {
    const [status, setStatus] = useState('unknown');

    const fetchStatus = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/status');
            setStatus(response.data.status);
        } catch (err) {
            console.error('Failed to fetch status:', err);
            setStatus('error');
        }
    };

    useEffect(() => {
        fetchStatus();
        const interval = setInterval(fetchStatus, 5000); // Refresh every 5s
        return () => clearInterval(interval);
    }, []);

    const getStatusClass = () => {
        switch (status) {
            case 'online': return 'status-online';
            case 'offline': return 'status-offline';
            case 'error': return 'status-error';
            default: return 'status-unknown';
        }
    };

    return (
        <span>
                {status.charAt(0).toUpperCase() + status.slice(1)}
        </span>
    )

    // return (
    //     <div className="dashboard-card">
    //         <div className="status-card-icon">🤖</div>
    //         <h3 className="status-card-title">Bot Status</h3>
    //         <p className={getStatusClass()}>
    //             {status.charAt(0).toUpperCase() + status.slice(1)}
    //         </p>
    //     </div>
    // );
}
