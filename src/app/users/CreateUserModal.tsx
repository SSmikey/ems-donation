'use client';

import { useState } from 'react';
import styles from './users.module.css';

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
        <div className={styles.modalOverlay} onClick={onClose}>
            <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
                <h2 className={styles.modalHeader}>
                    เพิ่มผู้ใช้งานใหม่
                </h2>

                <div className={styles.inputGroup}>
                    <label className={styles.label}>ชื่อ-นามสกุล:</label>
                    <input
                        type="text"
                        className={styles.input}
                        value={formData.fullName}
                        onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                        placeholder="เช่น สมชาย ใจดี"
                    />
                </div>

                <div className={styles.inputGroup}>
                    <label className={styles.label}>Username:</label>
                    <input
                        type="text"
                        className={styles.input}
                        value={formData.username}
                        onChange={e => setFormData({ ...formData, username: e.target.value })}
                        placeholder="เช่น admin123"
                    />
                </div>

                <div className={styles.inputGroup}>
                    <label className={styles.label}>สิทธิ์การใช้งาน (Role):</label>
                    <select
                        className={styles.select}
                        value={formData.role}
                        onChange={e => setFormData({ ...formData, role: e.target.value })}
                    >
                        <option value="staff">Staff (เจ้าหน้าที่ทั่วไป)</option>
                        <option value="admin">Admin (ผู้ดูแลระบบ)</option>
                    </select>
                </div>

                <div className={styles.modalFooter}>
                    <button
                        onClick={onClose}
                        className={styles.cancelBtn}
                    >
                        ยกเลิก
                    </button>
                    <button
                        onClick={handleSubmit}
                        className={styles.saveBtn}
                    >
                        บันทึกข้อมูล
                    </button>
                </div>
            </div>
        </div>
    );
}
