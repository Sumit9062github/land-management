import React, { useState } from 'react';
import MainForm from './MainForm';
import MainTable from './MainTable';

export default function MainApp({ user, onLogout }) {
  const [tab, setTab] = useState('main');

  return (
    <div>
      <h1 style={{ textAlign: 'center', color: '#0066cc' }}>
        कृष्णा प्रकल्प टप्पा क्र.1, ता.सातारा जि.सातारा
      </h1>
      <h3 style={{ textAlign: 'center' }}>
        आरफळ कालवे भूसंपादन प्रस्तावांची सद्यस्थिती, जिल्हा :- सांगली.
      </h3>

      <div className="tabs">
        <button onClick={() => setTab('main')}>मुख्य नोंदणी</button>
        <button onClick={onLogout} style={{ float: 'right', background: '#c00', color: 'white' }}>
          बाहेर पडा
        </button>
      </div>

      {tab === 'main' && (
        <>
          <MainForm />
          <MainTable />
        </>
      )}
    </div>
  );
}
