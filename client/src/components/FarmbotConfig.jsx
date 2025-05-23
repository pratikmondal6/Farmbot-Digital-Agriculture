import React, {useEffect, useState} from 'react';
import {FiArrowLeft} from 'react-icons/fi';
import Button from "./Button";
import instance from "../utils/api";
import {firmware_hardware, firmware_path, rpiVersions, timezones, updateTime} from "../utils/botConfigUtils";

function FarmbotConfig({onBack}) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const [botConfig, setBotConfig] = useState({
        name: '',
        orderNumber: '',
        timezone: '',
        location: {
            lat: '',
            long: '',
        },
        indoor: false,
        autoUpdate: '',
        os: {
            version: '',
            isUpdateAvailable: false,
            releaseNotes: '',
            updateUrl: 'google.com',
        },
        bootSequence: '',
        firmware: '',
        firmwarePath: '',
        raspberryPiModel: '',
    });

    // Fetch bot configuration data when component mounts
    useEffect(() => {
        const fetchBotConfig = async () => {
            try {
                setLoading(true);

                const response = await instance.get('/api/botConfig')
                const result = await response.data;

                if (result.error) {
                    setError(result.error.message || "Failed to load configuration");
                } else if (result.data) {
                    console.log("Received bot config:", result.data);
                    setBotConfig(result.data);
                }
            } catch (err) {
                console.error("Error fetching bot config:", err);
                setError("Failed to fetch bot configuration");
            } finally {
                setLoading(false);
            }
        };

        fetchBotConfig();
    }, []);

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await instance.put('/api/botConfig', botConfig)

            const result = await response.data;

            if (result.error) {
                console.error("Error saving the bot config:", result.error);
                alert('Error saving configuration');
            } else if (result.data) {
                console.log("Saved bot config:", result.data);
                onBack();
            }
        } catch (err) {
                console.error('Error saving config:', err);
                alert('Failed to save configuration. Please try again.');
        }
    };

    const handleChange = (e, field, nestedField = null) => {
        if (nestedField) {
            setBotConfig({
                ...botConfig, [field]: {
                    ...botConfig[field], [nestedField]: e.target.value
                }
            });
        } else {
            setBotConfig({
                ...botConfig, [field]: e.target.value
            });
        }
    };

    const handleCheckboxChange = (e, field) => {
        setBotConfig({
            ...botConfig, [field]: e.target.checked
        });
    };

    const handleUpdateClick = () => {
        if (botConfig.os.updateUrl) {
            window.open(botConfig.os.updateUrl, '_blank');
        }
    };

    return (<div className="farmbot-config">
        <div className="back-button" onClick={onBack}>
            <FiArrowLeft size={20}/>
        </div>

        {loading ? (
            <div className="loading-container">
                <div className="spinner"/>
            </div>
        ) : error ? (
            <div className="error-message">
                <p>{error}</p>
                <Button onClick={() => window.location.reload()}>Retry</Button>
            </div>
        ) : (
            <form onSubmit={handleSubmit}>
                <label>
                    Name:
                    <input
                        type="text"
                        value={botConfig.name}
                        onChange={(e) => handleChange(e, 'name')}
                    />
                </label>
                <label>
                    Order Number:
                    <input
                        type="text"
                        value={botConfig.orderNumber}
                        onChange={(e) => handleChange(e, 'orderNumber')}
                    />
                </label>
                <label>
                    Timezone:
                    <select
                        value={botConfig.timezone}
                        onChange={(e) => handleChange(e, 'timezone')}
                    >
                        {timezones.map((zone) => (
                            <option key={zone.key} value={zone.key}>
                                {zone.value}
                            </option>
                        ))}
                    </select>
                </label>
                <label>
                    Location:
                    <div className="location-inputs">
                        <input
                            type="text"
                            placeholder="Latitude"
                            value={botConfig.location.lat}
                            onChange={(e) => handleChange(e, 'location', 'lat')}
                        />
                        <input
                            type="text"
                            placeholder="Longitude"
                            value={botConfig.location.long}
                            onChange={(e) => handleChange(e, 'location', 'long')}
                        />
                    </div>
                </label>
                <label>
                    Indoor:
                    <input
                        type="checkbox"
                        checked={botConfig.indoor}
                        onChange={(e) => handleCheckboxChange(e, 'indoor')}
                    />
                </label>
                <label>
                    Auto Update:
                    <select
                        value={botConfig.autoUpdate}
                        onChange={(e) => handleChange(e, 'autoUpdate')}
                    >
                        {updateTime.map((time) => (
                            <option key={time.key} value={time.key}>
                                {time.value}
                            </option>
                        ))}
                    </select>
                </label>
                <label>
                    OS Version{botConfig.os.version ? `(${botConfig.os.version})` : ''}:
                    {botConfig.os.isUpdateAvailable ? <Button
                        className="update-button"
                        onClick={handleUpdateClick}
                    >
                        Update
                    </Button> : <Button
                        isDisabled={true}
                        type="button"
                        className="update-button"
                    >
                        Up To date
                    </Button>}

                </label>
                <label>
                    Boot Sequence:
                    <input
                        type="text"
                        value={botConfig.bootSequence}
                        onChange={(e) => handleChange(e, 'bootSequence')}
                    />
                </label>
                <label>
                    Firmware:
                    <select
                        value={botConfig.firmware}
                        onChange={(e) => handleChange(e, 'firmware')}
                    >
                        {firmware_hardware.map((firmware) => (
                            <option key={firmware.key} value={firmware.key}>
                                {firmware.value}
                            </option>
                        ))}
                    </select>
                </label>
                <label>
                    Firmware Path:
                    <select
                        value={botConfig.firmwarePath}
                        onChange={(e) => handleChange(e, 'firmwarePath')}
                    >
                        <option value="" disabled>Change firmware path</option>
                        {firmware_path.map((path) => (
                            <option key={path.key} value={path.key}>
                                {path.value}
                            </option>
                        ))}
                    </select>
                </label>
                <label>
                    Raspberry Pi Model:
                    <select
                        value={botConfig.raspberryPiModel}
                        onChange={(e) => handleChange(e, 'raspberryPiModel')}
                    >
                        <option>None</option>
                        {rpiVersions.map((rpi) => (
                            <option key={rpi.key} value={rpi.key}>
                                {rpi.value}
                            </option>
                        ))}
                    </select>
                </label>
                <Button type="submit" className="save-button"> Submit</Button>
            </form>
        )}
    </div>);
}

export default FarmbotConfig;
