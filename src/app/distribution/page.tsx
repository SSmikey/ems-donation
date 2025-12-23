'use client';

import { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import styles from './distribution.module.css';
import CreateRequestModal from './CreateRequestModal';
import Toast from '@/components/Toast';

interface Request {
    _id: string;
    shelterName: string;
    items: { itemName: string; quantity: number }[];
    status: 'รอดำเนินการ' | 'อนุมัติแล้ว' | 'จัดส่งแล้ว';
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
    const [toast, setToast] = useState<{message: string, type: 'success' | 'error'} | null>(null);

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

    const handleApprove = async (id: string) => {
        if (!confirm('ยืนยันการอนุมัติ? สต็อกสินค้าจะถูกตัดทันที')) return;
        
        try {
            const res = await fetch(`/api/distribution-requests/${id}/approve`, {
                method: 'PUT'
            });
            
            if (res.ok) {
                setToast({ message: 'อนุมัติคำขอสำเร็จ', type: 'success' });
                fetchRequests();
            } else if (res.status === 404) {
                setToast({ message: 'อนุมัติสำเร็จ (จำลอง - API ยังไม่พร้อม)', type: 'success' });
                fetchRequests();
            } else {
                setToast({ message: 'ไม่สามารถอนุมัติได้ (สินค้าอาจไม่พอ)', type: 'error' });
            }
        } catch (error) {
            console.error('Error approving:', error);
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
        return true;
    });

    return (
        <div className={styles.container}>
            <Sidebar isOpen={sidebarOpen} />
            <div className={styles.mainContent}>
                <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />

                <div className={styles.contentArea}>
                    <div className={styles.pageHeader}>
                        <div>
                            <h1>รายการคำขอเบิกสิ่งของ (Distribution Requests)</h1>
                            <p style={{ color: 'rgba(255,255,255,0.5)', marginTop: '5px' }}>
                                จัดการคำร้องขอทรัพยากรจากศูนย์พักพิงต่างๆ และติดตามสถานะการจัดส่ง
                            </p>
                            
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '15px', marginTop: '15px' }}>
                                <div style={{ display: 'flex', gap: '10px' }}>
                                    <select 
                                        value={filterStatus} 
                                        onChange={(e) => setFilterStatus(e.target.value)}
                                        style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.2)', color: 'white', cursor: 'pointer' }}
                                    >
                                        <option value="all">สถานะทั้งหมด</option>
                                        <option value="รอดำเนินการ">รอดำเนินการ</option>
                                        <option value="อนุมัติแล้ว">อนุมัติแล้ว</option>
                                        <option value="จัดส่งแล้ว">จัดส่งแล้ว</option>
                                    </select>

                                    <select 
                                        value={filterUrgency} 
                                        onChange={(e) => setFilterUrgency(e.target.value)}
                                        style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.2)', color: 'white', cursor: 'pointer' }}
                                    >
                                        <option value="all">ความเร่งด่วนทั้งหมด</option>
                                        <option value="สูง">สูง</option>
                                        <option value="กลาง">กลาง</option>
                                        <option value="ต่ำ">ต่ำ</option>
                                    </select>
                                </div>

                                <button 
                                    onClick={() => setIsModalOpen(true)}
                                    style={{ padding: '10px 20px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}
                                >
                                    + สร้างคำขอใหม่
                                </button>
                            </div>
                        </div>
                    </div>

                    {loading ? (
                        <div style={{ color: 'white', textAlign: 'center', padding: '20px' }}>กำลังโหลดข้อมูล...</div>
                    ) : (
                    <div className={styles.requestGrid}>
                        {filteredRequests.map((req) => (
                            <div key={req._id} className={styles.requestCard}>
                                <div className={styles.cardTop}>
                                    <div>
                                        <span className={styles.statusBadge}>REQ-{req._id.slice(-4)}</span>
                                        <h3 className={styles.shelterName}>{req.shelterName}</h3>
                                    </div>
                                    <span className={`${styles.urgencyBadge} ${getUrgencyClass(req.urgency)}`}>
                                        เร่งด่วน{req.urgency}
                                    </span>
                                </div>

                                <div className={styles.itemList}>
                                    {req.items.map((item, idx) => (
                                        <div key={idx} className={styles.itemEntry}>
                                            <span>{item.itemName}</span>
                                            <span style={{ fontWeight: '600' }}>{item.quantity} รายการ</span>
                                        </div>
                                    ))}
                                </div>

                                <div className={styles.footer}>
                                    <span className={styles.statusText}>
                                        สถานะ: {req.status} (เมื่อ {new Date(req.createdAt).toLocaleDateString('th-TH')})
                                    </span>
                                    {req.status === 'รอดำเนินการ' && (
                                        <button 
                                            className={styles.actionBtn}
                                            onClick={() => handleApprove(req._id)}
                                        >
                                            อนุมัติและจัดส่ง
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
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
        </div>
    );
}