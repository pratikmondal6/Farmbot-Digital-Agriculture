import React, {useState} from 'react';
import {FiArrowLeft} from 'react-icons/fi';
import Button from "./Button";

function FarmbotConfig({onBack}) {
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
            version: '1.0.0',
            isUpdateAvailable: false,
            releaseNotes: '',
            updateUrl: 'google.com',
        },
        bootSequence: '',
        firmware: '',
        firmwarePath: '',
        raspberryPiModel: '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log('Bot Configuration:', botConfig);
    };

    const handleChange = (e, field, nestedField = null) => {
        if (nestedField) {
            setBotConfig({
                ...botConfig,
                [field]: {
                    ...botConfig[field],
                    [nestedField]: e.target.value
                }
            });
        } else {
            setBotConfig({
                ...botConfig,
                [field]: e.target.value
            });
        }
    };

    const handleCheckboxChange = (e, field) => {
        setBotConfig({
            ...botConfig,
            [field]: e.target.checked
        });
    };

    const handleUpdateClick = () => {
        if (botConfig.os.updateUrl) {
            window.open(botConfig.os.updateUrl, '_blank');
        }
    };

    return (
        <div className="farmbot-config">
            <div className="back-button" onClick={onBack}>
                <FiArrowLeft size={20}/>
            </div>
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
                    <input
                        type="text"
                        value={botConfig.timezone}
                        onChange={(e) => handleChange(e, 'timezone')}
                    />
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
                    <input
                        type="text"
                        value={botConfig.autoUpdate}
                        onChange={(e) => handleChange(e, 'autoUpdate')}
                    />
                </label>
                <label>
                    OS Version({botConfig.os.version}):
                    {botConfig.os.isUpdateAvailable ?
                        <Button
                            className="update-button"
                            onClick={handleUpdateClick}
                        >
                            Update
                        </Button> :
                        <Button
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
                    <input
                        type="text"
                        value={botConfig.firmware}
                        onChange={(e) => handleChange(e, 'firmware')}
                    />
                </label>
                <label>
                    Firmware Path:
                    <input
                        type="text"
                        value={botConfig.firmwarePath}
                        onChange={(e) => handleChange(e, 'firmwarePath')}
                    />
                </label>
                <label>
                    Raspberry Pi Model:
                    <input
                        type="text"
                        value={botConfig.raspberryPiModel}
                        onChange={(e) => handleChange(e, 'raspberryPiModel')}
                    />
                </label>
                <button type="submit">Save Configuration</button>
            </form>
        </div>
    );
}

export default FarmbotConfig;
