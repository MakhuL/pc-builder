import React, { useEffect, useState } from 'react';

function Verify() {
  const [status, setStatus] = useState('Перевірка...');

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');

    if (!token) {
      setStatus('❌ Недійсне посилання для підтвердження.');
      return;
    }

    fetch(`http://localhost:3001/verify?token=${token}`)
      .then(async res => {
        const msg = await res.text();
        if (res.ok) {
          setStatus(`✅ ${msg}`);
        } else {
          setStatus(`❌ ${msg}`);
        }
      })
      .catch(() => setStatus('❌ Помилка під час підтвердження.'));
  }, []);

  return (
    <div className="login-container">
      <div className="login-box">
        <h2>Підтвердження email</h2>
        <p>{status}</p>
        <a href="/login">Перейти до входу</a>
      </div>
    </div>
  );
}

export default Verify;
