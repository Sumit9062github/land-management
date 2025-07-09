import React, { useEffect, useState } from 'react';
import * as XLSX from 'xlsx';
import '../css/form.css';


export default function MainTable() {
  const [entries, setEntries] = useState([]);

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('mainEntries') || '[]');
    setEntries(saved);
  }, []);

  const deleteEntry = (index) => {
    const updated = [...entries];
    updated.splice(index, 1);
    localStorage.setItem('mainEntries', JSON.stringify(updated));
    setEntries(updated);
  };

  const exportToExcel = () => {
    const table = document.getElementById('mainTable');
    const wb = XLSX.utils.table_to_book(table, { sheet: 'Sheet1' });
    XLSX.writeFile(wb, 'मुख्य_नोंदणी.xlsx');
  };

  return (
    <div>
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
            <th>PDF</th>
            <th>Delete</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((e, idx) => (
            <tr key={idx}>
              <td>{idx + 1}</td>
              <td>{e.purpose}</td>
              <td>{e.proposal}</td>
              <td>{e.area}</td>
              <td>
                <a href={e.pdfUrl} target="_blank" rel="noreferrer">
                  {e.pdfName}
                </a>
              </td>
              <td>
                <button onClick={() => deleteEntry(idx)}>हटवा</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
