'use client';

import { useState } from 'react';
import FormSelect from '@/components/FormSelect';

interface CreateUserModalProps {
    onClose: () => void;
    onSuccess: (user: any) => void;
}

export default function CreateUserModal({ onClose, onSuccess }: CreateUserModalProps) {
    const [formData, setFormData] = useState({
        fullName: '',
        username: '',
        password: '',
        role: 'staff',
        status: 'active'
    });

    const handleSubmit = () => {
        if (!formData.fullName || !formData.username || !formData.password) {
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
        <div className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000 }} onClick={onClose}>
            <style>{`
                .user-modal-input {
                    border: 1px solid #e5e7eb !important;
                    background: #ffffff !important;
                    color: #111827 !important;
                    border-radius: 10px !important;
                    height: 44px !important;
                    padding: 0 16px !important;
                    font-size: 14px !important;
                    transition: all 0.25s ease !important;
                }
                .user-modal-input:focus {
                    background: #ffffff !important;
                    border-color: #2563eb !important;
                    box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.1) !important;
                    outline: none !important;
                }
                .user-modal-input::placeholder {
                    color: #94a3b8;
                }
                .form-select-container {
                    margin-bottom: 0;
                }
            `}</style>
            <div className="card shadow-sm border-0" style={{ width: '90%', maxWidth: '500px', backgroundColor: '#ffffff', borderLeft: '4px solid #2563eb' }} onClick={e => e.stopPropagation()}>
                <div className="card-body p-4">
                    <h2 className="card-title mb-4 fw-bold" style={{ fontSize: '1.5rem', color: '#111827' }}>
                        เพิ่มผู้ใช้งานใหม่
                    </h2>

                    <div className="mb-3">
                        <label style={{ color: '#6b7280', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.025em', marginBottom: '6px', display: 'block' }}>ชื่อ-นามสกุล</label>
                        <input
                            type="text"
                            className="form-control user-modal-input"
                            value={formData.fullName}
                            onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                            placeholder="เช่น สมชาย ใจดี"
                        />
                    </div>

                    <div className="mb-3">
                        <label style={{ color: '#6b7280', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.025em', marginBottom: '6px', display: 'block' }}>Username</label>
                        <input
                            type="text"
                            className="form-control user-modal-input"
                            value={formData.username}
                            onChange={e => setFormData({ ...formData, username: e.target.value })}
                            placeholder="เช่น admin123"
                        />
                    </div>

                    <div className="mb-3">
                        <label style={{ color: '#6b7280', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.025em', marginBottom: '6px', display: 'block' }}>Password</label>
                        <input
                            type="password"
                            className="form-control user-modal-input"
                            value={formData.password}
                            onChange={e => setFormData({ ...formData, password: e.target.value })}
                            placeholder="กรอกรหัสผ่าน"
                        />
                    </div>

                    <div className="mb-4">
                        <FormSelect
                            label="สิทธิ์การใช้งาน (Role)"
                            value={formData.role}
                            onChange={(value) => setFormData({ ...formData, role: value })}
                            options={[
                                { value: 'staff', label: 'Staff (เจ้าหน้าที่ทั่วไป)' },
                                { value: 'admin', label: 'Admin (ผู้ดูแลระบบ)' }
                            ]}
                        />
                    </div>

                    <div className="d-flex justify-content-end gap-2 mt-4">
                        <button
                            onClick={onClose}
                            className="btn"
                            style={{ border: '1px solid #e5e7eb', color: '#6b7280', backgroundColor: '#ffffff', padding: '10px 20px', borderRadius: '8px', fontWeight: '600' }}
                        >
                            ยกเลิก
                        </button>
                        <button
                            onClick={handleSubmit}
                            className="btn fw-bold text-white"
                            style={{ backgroundColor: '#2563eb', border: 'none', padding: '10px 20px', borderRadius: '8px' }}
                        >
                            บันทึกข้อมูล
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
