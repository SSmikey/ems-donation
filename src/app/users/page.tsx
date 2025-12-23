'use client';

import { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import styles from './users.module.css';
import Toast from '@/components/Toast';
import CreateUserModal from './CreateUserModal';
import ConfirmDialog from '@/components/ConfirmDialog';

interface User {
    _id: string;
    username: string;
    firstName: string;
    lastName: string;
    role: 'admin' | 'staff';
    status?: 'active' | 'inactive';
}

export default function UsersPage() {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' } | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [confirmDialog, setConfirmDialog] = useState<{ userId: string; username: string } | null>(null);
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/users');
            if (response.ok) {
                const data = await response.json();
                setUsers(data);
            }
        } catch (error) {
            console.error('Error fetching users:', error);
            setToast({ message: 'โหลดข้อมูลล้มเหลว', type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleDelete = (id: string, username: string) => {
        setConfirmDialog({ userId: id, username });
    };

    const confirmDelete = async () => {
        if (!confirmDialog) return;
        try {
            const response = await fetch(`/api/users?id=${confirmDialog.userId}`, {
                method: 'DELETE',
            });
            if (response.ok) {
                setToast({ message: 'ลบผู้ใช้งานสำเร็จ', type: 'success' });
                fetchUsers();
            } else {
                setToast({ message: 'ลบผู้ใช้งานล้มเหลว', type: 'error' });
            }
        } catch (error) {
            setToast({ message: 'เกิดข้อผิดพลาดในการลบ', type: 'error' });
        } finally {
            setConfirmDialog(null);
        }
    };

    const handleCreateUser = (newUser: any) => {
        setIsModalOpen(false);
        setToast({ message: 'เพิ่มผู้ใช้งานสำเร็จ (Mock)', type: 'success' });
        fetchUsers();
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
                        {loading ? (
                            <p style={{ padding: '20px', textAlign: 'center' }}>กำลังโหลดข้อมูล...</p>
                        ) : (
                            <table className={styles.table}>
                                <thead>
                                    <tr>
                                        <th>ชื่อ-นามสกุล</th>
                                        <th>Username</th>
                                        <th>สิทธิ์ (Role)</th>
                                        <th>สถานะ</th>
                                        <th>จัดการ</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.map((user) => (
                                        <tr key={user._id}>
                                            <td>{user.firstName} {user.lastName}</td>
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
                                                <span style={{ color: (user.status || 'active') === 'active' ? '#4ade80' : '#9ca3af' }}>
                                                    ● {(user.status || 'active') === 'active' ? 'ใช้งานปกติ' : 'ระงับการใช้งาน'}
                                                </span>
                                            </td>
                                            <td>
                                                <button
                                                    onClick={() => handleDelete(user._id, user.username)}
                                                    style={{ color: '#f87171', background: 'none', border: 'none', cursor: 'pointer' }}
                                                >
                                                    ลบ
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
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
