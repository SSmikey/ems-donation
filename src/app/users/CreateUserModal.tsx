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
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async () => {
        // Clear previous errors
        setError(null);

        // Validation
        if (!formData.fullName || !formData.username || !formData.password) {
            setError('กรุณากรอกข้อมูลให้ครบถ้วน');
            return;
        }

        if (formData.password.length < 6) {
            setError('รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร');
            return;
        }

        try {
            setLoading(true);
            const response = await fetch('/api/users', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    fullName: formData.fullName,
                    username: formData.username,
                    password: formData.password,
                    role: formData.role
                })
            });

            const data = await response.json();

            if (!response.ok) {
                if (data.details && Array.isArray(data.details)) {
                    setError(data.details.join(', '));
                } else {
                    setError(data.error || 'ไม่สามารถสร้างผู้ใช้งานได้');
                }
                return;
            }

            // Success - call the callback
            onSuccess(data);
        } catch (err) {
            setError('เกิดข้อผิดพลาดในการสร้างผู้ใช้งาน');
            console.error('Create user error:', err);
        } finally {
            setLoading(false);
        }
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

                    {error && (
                        <div className="alert alert-danger mb-4" role="alert" style={{ borderRadius: '10px', border: 'none', backgroundColor: '#fee2e2', color: '#991b1b', padding: '12px 16px', fontSize: '14px' }}>
                            {error}
                        </div>
                    )}

                    <div className="d-flex justify-content-end gap-2 mt-4">
                        <button
                            onClick={onClose}
                            className="btn"
                            disabled={loading}
                            style={{ border: '1px solid #e5e7eb', color: '#6b7280', backgroundColor: '#ffffff', padding: '10px 20px', borderRadius: '8px', fontWeight: '600', opacity: loading ? 0.5 : 1 }}
                        >
                            ยกเลิก
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={loading}
                            className="btn fw-bold text-white"
                            style={{ backgroundColor: '#2563eb', border: 'none', padding: '10px 20px', borderRadius: '8px', opacity: loading ? 0.7 : 1, cursor: loading ? 'not-allowed' : 'pointer' }}
                        >
                            {loading ? 'กำลังบันทึก...' : 'บันทึกข้อมูล'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
