'use client';

import { useState } from 'react';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import styles from './users.module.css';

interface User {
    id: string;
    username: string;
    fullName: string;
    role: 'admin' | 'staff';
    status: 'active' | 'inactive';
}

export default function UsersPage() {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    
    // Mock Data สำหรับผู้ใช้งาน
    const [users, setUsers] = useState<User[]>([
        { id: '1', username: 'admin@ems.com', fullName: 'Admin User', role: 'admin', status: 'active' },
        { id: '2', username: 'staff1@ems.com', fullName: 'Somchai Staff', role: 'staff', status: 'active' },
        { id: '3', username: 'staff2@ems.com', fullName: 'Somsri Volunteer', role: 'staff', status: 'inactive' },
    ]);

    const handleDelete = (id: string) => {
        if (confirm('คุณต้องการลบผู้ใช้งานนี้ใช่หรือไม่?')) {
            setUsers(users.filter(u => u.id !== id));
        }
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
                        <button className={styles.addButton} onClick={() => alert('ฟีเจอร์เพิ่มผู้ใช้จะมาในเร็วๆ นี้')}>
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
                                                onClick={() => handleDelete(user.id)}
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
        </div>
    );
}