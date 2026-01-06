'use client';

import { useState, useEffect } from 'react';
import { Dropdown } from 'react-bootstrap';

interface HeaderProps {
  onMenuClick: () => void;
}

const UserIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const LogoutIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
  </svg>
);

export default function Header({ onMenuClick }: HeaderProps) {
  const [user, setUser] = useState<any>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const savedUser = sessionStorage.getItem('user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        console.error('Failed to parse user from session');
      }
    }
  }, []);

  const handleLogout = () => {
    sessionStorage.removeItem('user');
    window.location.href = '/';
  };

  return (
    <header
      className="sticky-top bg-white border-bottom"
      style={{
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05)',
        height: '64px',
        display: 'flex',
        alignItems: 'center',
        paddingLeft: '20px',
        paddingRight: '20px',
      }}
    >
      <div className="d-flex align-items-center gap-3 flex-grow-1">
        {/* Menu Button */}
        <button
          className="btn btn-link p-0 text-dark"
          onClick={onMenuClick}
          style={{
            textDecoration: 'none',
            color: '#212529',
            border: 'none',
            fontSize: '1.5rem',
            cursor: 'pointer',
          }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>
      </div>

      {/* User Profile Dropdown */}
      {mounted && (
        <Dropdown className="d-flex align-items-center gap-2">
          <Dropdown.Toggle
            variant="link"
            id="profile-dropdown"
            className="btn btn-link p-0 text-dark"
            style={{
              textDecoration: 'none',
              color: '#212529',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <UserIcon />
          </Dropdown.Toggle>

          <Dropdown.Menu
            align="end"
            style={{
              minWidth: '300px',
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
              border: '1px solid #e9ecef',
              borderRadius: '0.75rem',
            }}
          >
            <Dropdown.Header
              className="d-flex align-items-center gap-3 px-4 py-3"
              style={{
                backgroundColor: '#f8f9fa',
                borderBottom: '1px solid #e9ecef',
              }}
            >
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  backgroundColor: '#e9ecef',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '24px',
                }}
              >
                👤
              </div>
              <div>
                <div className="fw-bold text-dark" style={{ fontSize: '0.95rem' }}>
                  {user ? `${user.firstName} ${user.lastName}` : 'Guest User'}
                </div>
                <div className="text-muted small">
                  {user ? user.username : 'guest'}@ems-donation.io
                </div>
              </div>
            </Dropdown.Header>

            <Dropdown.Divider className="m-0" />

            <Dropdown.Item
              onClick={handleLogout}
              className="d-flex align-items-center gap-2 px-4 py-3"
              style={{
                color: '#ef4444',
                cursor: 'pointer',
                fontSize: '0.95rem',
              }}
            >
              <span style={{ display: 'flex', alignItems: 'center' }}>
                <LogoutIcon />
              </span>
              Logout
            </Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
      )}
    </header>
  );
}
