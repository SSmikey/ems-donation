'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
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
      const success = await login(username, password);

      if (success) {
        router.push('/dashboard');
      } else {
        setError('ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง');
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
        background: '#f8fafc',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        position: 'relative'
      }}
    >
      {/* Dynamic Background Blobs - Increased Opacity for Richer Colors */}
      <div style={{
        position: 'absolute',
        top: '-10%',
        left: '-10%',
        width: '45%',
        height: '45%',
        background: 'radial-gradient(circle, rgba(16, 185, 129, 0.35) 0%, rgba(16, 185, 129, 0) 75%)',
        filter: 'blur(80px)',
        zIndex: 1,
        animation: 'float 15s infinite alternate ease-in-out'
      }}></div>
      <div style={{
        position: 'absolute',
        bottom: '-10%',
        right: '-10%',
        width: '55%',
        height: '55%',
        background: 'radial-gradient(circle, rgba(59, 130, 246, 0.35) 0%, rgba(59, 130, 246, 0) 75%)',
        filter: 'blur(100px)',
        zIndex: 1,
        animation: 'float 18s infinite alternate-reverse ease-in-out'
      }}></div>
      <div style={{
        position: 'absolute',
        top: '15%',
        right: '5%',
        width: '35%',
        height: '35%',
        background: 'radial-gradient(circle, rgba(245, 158, 11, 0.3) 0%, rgba(245, 158, 11, 0) 75%)',
        filter: 'blur(70px)',
        zIndex: 1,
        animation: 'float 12s infinite alternate ease-in-out'
      }}></div>
      <div style={{
        position: 'absolute',
        bottom: '10%',
        left: '10%',
        width: '40%',
        height: '40%',
        background: 'radial-gradient(circle, rgba(139, 92, 246, 0.3) 0%, rgba(139, 92, 246, 0) 75%)',
        filter: 'blur(90px)',
        zIndex: 1,
        animation: 'float 20s infinite alternate-reverse ease-in-out'
      }}></div>

      {/* Login Card */}
      <div
        className="card border-0 shadow-lg"
        style={{
          maxWidth: '460px',
          width: '90%',
          padding: '50px 45px',
          position: 'relative',
          zIndex: 10,
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          borderRadius: '24px',
          border: '1px solid rgba(255, 255, 255, 0.6)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15)'
        }}
      >
        {/* Logo Section */}
        <div className="text-center mb-5">
          <div className="mb-4 d-inline-block p-3 rounded-circle shadow-sm" style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)' }}>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
          </div>
          <h1 className="fw-bold mb-2" style={{ fontSize: '28px', color: '#111827', letterSpacing: '-0.025em', lineHeight: '1.2' }}>
            ระบบจัดการบริจาค
          </h1>
          <p className="text-secondary mb-0" style={{ fontSize: '13px', fontWeight: '600', letterSpacing: '0.05em', color: '#6b7280' }}>
            EMERGENCY MANAGEMENT SYSTEM
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin}>
          {error && (
            <div
              className="alert d-flex align-items-center mb-4"
              role="alert"
              style={{
                borderRadius: '12px',
                border: '1px solid rgba(239, 68, 68, 0.2)',
                background: 'rgba(254, 226, 226, 0.8)',
                color: '#991b1b',
                fontSize: '14px',
                padding: '12px 16px'
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="me-2">
                <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          {/* Username Input */}
          <div className="mb-4">
            <label className="form-label mb-2" style={{ fontSize: '12px', color: '#6b7280', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              ชื่อผู้ใช้งาน
            </label>
            <div className="position-relative">
              <span className="position-absolute" style={{ left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
                </svg>
              </span>
              <input
                type="text"
                placeholder="กรอกชื่อผู้ใช้งาน"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="form-control"
                style={{
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  color: '#1e293b',
                  borderRadius: '12px',
                  padding: '12px 16px 12px 48px',
                  fontSize: '15px',
                  height: '50px',
                  transition: 'all 0.2s ease'
                }}
                required
              />
            </div>
          </div>

          {/* Password Input */}
          <div className="mb-4">
            <label className="form-label mb-2" style={{ fontSize: '12px', color: '#6b7280', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              รหัสผ่าน
            </label>
            <div className="position-relative">
              <span className="position-absolute" style={{ left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              </span>
              <input
                type="password"
                placeholder="กรอกรหัสผ่าน"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="form-control"
                style={{
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  color: '#1e293b',
                  borderRadius: '12px',
                  padding: '12px 16px 12px 48px',
                  fontSize: '15px',
                  height: '50px',
                  transition: 'all 0.2s ease'
                }}
                required
              />
            </div>
          </div>
          
          {/* Login Button */}
          <button
            type="submit"
            className="btn w-100 fw-bold transition-all shadow-sm"
            disabled={loading}
            style={{
              background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
              color: '#ffffff',
              border: 'none',
              padding: '14px',
              fontSize: '16px',
              borderRadius: '12px',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
            }}
          >
            {loading ? (
              <div className="d-flex align-items-center justify-content-center">
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                กำลังเข้าสู่ระบบ...
              </div>
            ) : (
              'เข้าสู่ระบบ'
            )}
          </button>
        </form >
      </div >

      <style>{`
        @keyframes float {
          0% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-20px) scale(1.05); }
          100% { transform: translateY(0) scale(1); }
        }

        input:focus {
          background: #ffffff !important;
          border-color: #3b82f6 !important;
          box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1) !important;
          outline: none;
        }

        .btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 10px 15px -3px rgba(59, 130, 246, 0.3) !important;
          filter: brightness(1.1);
        }

        .btn:active:not(:disabled) {
          transform: translateY(0);
        }

        input::placeholder {
          color: #94a3b8;
          font-weight: 400;
        }
      `}</style>
    </div>
  );
}
