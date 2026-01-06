'use client';

import { useEffect, useState } from 'react';

interface ToastProps {
  message: string;
  type: 'success' | 'error';
  onClose: () => void;
  duration?: number;
}

export default function Toast({ message, type, onClose, duration = 3000 }: ToastProps) {
  const [show, setShow] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShow(false);
      setTimeout(onClose, 300);
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const bgColor = type === 'success' ? 'bg-success' : 'bg-danger';
  const borderColor = type === 'success' ? 'border-success' : 'border-danger';

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        gap: '10px'
      }}
    >
      <div
        className={`toast show ${show ? '' : ''}`}
        style={{
          minWidth: '300px',
          opacity: show ? 1 : 0,
          transform: show ? 'translateX(0)' : 'translateX(100%)',
          transition: 'all 0.3s ease-out',
          backgroundColor: type === 'success' ? '#d4edda' : '#f8d7da',
          borderLeft: `4px solid ${type === 'success' ? '#4ade80' : '#f87171'}`,
          color: type === 'success' ? '#155724' : '#721c24',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
          borderRadius: '8px',
          padding: '16px'
        }}
      >
        <span style={{ fontSize: '14px', fontWeight: 500 }}>
          {message}
        </span>
      </div>
    </div>
  );
}