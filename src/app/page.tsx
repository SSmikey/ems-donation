'use client';

import { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
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
    <div className={`min-vh-100 d-flex align-items-center justify-content-center overflow-hidden position-relative ${styles.container}`}>
      {/* Decorative elements */}
      <div className={`${styles.decoration} ${styles.decorationTL}`}></div>
      <div className={`${styles.decoration} ${styles.decorationBL}`}></div>
      <div className={`${styles.decoration} ${styles.decorationBR}`}></div>
      <div className={`${styles.decorationDot} ${styles.dotTR}`}></div>
      <div className={`${styles.decorationDot} ${styles.dotML}`}></div>

      {/* Login Card */}
      <div className={`card border-0 shadow position-relative ${styles.card}`}>
        {/* Logo Section */}
        <div className={`text-center mb-4 ${styles.logoSection}`}>
          <h1 className={`mb-0 ${styles.appName}`}>ems-donation</h1>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin} className="w-100">
          <h2 className={`text-center mb-4 ${styles.loginTitle}`}>Login</h2>

          {error && (
            <div className="alert alert-danger small text-center mb-3">
              {error}
            </div>
          )}

          {/* Username Input */}
          <div className={`mb-3 ${styles.inputGroup}`}>
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className={`form-control ${styles.input}`}
              required
            />
          </div>

          {/* Password Input */}
          <div className={`mb-3 ${styles.inputGroup}`}>
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`form-control ${styles.input}`}
              required
            />
          </div>

          {/* Remember Me */}
          <div className={`d-flex justify-content-between align-items-center mb-4 ${styles.optionsRow}`}>
            <label className={`form-check-label cursor-pointer ${styles.rememberCheckbox}`}>
              <input
                type="checkbox"
                className="form-check-input me-2"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              <span>Remember me?</span>
            </label>
          </div>

          {/* Login Button */}
          <button type="submit" className={`btn btn-primary w-100 fw-bold ${styles.loginButton}`} disabled={loading}>
            {loading ? 'กำลังเข้าสู่ระบบ...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
}
