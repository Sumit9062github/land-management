import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import '../css/form.css';
import axios from 'axios';
import Snackbar from '@mui/material/Snackbar';
import MuiAlert from '@mui/material/Alert';




export default function TabbedForm({ onLogout }) {
  const [activeTab, setActiveTab] = useState('main');
  const [formData, setFormData] = useState({});
  const [entries, setEntries] = useState([]);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success'); // 'success' or 'error'

  const showSnackbar = (message, severity = 'success') => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };


  useEffect(() => {
    fetchEntries();
  }, []);

  const fetchEntries = async () => {
    try {
      const response = await axios.get('http://localhost:8080/api/entries');

      const mapped = response.data.map(entry => ({
        ...entry,
        tabType: entry.entryType, 
      }));

      setEntries(mapped);
    } catch (err) {
      console.error('Error fetching entries:', err);
    }
  };



  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'pdf') {
      setFormData({ ...formData, pdf: files[0] });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.pdf) return;

    const reader = new FileReader();
    reader.onload = async () => {
      const newEntry = {
        ...formData,
        tabType: activeTab,
        pdfName: formData.pdf.name,
        pdfUrl: reader.result,
        entryType: activeTab 
      };

      try {
        const res = await axios.post('http://localhost:8080/api/entries', newEntry);
        setEntries([...entries, res.data]);
        setFormData({});
        showSnackbar('नोंदणी यशस्वीरित्या जतन झाली!', 'success');
        await fetchEntries();
      } catch (err) {
        console.error('Error saving entry:', err);
        showSnackbar('नोंदणी जतन करताना त्रुटी आली.', 'error');
      }

    };
    reader.readAsDataURL(formData.pdf);
  };

  const deleteRow = async (id, index) => {
    try {
      await axios.delete(`http://localhost:8080/api/entries/${id}`);
      const updated = [...entries];
      updated.splice(index, 1);
      setEntries(updated);
      showSnackbar('नोंदणी यशस्वीरित्या हटवली!', 'success');
      await fetchEntries();
    } catch (err) {
      console.error('Error deleting entry:', err);
      showSnackbar('नोंदणी हटवताना त्रुटी आली.', 'error');
    }
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

        <Snackbar
          open={snackbarOpen}
          autoHideDuration={4000}
          onClose={handleSnackbarClose}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
          <MuiAlert
            elevation={6}
            variant="filled"
            onClose={handleSnackbarClose}
            severity={snackbarSeverity}
            sx={{ width: '100%' }}
          >
            {snackbarMessage}
          </MuiAlert>
        </Snackbar>
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
            <th>टॅब प्रकार</th>
            <th>प्रयोजन</th>
            <th>प्रस्ताव</th>
            <th>क्षेत्र (हे.आर.)</th>
            <th>मूल्यांकन क्षेत्र (हे.)</th>
            <th>खरेदी क्षेत्र (हे.)</th>
            <th>गाव/तालुका/जिल्हा</th>
            <th>शेरा</th>
            <th>PDF</th>
            <th>हटवा</th>
          </tr>
        </thead>
        <tbody>
          {entries
            .filter((entry) => entry.tabType === activeTab)
            .map((entry, index) => (
              <tr key={entry.id || index}>
                <td>{index + 1}</td>
                <td>{entry.tabType || '-'}</td>
                <td>{entry.purpose || '-'}</td>
                <td>{entry.proposal || '-'}</td>
                <td>{entry.area || '-'}</td>
                <td>{entry.valuatedArea || '-'}</td>
                <td>{entry.purchasedArea || '-'}</td>
                <td>{entry.location || '-'}</td>
                <td>{entry.remarks || '-'}</td>
                <td>
                  {entry.pdfName ? (
                    <a
                      href={`http://localhost:8080/api/entries/${entry.id}/pdf`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {entry.pdfName}
                    </a>
                  ) : (
                    "-"
                  )}
                </td>
                <td>
                  <button onClick={() => deleteRow(entry.id, index)}>हटवा</button>
                </td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
}
