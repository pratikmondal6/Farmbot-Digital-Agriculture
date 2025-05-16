import React, { useState } from 'react';

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
    console.log(name)
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const response = await fetch('http://localhost:5000/api/plants', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          plant_type: formData.plant_type.trim(),
          minimal_distance: Number(formData.minimal_distance),
          seeding_depth: Number(formData.seeding_depth),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Fehler beim Speichern.');
      }

      setSuccess('Pflanze erfolgreich hinzugefügt.');
      setFormData({
        plant_type: '',
        minimal_distance: '',
        seeding_depth: '',
      });
    } catch (err) {
      setError(err.message || 'Unbekannter Fehler');
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
