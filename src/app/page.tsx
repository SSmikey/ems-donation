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
        background: '#f8f9fa',
        backgroundImage: 'linear-gradient(180deg, #ffffff 0%, #f1f3f5 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        position: 'relative'
      }}
    >

      {/* Login Card */}
      <div
        className="card border-0"
        style={{
          maxWidth: '480px',
          width: '90%',
          padding: '55px 50px',
          position: 'relative',
          zIndex: 10,
          background: '#ffffff',
          borderRadius: '16px',
          boxShadow: '0 10px 40px rgba(0, 0, 0, 0.06)',
          border: '1px solid #e9ecef'
        }}
      >
        {/* Logo Section */}
        <div className="text-center mb-5">
          <h1 className="fw-bold mb-2" style={{ fontSize: '28px', color: '#1e293b', letterSpacing: '-0.3px', lineHeight: '1.2' }}>
            ระบบจัดการบริจาคสิ่งของ
          </h1>
          <p className="text-secondary mb-0" style={{ fontSize: '13px', fontWeight: '500', letterSpacing: '0.3px' }}>
            EMERGENCY MANAGEMENT SYSTEM
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin}>
          <div className="mb-4 pb-3" style={{ borderBottom: '2px solid #f1f3f5' }}>
            <h2 className="text-center fw-bold mb-0" style={{ fontSize: '20px', color: '#334155', letterSpacing: '-0.2px' }}>
              เข้าสู่ระบบ
            </h2>
          </div>

          {error && (
            <div
              className="alert alert-danger d-flex align-items-center mb-4"
              role="alert"
              style={{
                borderRadius: '12px',
                border: 'none',
                background: '#fee2e2',
                color: '#991b1b',
                fontSize: '14px'
              }}
            >
              <i className="bi bi-exclamation-circle-fill me-2"></i>
              <span>{error}</span>
            </div>
          )}

          {/* Username Input */}
          <div className="mb-4">
            <label className="form-label fw-semibold mb-2" style={{ fontSize: '13px', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              ชื่อผู้ใช้งาน
            </label>
            <div className="position-relative">
              <i
                className="bi bi-person position-absolute"
                style={{
                  left: '14px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#94a3b8',
                  fontSize: '16px'
                }}
              ></i>
              <input
                type="text"
                placeholder="กรอกชื่อผู้ใช้งาน"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="form-control"
                style={{
                  background: '#ffffff',
                  border: '1.5px solid #cbd5e0',
                  color: '#1e293b',
                  borderRadius: '8px',
                  padding: '11px 14px 11px 42px',
                  fontSize: '14px',
                  fontWeight: '500'
                }}
                required
              />
            </div>
          </div>

          {/* Password Input */}
          <div className="mb-4">
            <label className="form-label fw-semibold mb-2" style={{ fontSize: '13px', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              รหัสผ่าน
            </label>
            <div className="position-relative">
              <i
                className="bi bi-lock position-absolute"
                style={{
                  left: '14px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#94a3b8',
                  fontSize: '16px'
                }}
              ></i>
              <input
                type="password"
                placeholder="กรอกรหัสผ่าน"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="form-control"
                style={{
                  background: '#ffffff',
                  border: '1.5px solid #cbd5e0',
                  color: '#1e293b',
                  borderRadius: '8px',
                  padding: '11px 14px 11px 42px',
                  fontSize: '14px',
                  fontWeight: '500'
                }}
                required
              />
            </div>
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
                  width: '18px',
                  height: '18px',
                  borderRadius: '6px',
                  border: '2px solid #cbd5e0'
                }}
              />
              <label
                className="form-check-label"
                htmlFor="rememberMe"
                style={{
                  color: '#718096',
                  fontSize: '14px',
                  marginLeft: '8px'
                }}
              >
                จดจำการเข้าสู่ระบบ
              </label>
            </div>
          </div>

          {/* Login Button */}
          <button
            type="submit"
            className="btn btn-primary w-100 fw-bold"
            disabled={loading}
            style={{
              background: '#1e40af',
              border: 'none',
              padding: '13px',
              fontSize: '15px',
              borderRadius: '8px',
              boxShadow: '0 4px 12px rgba(30, 64, 175, 0.15)',
              transition: 'all 0.2s ease',
              letterSpacing: '0.3px'
            }}
          >
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                กำลังเข้าสู่ระบบ...
              </>
            ) : (
              'เข้าสู่ระบบ'
            )}
          </button>
        </form >
      </div >

      <style>{`
        input::placeholder {
          color: #94a3b8 !important;
        }

        input:focus {
          background: #ffffff !important;
          border-color: #1e40af !important;
          box-shadow: 0 0 0 3px rgba(30, 64, 175, 0.08) !important;
          color: #1e293b !important;
        }

        .form-check-input:checked {
          background-color: #1e40af !important;
          border-color: #1e40af !important;
        }

        .form-check-input:focus {
          border-color: #1e40af !important;
          box-shadow: 0 0 0 3px rgba(30, 64, 175, 0.08) !important;
        }

        .btn-primary:hover:not(:disabled) {
          background: #1e3a8a !important;
          transform: translateY(-1px);
          box-shadow: 0 6px 16px rgba(30, 64, 175, 0.2) !important;
        }

        .btn-primary:active:not(:disabled) {
          transform: translateY(0);
          box-shadow: 0 2px 8px rgba(30, 64, 175, 0.15) !important;
        }

        .btn-primary:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
      `}</style>
    </div >
  );
}
