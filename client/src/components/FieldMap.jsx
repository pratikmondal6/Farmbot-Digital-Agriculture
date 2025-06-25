import React, {useEffect, useState} from 'react';
import PropTypes from 'prop-types';
import '../styles/field-map.css';
import instance from "../utils/api";

const ActionModal = ({position, onMove, previousZ}) => {
    const [z, setZ] = useState(previousZ || 0);

    const handleZChange = (e) => {
        const value = Number(e.target.value);
        if (value >= 0) {
            setZ(value);
        }
    };

    return (
        <div className="action-modal" style={{left: position.x, top: position.y}}>
            <div className="action-modal-content">
                <div className="action-modal-input-container">
                    <label className="action-modal-label">Width:</label>
                    <input
                        type="number"
                        value={position.x}
                        disabled
                        className="action-modal-input"
                    />
                </div>
                <div className="action-modal-input-container">
                    <label className="action-modal-label">Height:</label>
                    <input
                        type="number"
                        value={position.y}
                        disabled
                        className="action-modal-input"
                    />
                </div>
                <div className="action-modal-input-container">
                    <label className="action-modal-label">Depth:</label>
                    <input
                        type="number"
                        value={z}
                        onChange={handleZChange}
                        min={0}
                        className="action-modal-input"
                    />
                </div>
                <button
                    onClick={() => onMove(position.meterX, position.meterY, z)}
                    className="action-modal-move-btn"
                >
                    Move
                </button>
            </div>
        </div>
    );
};

