'use client';

import { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
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
        setToast({ message: 'เพิ่มผู้ใช้งานสำเร็จ', type: 'success' });
        fetchUsers();
    };

    return (
        <div className="d-flex" style={{ minHeight: '100vh', background: '#ffffff', color: '#111827' }}>
            <Sidebar isOpen={sidebarOpen} />
            <div className="flex-grow-1 d-flex flex-column" style={{ overflow: 'hidden' }}>
                {!isModalOpen && <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />}

                <div className="flex-grow-1 overflow-y-auto p-4" style={{ backgroundColor: '#f8f9fa' }}>
                    <div className="d-flex justify-content-between align-items-start mb-4">
                        <div>
                            <h1 className="fw-bold" style={{ fontSize: '32px', margin: 0, marginBottom: '5px', color: '#111827' }}>
                                จัดการผู้ใช้งาน (User Management)
                            </h1>
                            <p style={{ color: '#868e96', margin: 0 }}>
                                ดูแลจัดการบัญชีผู้ใช้และกำหนดสิทธิ์การเข้าถึง
                            </p>
                        </div>
                        <button className="btn btn-primary fw-bold" onClick={() => setIsModalOpen(true)}>
                            + เพิ่มผู้ใช้งาน
                        </button>
                    </div>

                    <div>
                        {loading ? (
                            <p className="text-center" style={{ paddingTop: '20px', color: '#868e96' }}>กำลังโหลดข้อมูล...</p>
                        ) : users.length === 0 ? (
                            <div className="card shadow-sm border-0 text-center py-5">
                                <div className="card-body">
                                    <h5 className="fw-bold" style={{ color: '#6c757d', fontSize: '18px' }}>ไม่มีผู้ใช้งานในระบบ</h5>
                                    <p style={{ color: '#adb5bd', fontSize: '15px', marginTop: '8px' }}>คลิกปุ่ม "เพิ่มผู้ใช้งาน" เพื่อสร้างผู้ใช้งานใหม่</p>
                                </div>
                            </div>
                        ) : (
                            <div className="table-responsive">
                                <table className="table table-hover align-middle" style={{ backgroundColor: '#ffffff', borderColor: '#dee2e6' }}>
                                    <thead style={{ borderColor: '#dee2e6', backgroundColor: '#f8f9fa' }}>
                                        <tr>
                                            <th style={{ color: '#495057' }}>ชื่อ-นามสกุล</th>
                                            <th style={{ color: '#495057' }}>Username</th>
                                            <th style={{ color: '#495057' }}>สิทธิ์ (Role)</th>
                                            <th style={{ color: '#495057' }}>สถานะ</th>
                                            <th style={{ color: '#495057' }}>จัดการ</th>
                                        </tr>
                                    </thead>
                                    <tbody style={{ borderColor: '#dee2e6' }}>
                                        {users.map((user) => (
                                            <tr key={user._id} style={{ borderColor: '#dee2e6' }}>
                                                <td style={{ color: '#212529' }}>{user.firstName} {user.lastName}</td>
                                                <td style={{ color: '#495057' }}>{user.username}</td>
                                                <td>
                                                    <span className={user.role === 'admin' ? 'badge bg-danger' : 'badge bg-info'}>
                                                        {user.role.toUpperCase()}
                                                    </span>
                                                </td>
                                                <td>
                                                    <span style={{ color: (user.status || 'active') === 'active' ? '#10b981' : '#9ca3af' }}>
                                                        ● {(user.status || 'active') === 'active' ? 'ใช้งานปกติ' : 'ระงับการใช้งาน'}
                                                    </span>
                                                </td>
                                                <td>
                                                    <button
                                                        className="btn btn-sm btn-danger"
                                                        onClick={() => handleDelete(user._id, user.username)}
                                                    >
                                                        ลบ
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
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
