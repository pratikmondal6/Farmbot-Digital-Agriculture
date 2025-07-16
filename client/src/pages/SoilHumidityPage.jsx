import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import '../styles/soil-humidity-page.css';

const SoilHumidityPage = ({ selectArea, setSelectArea, selectedAreaLocation, onHumidityReadings }) => {
    const [loading, setLoading] = useState({
        measure: false
    });
    const [humidityReadings, setHumidityReadings] = useState(null);
    const [selectedArea, setSelectedArea] = useState(null);

    const handleSelectArea = () => {
        setSelectArea(true);
    };

    const handleMeasureHumidity = async () => {
        try {
            setLoading(prev => ({ ...prev, measure: true }));

            // Validate selectedAreaLocation
            if (!selectedAreaLocation || 
                !selectedAreaLocation.topLeft || !selectedAreaLocation.topRight || 
                !selectedAreaLocation.bottomLeft || !selectedAreaLocation.bottomRight) {
                throw new Error('Invalid area selection. Please select an area again.');
            }

            // Validate that each corner has valid x and y coordinates
            const corners = ['topLeft', 'topRight', 'bottomLeft', 'bottomRight'];
            for (const corner of corners) {
                if (selectedAreaLocation[corner].x === undefined || selectedAreaLocation[corner].y === undefined) {
                    throw new Error(`Invalid coordinates for ${corner}. Please select an area again.`);
                }
            }

            // Validate that user is logged in
            if (!sessionStorage.getItem('token')) {
                throw new Error('Authentication token not found. Please log in again.');
            }

            // Store the selected area in state
            setSelectedArea(selectedAreaLocation);

            // Then send the request to the areaHumidity endpoint with the selected area coordinates
            try {
                const response = await api.post('/api/areaHumidity/measure', {
                    topLeft: selectedAreaLocation.topLeft,
                    topRight: selectedAreaLocation.topRight,
                    bottomLeft: selectedAreaLocation.bottomLeft,
                    bottomRight: selectedAreaLocation.bottomRight
                });

                if (response.status === 200) {
                    // Store the humidity readings in state
                    setHumidityReadings(response.data.readings);

                    // Pass the humidity readings and area to the parent component
                    if (onHumidityReadings) {
                        onHumidityReadings({
                            readings: response.data.readings,
                            area: response.data.area
                        });
                    }

                    alert('Humidity measurement completed successfully.');
                } else {
                    throw new Error(response.data && response.data.message ? response.data.message : 'Unknown error');
                }
            } catch (error) {
                if (error.response && error.response.status === 404) {
                    throw new Error('Humidity measurement endpoint not found. Please contact support.');
                }
                throw error; // Re-throw the error to be caught by the outer catch block
            }
        } catch (error) {
            console.error('Error measuring humidity:', error);
            let errorMessage = 'Failed to measure humidity. Please try again.';
            if (error.response) {
                // The request was made and the server responded with a status code
                // that falls out of the range of 2xx
                console.error('Error response data:', error.response.data);
                console.error('Error response status:', error.response.status);
                errorMessage = `Failed to measure humidity: ${error.response.data.message || error.response.statusText}`;
            } else if (error.request) {
                // The request was made but no response was received
                console.error('Error request:', error.request);
                errorMessage = 'Failed to measure humidity: No response received from server.';
            } else {
                // Something happened in setting up the request that triggered an Error
                console.error('Error message:', error.message);
                errorMessage = `Failed to measure humidity: ${error.message}`;
            }
            alert(errorMessage);
        } finally {
            setLoading(prev => ({ ...prev, measure: false }));
        }
    };


    return (
        <div className="soil-humidity-container">
            <div>
                <form className="soil-humidity-form">
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
                    </div>
                </form>
            </div>
        </div>
    );
};

export default SoilHumidityPage;
