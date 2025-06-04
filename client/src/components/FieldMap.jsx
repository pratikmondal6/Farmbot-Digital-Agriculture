import React, {useState} from 'react';
import PropTypes from 'prop-types';
import '../utils/styles/field-map.css';

const ActionModal = ({position, onMove}) => {
    const [z, setZ] = useState(0);

    const handleZChange = (e) => {
        const value = Number(e.target.value);
        if (value >= 0 && value <= 100) {
            setZ(value);
        }
    };

    return (
        <div className="action-modal" style={{left: position.x, top: position.y}}>
            <div className="action-modal-content">
                <div className="action-modal-input-container">
                    <label className="action-modal-label">X:</label>
                    <input
                        type="number"
                        value={position.meterX}
                        disabled
                        className="action-modal-input"
                    />
                </div>
                <div className="action-modal-input-container">
                    <label className="action-modal-label">Y:</label>
                    <input
                        type="number"
                        value={position.meterY}
                        disabled
                        className="action-modal-input"
                    />
                </div>
                <div className="action-modal-input-container">
                    <label className="action-modal-label">Z:</label>
                    <input
                        type="number"
                        value={z}
                        onChange={handleZChange}
                        min={0}
                        max={100}
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

const FieldMap = ({widthInMeter = 1800, heightInMeter = 1400}) => {
    const containerWidth = 1200;
    const containerHeight = 750;
    const margin = 2;
    const gridSpacing = 60;
    const [hoverPoint, setHoverPoint] = useState(null);
    const [selectedPoint, setSelectedPoint] = useState(null);

    const scaleX = containerWidth / widthInMeter;
    const scaleY = containerHeight / heightInMeter;
    const marginPx = margin * scaleX;

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
                x: meterX,
                y: meterY,
                z: 0,
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
            const svgRect = event.currentTarget.getBoundingClientRect();
            setSelectedPoint({
                x: event.clientX,
                y: event.clientY,
                meterX: hoverPoint.x,
                meterY: hoverPoint.y,
                meterZ: 0,
            });
            setHoverPoint(null);
        }
    };

    const handleMove = (x, y) => {
        console.log(`Moving to position (${x}, ${y})`);
        setSelectedPoint(null);
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
                />
            )}
        </div>
    );
};

FieldMap.propTypes = {
    widthInMeter: PropTypes.number,
    heightInMeter: PropTypes.number
};

export default FieldMap;