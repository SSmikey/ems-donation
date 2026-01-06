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
        background: '#ffffff',
        backgroundImage: `
          linear-gradient(135deg, #f5f7fa 0%, #e3e8f0 100%),
          repeating-linear-gradient(45deg, transparent, transparent 35px, rgba(99, 102, 241, 0.03) 35px, rgba(99, 102, 241, 0.03) 70px),
          repeating-linear-gradient(-45deg, transparent, transparent 35px, rgba(59, 130, 246, 0.02) 35px, rgba(59, 130, 246, 0.02) 70px)
        `,
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
          width: '500px',
          height: '500px',
          background: 'radial-gradient(circle, rgba(99, 102, 241, 0.05), transparent)',
          borderRadius: '50%',
          opacity: 0.6,
          top: '-150px',
          left: '-150px',
          animation: 'pulse 4s ease-in-out infinite'
        }}
      ></div>
      <div
        style={{
          position: 'absolute',
          width: '400px',
          height: '400px',
          background: 'radial-gradient(circle, rgba(59, 130, 246, 0.05), transparent)',
          borderRadius: '50%',
          opacity: 0.6,
          bottom: '-100px',
          right: '-100px',
          animation: 'pulse 4s ease-in-out infinite 2s'
        }}
      ></div>

      {/* Login Card */}
      <div
        className="card border-0"
        style={{
          maxWidth: '460px',
          width: '90%',
          padding: '50px 45px',
          position: 'relative',
          zIndex: 10,
          background: '#ffffff',
          borderRadius: '24px',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.08), 0 0 1px rgba(0, 0, 0, 0.05)'
        }}
      >
        {/* Logo Section */}
        <div className="text-center mb-4">
          <div
            style={{
              width: '80px',
              height: '80px',
              background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
              borderRadius: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px',
              boxShadow: '0 10px 30px rgba(59, 130, 246, 0.3)'
            }}
          >
            <i className="bi bi-house-heart-fill" style={{ fontSize: '36px', color: '#ffffff' }}></i>
          </div>
          <h1 className="fw-bold mb-2" style={{ fontSize: '26px', color: '#2d3748', letterSpacing: '-0.5px' }}>
            ระบบจัดการบริจาคสิ่งของ
          </h1>
          <p className="text-muted mb-0" style={{ fontSize: '14px' }}>
            EMS Donation Management System
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin}>
          <h2 className="text-center fw-semibold mb-4" style={{ fontSize: '22px', color: '#4a5568' }}>
            เข้าสู่ระบบ
          </h2>

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
          <div className="mb-3">
            <label className="form-label fw-semibold" style={{ fontSize: '14px', color: '#4a5568' }}>
              ชื่อผู้ใช้
            </label>
            <div className="position-relative">
              <i
                className="bi bi-person-fill position-absolute"
                style={{
                  left: '16px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#a0aec0',
                  fontSize: '18px'
                }}
              ></i>
              <input
                type="text"
                placeholder="กรอกชื่อผู้ใช้"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="form-control"
                style={{
                  background: '#f7fafc',
                  border: '2px solid #e2e8f0',
                  color: '#2d3748',
                  borderRadius: '12px',
                  padding: '12px 16px 12px 48px',
                  fontSize: '15px'
                }}
                required
              />
            </div>
          </div>

          {/* Password Input */}
          <div className="mb-4">
            <label className="form-label fw-semibold" style={{ fontSize: '14px', color: '#4a5568' }}>
              รหัสผ่าน
            </label>
            <div className="position-relative">
              <i
                className="bi bi-lock-fill position-absolute"
                style={{
                  left: '16px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#a0aec0',
                  fontSize: '18px'
                }}
              ></i>
              <input
                type="password"
                placeholder="กรอกรหัสผ่าน"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="form-control"
                style={{
                  background: '#f7fafc',
                  border: '2px solid #e2e8f0',
                  color: '#2d3748',
                  borderRadius: '12px',
                  padding: '12px 16px 12px 48px',
                  fontSize: '15px'
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
            className="btn btn-primary w-100 fw-semibold"
            disabled={loading}
            style={{
              background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
              border: 'none',
              padding: '14px',
              fontSize: '16px',
              borderRadius: '12px',
              boxShadow: '0 10px 25px rgba(59, 130, 246, 0.3)',
              transition: 'all 0.3s ease'
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
        </form>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% {
            transform: scale(1);
            opacity: 0.5;
          }
          50% {
            transform: scale(1.05);
            opacity: 0.6;
          }
        }

        input::placeholder {
          color: #a0aec0 !important;
        }

        input:focus {
          background: #ffffff !important;
          border-color: #3b82f6 !important;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1) !important;
          color: #2d3748 !important;
        }

        .form-check-input:checked {
          background-color: #3b82f6 !important;
          border-color: #3b82f6 !important;
        }

        .form-check-input:focus {
          border-color: #3b82f6 !important;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1) !important;
        }

        .btn-primary:hover:not(:disabled) {
          background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%) !important;
          transform: translateY(-2px);
          box-shadow: 0 15px 35px rgba(59, 130, 246, 0.4) !important;
        }

        .btn-primary:active:not(:disabled) {
          transform: translateY(0);
          box-shadow: 0 5px 15px rgba(59, 130, 246, 0.3) !important;
        }

        .btn-primary:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
}
