'use client';

import { useState } from 'react';
import styles from './page.module.css';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (res.ok) {
        // Save user to sessionStorage for basic persistence
        sessionStorage.setItem('user', JSON.stringify(data.user));
        window.location.href = '/dashboard';
      } else {
        setError(data.error || 'การเข้าสู่ระบบล้มเหลว');
      }
    } catch (err) {
      setError('ไม่สามารถเชื่อมต่อกับระบบได้');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      {/* Decorative elements */}
      <div className={styles.decoration + ' ' + styles.decorationTL}></div>
      <div className={styles.decoration + ' ' + styles.decorationBL}></div>
      <div className={styles.decoration + ' ' + styles.decorationBR}></div>
      <div className={styles.decorationDot + ' ' + styles.dotTR}></div>
      <div className={styles.decorationDot + ' ' + styles.dotML}></div>

      {/* Login Card */}
      <div className={styles.card}>
        {/* Logo Section */}
        <div className={styles.logoSection}>
          <h1 className={styles.appName}>ems-donation</h1>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin} className={styles.form}>
          <h2 className={styles.loginTitle}>Login</h2>

          {error && (
            <div style={{ color: '#f87171', background: 'rgba(248, 113, 113, 0.1)', padding: '10px', borderRadius: '8px', marginBottom: '15px', fontSize: '14px', textAlign: 'center' }}>
              {error}
            </div>
          )}

          {/* Username Input */}
          <div className={styles.inputGroup}>
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className={styles.input}
              required
            />
          </div>

          {/* Password Input */}
          <div className={styles.inputGroup}>
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={styles.input}
              required
            />
          </div>

          {/* Remember Me */}
          <div className={styles.optionsRow}>
            <label className={styles.rememberCheckbox}>
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              <span>Remember me?</span>
            </label>
          </div>

          {/* Login Button */}
          <button type="submit" className={styles.loginButton} disabled={loading}>
            {loading ? 'กำลังเข้าสู่ระบบ...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
}
