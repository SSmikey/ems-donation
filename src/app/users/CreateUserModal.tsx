'use client';

import { useState } from 'react';

interface CreateUserModalProps {
    onClose: () => void;
    onSuccess: (user: any) => void;
}

export default function CreateUserModal({ onClose, onSuccess }: CreateUserModalProps) {
    const [formData, setFormData] = useState({
        fullName: '',
        username: '',
        role: 'staff',
        status: 'active'
    });

    const handleSubmit = () => {
        if (!formData.fullName || !formData.username) {
            alert('กรุณากรอกข้อมูลให้ครบถ้วน');
            return;
        }

        // Mock ID generation & User Object
        const newUser = {
            id: Math.random().toString(36).substr(2, 9),
            ...formData
        };

        onSuccess(newUser);
    };

    return (
        <div className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center" style={{ backgroundColor: 'rgba(0,0,0,0.7)', zIndex: 1000 }} onClick={onClose}>
            <style>{`
                .user-modal-input,
                .user-modal-select {
                    border: 1px solid rgba(255, 255, 255, 0.1) !important;
                    background: rgba(255, 255, 255, 0.05) !important;
                    color: #ffffff !important;
                }
                .user-modal-input:focus,
                .user-modal-select:focus {
                    background: rgba(255, 255, 255, 0.1) !important;
                    border-color: #3b82f6 !important;
                    box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2) !important;
                }
                .user-modal-input::placeholder {
                    color: rgba(255, 255, 255, 0.3);
                }
                .user-modal-select option {
                    background-color: #1e293b;
                    color: #ffffff;
                }
            `}</style>
            <div className="card shadow-lg border-0" style={{ width: '90%', maxWidth: '500px', backgroundColor: 'rgba(30, 41, 59, 0.95)', borderTop: '1px solid rgba(255, 255, 255, 0.1)' }} onClick={e => e.stopPropagation()}>
                <div className="card-body p-4">
                    <h2 className="card-title mb-4 fw-bold border-bottom pb-3" style={{ fontSize: '1.5rem', borderBottomColor: 'rgba(255, 255, 255, 0.1)' }}>
                        เพิ่มผู้ใช้งานใหม่
                    </h2>

                    <div className="mb-3">
                        <label className="form-label fw-500 mb-2" style={{ color: 'rgba(255, 255, 255, 0.8)' }}>ชื่อ-นามสกุล:</label>
                        <input
                            type="text"
                            className="form-control user-modal-input"
                            value={formData.fullName}
                            onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                            placeholder="เช่น สมชาย ใจดี"
                        />
                    </div>

                    <div className="mb-3">
                        <label className="form-label fw-500 mb-2" style={{ color: 'rgba(255, 255, 255, 0.8)' }}>Username:</label>
                        <input
                            type="text"
                            className="form-control user-modal-input"
                            value={formData.username}
                            onChange={e => setFormData({ ...formData, username: e.target.value })}
                            placeholder="เช่น admin123"
                        />
                    </div>

                    <div className="mb-4">
                        <label className="form-label fw-500 mb-2" style={{ color: 'rgba(255, 255, 255, 0.8)' }}>สิทธิ์การใช้งาน (Role):</label>
                        <select
                            className="form-select user-modal-select"
                            value={formData.role}
                            onChange={e => setFormData({ ...formData, role: e.target.value })}
                        >
                            <option value="staff">Staff (เจ้าหน้าที่ทั่วไป)</option>
                            <option value="admin">Admin (ผู้ดูแลระบบ)</option>
                        </select>
                    </div>

                    <div className="d-flex justify-content-end gap-2 mt-4">
                        <button
                            onClick={onClose}
                            className="btn btn-outline-light"
                        >
                            ยกเลิก
                        </button>
                        <button
                            onClick={handleSubmit}
                            className="btn fw-600 text-white"
                            style={{ backgroundColor: '#3b82f6', border: 'none' }}
                        >
                            บันทึกข้อมูล
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
