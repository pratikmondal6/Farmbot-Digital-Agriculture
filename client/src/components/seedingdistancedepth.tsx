import React, { useState } from 'react';

const SeedingDistanceDepth = () => {
    const [isOpen, setIsOpen] = useState(false);

    const toggleSidebar = () => {
        setIsOpen(!isOpen);
    }

    return (
        <div style={{ position: 'relative', height: '100vh' }}>
            <button
                style={{
                    backgroundColor: 'green',
                    color: 'white',
                    padding: '10px 20px',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: 'pointer',
                    position: 'absolute',
                    top: '20px',
                    left: '20px',
                    zIndex: 2
                }}
                onClick={toggleSidebar}
            >
                {isOpen ? 'Close' : 'Open'}
            </button>
            {/* Sidebar */}
            <div
                style={{
                    position: 'fixed',
                    top: 0,
                    left: isOpen ? 0 : '-300px',
                    width: '300px',
                    height: '100%',
                    backgroundColor: '#d4f5dd', // light green
                    boxShadow: '2px 0 5px rgba(0,0,0,0.3)',
                    transition: 'left 0.3s ease',
                    padding: '20px',
                    zIndex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'flex-start'
                }}
            >
                <div
                    style={{
                        color: '#14532d',
                        marginTop: '38px' // 1 cm below the top (and button)
                    }}
                >
                    <h2 style={{ marginBottom: '8px' }}>Set the seeding depth</h2>
                    <p style={{ margin: 0 }}>The normal seeding depth is x cm. You can chose a number between y and z.</p>
                </div>
            </div>
        </div>
    );
};

export default SeedingDistanceDepth;