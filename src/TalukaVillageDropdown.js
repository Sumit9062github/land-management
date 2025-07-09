import React, { useState } from 'react';

const talukaData = {
  'कडेगाव': ['वांगी'],
  'खानापूर': ['भाळवणी']
};

export default function TalukaVillageDropdown() {
  const [selectedTaluka, setSelectedTaluka] = useState('');
  const [villages, setVillages] = useState([]);
  const [selectedVillage, setSelectedVillage] = useState('');

  const handleTalukaChange = (e) => {
    const taluka = e.target.value;
    setSelectedTaluka(taluka);
    setVillages(talukaData[taluka] || []);
    setSelectedVillage('');
  };

  const handleVillageChange = (e) => {
    setSelectedVillage(e.target.value);
  };

  return (
    <div className="p-4">
      <label className="block mb-2">तालुका:</label>
      <select value={selectedTaluka} onChange={handleTalukaChange} className="border p-2 rounded w-full mb-4">
        <option value="">-- तालुका निवडा --</option>
        {Object.keys(talukaData).map((taluka) => (
          <option key={taluka} value={taluka}>
            {taluka}
          </option>
        ))}
      </select>

      {villages.length > 0 && (
        <>
          <label className="block mb-2">गाव:</label>
          <select value={selectedVillage} onChange={handleVillageChange} className="border p-2 rounded w-full">
            <option value="">-- गाव निवडा --</option>
            {villages.map((village) => (
              <option key={village} value={village}>
                {village}
              </option>
            ))}
          </select>
        </>
      )}
    </div>
  );
}
