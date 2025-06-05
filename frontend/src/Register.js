// === frontend/Register.js ===
import React, { useState } from 'react';

function Register() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const response = await fetch('http://localhost:3001/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('✅ Реєстрація успішна! Перевірте email для підтвердження акаунту.');
        setUsername('');
        setEmail('');
        setPassword('');
      } else {
        setError(data.message || 'Помилка реєстрації');
      }
    } catch (err) {
      setError('Помилка зʼєднання з сервером');
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h2>Реєстрація</h2>
        <form className="login-form" onSubmit={handleRegister}>
          <input
            type="text"
            placeholder="Логін"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Пароль"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit">Зареєструватись</button>
        </form>
        {error && <p className="login-error">{error}</p>}
        {success && <p className="login-success">{success}</p>}
        <p style={{ marginTop: '1rem' }}>
          Вже маєте акаунт? <a href="/login">Увійти</a>
        </p>
      </div>
    </div>
  );
}

export default Register;
