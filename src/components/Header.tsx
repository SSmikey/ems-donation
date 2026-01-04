'use client';

import { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import styles from './Header.module.css';

interface HeaderProps {
  onMenuClick: () => void;
}

export default function Header({ onMenuClick }: HeaderProps) {
  return (
    <header className={`d-flex justify-content-between align-items-center px-5 py-3 border-bottom sticky-top ${styles.header}`}>
      <div className="d-flex align-items-center gap-3">
        <button className={`btn btn-sm d-md-none ${styles.menuButton}`} onClick={onMenuClick}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>
      </div>

      <div className="d-flex align-items-center gap-3">
        {/* Empty - Profile moved to Sidebar */}
      </div>
    </header>
  );
}
