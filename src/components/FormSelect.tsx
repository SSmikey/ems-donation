'use client';

import { useState, useRef, useEffect } from 'react';

interface Option {
    value: string;
    label: string;
}

interface FormSelectProps {
    label?: string;
    value: string;
    onChange: (value: string) => void;
    options: Option[];
    placeholder?: string;
    disabled?: boolean;
    className?: string;
    dark?: boolean;
}

export default function FormSelect({
    label,
    value,
    onChange,
    options,
    placeholder = 'เลือก...',
    disabled = false,
    className = '',
    dark = false,
}: FormSelectProps) {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const selectedOption = options.find((opt) => opt.value === value);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSelect = (val: string) => {
        onChange(val);
        setIsOpen(false);
    };

    const [isHovered, setIsHovered] = useState(false);

    const bgColor = dark ? 'rgba(255, 255, 255, 0.05)' : '#f9fafb';
    const borderColor = dark ? 'rgba(0, 212, 255, 0.3)' : '#e5e7eb';
    const textColor = dark ? '#ffffff' : '#111827';
    const labelColor = dark ? 'rgba(255, 255, 255, 0.8)' : '#6b7280';
    const activeBorder = dark ? '#00d4ff' : '#2563eb';
    const dropdownBg = dark ? '#1a1a2e' : '#ffffff';
    const itemHover = dark ? 'rgba(0, 212, 255, 0.1)' : '#f3f4f6';

    const triggerBg = disabled
        ? (dark ? 'rgba(255,255,255,0.02)' : '#f3f4f6')
        : (isOpen ? bgColor : (isHovered ? (dark ? 'rgba(255, 255, 255, 0.08)' : '#f3f4f6') : bgColor));

    return (
        <div className={`form-select-container ${className}`} ref={containerRef} style={{ position: 'relative' }}>
            {label && (
                <label className="filter-label" style={{
                    fontSize: '12px',
                    fontWeight: 600,
                    color: labelColor,
                    marginBottom: '6px',
                    display: 'block',
                    textTransform: 'uppercase',
                    letterSpacing: '0.025em'
                }}>
                    {label}
                </label>
            )}
            <div
                className={`custom-select-trigger ${isOpen ? 'active' : ''} ${disabled ? 'disabled' : ''}`}
                onClick={() => !disabled && setIsOpen(!isOpen)}
                onMouseEnter={() => !disabled && setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0 16px',
                    height: '44px',
                    background: triggerBg,
                    border: isOpen ? `1px solid ${activeBorder}` : `1px solid ${borderColor}`,
                    borderRadius: '10px',
                    cursor: disabled ? 'not-allowed' : 'pointer',
                    transition: 'all 0.2s ease',
                    fontSize: '14px',
                    color: selectedOption ? textColor : (dark ? 'rgba(255,255,255,0.4)' : '#9ca3af'),
                    boxShadow: isOpen ? `0 0 0 4px ${dark ? 'rgba(0, 212, 255, 0.1)' : 'rgba(37, 99, 235, 0.1)'}` : 'none',
                }}
            >
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {selectedOption ? selectedOption.label : placeholder}
                </span>
                <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    style={{
                        transition: 'transform 0.2s ease',
                        transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                        color: dark ? 'rgba(255,255,255,0.5)' : '#6b7280',
                    }}
                >
                    <polyline points="6 9 12 15 18 9" />
                </svg>
            </div>

            {isOpen && (
                <div
                    className="custom-select-options"
                    style={{
                        position: 'absolute',
                        top: 'calc(100% + 4px)',
                        left: 0,
                        right: 0,
                        background: dropdownBg,
                        border: `1px solid ${borderColor}`,
                        borderRadius: '10px',
                        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                        zIndex: 1000,
                        maxHeight: '250px',
                        overflowY: 'auto',
                        padding: '4px',
                    }}
                >
                    {options.length > 0 ? (
                        options.map((option) => (
                            <div
                                key={option.value}
                                className="custom-select-option"
                                onClick={() => handleSelect(option.value)}
                                style={{
                                    padding: '10px 12px',
                                    borderRadius: '6px',
                                    cursor: 'pointer',
                                    fontSize: '14px',
                                    color: value === option.value ? '#ffffff' : (dark ? 'rgba(255,255,255,0.9)' : '#374151'),
                                    background: value === option.value ? activeBorder : 'transparent',
                                    transition: 'all 0.1s ease',
                                }}
                                onMouseEnter={(e) => {
                                    if (value !== option.value) {
                                        e.currentTarget.style.background = itemHover;
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    if (value !== option.value) {
                                        e.currentTarget.style.background = 'transparent';
                                    }
                                }}
                            >
                                {option.label}
                            </div>
                        ))
                    ) : (
                        <div style={{ padding: '10px 12px', fontSize: '14px', color: '#9ca3af', textAlign: 'center' }}>
                            ไม่มีข้อมูล
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
