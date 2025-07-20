import React, { useState, useEffect, useRef } from 'react';
import * as XLSX from 'xlsx';
import '../css/form.css';
import axios from 'axios';
import Snackbar from '@mui/material/Snackbar';
import MuiAlert from '@mui/material/Alert';

export default function TabbedForm({ onLogout }) {
  const [activeTab, setActiveTab] = useState('main');
  const [formData, setFormData] = useState({});
  const [entries, setEntries] = useState([]);
  const [editMode, setEditMode] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  const formRef = useRef(null);
  const [searchLocation, setSearchLocation] = useState('');


  const showSnackbar = (message, severity = 'success') => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  const handleSnackbarClose = () => setSnackbarOpen(false);

  useEffect(() => {
    fetchEntries();
  }, []);

  const fetchEntries = async () => {
    try {
     // const response = await axios.get('http://localhost:8080/api/entries');
     const response= await axios.get('https://illustrious-fulfillment-production.up.railway.app/api/entries');
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
    if (!formData.pdf && !editMode) return;

    const reader = new FileReader();
    reader.onload = async () => {
      const payload = {
        ...formData,
        tabType: activeTab,
        pdfName: formData.pdf?.name || formData.pdfName,
        pdfUrl: reader.result || null,
        entryType: activeTab
      };

      try {
        if (editMode) {
        //  await axios.put(`http://localhost:8080/api/entries/${editingId}`, payload);
          await axios.put(`https://illustrious-fulfillment-production.up.railway.app/api/entries/${editingId}`, payload);

          showSnackbar('नोंदणी यशस्वीरित्या अद्यतनित झाली!', 'success');
        } else {
       //   await axios.post('http://localhost:8080/api/entries', payload);
          await axios.post('https://illustrious-fulfillment-production.up.railway.app/api/entries', payload);
          showSnackbar('नोंदणी यशस्वीरित्या जतन झाली!', 'success');
        }

        setFormData({});
        setEditMode(false);
        setEditingId(null);
        await fetchEntries();
      } catch (err) {
        console.error('Error saving entry:', err);
        showSnackbar('नोंदणी जतन करताना त्रुटी आली.', 'error');
      }
    };

    if (formData.pdf && typeof formData.pdf !== 'string') {
      reader.readAsDataURL(formData.pdf);
    } else {
      reader.onload();
    }
  };

  const deleteRow = async (id, index) => {
    try {
     //  await axios.delete(`http://localhost:8080/api/entries/${id}`);
      await axios.delete(`https://illustrious-fulfillment-production.up.railway.app/api/entries/${id}`);
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

  const handleEdit = (entry) => {
    setFormData({ ...entry });
    setEditMode(true);
    setEditingId(entry.id);
    setActiveTab(entry.tabType);
    setTimeout(() => formRef.current.scrollIntoView({ behavior: 'smooth' }), 100);
  };

  const handleCancelEdit = () => {
    setFormData({});
    setEditMode(false);
    setEditingId(null);
  };

 const exportToExcel = () => {
  const filteredEntries = entries.filter(entry => entry.tabType === activeTab);

  if (filteredEntries.length === 0) {
    showSnackbar("एक्सेलसाठी काहीही डेटा उपलब्ध नाही.", "info");
    return;
  }

  // Format entries into a readable array of objects
  const dataToExport = filteredEntries.map((entry, index) => ({
    'अ.क्र.': index + 1,
    'टॅब प्रकार': entry.tabType || '-',
    'प्रयोजन': entry.purpose || '-',
    'प्रस्ताव': entry.proposal || '-',
    'क्षेत्र (हे.आर.)': entry.area || '-',
    'मूल्यांकन क्षेत्र (हे.)': entry.valuatedArea || '-',
    'खरेदी क्षेत्र (हे.)': entry.purchasedArea || '-',
    'गाव/तालुका/जिल्हा': entry.location || '-',
    'शेरा': entry.remarks || '-',
    'PDF नाव': entry.pdfName || '-'
  }));

  const worksheet = XLSX.utils.json_to_sheet(dataToExport);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');

  let filename = 'नोंदणी.xlsx';
  if (activeTab === 'main') filename = 'मुख्य_नोंदणी.xlsx';
  if (activeTab === 'valuation') filename = 'थेट_खरेदी.xlsx';
  if (activeTab === 'pending') filename = 'प्रलंबित.xlsx';

  XLSX.writeFile(workbook, filename);
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
          <input type="number" name="area" value={formData.area || ''} pattern="^\d{1,3}(\.\d{1,4})?$" title="कृपया 3 अंकांपर्यंत आणि दशांश नंतर 4 अंकांपर्यंत मूल्य प्रविष्ट करा (उदा. 250.1234)" inputMode="decimal" onChange={handleChange} required />

          <label>गांव / तालुका / जिल्हा:</label>
          <input type="text" name="location" value={formData.location || ''} onChange={handleChange} required />

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
          <input type="number" name="valuatedArea" value={formData.valuatedArea || ''} pattern="^\d{1,3}(\.\d{1,4})?$" title="कृपया 3 अंकांपर्यंत आणि दशांश नंतर 4 अंकांपर्यंत मूल्य प्रविष्ट करा (उदा. 250.1234)" inputMode="decimal" onChange={handleChange} required />

          <label>खरेदी दस्त केलेले क्षेत्र (हे.):</label>
          <input type="number" name="purchasedArea" value={formData.purchasedArea || ''} pattern="^\d{1,3}(\.\d{1,4})?$" title="कृपया 3 अंकांपर्यंत आणि दशांश नंतर 4 अंकांपर्यंत मूल्य प्रविष्ट करा (उदा. 250.1234)" inputMode="decimal" onChange={handleChange} required />

          <label>गांव / तालुका / जिल्हा:</label>
          <input type="text" name="location" value={formData.location || ''} onChange={handleChange} required />

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
          <input type="number" name="area" value={formData.area || ''} pattern="^\d{1,3}(\.\d{1,4})?$" title="कृपया 3 अंकांपर्यंत आणि दशांश नंतर 4 अंकांपर्यंत मूल्य प्रविष्ट करा (उदा. 250.1234)" inputMode="decimal" onChange={handleChange} required />

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
       <h1 className="main-title">आरफळ कालवे उपविभाग क्रमांक ३, कवठे एकंद</h1>
      <h1 className="main-title">आरफळ भूसंपादन व्यवस्थापन प्रणाली, जि.सांगली</h1>

      <div className="tab-buttons">
        {['main', 'valuation', 'pending'].map(tab => (
          <button
            key={tab}
            type="button"
            className={activeTab === tab ? 'tab-button active' : 'tab-button'}
            onClick={() => setActiveTab(tab)}
          >
            {{
              main: 'मुख्य नोंदणी',
              valuation: 'थेट खरेदी/मूल्यांकन प्रस्ताव',
              pending: 'भूमि अभिलेख यांचेकडे प्रलंबित'
            }[tab]}
          </button>
        ))}
        <button onClick={onLogout} style={{ marginLeft: 'auto', backgroundColor: '#c00', color: '#fff' }}>
          बाहेर पडा
        </button>
        <Snackbar
          open={snackbarOpen}
          autoHideDuration={4000}
          onClose={handleSnackbarClose}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
          <MuiAlert elevation={6} variant="filled" onClose={handleSnackbarClose} severity={snackbarSeverity}>
            {snackbarMessage}
          </MuiAlert>
        </Snackbar>
      </div>

      <form className="form-layout" onSubmit={handleSubmit} ref={formRef} style={{ border: editMode ? '2px dashed #4caf50' : 'none' }}>
        {renderForm()}

        <label>PDF दस्तऐवज:</label>
        {formData.pdfName && !formData.pdf?.name ? (
          <p>🔗 <strong>{formData.pdfName}</strong></p>
        ) : (
          <input type="file" name="pdf" accept="application/pdf" onChange={handleChange} required={!editMode} />
        )}

        {!editMode ? (
          <button type="submit" className="save-button">जतन करा</button>
        ) : (
          <>
            <button type="submit" className="save-button">अद्यतन करा</button>
            <button type="button" className="cancel-button" onClick={handleCancelEdit}>रद्द करा</button>
          </>
        )}
      </form>

      <div className="action-buttons">
        <button onClick={exportToExcel}>Excel मध्ये निर्यात करा</button>
      </div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', margin: '10px 0' }}>
  <label htmlFor="locationSearch" style={{ marginRight: '8px', fontWeight: 'bold' }}>
    🔍 गाव/तालुका/जिल्हा शोधा:
  </label>
  <input
    id="locationSearch"
    type="text"
    placeholder="गावाचे नाव टाका"
    value={searchLocation}
    onChange={(e) => setSearchLocation(e.target.value)}
    style={{ padding: '4px 8px', width: '200px' }}
  />
</div>


    <table id="mainTable">
  <thead>
    <tr>
      <th>अ.क्र.</th>
      <th>टॅब प्रकार</th>
      <th>प्रयोजन</th>
      <th>प्रस्ताव</th>
      <th>क्षेत्र</th>
      <th>मूल्यांकन</th>
      <th>खरेदी क्षेत्र</th>
      <th>गाव/तालुका/जिल्हा</th>
      <th>शेरा</th>
      <th>PDF</th>
      <th>कृती</th>
    </tr>
  </thead>
  <tbody>
    {entries
      .filter((entry) => entry.tabType === activeTab)
.filter((entry) =>
  entry.location?.toLowerCase().includes(searchLocation.toLowerCase())
)

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
            {entry.pdfName && (
  <a
    href={`http://localhost:8080/api/entries/${entry.id}/pdf`}
    target="_blank"
    rel="noopener noreferrer"
    className="btn btn-sm btn-outline-primary"
  >
    PDF डाउनलोड करा
  </a>
)}

          </td>
          <td>
            <button onClick={() => handleEdit(entry)}>संपादन</button>{' '}
            <button onClick={() => deleteRow(entry.id, index)}>हटवा</button>
          </td>
        </tr>
      ))}
  </tbody>

  <tfoot>
    <tr style={{ fontWeight: 'bold', backgroundColor: '#f0f0f0' }}>
      <td colSpan={4}>एकूण:</td>
      <td>
        {
          entries
            .filter((entry) => entry.tabType === activeTab)
            .reduce((sum, entry) => sum + (parseFloat(entry.area) || 0), 0)
        }
      </td>
      <td>
        {
          entries
            .filter((entry) => entry.tabType === activeTab)
            .reduce((sum, entry) => sum + (parseFloat(entry.valuatedArea) || 0), 0)
        }
      </td>
      <td>
        {
          entries
            .filter((entry) => entry.tabType === activeTab)
            .reduce((sum, entry) => sum + (parseFloat(entry.purchasedArea) || 0), 0)
        }
      </td>
      <td colSpan={4}></td>
    </tr>
  </tfoot>
</table>

    </div>
  );
}
