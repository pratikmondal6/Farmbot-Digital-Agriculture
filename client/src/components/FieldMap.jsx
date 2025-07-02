import React, {useEffect, useState} from 'react';
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
                        value={position.meterX}
                        disabled
                        className="action-modal-input"
                    />
                </div>
                <div className="action-modal-input-container">
                    <label className="action-modal-label">Height:</label>
                    <input
                        type="number"
                        value={position.meterY}
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

const Circle = ({x, y, color, onClick, onPointerEnter, onPointerLeave}) => {
    return (
        <circle
            cx={x * scaleX}
            cy={containerHeight - (y * scaleY)}
            r={radius}
            fill={color}
            fillOpacity={0.8}
            stroke="#333"
            strokeWidth="1"
            style={{cursor: 'pointer'}}
            onClick={onClick}
            onPointerEnter={onPointerEnter}
            onPointerLeave={onPointerLeave}
        />
    );
};

let scaleX = 0;
let scaleY = 0;

const containerWidth = 1200;
const containerHeight = 750;
const radius = 10;
const margin = 2;

const FieldMap = ({widthInMeter = 2700, heightInMeter = 1200, onAreaSelect, selectArea = false, onElementClick}) => {
        const gridSpacing = 60;
        const [hoverPoint, setHoverPoint] = useState(null);
        const [selectedPoint, setSelectedPoint] = useState(null);
        const [currentPosition, setCurrentPosition] = useState({x: 0, y: 0});
        const [targetPosition, setTargetPosition] = useState({x: 0, y: 0});
        const [isSelectingArea, setIsSelectingArea] = useState(selectArea);
        const [selectionStart, setSelectionStart] = useState(null);
        const [selectionEnd, setSelectionEnd] = useState(null);
        const disabledAreas = [
            {
                x1: 2545,
                y1: 100,
                x2: 2700,
                y2: 400,
            },
            {
                x1: 2545,
                y1: 810,
                x2: 2700,
                y2: 1110,
            }
        ];

        useEffect(() => {
            setIsSelectingArea(selectArea);
        }, [selectArea]);

        const isPointInDisabledArea = (x, y) => {
            return disabledAreas.some(area => {
                return x >= area.x1 && x <= area.x2 &&
                    y >= area.y1 && y <= area.y2;
            });
        };
        // const [step, setStep] = useState(0);
        // const intervalRef = React.useRef(null);

        scaleX = containerWidth / widthInMeter;
        scaleY = containerHeight / heightInMeter;
        const marginPx = margin * scaleX;

        const animationFrameRef = React.useRef(null);


        const [fieldMapElements, setFieldMapElements] = useState({
            seedBoxLocations: [{
                x: 2130,
                y: 20,
                z: 540,
                isSeedHovered: false,
                text: "Carrot Seeds Box",
                color: "#f59e42",
                onClick: function () {
                    const {x, y, z, text} = fieldMapElements.seedBoxLocations[0];
                    console.log(` clicked`);
                    onElementClick && onElementClick({x, y, z});
                }
            }],
            devices: [{
                x: 2630, y: 150, z: -410, isDeviceHovered: false, text: "Watering Nozzle", color: "#3b82f6",
                onClick: function () {
                    const {x, y, z, text} = fieldMapElements.devices[0];
                    console.log(`${text} clicked`);
                    onElementClick && onElementClick({x, y, z});
                }
            },
                {
                    x: 2630, y: 245, z: -395, isDeviceHovered: false, text: "Seeder", color: "#f8c727",
                    onClick: function () {
                        const {x, y, z, text} = fieldMapElements.devices[1];
                        console.log(`${text} clicked`);
                        onElementClick && onElementClick({x, y, z});
                    }
                },
                {
                    x: 2630, y: 350, z: -410, isDeviceHovered: false, text: "Soil Sensor", color: "#5c5e60",
                    onClick: function () {
                        const {x, y, z, text} = fieldMapElements.devices[2];
                        console.log(`${text} clicked`);
                        onElementClick && onElementClick({x, y, z});
                    }
                },
                {
                    x: 2630, y: 855, z: -380, isDeviceHovered: false, text: "Empty Slot", color: "#ffffff",
                    onClick: function () {
                        const {x, y, z, text} = fieldMapElements.devices[3];
                        console.log(`${text} clicked`);
                        onElementClick && onElementClick({x, y, z});
                    }
                },
                {
                    x: 2630, y: 960, z: -420, isDeviceHovered: false, text: "Rotatory Tool", color: "#05ef8d",
                    onClick: function () {
                        const {x, y, z, text} = fieldMapElements.devices[4];
                        console.log(`${text} clicked`);
                        onElementClick && onElementClick({x, y, z});
                    }
                },
                {
                    x: 2630, y: 1060, z: -420, isDeviceHovered: false, text: "Weeder", color: "#f63b3b",
                    onClick: function () {
                        const {x, y, z, text} = fieldMapElements.devices[5];
                        console.log(`${text} clicked`);
                        onElementClick && onElementClick({x, y, z});
                    }
                }]
            // robot: {x: 0, y: 0, isRobotHovered: false, text: "Robot", color: "#5be318"}
        });

        const handleStartSelection = (event) => {
            if (!isSelectingArea) return;

            const svgRect = event.currentTarget.getBoundingClientRect();
            const x = Math.floor((event.clientX - svgRect.left - marginPx) / scaleX);
            const y = Math.floor((containerHeight - (event.clientY - svgRect.top - marginPx)) / scaleY);

            setSelectionStart({x, y});
            setSelectionEnd({x, y});
        };

        const handleSelectionMove = (event) => {
            if (!isSelectingArea || !selectionStart) return;

            const svgRect = event.currentTarget.getBoundingClientRect();
            const x = Math.floor((event.clientX - svgRect.left - marginPx) / scaleX);
            const y = Math.floor((containerHeight - (event.clientY - svgRect.top - marginPx)) / scaleY);

            setSelectionEnd({x, y});
        };

        const handleEndSelection = () => {
            if (!isSelectingArea || !selectionStart || !selectionEnd) return;

            const isSamePoint = Math.abs(selectionStart.x - selectionEnd.x) < 15 &&
                Math.abs(selectionStart.y - selectionEnd.y) < 15;

            if (isSamePoint) {
                setIsSelectingArea(false);
                setSelectionStart(null);
                setSelectionEnd(null);
                alert("Please select a valid area.");
                return;
            }

            const points = {
                topLeft: {
                    x: Math.min(selectionStart.x, selectionEnd.x),
                    y: Math.max(selectionStart.y, selectionEnd.y)
                },
                topRight: {
                    x: Math.max(selectionStart.x, selectionEnd.x),
                    y: Math.max(selectionStart.y, selectionEnd.y)
                },
                bottomLeft: {
                    x: Math.min(selectionStart.x, selectionEnd.x),
                    y: Math.min(selectionStart.y, selectionEnd.y)
                },
                bottomRight: {
                    x: Math.max(selectionStart.x, selectionEnd.x),
                    y: Math.min(selectionStart.y, selectionEnd.y)
                }
            };

            setIsSelectingArea(false);
            setSelectionStart(null);
            setSelectionEnd(null);

            console.log(`Selected Area Points:`, points);

            if (onAreaSelect) {
                onAreaSelect(points);
            }
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

            if (isPointInDisabledArea(meterX, meterY)) {
                setHoverPoint(null);
                return;
            }

            for (const [, elements] of Object.entries(fieldMapElements)) {
                if (Array.isArray(elements)) {
                    for (const element of elements) {
                        const elementCenterX = element.x * scaleX;
                        const elementCenterY = containerHeight - (element.y * scaleY);
                        const distance = Math.sqrt(
                            Math.pow(x - elementCenterX, 2) +
                            Math.pow(y - elementCenterY, 2)
                        );

                        if (distance <= radius) {
                            setHoverPoint(null);
                            return;
                        }
                    }
                } else if (elements && typeof elements === 'object') {
                    // Handle single objects (like robot)
                    const elementCenterX = elements.x * scaleX;
                    const elementCenterY = containerHeight - (elements.y * scaleY);
                    const distance = Math.sqrt(
                        Math.pow(x - elementCenterX, 2) +
                        Math.pow(y - elementCenterY, 2)
                    );

                    if (distance <= radius) {
                        setHoverPoint(null);
                        return;
                    }
                }
            }

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
                await instance.post('/move', {
                    x: xNew,
                    y: yNew,
                    z: -zNew
                });

                // Set target position after successful API call
                setTargetPosition({
                    x: xNew,
                    y: yNew,
                    z: zNew,
                });
                setSelectedPoint(null);
            } catch (error) {
                console.error('Error moving robot:', error);
            }
        };

        const handleElementHover = (key, index, isHovered) => {
            setFieldMapElements(prev => {
                const newElements = {...prev};
                if (Array.isArray(newElements[key])) {
                    newElements[key] = [...newElements[key]];
                    newElements[key][index] = {...newElements[key][index], isHovered};
                } else {
                    newElements[key] = {...newElements[key], isHovered};
                }
                return newElements;
            });
        };

        return (
            <div className="field-map-container">
                <svg
                    width={containerWidth + (2 * marginPx)}
                    height={containerHeight + (2 * marginPx)}
                    viewBox={`${-marginPx} ${-marginPx} ${containerWidth + (2 * marginPx)} ${containerHeight + (2 * marginPx)}`}
                    onMouseDown={handleStartSelection}
                    onMouseMove={isSelectingArea ? handleSelectionMove : handleMouseMove}
                    onMouseUp={handleEndSelection}
                    onMouseLeave={handleMouseLeave}
                    onClick={!isSelectingArea ? handleClick : undefined}
                >
                    {drawGrid()}

                    {/* Render disabled areas */}
                    {disabledAreas.map((area, index) => (
                        <g key={`disabled-area-${index}`}>
                            <rect
                                x={area.x1 * scaleX}
                                y={containerHeight - (area.y2 * scaleY)}
                                width={(area.x2 - area.x1) * scaleX}
                                height={(area.y2 - area.y1) * scaleY}
                                fill="rgba(128, 128, 128, 0.2)"
                                stroke="#666"
                                strokeWidth="1"
                                strokeDasharray="5,5"
                            />
                        </g>
                    ))}

                    {/* Animated robot circle */}
                    <circle
                        className="robot-circle"
                        cx={currentPosition.x * scaleX}
                        cy={containerHeight - (currentPosition.y * scaleY)}
                        r={radius}
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

                    {Object.entries(fieldMapElements).map(([key, elements]) => {
                        if (Array.isArray(elements)) {
                            return elements.map((element, index) => (
                                <g key={`${key}-${index}`}>
                                    <Circle
                                        x={element.x}
                                        y={element.y}
                                        color={element.color}
                                        isHovered={element.isHovered}
                                        onClick={element.onClick}
                                        onPointerEnter={() => handleElementHover(key, index, true)}
                                        onPointerLeave={() => handleElementHover(key, index, false)}
                                    />
                                    {element.isHovered && (
                                        <text
                                            {...getTextPosition(element, containerWidth, containerHeight, widthInMeter, heightInMeter)}
                                            fill="#333"
                                            fontSize="12"
                                        >
                                            {element.text}
                                        </text>
                                    )}
                                </g>
                            ));
                        } else if (elements && typeof elements === 'object') {
                            return (
                                <g key={key}>
                                    <Circle
                                        x={elements.x}
                                        y={elements.y}
                                        color={elements.color}
                                        isHovered={elements.isHovered}
                                        onClick={elements.onClick}
                                        onPointerEnter={() => handleElementHover(key, null, true)}
                                        onPointerLeave={() => handleElementHover(key, null, false)}
                                    />
                                    {elements.isHovered && (
                                        <text
                                            x={elements.x * scaleX}
                                            y={containerHeight - (elements.y * scaleY - 25)}
                                            textAnchor={elements.x > widthInMeter * 0.9 ? "end" : "start"}
                                            dy={elements.y > heightInMeter * 0.9 ? "-25" : "25"}
                                            fill="#333"
                                            fontSize="12"
                                        >
                                            {elements.text}
                                        </text>
                                    )}
                                </g>
                            );
                        }
                        return null;
                    })}

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

                    {isSelectingArea && selectionStart && selectionEnd && (
                        <rect
                            x={Math.min(selectionStart.x, selectionEnd.x) * scaleX}
                            y={containerHeight - Math.max(selectionStart.y, selectionEnd.y) * scaleY}
                            width={Math.abs(selectionEnd.x - selectionStart.x) * scaleX}
                            height={Math.abs(selectionEnd.y - selectionStart.y) * scaleY}
                            fill="rgba(0, 123, 255, 0.2)"
                            stroke="rgb(0, 123, 255)"
                            strokeWidth="2"
                        />
                    )}
                </svg>

                {selectedPoint && !isPointInDisabledArea(selectedPoint.meterX, selectedPoint.meterY) && (
                    <ActionModal
                        position={selectedPoint}
                        onMove={handleMove}
                        previousZ={targetPosition.z}
                    />
                )}
            </div>
        );
    }
;

const getTextPosition = (element, containerWidth, containerHeight, widthInMeter, heightInMeter) => {
    const pixelX = element.x;
    const pixelY = element.y;
    const isNearLeft = pixelX < containerWidth * 0.2;
    const isNearTop = pixelY < containerHeight * 0.2;

    return {
        x: element.x * scaleX + (isNearLeft ? 10 : -10),
        y: containerHeight - (element.y * scaleY) + (isNearTop ? -10 : 20),
        textAnchor: isNearLeft ? "start" : "end"
    };
};


export default FieldMap;