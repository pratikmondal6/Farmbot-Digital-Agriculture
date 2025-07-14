import React, {useEffect, useState} from 'react';
import '../styles/field-map.css';
import instance from "../utils/api";

let scaleX = 0;
let scaleY = 0;

const containerWidth = 1200;
const containerHeight = 600;
const radius = 10;
const margin = 2;
const border = 15; // Border width
const widthInMeter = 2700;
const heightInMeter = 1200;

// functions for coordinate calculations
const meterToPixelX = (x) => x * scaleX;
const meterToPixelY = (y) => containerHeight - (y * scaleY);
const pixelToMeterX = (pixelX) => Math.floor(pixelX / scaleX);
const pixelToMeterY = (pixelY) => Math.floor((containerHeight - pixelY) / scaleY);

// function to convert event coordinates to meter coordinates
const eventToMeterCoordinates = (event, svgRect) => {
    const marginPx = margin * scaleX;
    // Adjust for border only
    const pixelX = event.clientX - svgRect.left - marginPx - border;
    const pixelY = event.clientY - svgRect.top - marginPx - border;
    return {
        x: pixelToMeterX(pixelX),
        y: pixelToMeterY(pixelY),
        pixelX,
        pixelY
    };
};

const FieldMap = ({onAreaSelect, selectArea = false, onElementClick, activeComponent}) => {
    const gridSpacing = 60;
    const [hoverPoint, setHoverPoint] = useState(null);
    const [selectedPoint, setSelectedPoint] = useState(null);
    const [currentPosition, setCurrentPosition] = useState({x: 0, y: 0});
    const [targetPosition, setTargetPosition] = useState({x: 0, y: 0});
    const [isSelectingArea, setIsSelectingArea] = useState(selectArea);
    const [selectionStart, setSelectionStart] = useState(null);
    const [selectionEnd, setSelectionEnd] = useState(null);
    const [plantedSeeds, setPlantedSeeds] = useState([]);
    const [disabledAreas, setDisabledAreas] = useState([
        {
            x1: 2545,
            y1: 100,
            x2: 2700,
            y2: 400,
            name: "Component Storage Area",
            type: "component_storage",
            color: "rgba(128,128,128,0.2)"
        },
        {
            x1: 2545,
            y1: 810,
            x2: 2700,
            y2: 1110,
            name: "Component Storage Area",
            type: "component_storage",
            color: "rgba(128,128,128,0.2)"
        },
    ]);

    useEffect(() => {
        setIsSelectingArea(selectArea);
    }, [selectArea]);

    const isPointInDisabledArea = (x, y) => {
        return disabledAreas.some(area => {
            return x >= area.x1 && x <= area.x2 &&
                y >= area.y1 && y <= area.y2;
        });
    };

    const intervalRef = React.useRef(null);

    scaleX = containerWidth / widthInMeter;
    scaleY = containerHeight / heightInMeter;
    const marginPx = margin * scaleX;

    const animationFrameRef = React.useRef(null);


    const [fieldMapElements, setFieldMapElements] = useState({
        seedBoxLocations: [{
            x: 2130,
            y: 20,
            z: 540,
            text: "Carrot Seeds Box",
            color: "#f59e42",
            onClick: function () {
                const {x, y, z, text} = fieldMapElements.seedBoxLocations[0];
                console.log(` clicked`);
                onElementClick && onElementClick({x, y, z});
            }
        }],
        devices: [{
            x: 2630, y: 150, z: -410, text: "Watering Nozzle", color: "#3b82f6",
            onClick: function () {
                const {x, y, z, text} = fieldMapElements.devices[0];
                console.log(`${text} clicked`);
                onElementClick && onElementClick({x, y, z});
            }
        },
            {
                x: 2630, y: 245, z: -395, text: "Seeder", color: "#f8c727",
                onClick: function () {
                    const {x, y, z, text} = fieldMapElements.devices[1];
                    console.log(`${text} clicked`);
                    onElementClick && onElementClick({x, y, z});
                }
            },
            {
                x: 2630, y: 350, z: -410, text: "Soil Sensor", color: "#5c5e60",
                onClick: function () {
                    const {x, y, z, text} = fieldMapElements.devices[2];
                    console.log(`${text} clicked`);
                    onElementClick && onElementClick({x, y, z});
                }
            },
            {
                x: 2630, y: 855, z: -380, text: "Empty Slot", color: "#ffffff",
                onClick: function () {
                    const {x, y, z, text} = fieldMapElements.devices[3];
                    console.log(`${text} clicked`);
                    onElementClick && onElementClick({x, y, z});
                }
            },
            {
                x: 2630, y: 960, z: -420, text: "Rotatory Tool", color: "#05ef8d",
                onClick: function () {
                    const {x, y, z, text} = fieldMapElements.devices[4];
                    console.log(`${text} clicked`);
                    onElementClick && onElementClick({x, y, z});
                }
            },
            {
                x: 2630, y: 1060, z: -420, text: "Weeder", color: "#f63b3b",
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
        const coords = eventToMeterCoordinates(event, svgRect);

        setSelectionStart({x: coords.x, y: coords.y});
        setSelectionEnd({x: coords.x, y: coords.y});
    };

    const handleSelectionMove = (event) => {
        if (!isSelectingArea || !selectionStart) return;

        const svgRect = event.currentTarget.getBoundingClientRect();
        const coords = eventToMeterCoordinates(event, svgRect);

        setSelectionEnd({x: coords.x, y: coords.y});
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

        const x1 = Math.min(selectionStart.x, selectionEnd.x);
        const x2 = Math.max(selectionStart.x, selectionEnd.x);
        const y1 = Math.min(selectionStart.y, selectionEnd.y);
        const y2 = Math.max(selectionStart.y, selectionEnd.y);

        // Check for overlap with existing disabled areas
        const hasOverlap = disabledAreas.some(area => {
            return !(x2 < area.x1 || x1 > area.x2 || y2 < area.y1 || y1 > area.y2);
        });

        if (hasOverlap) {
            setIsSelectingArea(true);
            setSelectionStart(null);
            setSelectionEnd(null);
            alert("Selected area overlaps with an existing area. Please select a different area.");
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
        const speed = 0.05;

        setCurrentPosition(prev => {
            const dx = targetPosition.x - prev.x;
            const dy = targetPosition.y - prev.y;

            // If we're close enough to target
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
    const fetchRobotPosition = async () => {
        try {
            console.log('Fetching robot position...');
            const response = await instance.get('/farmbotPosition');
            setTargetPosition(response.data);
        } catch
            (error) {
            console.error('Failed to fetch robot position:', error);
        }
    };

    // Set up polling interval
    useEffect(() => {
        fetchRobotPosition();
        // Set up interval to fetch position every 2 seconds
        intervalRef.current = setInterval(fetchRobotPosition, 2000);

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, []);

    // Fetch Seed Locations
    const fetchSeedLocations = async () => {
        try {
            const response = await instance.get('/seedingJob/seeds');
            const seedLocations = response.data;

            return seedLocations.map(seed => ({
                ...seed,
                color: "#6d2ccf",
            }));
        } catch (error) {
            console.error('Error fetching seed locations:', error);
        }
    }

    useEffect(() => {
        const loadSeedLocations = async () => {
            try {
                const seedLocations = await fetchSeedLocations();
                setPlantedSeeds(seedLocations);
            } catch (error) {
                console.error('Error loading seed locations:', error);
            }
        };

        loadSeedLocations();
    }, []);

    // fetch selected areas from the server
    const fetchSelectedAreas = async () => {
        console.log("Fetching selected areas");
        try {
            const response = await instance.get('/seedingJob/seedingJobs');

            const selectedAreas = response.data.map(area => ({
                x1: parseInt(area.bottomLeft.x),
                y1: parseInt(area.bottomLeft.y),
                x2: parseInt(area.topRight.x),
                y2: parseInt(area.topRight.y),
                name: `Planted ${area.plant}`,
                color: "rgba(255,0,0,0.24)",
            }));

            console.log("Selected areas fetched:", selectedAreas);

            setDisabledAreas(prevAreas => {
                console.log(prevAreas)
                return [...prevAreas, ...selectedAreas];
            });

            console.log("disable areas", disabledAreas);
        } catch (error) {
            console.error('Error fetching selected areas:', error);
        }
    };

    useEffect(() => {
        fetchSelectedAreas();
    }, []);

    // Grid drawing
    const drawGrid = () => {
        const elements = [];

        for (let y = 0; y <= heightInMeter; y += gridSpacing) {
            elements.push(
                <line
                    key={`h-${y}`}
                    x1={-marginPx}
                    y1={meterToPixelY(y)}
                    x2={containerWidth + marginPx}
                    y2={meterToPixelY(y)}
                    stroke="#000000"
                    strokeWidth="0.2"
                />
            );
        }

        for (let x = 0; x <= widthInMeter; x += gridSpacing) {
            elements.push(
                <line
                    key={`v-${x}`}
                    x1={meterToPixelX(x)}
                    y1={-marginPx}
                    x2={meterToPixelX(x)}
                    y2={containerHeight + marginPx}
                    stroke="#000000"
                    strokeWidth="0.2"
                />
            );
        }

        return elements;
    };

    function handleMapElementHover(fieldMapElements, x, y) {
        for (const [, elements] of Object.entries(fieldMapElements)) {
            if (Array.isArray(elements)) {
                for (const element of elements) {
                    const elementCenterX = meterToPixelX(element.x);
                    const elementCenterY = meterToPixelY(element.y);
                    const distance = Math.sqrt(
                        Math.pow(x - elementCenterX, 2) +
                        Math.pow(y - elementCenterY, 2)
                    );

                    if (distance <= radius) {
                        setHoverPoint(null);
                        return true;
                    }
                }
            } else if (elements && typeof elements === 'object') {
                // Handle single objects (like robot)
                const elementCenterX = meterToPixelX(elements.x);
                const elementCenterY = meterToPixelY(elements.y);
                const distance = Math.sqrt(
                    Math.pow(x - elementCenterX, 2) +
                    Math.pow(y - elementCenterY, 2)
                );

                if (distance <= radius) {
                    setHoverPoint(null);
                    return true;
                }
            }
        }
    }

    function handlePlantedSeedHover(plantedSeeds, x, y) {
        for (const plantedSeed of plantedSeeds) {
            const plantedSeedCenterX = meterToPixelX(plantedSeed.x);
            const plantedSeedCenterY = meterToPixelY(plantedSeed.y);
            const distance = Math.sqrt(
                Math.pow(x - plantedSeedCenterX, 2) +
                Math.pow(y - plantedSeedCenterY, 2)
            );

            if (distance <= radius) {
                setHoverPoint(null);
                return true;
            }
        }

    }

    const handleMouseMove = (event) => {
        const svgRect = event.currentTarget.getBoundingClientRect();
        const coords = eventToMeterCoordinates(event, svgRect);

        if (isPointInDisabledArea(coords.x, coords.y)) {
            setHoverPoint(null);
            return;
        }

        if (handleMapElementHover(fieldMapElements, coords.pixelX, coords.pixelY))
            return;
        if (handlePlantedSeedHover(plantedSeeds, coords.pixelX, coords.pixelY))
            return;

        if (coords.x >= 0 && coords.x <= widthInMeter && coords.y >= 0 && coords.y <= heightInMeter) {
            setHoverPoint({
                ...hoverPoint,
                x: coords.x,
                y: coords.y,
                pixelX: coords.pixelX,
                pixelY: coords.pixelY,
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
                width={containerWidth + (2 * marginPx) + (2 * border)}
                height={containerHeight + (2 * marginPx) + (2 * border)}
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
                        <Rectangle area={area}/>
                    </g>
                ))}

                {/* robot circle */}
                <circle
                    className="robot-circle"
                    cx={meterToPixelX(currentPosition.x)}
                    cy={meterToPixelY(currentPosition.y)}
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

                {/* Render field map elements */}
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
                                    <Text x={element.x} y={element.y} text={element.text}/>
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
                                {elements.isHovered &&
                                    <Text x={elements.x} y={elements.y} text={elements.text}/>
                                }
                            </g>
                        );
                    }
                    return null;
                })}

                {/* Render planted seeds */}
                {plantedSeeds.map((seed, index) => (
                    <g key={`seed-${index}`}>
                        <circle
                            cx={meterToPixelX(parseInt(seed.x))}
                            cy={meterToPixelY(parseInt(seed.y))}
                            r={radius * 0.8}
                            fill="#6d2ccf"
                            fillOpacity={0.8}
                            stroke="#333"
                            strokeWidth="1"
                            style={{cursor: 'pointer'}}
                            onPointerEnter={() => {
                                // Show seed info on hover
                                const element = plantedSeeds[index];
                                element.isHovered = true;
                                setPlantedSeeds([...plantedSeeds]);
                            }}
                            onPointerLeave={() => {
                                const element = plantedSeeds[index];
                                element.isHovered = false;
                                setPlantedSeeds([...plantedSeeds]);
                            }}
                        />
                        {seed.isHovered &&
                            <Text x={seed.x} y={seed.y} text={seed.seed_name}/>
                        }
                    </g>
                ))}

                {/* Hover indicators */}
                {hoverPoint && (
                    <>
                        <line
                            x1={hoverPoint.pixelX}
                            y1={-marginPx}
                            x2={hoverPoint.pixelX}
                            y2={containerHeight + marginPx}
                            stroke="#000000"
                            strokeWidth="1"
                        />
                        <line
                            x1={-marginPx}
                            y1={hoverPoint.pixelY}
                            x2={containerWidth + marginPx}
                            y2={hoverPoint.pixelY}
                            stroke="#000000"
                            strokeWidth="1"
                        />
                        <Text x={hoverPoint.x} y={hoverPoint.y} text={`(${hoverPoint.x}, ${hoverPoint.y})`}/>
                    </>
                )}

                {isSelectingArea && selectionStart && selectionEnd && (
                    <rect
                        x={meterToPixelX(Math.min(selectionStart.x, selectionEnd.x))}
                        y={meterToPixelY(Math.max(selectionStart.y, selectionEnd.y))}
                        width={Math.abs(meterToPixelX(selectionEnd.x) - meterToPixelX(selectionStart.x))}
                        height={Math.abs(meterToPixelY(selectionEnd.y) - meterToPixelY(selectionStart.y))}
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
};

const Text = ({x, y, text}) => {
    const isNearLeft = x < widthInMeter * 0.2;
    const isNearTop = y < heightInMeter * 0.2;

    return (
        <text
            x={meterToPixelX(x) + (isNearLeft ? 10 : -10)}
            y={meterToPixelY(y) + (isNearTop ? -10 : 20)}
            textAnchor={isNearLeft ? "start" : "end"}
            fill="#333"
            fontSize="12"
        >
            {text}
        </text>
    );
}

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
                        value={Math.abs(z)}
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
            cx={meterToPixelX(x)}
            cy={meterToPixelY(y)}
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

const Rectangle = ({area}) => {
    return (
        <rect
            x={meterToPixelX(area.x1)}
            y={meterToPixelY(area.y2)}
            width={meterToPixelX(area.x2) - meterToPixelX(area.x1)}
            height={meterToPixelY(area.y1) - meterToPixelY(area.y2)}
            fill={area.color}
            stroke="#666"
            strokeWidth="1"
            strokeDasharray="5,5"
        />
    )
}

export default FieldMap;
