'use client';

import { useState } from 'react';

interface DateRangePickerProps {
  onDaysChange: (days: number) => void;
  selectedDays: number;
}

export default function DateRangePicker({ onDaysChange, selectedDays }: DateRangePickerProps) {
  const presets = [
    { label: '7 วัน', days: 7 },
    { label: '14 วัน', days: 14 },
    { label: '30 วัน', days: 30 },
    { label: '90 วัน', days: 90 },
  ];

  return (
    <div className="d-flex gap-2 align-items-center">
      <span className="text-muted me-2" style={{ fontSize: '14px', fontWeight: 500 }}>
        ช่วงเวลา:
      </span>
      {presets.map((preset) => (
        <button
          key={preset.days}
          onClick={() => onDaysChange(preset.days)}
          className="btn btn-sm rounded-pill border-0"
          style={{
            fontSize: '13px',
            fontWeight: 600,
            backgroundColor: selectedDays === preset.days ? '#6366f1' : '#f3f4f6',
            color: selectedDays === preset.days ? '#ffffff' : '#4b5563',
            padding: '6px 16px',
            transition: 'all 0.2s ease',
          }}
        >
          {preset.label}
        </button>
      ))}
    </div>
  );
}
