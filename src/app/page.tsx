'use client';

import { useState } from 'react';

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
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        position: 'relative'
      }}
    >
      {/* Decorative elements */}
      <div
        style={{
          position: 'absolute',
          width: '400px',
          height: '400px',
          background: 'radial-gradient(circle, #00d4ff, transparent)',
          borderRadius: '50%',
          opacity: 0.15,
          top: '-100px',
          left: '-100px'
        }}
      ></div>
      <div
        style={{
          position: 'absolute',
          width: '300px',
          height: '300px',
          background: 'radial-gradient(circle, #c084fc, transparent)',
          borderRadius: '50%',
          opacity: 0.15,
          bottom: '-50px',
          left: '-50px'
        }}
      ></div>
      <div
        style={{
          position: 'absolute',
          width: '350px',
          height: '350px',
          background: 'radial-gradient(circle, #00d4ff, transparent)',
          borderRadius: '50%',
          opacity: 0.15,
          bottom: '-100px',
          right: '-100px'
        }}
      ></div>

      {/* Login Card */}
      <div
        className="card shadow-lg border-0"
        style={{
          maxWidth: '420px',
          width: '100%',
          padding: '60px 50px',
          position: 'relative',
          zIndex: 10,
          background: 'rgba(22, 33, 62, 0.9)',
          backdropFilter: 'blur(10px)'
        }}
      >
        {/* Logo Section */}
        <div className="text-center mb-5">
          <h1 className="fw-bold" style={{ fontSize: '28px', color: '#ffffff', letterSpacing: '0.5px', margin: 0 }}>
            ems-donation
          </h1>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin}>
          <h2 className="text-center fw-normal mb-4" style={{ fontSize: '24px', color: '#ffffff', letterSpacing: '0.5px' }}>
            Login
          </h2>

          {error && (
            <div className="alert alert-danger d-flex align-items-center mb-3" role="alert">
              <span>{error}</span>
            </div>
          )}

          {/* Username Input */}
          <div className="mb-3">
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="form-control"
              style={{
                background: 'rgba(255, 255, 255, 0.08)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                color: '#ffffff',
                borderRadius: '10px'
              }}
              required
            />
          </div>

          {/* Password Input */}
          <div className="mb-4">
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="form-control"
              style={{
                background: 'rgba(255, 255, 255, 0.08)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                color: '#ffffff',
                borderRadius: '10px'
              }}
              required
            />
          </div>

          {/* Remember Me */}
          <div className="mb-4">
            <div className="form-check">
              <input
                className="form-check-input"
                type="checkbox"
                id="rememberMe"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                style={{
                  accentColor: 'rgba(255, 255, 255, 0.6)'
                }}
              />
              <label className="form-check-label" htmlFor="rememberMe" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                Remember me?
              </label>
            </div>
          </div>

          {/* Login Button */}
          <button
            type="submit"
            className="btn btn-primary w-100 fw-bold"
            disabled={loading}
            style={{
              background: 'linear-gradient(135deg, #00d4ff 0%, #0099cc 100%)',
              border: 'none',
              padding: '14px',
              fontSize: '16px',
              borderRadius: '10px',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)'
            }}
          >
            {loading ? 'กำลังเข้าสู่ระบบ...' : 'Login'}
          </button>
        </form>
      </div>

      <style>{`
        input::placeholder {
          color: rgba(255, 255, 255, 0.5) !important;
        }

        input:focus {
          background: rgba(255, 255, 255, 0.12) !important;
          border-color: rgba(255, 255, 255, 0.4) !important;
          box-shadow: none !important;
          color: #ffffff !important;
        }

        .btn-primary:hover:not(:disabled) {
          background: linear-gradient(135deg, #00e5ff 0%, #00aadd 100%) !important;
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(0, 0, 0, 0.25) !important;
        }

        .btn-primary:active:not(:disabled) {
          transform: translateY(0);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15) !important;
        }

        .btn-primary:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
}
