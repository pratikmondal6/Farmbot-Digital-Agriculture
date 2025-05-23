import React, { useState, useRef, useEffect } from "react";
import { FiSettings, FiChevronRight } from "react-icons/fi";
import FarmbotConfig from "./FarmbotConfig";

function Settings() {
    const [showSetting, setShowSetting] = useState(false);
    const [showFarmbotConfig, setShowFarmbotConfig] = useState(false);
    const settingsRef = useRef(null);

    function handleClick(e) {
        e.stopPropagation();
        setShowSetting((prev) => !prev);
        setShowFarmbotConfig(false);
    }

    function handleFarmbotClick(e) {
        e.stopPropagation();
        setShowFarmbotConfig(true);
    }

    useEffect(() => {
        function handleClickOutside(event) {
            if (settingsRef.current && !settingsRef.current.contains(event.target)) {
                setShowSetting(false);
                setShowFarmbotConfig(false);
            }
        }

        if (showSetting) {
            document.addEventListener("mousedown", handleClickOutside);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [showSetting]);

    return (
        <div className="relative h-full" ref={settingsRef}>
            {/* Gear icon inside header, with no background overflow */}
            <div
                onClick={handleClick}
                className="flex items-center justify-center px-3 cursor-pointer transition-transform duration-300 hover:rotate-12"
            >
                <FiSettings size={24} className="text-white" />
            </div>

            {/* Dropdown panel */}
            {showSetting && (
                <div className="absolute right-0 top-full mt-2 z-50">
                    {!showFarmbotConfig ? (
                        <div className="w-72 bg-white border rounded shadow-lg p-4 space-y-2">
                            <div
                                className="flex justify-between items-center cursor-pointer hover:bg-gray-100 px-3 py-2 rounded"
                                onClick={handleFarmbotClick}
                            >
                                <span className="text-sm font-medium text-gray-800">Farmbot</span>
                                <FiChevronRight className="text-gray-500" />
                            </div>
                        </div>
                    ) : (
                        <div className="w-[420px] h-[640px] bg-white rounded-lg shadow-lg overflow-y-auto p-4">
                            <FarmbotConfig onBack={() => setShowFarmbotConfig(false)} />
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

export default Settings;
