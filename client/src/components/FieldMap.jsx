import React, { useState } from 'react';
import PropTypes from 'prop-types';

const FieldMap = ({ widthInCm = 800, heightInCm = 400 }) => {
    const containerWidth = 1000;
    const containerHeight = 500;
    const margin = 2;
    const gridSpacing = 30;
    const [hoverPoint, setHoverPoint] = useState(null);
    const [selectedPoint, setSelectedPoint] = useState(null);

    const scaleX = containerWidth / widthInCm;
    const scaleY = containerHeight / heightInCm;
    const marginPx = margin * scaleX;

    const drawGrid = () => {
        const elements = [];

        for (let y = 0; y <= heightInCm; y += gridSpacing) {
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

        for (let x = 0; x <= widthInCm; x += gridSpacing) {
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

        const cmX = Math.floor(x / scaleX);
        const cmY = Math.floor((containerHeight - y) / scaleY);

        if (cmX >= 0 && cmX <= widthInCm && cmY >= 0 && cmY <= heightInCm) {
            const pixelX = x;
            const pixelY = y;
            // Calculate if we're near the left edge
            const isNearLeft = pixelX < containerWidth * 0.2;
            const isNearTop = pixelY < containerHeight * 0.2;

            setHoverPoint({
                x: cmX,
                y: cmY,
                pixelX,
                pixelY,
                isNearLeft,
                isNearTop
            });
        } else {
            setHoverPoint(null);
        }
    };

    const handleMouseLeave = () => {
        setHoverPoint(null);
    };

    return (
        <div className="field-map-container">
            <svg
                width={containerWidth + (2 * marginPx)}
                height={containerHeight + (2 * marginPx)}
                viewBox={`${-marginPx} ${-marginPx} ${containerWidth + (2 * marginPx)} ${containerHeight + (2 * marginPx)}`}
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
                onClick={}
                style={{
                    border: '2px solid #000000',
                    borderRadius: '2px',
                    backgroundColor: '#fff'
                }}
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
        </div>
    );
};

FieldMap.propTypes = {
    widthInCm: PropTypes.number,
    heightInCm: PropTypes.number
};

export default FieldMap;