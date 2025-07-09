import React, { useState } from 'react';
import '../css/form.css';

const talukaData = {
  'कडेगाव': ['वांगी'],
  'खानापूर': ['भाळवणी']
};

export default function MainForm() {
  const [formData, setFormData] = useState({
    taluka: '',
    village: '',
    type: '',
    proposal: '',
    area: '',
    ownership: '',
    pdf: null
  });

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'pdf') {
      setFormData({ ...formData, pdf: files[0] });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.pdf) return;

    const reader = new FileReader();
    reader.onload = () => {
      const entry = {
        ...formData,
        pdfName: formData.pdf.name,
        pdfUrl: reader.result
      };
      const entries = JSON.parse(localStorage.getItem('mainEntries') || '[]');
      entries.push(entry);
      localStorage.setItem('mainEntries', JSON.stringify(entries));
      setFormData({
        taluka: '',
        village: '',
        type: '',
        proposal: '',
        area: '',
        ownership: '',
        pdf: null
      });
    };
    reader.readAsDataURL(formData.pdf);
  };

  return (
    <form onSubmit={handleSubmit} className="form-layout">
      <label>तालुका:</label>
      <select name="taluka" value={formData.taluka} onChange={handleChange} required>
        <option value="">-- तालुका निवडा --</option>
        {Object.keys(talukaData).map((taluka) => (
          <option key={taluka} value={taluka}>{taluka}</option>
        ))}
      </select>

      <label>गाव:</label>
      <select name="village" value={formData.village} onChange={handleChange} required>
        <option value="">-- गाव निवडा --</option>
        {(talukaData[formData.taluka] || []).map((village) => (
          <option key={village} value={village}>{village}</option>
        ))}
      </select>

      <label>प्रकार:</label>
      <input type="text" name="type" value={formData.type} onChange={handleChange} required />

      <label>प्रस्ताव:</label>
      <input type="text" name="proposal" value={formData.proposal} onChange={handleChange} required />

      <label>क्षेत्र (हे.आर):</label>
      <input type="number" name="area" step="0.01" min="0" value={formData.area} onChange={handleChange} required />

      <label>धारणाधिकार:</label>
      <input type="text" name="ownership" value={formData.ownership} onChange={handleChange} required />

      <label>PDF दस्तऐवज:</label>
      <input type="file" name="pdf" accept="application/pdf" onChange={handleChange} required />

      <button type="submit" className="save-button">जतन करा</button>
    </form>
  );
}
