'use client';

import { useState } from 'react';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import styles from './users.module.css';
import Toast from '@/components/Toast';
import CreateUserModal from './CreateUserModal';
import ConfirmDialog from '@/components/ConfirmDialog';

interface User {
    id: string;
    username: string;
    fullName: string;
    role: 'admin' | 'staff';
    status: 'active' | 'inactive';
}

export default function UsersPage() {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' } | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [confirmDialog, setConfirmDialog] = useState<{ userId: string; username: string } | null>(null);

    // Mock Data สำหรับผู้ใช้งาน
    const [users, setUsers] = useState<User[]>([
        { id: '1', username: 'admin@ems.com', fullName: 'Admin User', role: 'admin', status: 'active' },
        { id: '2', username: 'staff1@ems.com', fullName: 'Somchai Staff', role: 'staff', status: 'active' },
        { id: '3', username: 'staff2@ems.com', fullName: 'Somsri Volunteer', role: 'staff', status: 'inactive' },
    ]);

    const handleDelete = (id: string, username: string) => {
        setConfirmDialog({ userId: id, username });
    };

    const confirmDelete = () => {
        if (!confirmDialog) return;
        setUsers(users.filter(u => u.id !== confirmDialog.userId));
        setToast({ message: 'ลบผู้ใช้งานสำเร็จ', type: 'success' });
        setConfirmDialog(null);
    };

    const handleCreateUser = (newUser: any) => {
        setUsers([...users, newUser]);
        setIsModalOpen(false);
        setToast({ message: 'เพิ่มผู้ใช้งานสำเร็จ', type: 'success' });
    };

    return (
        <div className={styles.container}>
            <Sidebar isOpen={sidebarOpen} />
            <div className={styles.mainContent}>
                <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />

                <div className={styles.contentArea}>
                    <div className={styles.pageHeader}>
                        <div>
                            <h1>จัดการผู้ใช้งาน (User Management)</h1>
                            <p style={{ color: 'rgba(255,255,255,0.5)', marginTop: '5px' }}>
                                ดูแลจัดการบัญชีผู้ใช้และกำหนดสิทธิ์การเข้าถึง
                            </p>
                        </div>
                        <button className={styles.addButton} onClick={() => setIsModalOpen(true)}>
                            + เพิ่มผู้ใช้งาน
                        </button>
                    </div>

                    <div className={styles.tableContainer}>
                        <table className={styles.table}>
                            <thead>
                                <tr>
                                    <th>ชื่อ-นามสกุล</th>
                                    <th>อีเมล / Username</th>
                                    <th>สิทธิ์ (Role)</th>
                                    <th>สถานะ</th>
                                    <th>จัดการ</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map((user) => (
                                    <tr key={user.id}>
                                        <td>{user.fullName}</td>
                                        <td>{user.username}</td>
                                        <td>
                                            <span className={styles.roleBadge} style={{
                                                backgroundColor: user.role === 'admin' ? 'rgba(236, 72, 153, 0.2)' : 'rgba(59, 130, 246, 0.2)',
                                                color: user.role === 'admin' ? '#f472b6' : '#60a5fa'
                                            }}>
                                                {user.role.toUpperCase()}
                                            </span>
                                        </td>
                                        <td>
                                            <span style={{ color: user.status === 'active' ? '#4ade80' : '#9ca3af' }}>
                                                ● {user.status === 'active' ? 'ใช้งานปกติ' : 'ระงับการใช้งาน'}
                                            </span>
                                        </td>
                                        <td>
                                            <button
                                                onClick={() => handleDelete(user.id, user.username)}
                                                style={{ color: '#f87171', background: 'none', border: 'none', cursor: 'pointer' }}
                                            >
                                                ลบ
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {isModalOpen && (
                <CreateUserModal
                    onClose={() => setIsModalOpen(false)}
                    onSuccess={handleCreateUser}
                />
            )}

            {confirmDialog && (
                <ConfirmDialog
                    title="ยืนยันการลบผู้ใช้งาน"
                    message={`คุณต้องการลบผู้ใช้งาน "${confirmDialog.username}" ใช่หรือไม่? การดำเนินการนี้ไม่สามารถย้อนคืนได้`}
                    confirmText="ลบผู้ใช้งาน"
                    cancelText="ยกเลิก"
                    onConfirm={confirmDelete}
                    onCancel={() => setConfirmDialog(null)}
                    isDangerous={true}
                />
            )}

            {toast && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast(null)}
                />
            )}
        </div>
    );
}
