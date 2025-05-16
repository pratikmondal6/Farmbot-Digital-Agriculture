import React, { useState } from 'react';
import axios from 'axios';

const PlantForm = () => {
  const [formData, setFormData] = useState({
    plant_type: '',
    minimal_distance: '',
    seeding_depth: '',
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      await axios.post('http://localhost:5000/api/plants', {
        plant_type: formData.plant_type.trim(),
        minimal_distance: Number(formData.minimal_distance),
        seeding_depth: Number(formData.seeding_depth),
      });
      setSuccess('Pflanze erfolgreich hinzugefügt.');
      setFormData({
        plant_type: '',
        minimal_distance: '',
        seeding_depth: '',
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Fehler beim Speichern.');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>Pflanzentyp:</label>
        <input
          type="text"
          name="plant_type"
          value={formData.plant_type}
          onChange={handleChange}
          required
        />
      </div>
      <div>
        <label>Mindestabstand (cm):</label>
        <input
          type="number"
          name="minimal_distance"
          value={formData.minimal_distance}
          onChange={handleChange}
          required
        />
      </div>
      <div>
        <label>Aussaattiefe (cm):</label>
        <input
          type="number"
          name="seeding_depth"
          value={formData.seeding_depth}
          onChange={handleChange}
          required
        />
      </div>
      <button type="submit">Speichern</button>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {success && <p style={{ color: 'green' }}>{success}</p>}
    </form>
  );
};

export default PlantForm;
