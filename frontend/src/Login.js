import React, { useState } from 'react';

function Login({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch('http://localhost:3001/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('username', data.username);
        localStorage.setItem('role', data.role);
        onLogin(data.role);
      } else {
        setError(data.message || 'Помилка входу');
      }
    } catch (err) {
      setError('Помилка зʼєднання з сервером');
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h2>Вхід</h2>
        <form className="login-form" onSubmit={handleLogin}>
          <input
            type="text"
            placeholder="Логін"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Пароль"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit">Увійти</button>
        </form>
        <p style={{ marginTop: '1rem' }}>
  Ще не маєте акаунту? <a href="/register">Зареєструйтесь</a>
</p>

        {error && <p className="login-error">{error}</p>}
      </div>
    </div>
  );
}

export default Login;
