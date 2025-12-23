'use client';

import { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import styles from './distribution.module.css';
import CreateRequestModal from './CreateRequestModal';
import Toast from '@/components/Toast';
import ConfirmDialog from '@/components/ConfirmDialog';

interface Request {
    _id: string;
    shelterName: string;
    items: { itemName: string; quantity: number }[];
    status: 'รอดำเนินการ' | 'อนุมัติแล้ว' | 'กำลังจัดส่ง' | 'ส่งมอบแล้ว';
    urgency: 'สูง' | 'กลาง' | 'ต่ำ';
    createdAt: string;
}

export default function DistributionPage() {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [requests, setRequests] = useState<Request[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState('all');
    const [filterUrgency, setFilterUrgency] = useState('all');
    const [filterDate, setFilterDate] = useState('');
    const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' } | null>(null);
    const [confirmDialog, setConfirmDialog] = useState<{ requestId: string; shelterName: string } | null>(null);

    const fetchRequests = async () => {
        try {
            setLoading(true);
            const res = await fetch('/api/distribution-requests');

            const contentType = res.headers.get("content-type");
            if (contentType && contentType.includes("application/json")) {
                const data = await res.json();
                if (data.success) {
                    setRequests(data.data);
                }
            } else {
                console.warn("API not ready, using mock data");
                setRequests([
                    {
                        _id: 'MOCK-001',
                        shelterName: 'ศูนย์พักพิงเทศบาล (Mock)',
                        items: [{ itemName: 'ข้าวสาร', quantity: 20 }, { itemName: 'น้ำดื่ม', quantity: 50 }],
                        status: 'รอดำเนินการ',
                        urgency: 'สูง',
                        createdAt: new Date().toISOString()
                    }
                ]);
            }
        } catch (error) {
            console.error('Failed to fetch requests', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRequests();
    }, []);

    const handleCreateRequest = async (id: string, shelterName: string) => {
        setConfirmDialog({ requestId: id, shelterName });
    };

    const confirmCreateRequest = async () => {
        if (!confirmDialog) return;

        try {
            const res = await fetch(`/api/distribution-requests/${confirmDialog.requestId}/approve`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ approvedBy: 'Admin (System)' })
            });

            if (res.ok) {
                setToast({ message: 'อนุมัติคำขอสำเร็จ สต็อกสินค้าจะถูกตัดทันที', type: 'success' });
                fetchRequests();
            } else {
                const errorData = await res.json();
                setToast({ message: errorData.error || 'ไม่สามารถอนุมัติคำขอได้ (สินค้าอาจไม่พอ)', type: 'error' });
            }
        } catch (error) {
            console.error('Error approving request:', error);
            setToast({ message: 'เกิดข้อผิดพลาดในการอนุมัติคำขอ', type: 'error' });
        } finally {
            setConfirmDialog(null);
        }
    };

    const getUrgencyClass = (urgency: string) => {
        switch (urgency) {
            case 'สูง': return styles.urgencyHigh;
            case 'กลาง': return styles.urgencyMedium;
            default: return styles.urgencyLow;
        }
    };

    const filteredRequests = requests.filter(req => {
        if (filterStatus !== 'all' && req.status !== filterStatus) return false;
        if (filterUrgency !== 'all' && req.urgency !== filterUrgency) return false;
        if (filterDate) {
            const reqDate = new Date(req.createdAt).toISOString().split('T')[0];
            return reqDate === filterDate;
        }
        return true;
    });

    return (
        <div className={styles.container}>
            <Sidebar isOpen={sidebarOpen} />
            <div className={styles.mainContent}>
                <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />

                <div className={styles.contentArea}>
                    <div className={styles.pageHeader}>
                        <h1>รายการคำขอเบิกสิ่งของ (Distribution Requests)</h1>
                        <button
                            style={{
                                padding: '10px 20px',
                                backgroundColor: '#3b82f6',
                                color: 'white',
                                border: 'none',
                                borderRadius: '8px',
                                fontWeight: 'bold',
                                cursor: 'pointer'
                            }}
                            onClick={() => setIsModalOpen(true)}
                        >
                            + สร้างคำขอใหม่
                        </button>
                    </div>

                    <div className={styles.filterSection}>
                        <div className={styles.filterGroup}>
                            <label>สถานะ</label>
                            <select
                                className={styles.filterSelect}
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value)}
                            >
                                <option value="all">ทั้งหมด</option>
                                <option value="รอดำเนินการ">รอดำเนินการ</option>
                                <option value="อนุมัติแล้ว">อนุมัติแล้ว</option>
                                <option value="กำลังจัดส่ง">กำลังจัดส่ง</option>
                                <option value="ส่งมอบแล้ว">ส่งมอบแล้ว</option>
                            </select>
                        </div>

                        <div className={styles.filterGroup}>
                            <label>ความเร่งด่วน</label>
                            <select
                                className={styles.filterSelect}
                                value={filterUrgency}
                                onChange={(e) => setFilterUrgency(e.target.value)}
                            >
                                <option value="all">ทั้งหมด</option>
                                <option value="สูง">สูง</option>
                                <option value="กลาง">กลาง</option>
                                <option value="ต่ำ">ต่ำ</option>
                            </select>
                        </div>

                        <div className={styles.filterGroup}>
                            <label>วันที่</label>
                            <input
                                type="date"
                                className={styles.filterSelect}
                                value={filterDate}
                                onChange={(e) => setFilterDate(e.target.value)}
                            />
                        </div>
                    </div>

                    {loading ? (
                        <p>กำลังโหลดข้อมูลคำขอเบิกสิ่งของ...</p>
                    ) : (
                        <>
                            <table className={styles.requestsTable}>
                                <thead>
                                    <tr>
                                        <th>เลขที่คำขอ</th>
                                        <th>ศูนย์พักพิง</th>
                                        <th>สินค้าที่ขอ</th>
                                        <th>ความเร่งด่วน</th>
                                        <th>สถานะ</th>
                                        <th>วันที่สร้าง</th>
                                        <th>จัดการ</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredRequests.map((req) => (
                                        <tr key={req._id}>
                                            <td className={styles.requestId}>REQ-{req._id.slice(-4)}</td>
                                            <td>{req.shelterName}</td>
                                            <td>
                                                <div className={styles.itemsList}>
                                                    {req.items.map((item, idx) => (
                                                        <div key={idx}>{item.itemName} x{item.quantity}</div>
                                                    ))}
                                                </div>
                                            </td>
                                            <td>
                                                <span className={`${styles.urgencyBadge} ${getUrgencyClass(req.urgency)}`}>
                                                    {req.urgency}
                                                </span>
                                            </td>
                                            <td>
                                                <span className={styles.statusBadge}>{req.status}</span>
                                            </td>
                                            <td>{new Date(req.createdAt).toLocaleDateString('th-TH')}</td>
                                            <td className={styles.actionsCell}>
                                                {req.status === 'รอดำเนินการ' && (
                                                    <button
                                                        className={styles.createBtn}
                                                        onClick={() => handleCreateRequest(req._id, req.shelterName || 'ศูนย์พักพิง')}
                                                    >
                                                        อนุมัติคำขอ
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            {filteredRequests.length === 0 && (
                                <div style={{ textAlign: 'center', marginTop: '50px', color: 'rgba(255,255,255,0.5)' }}>
                                    <p>ไม่พบรายการคำขอเบิกสิ่งของ</p>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>

            {isModalOpen && (
                <CreateRequestModal
                    onClose={() => setIsModalOpen(false)}
                    onSuccess={() => {
                        setIsModalOpen(false);
                        fetchRequests();
                    }}
                />
            )}

            {toast && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast(null)}
                />
            )}
            {confirmDialog && (
                <ConfirmDialog
                    title="อนุมัติคำขอเบิกสิ่งของ"
                    message={`ยืนยันการอนุมัติคำขอเบิกสิ่งของสำหรับ "${confirmDialog.shelterName}"? สต็อกสินค้าจะถูกตัดทันที`}
                    confirmText="อนุมัติคำขอ"
                    cancelText="ยกเลิก"
                    isDangerous={true}
                    onConfirm={confirmCreateRequest}
                    onCancel={() => setConfirmDialog(null)}
                />
            )}
        </div>
    );
}