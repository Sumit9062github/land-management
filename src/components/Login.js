import React, { useState } from 'react';
import '../css/login.css';


const users = {
  admin: '1234',
  user: 'ak1234'
};

export default function Login({ onLoginSuccess }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = () => {
    if (users[username] && users[username] === password) {
      onLoginSuccess({ username });
    } else {
      setError('चुकीचे नाव किंवा पासवर्ड');
    }
  };

  return (
    <div className="login-box">
      <h2>प्रवेश करा</h2>
      <label>वापरकर्ता नाव:</label>
      <input value={username} onChange={(e) => setUsername(e.target.value)} />
      <label>पासवर्ड:</label>
      <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
      <button onClick={handleLogin}>प्रवेश</button>
      <p style={{ color: 'red' }}>{error}</p>
    </div>
  );
}
