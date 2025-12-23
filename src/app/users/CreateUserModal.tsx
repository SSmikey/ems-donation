'use client';

import { useState, CSSProperties } from 'react';

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

    // Styles
    const modalOverlayStyle: CSSProperties = {
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
    };
    
    const modalContentStyle: CSSProperties = {
        backgroundColor: 'white', padding: '25px', borderRadius: '12px', width: '90%', maxWidth: '500px', color: '#333',
        boxShadow: '0 10px 25px rgba(0,0,0,0.2)'
    };

    const inputGroupStyle: CSSProperties = { marginBottom: '15px' };
    const labelStyle: CSSProperties = { display: 'block', marginBottom: '5px', fontWeight: 500 };
    const inputStyle: CSSProperties = {
        width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '14px'
    };

    return (
        <div style={modalOverlayStyle}>
            <div style={modalContentStyle}>
                <h2 style={{ fontSize: '1.5rem', marginBottom: '20px', fontWeight: 'bold', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>
                    เพิ่มผู้ใช้งานใหม่
                </h2>
                
                <div style={inputGroupStyle}>
                    <label style={labelStyle}>ชื่อ-นามสกุล:</label>
                    <input 
                        type="text" 
                        style={inputStyle}
                        value={formData.fullName}
                        onChange={e => setFormData({...formData, fullName: e.target.value})}
                        placeholder="เช่น สมชาย ใจดี"
                    />
                </div>

                <div style={inputGroupStyle}>
                    <label style={labelStyle}>อีเมล / Username:</label>
                    <input 
                        type="text" 
                        style={inputStyle}
                        value={formData.username}
                        onChange={e => setFormData({...formData, username: e.target.value})}
                        placeholder="user@ems.com"
                    />
                </div>

                <div style={inputGroupStyle}>
                    <label style={labelStyle}>สิทธิ์การใช้งาน (Role):</label>
                    <select 
                        style={inputStyle}
                        value={formData.role}
                        onChange={e => setFormData({...formData, role: e.target.value})}
                    >
                        <option value="staff">Staff (เจ้าหน้าที่ทั่วไป)</option>
                        <option value="admin">Admin (ผู้ดูแลระบบ)</option>
                    </select>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '25px' }}>
                    <button 
                        onClick={onClose}
                        style={{ padding: '10px 20px', border: '1px solid #ccc', borderRadius: '6px', background: 'white', cursor: 'pointer' }}
                    >
                        ยกเลิก
                    </button>
                    <button 
                        onClick={handleSubmit}
                        style={{ padding: '10px 20px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
                    >
                        บันทึกข้อมูล
                    </button>
                </div>
            </div>
        </div>
    );
}