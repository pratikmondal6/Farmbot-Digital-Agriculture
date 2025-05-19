import React, {useState, useRef, useEffect} from "react";
import {FiSettings, FiChevronRight} from "react-icons/fi";
import FarmbotConfig from "../components/FarmbotConfig";

function Settings() {
    const [showSetting, setShowSetting] = useState(false);
    const [showFarmbotConfig, setShowFarmbotConfig] = useState(false);
    const settingsRef = useRef(null);

    function handleClick(e){
        e.stopPropagation();
        console.log("Setting button clicked");
        setShowSetting(show => !show);
        setShowFarmbotConfig(false); // Reset farmbot config view when toggling settings
    }

    function handleFarmbotClick(e) {
        e.stopPropagation();
        console.log("Farmbot option clicked");
        setShowFarmbotConfig(true);
    }

    useEffect(() => {
        function handleClickOutside(event) {
            if (settingsRef.current && !settingsRef.current.contains(event.target)) {
                setShowSetting(false);
                setShowFarmbotConfig(false);
            }
        }

        // Add an event listener if settings are shown
        if (showSetting) {
            document.addEventListener("mousedown", handleClickOutside);
        }

        // Clean up the event listener
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [showSetting]);

    return (
        <div className="settings-container" ref={settingsRef}>
            <div className={"settings-icon"}>
                <FiSettings onClick={handleClick} size={24}/>
            </div>
            {showSetting && <div className="settings-form-container">
                {!showFarmbotConfig ? (
                    <div className="settings-options-list">
                        <div className="settings-option" onClick={handleFarmbotClick}>
                            <span>Farmbot</span>
                            <FiChevronRight className="more-content-icon" />
                        </div>
                    </div>
                ) : (
                    <FarmbotConfig onBack={() => setShowFarmbotConfig(false)}/>
                )}
            </div>}
        </div>
    );
}

export default Settings;