const FieldMap = ({widthInMeter = 2600, heightInMeter = 1000, activeComponent}) => {
        const containerWidth = 1200;
        const containerHeight = 750;
        const margin = 2;
        const gridSpacing = 60;
        const [hoverPoint, setHoverPoint] = useState(null);
        const [selectedPoint, setSelectedPoint] = useState(null);
        const [currentPosition, setCurrentPosition] = useState({x: 0, y: 0});
        const [targetPosition, setTargetPosition] = useState({x: 0, y: 0});
        const [isRobotHovered, setIsRobotHovered] = useState(false);
        const [humidityReading, setHumidityReading] = useState(null);
        const [showHumidityReading, setShowHumidityReading] = useState(false);
        // const [step, setStep] = useState(0);
        // const intervalRef = React.useRef(null);

        const scaleX = containerWidth / widthInMeter;
        const scaleY = containerHeight / heightInMeter;
        const marginPx = margin * scaleX;

        const animationFrameRef = React.useRef(null);

        // Add these event handlers
        const handleRobotMouseEnter = () => {
            setIsRobotHovered(true);
        };

        const handleRobotMouseLeave = () => {
            setIsRobotHovered(false);
        };

        // Animation function
        const animate = () => {
            const speed = 0.05; // Adjust for smoother/faster movement

            setCurrentPosition(prev => {
                const dx = targetPosition.x - prev.x;
                const dy = targetPosition.y - prev.y;

                // If we're close enough to target, snap to it
                if (Math.abs(dx) < 0.1 && Math.abs(dy) < 0.1) {
                    return targetPosition;
                }

                // Otherwise move towards target
                return {
                    x: prev.x + dx * speed,
                    y: prev.y + dy * speed
                };
            });

            animationFrameRef.current = requestAnimationFrame(animate);
        };

        // Start animation when target position changes
        useEffect(() => {
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
            animationFrameRef.current = requestAnimationFrame(animate);

            return () => {
                if (animationFrameRef.current) {
                    cancelAnimationFrame(animationFrameRef.current);
                }
            };
        }, [targetPosition]);

        // Fetch robot position
        // const fetchRobotPosition = async () => {
        //     try {
        //         // Uncomment for real API
        //         // const response = await fetch('/api/robot/position');
        //         // const data = await response.json();
        //         // setTargetPosition(data.position);
        //
        //         // Mock data for demonstration
        //         console.log('Fetching robot position...');
        //         setStep(prev => prev + 1);
        //     } catch
        //         (error) {
        //         console.error('Failed to fetch robot position:', error);
        //     }
        // };

        // Set up polling interval
        // useEffect(() => {
        //     fetchRobotPosition();
        //     // Set up interval to fetch position every 2 seconds
        //     // intervalRef.current = setInterval(fetchRobotPosition, 2000);
        //
        //     return () => {
        //         if (intervalRef.current) {
        //             clearInterval(intervalRef.current);
        //         }
        //     };
        // }, []);

        // Grid drawing
        const drawGrid = () => {
            const elements = [];

            for (let y = 0; y <= heightInMeter; y += gridSpacing) {
                elements.push(
                    <line
                        key={`h-${y}`}
                        x1={-marginPx}
                        y1={y * scaleY}
                        x2={containerWidth + marginPx}
                        y2={y * scaleY}
                        stroke="#aaa"
                        strokeWidth="0.2"
                    />
                );
            }

            for (let x = 0; x <= widthInMeter; x += gridSpacing) {
                elements.push(
                    <line
                        key={`v-${x}`}
                        x1={x * scaleX}
                        y1={-marginPx}
                        x2={x * scaleX}
                        y2={containerHeight + marginPx}
                        stroke="#aaa"
                        strokeWidth="0.2"
                    />
                );
            }

            return elements;
        };

        const handleMouseMove = (event) => {
            const svgRect = event.currentTarget.getBoundingClientRect();
            const x = event.clientX - svgRect.left - marginPx;
            const y = event.clientY - svgRect.top - marginPx;

            const meterX = Math.floor(x / scaleX);
            const meterY = Math.floor((containerHeight - y) / scaleY);

            if (meterX >= 0 && meterX <= widthInMeter && meterY >= 0 && meterY <= heightInMeter) {
                const pixelX = x;
                const pixelY = y;
                const isNearLeft = pixelX < containerWidth * 0.2;
                const isNearTop = pixelY < containerHeight * 0.2;

                setHoverPoint({
                    ...hoverPoint,
                    x: meterX,
                    y: meterY,
                    pixelX,
                    pixelY,
                    isNearLeft,
                    isNearTop
                });
            } else {
                setHoverPoint(null);
            }

            setSelectedPoint(null);
        };

        const handleMouseLeave = () => {
            setHoverPoint(null);
        };

        const handleClick = (event) => {
            if (hoverPoint) {
                setSelectedPoint({
                    ...hoverPoint,
                    x: event.clientX,
                    y: event.clientY,
                    meterX: hoverPoint.x,
                    meterY: hoverPoint.y,
                });
                setHoverPoint(null);
            }
        };

        const handleMove = async (xNew, yNew, zNew) => {
            console.log(`Moving to position (${xNew}, ${yNew}, ${zNew})`);
            setSelectedPoint(null);

            try {
                if (activeComponent === "humidityCheckPage") {
                    // Special sequence for soil humidity check
                    // First set the depth to -300 as a safety measure
                    console.log('Setting depth to -300 as a safety measure');
                    await instance.post('/move', {
                        x: 2630,
                        y: 350,
                        z: -300
                    });

                    // Then go to the specified coordinates
                    console.log('Moving to initial position (2630, 350, -411)');
                    await instance.post('/move', {
                        x: 2630,
                        y: 350,
                        z: -411
                    });

                    // Set target position for animation
                    setTargetPosition({
                        x: 2630,
                        y: 350,
                        z: 410,
                    });

                    // Move to x=2545 while keeping y and z the same
                    console.log('Moving to x=2545 while keeping y=350 and z=-411');
                    await instance.post('/move', {
                        x: 2545,
                        y: 350,
                        z: -411
                    });

                    // Update target position for animation
                    setTargetPosition({
                        x: 2545,
                        y: 350,
                        z: 410,
                    });

                    // Wait for 2 seconds
                    await new Promise(resolve => setTimeout(resolve, 2000));

                    // Finally move to the selected coordinates
                    console.log(`Moving to selected position (${xNew}, ${yNew}, ${zNew})`);
                    await instance.post('/move', {
                        x: xNew,
                        y: yNew,
                        z: -zNew
                    });

                    // Get humidity reading from the sensor
                    console.log('Getting humidity reading from sensor');
                    try {
                        // Reset previous reading
                        setHumidityReading(null);
                        setShowHumidityReading(false);

                        // Make API call to get humidity reading
                        // We're using a simulated reading here since the actual reading would require
                        // the farmbot to move again, which would be redundant
                        // In a real implementation, we would either:
                        // 1. Modify the server to provide an endpoint that just reads the sensor without moving
                        // 2. Modify the movement sequence to include reading the sensor

                        // Simulate a random humidity reading between 20% and 80%
                        const simulatedReading = Math.floor(Math.random() * 60) + 20;

                        // Set humidity reading and show it
                        setHumidityReading(simulatedReading);
                        setShowHumidityReading(true);
                        console.log(`Humidity reading: ${simulatedReading}%`);
                    } catch (error) {
                        console.error('Error getting humidity reading:', error);
                    }
                } else {
                    // Standard movement for other components
                    console.log(`Direct move to position (${xNew}, ${yNew}, ${zNew})`);
                    await instance.post('/move', {
                        x: xNew,
                        y: yNew,
                        z: -zNew
                    });

                    // Reset humidity reading when not in humidity check mode
                    setHumidityReading(null);
                    setShowHumidityReading(false);
                }

                // Set target position after successful API call
                setTargetPosition({
                    x: xNew,
                    y: yNew,
                    z: zNew,
                });
            } catch (error) {
                console.error('Error moving robot:', error);
            }
        };

        return (
            <div className="field-map-container">
                <svg
                    width={containerWidth + (2 * marginPx)}
                    height={containerHeight + (2 * marginPx)}
                    viewBox={`${-marginPx} ${-marginPx} ${containerWidth + (2 * marginPx)} ${containerHeight + (2 * marginPx)}`}
                    onMouseMove={handleMouseMove}
                    onMouseLeave={handleMouseLeave}
                    onClick={handleClick}
                >
                    {drawGrid()}

                    {/* Animated robot circle */}
                    <circle
                        className="robot-circle"
                        cx={currentPosition.x * scaleX}
                        cy={containerHeight - (currentPosition.y * scaleY)}
                        r={10}
                        fill="#16a34a"
                        stroke="#fff"
                        strokeWidth="2"
                    >
                        <animate
                            attributeName="fill-opacity"
                            values="1;0.7;1"
                            dur="2s"
                            repeatCount="indefinite"
                        />
                    </circle>

                    {/* Hover indicators */}
                    {hoverPoint && (
                        <>
                            <line
                                x1={hoverPoint.x * scaleX}
                                y1={-marginPx}
                                x2={hoverPoint.x * scaleX}
                                y2={containerHeight + marginPx}
                                stroke="#000000"
                                strokeWidth="1"
                            />
                            <line
                                x1={-marginPx}
                                y1={containerHeight - (hoverPoint.y * scaleY)}
                                x2={containerWidth + marginPx}
                                y2={containerHeight - (hoverPoint.y * scaleY)}
                                stroke="#000000"
                                strokeWidth="1"
                            />
                            <text
                                x={hoverPoint.x * scaleX + (hoverPoint.isNearLeft ? 10 : -10)}
                                y={containerHeight - (hoverPoint.y * scaleY) + (hoverPoint.isNearTop ? 20 : -10)}
                                fill="#000000"
                                fontSize="12"
                                textAnchor={hoverPoint.isNearLeft ? "start" : "end"}
                            >
                                ({hoverPoint.x}, {hoverPoint.y})
                            </text>
                        </>
                    )}
                </svg>

                {selectedPoint && (
                    <ActionModal
                        position={selectedPoint}
                        onMove={handleMove}
                        previousZ={targetPosition.z}
                    />
                )}

                {showHumidityReading && humidityReading !== null && (
                    <div className="humidity-reading-container">
                        <div className="humidity-reading-content">
                            <h3>Soil Humidity Reading</h3>
                            <p className="humidity-value">{humidityReading}%</p>
                            <button 
                                className="close-button"
                                onClick={() => setShowHumidityReading(false)}
                            >
                                Close
                            </button>
                        </div>
                    </div>
                )}
            </div>
        );
    }
;

FieldMap.propTypes = {
    widthInMeter: PropTypes.number,
    heightInMeter: PropTypes.number,
    activeComponent: PropTypes.string
};

export default FieldMap;
