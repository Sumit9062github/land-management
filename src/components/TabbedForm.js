import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import '../css/form.css';



export default function TabbedForm({ onLogout}) {
  const [activeTab, setActiveTab] = useState('main');
  const [formData, setFormData] = useState({});
  const [entries, setEntries] = useState([]);

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('mainEntries') || '[]');
    setEntries(saved);
  }, []);

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
      const newEntry = {
        ...formData,
        pdfName: formData.pdf.name,
        pdfUrl: reader.result
      };
      const updated = [...entries, newEntry];
      setEntries(updated);
      localStorage.setItem('mainEntries', JSON.stringify(updated));
      setFormData({});
    };
    reader.readAsDataURL(formData.pdf);
  };

  const deleteRow = (index) => {
    const updated = [...entries];
    updated.splice(index, 1);
    setEntries(updated);
    localStorage.setItem('mainEntries', JSON.stringify(updated));
  };

  const exportToExcel = () => {
    const table = document.getElementById('mainTable');
    const wb = XLSX.utils.table_to_book(table, { sheet: 'Sheet1' });
    XLSX.writeFile(wb, 'मुख्य_नोंदणी.xlsx');
  };

  const renderForm = () => {
    switch (activeTab) {
      case 'main':
        return (
          <>
            <label>प्रयोजन:</label>
            <input type="text" name="purpose" value={formData.purpose || ''} onChange={handleChange} required />

            <label>प्रस्ताव:</label>
            <input type="text" name="proposal" value={formData.proposal || ''} onChange={handleChange} required />

            <label>क्षेत्र (हे.आर):</label>
            <input type="number" name="area" value={formData.area || ''} step="0.01" min="0" onChange={handleChange} required />

            <label>शेरा:</label>
            <input type="text" name="remarks" value={formData.remarks || ''} onChange={handleChange} />
          </>
        );

      case 'valuation':
        return (
          <>
            <label>प्रस्ताव:</label>
            <input type="text" name="proposal" value={formData.proposal || ''} onChange={handleChange} required />

            <label>मुल्यांकन झालेले एकुण क्षेत्र (हे.):</label>
            <input type="number" name="valuatedArea" value={formData.valuatedArea || ''} step="0.01" min="0" onChange={handleChange} required />

            <label>खरेदी दस्त केलेले क्षेत्र (हे.):</label>
            <input type="number" name="purchasedArea" value={formData.purchasedArea || ''} step="0.01" min="0" onChange={handleChange} required />

            <label>शेरा:</label>
            <input type="text" name="remarks" value={formData.remarks || ''} onChange={handleChange} />
          </>
        );

      case 'pending':
        return (
          <>
            <label>भूसंपादनाचे प्रयोजन:</label>
            <input type="text" name="purpose" value={formData.purpose || ''} onChange={handleChange} required />

            <label>गांव / तालुका / जिल्हा:</label>
            <input type="text" name="location" value={formData.location || ''} onChange={handleChange} required />

            <label>एकूण क्षेत्र (हे.आर.):</label>
            <input type="number" name="area" value={formData.area || ''} step="0.01" min="0" onChange={handleChange} required />

            <label>शेरा:</label>
            <input type="text" name="remarks" value={formData.remarks || ''} onChange={handleChange} />
          </>
        );

      default:
        return null;
    }
  };

  return (
    <div className="tabbed-form-wrapper">
      <h1 className="main-title">भूसंपादन व्यवस्थापन प्रणाली</h1>

      <div className="tab-buttons">
  <button
    type="button"
    className={activeTab === 'main' ? 'tab-button active' : 'tab-button'}
    onClick={() => setActiveTab('main')}
  >
    मुख्य नोंदणी
  </button>
  <button
    type="button"
    className={activeTab === 'valuation' ? 'tab-button active' : 'tab-button'}
    onClick={() => setActiveTab('valuation')}
  >
    थेट खरेदी/मूल्यांकन प्रस्ताव
  </button>
  <button
    type="button"
    className={activeTab === 'pending' ? 'tab-button active' : 'tab-button'}
    onClick={() => setActiveTab('pending')}
  >
    भूमि अभिलेख यांचेकडे प्रलंबित
  </button>
   <button onClick={onLogout} style={{ marginLeft: 'auto', backgroundColor: '#c00', color: '#fff' }}>
    बाहेर पडा
  </button>
</div>


      <form className="form-layout" onSubmit={handleSubmit}>
        {renderForm()}

        <label>PDF दस्तऐवज:</label>
        <input type="file" name="pdf" accept="application/pdf" onChange={handleChange} required />

        <button type="submit" className="save-button">जतन करा</button>
      </form>

      <div className="action-buttons">
        <button onClick={exportToExcel}>Excel मध्ये निर्यात करा</button>
      </div>

      <table id="mainTable">
        <thead>
          <tr>
            <th>अ.क्र.</th>
            <th>प्रयोजन</th>
            <th>प्रस्ताव</th>
            <th>क्षेत्र</th>
            <th>शेरा</th>
            <th>PDF</th>
            <th>हटवा</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((entry, index) => (
            <tr key={index}>
              <td>{index + 1}</td>
              <td>{entry.purpose || '-'}</td>
              <td>{entry.proposal || '-'}</td>
              <td>{entry.area || entry.valuatedArea || entry.purchasedArea || '-'}</td>
              <td>{entry.remarks || '-'}</td>
              <td>
                {entry.pdfUrl ? (
                  <a href={entry.pdfUrl} target="_blank" rel="noopener noreferrer">
                    {entry.pdfName}
                  </a>
                ) : (
                  '-'
                )}
              </td>
              <td>
                <button onClick={() => deleteRow(index)}>हटवा</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
