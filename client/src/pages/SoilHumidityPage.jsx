import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import '../styles/soil-humidity-page.css';

// Component to render the humidity heatmap
const HumidityHeatmap = ({ readings, area }) => {
    if (!readings || !area) return null;

    // Calculate the bounds of the selected area
    const minX = Math.min(area.topLeft.x, area.bottomLeft.x);
    const maxX = Math.max(area.topRight.x, area.bottomRight.x);
    const minY = Math.min(area.bottomLeft.y, area.bottomRight.y);
    const maxY = Math.max(area.topLeft.y, area.topRight.y);

    // Calculate width and height of the area
    const width = maxX - minX;
    const height = maxY - minY;

    // Function to get color based on humidity value
    const getHumidityColor = (value) => {
        // Color scale from dry (red) to wet (blue)
        if (value < 25) return `rgba(255, 0, 0, 0.7)`; // Very dry - red
        if (value < 50) return `rgba(255, 165, 0, 0.7)`; // Dry - orange
        if (value < 75) return `rgba(255, 255, 0, 0.7)`; // Medium - yellow
        return `rgba(0, 0, 255, 0.7)`; // Wet - blue
    };

    // Create a grid of cells for the heatmap
    const cellSize = 20; // Size of each cell in the heatmap
    const numCellsX = Math.ceil(width / cellSize);
    const numCellsY = Math.ceil(height / cellSize);

    // Create an interpolated grid of humidity values
    const grid = [];
    for (let y = 0; y < numCellsY; y++) {
        for (let x = 0; x < numCellsX; x++) {
            const cellX = minX + (x * cellSize);
            const cellY = minY + (y * cellSize);

            // Interpolate humidity value based on distance to each reading
            let totalWeight = 0;
            let weightedSum = 0;

            readings.forEach(reading => {
                // Calculate distance from cell to reading
                const distance = Math.sqrt(
                    Math.pow(cellX - reading.x, 2) + 
                    Math.pow(cellY - reading.y, 2)
                );

                // Use inverse distance weighting
                const weight = distance === 0 ? 1000 : 1 / (distance * distance);
                totalWeight += weight;
                weightedSum += weight * parseInt(reading.value);
            });

            const interpolatedValue = totalWeight > 0 ? weightedSum / totalWeight : 0;

            grid.push({
                x: cellX,
                y: cellY,
                value: interpolatedValue
            });
        }
    }

    return (
        <div className="humidity-heatmap-container">
            <h3>Humidity Heatmap</h3>
            <div className="heatmap-legend">
                <div className="legend-item">
                    <div className="legend-color" style={{ backgroundColor: 'rgba(255, 0, 0, 0.7)' }}></div>
                    <span>Very Dry (0-25%)</span>
                </div>
                <div className="legend-item">
                    <div className="legend-color" style={{ backgroundColor: 'rgba(255, 165, 0, 0.7)' }}></div>
                    <span>Dry (25-50%)</span>
                </div>
                <div className="legend-item">
                    <div className="legend-color" style={{ backgroundColor: 'rgba(255, 255, 0, 0.7)' }}></div>
                    <span>Medium (50-75%)</span>
                </div>
                <div className="legend-item">
                    <div className="legend-color" style={{ backgroundColor: 'rgba(0, 0, 255, 0.7)' }}></div>
                    <span>Wet (75-100%)</span>
                </div>
            </div>
            <svg 
                width="100%" 
                height="300" 
                viewBox={`${minX} ${minY} ${width} ${height}`}
                style={{ border: '1px solid #ccc', marginTop: '10px' }}
                preserveAspectRatio="xMidYMid meet"
            >
                {/* Render the selected area outline */}
                <path 
                    d={`M ${area.topLeft.x} ${area.topLeft.y} 
                        L ${area.topRight.x} ${area.topRight.y} 
                        L ${area.bottomRight.x} ${area.bottomRight.y} 
                        L ${area.bottomLeft.x} ${area.bottomLeft.y} Z`}
                    fill="none"
                    stroke="#000"
                    strokeWidth="2"
                />

                {/* Render the heatmap cells */}
                {grid.map((cell, index) => (
                    <rect
                        key={index}
                        x={cell.x}
                        y={cell.y}
                        width={cellSize}
                        height={cellSize}
                        fill={getHumidityColor(cell.value)}
                    />
                ))}

                {/* Render the actual reading points */}
                {readings.map((reading, index) => (
                    <circle
                        key={index}
                        cx={reading.x}
                        cy={reading.y}
                        r="5"
                        fill="#fff"
                        stroke="#000"
                        strokeWidth="1"
                    />
                ))}
            </svg>
            <div className="humidity-readings">
                <h4>Humidity Readings:</h4>
                <ul>
                    {readings.map((reading, index) => (
                        <li key={index}>
                            Point {reading.point}: {reading.value}% 
                            {reading.simulated ? ' (Simulated)' : ''}
                            at ({reading.x}, {reading.y})
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

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

                    // Store the area in state for the heatmap
                    setSelectedArea(response.data.area);

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
            setLoading(prev => ({...prev, measure: false}));
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
                            onClick={() => {
                                setSelectArea(!selectArea)
                            }}
                        >
                            Select Area
                        </button>
                        <input
                            value={selectedAreaLocation ? `(${selectedAreaLocation.bottomLeft.x}, ${selectedAreaLocation.bottomLeft.y}) to (${selectedAreaLocation.topRight.x}, ${selectedAreaLocation.topRight.y})` : ''}
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

                {/* Render the heatmap if we have humidity readings */}
                {humidityReadings && selectedArea && (
                    <HumidityHeatmap readings={humidityReadings} area={selectedArea} />
                )}
            </div>
        </div>
    );
};

export default SoilHumidityPage;
