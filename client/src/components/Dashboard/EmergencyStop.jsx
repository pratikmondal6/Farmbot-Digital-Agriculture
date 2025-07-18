import React, { useEffect, useState } from 'react';
import api from "../../utils/api";


export default function EmergencyStop() {
    const [locked, setLocked] = useState(false)
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        const fetchLockedStatus = async () => {
            const response = await api.get("/farmbotPosition")
            setLocked(response.data.locked)
        }
        fetchLockedStatus()
    }, []);
    
    useEffect(() => {
        const interval = setInterval(async () => {
            const response = await api.get("/farmbotPosition")
            setLocked(response.data.locked)
        }, 10000);

        return () => clearInterval(interval); // Cleanup on unmount
    }, []); // Empty deps = run once on mount

    const handleStopButton = async () => {
        setLoading(true)
        if (locked) {
            await api.get("/emergencyStop/unlock")
        }
        else {
            await api.get("/emergencyStop/stop")
        }
        setLoading(false)
        setLocked(!locked)
    }

    return (
        <button
            type='button'
            onClick={() => handleStopButton()}
            disabled={loading}
            >
            {
                loading && locked ? "Unlocking..." :
                loading && !locked ? "Stopping..." :
                !loading && locked ? "Unlock" :
                "Stop"
            }
        </button>
    )

}
