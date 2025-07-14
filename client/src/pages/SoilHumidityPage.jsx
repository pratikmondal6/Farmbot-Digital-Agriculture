import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/soil-humidity-page.css';

const SoilHumidityPage = ({ selectArea, setSelectArea, selectedAreaLocation }) => {
    const [loading, setLoading] = useState({
        measure: false,
        return: false
    });

    const handleSelectArea = () => {
        setSelectArea(true);
        selectedAreaLocation = null;
    };

    const handleMeasureHumidity = async () => {
        try {
            setLoading(prev => ({ ...prev, measure: true }));
            const response = await axios.post('/api/humidity/measure', {
                area: selectedAreaLocation
            });

            if (response.status === 200) {
                alert('Humidity measurement completed successfully.');
            }
        } catch (error) {
            console.error('Error measuring humidity:', error);
            alert('Failed to measure humidity. Please try again.');
        } finally {
            setLoading(prev => ({ ...prev, measure: false }));
        }
    };

    const handleReturnDevice = async () => {
        try {
            setLoading(prev => ({ ...prev, return: true }));
            const response = await axios.post('/api/device/return-home');

            if (response.status === 200) {
                alert('Device returned to original position.');
            }
        } catch (error) {
            console.error('Error returning device:', error);
            alert('Failed to return device. Please try again.');
        } finally {
            setLoading(prev => ({ ...prev, return: false }));
        }
    };

    return (
        <div className="soil-humidity-container">
            <div>
                <form
                    className="soil-humidity-form"
                    style={{
                        background: "#f0fdf4",
                        borderRadius: 12,
                        padding: "16px 10px 24px 10px",
                        boxShadow: "0 2px 8px #0002"
                    }}
                >
                    <h2 className="soil-humidity-title">Soil Humidity Measurement</h2>

                    <label className="soil-humidity-label">Measurement Area</label>
                    <div className="soil-humidity-area-selection">
                        <button
                            type='button'
                            className="soil-humidity-button-select"
                            onClick={handleSelectArea}
                        >
                            Select Area
                        </button>
                        <input
                            value={selectedAreaLocation ? `(${selectedAreaLocation.topLeft.x}, ${selectedAreaLocation.topLeft.y}) to (${selectedAreaLocation.bottomRight.x}, ${selectedAreaLocation.bottomRight.y})` : ''}
                            disabled
                            type="text"
                        />
                    </div>

                    <div className="soil-humidity-button-container">
                        <button
                            type="button"
                            className="soil-humidity-button"
                            onClick={handleMeasureHumidity}
                            disabled={!selectedAreaLocation || loading.measure}
                        >
                            {loading.measure ? 'Measuring...' : 'Measure Humidity'}
                        </button>
                        <button
                            type="button"
                            className="soil-humidity-button"
                            onClick={handleReturnDevice}
                            disabled={loading.return}
                        >
                            {loading.return ? 'Returning...' : 'Return Device'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default SoilHumidityPage;