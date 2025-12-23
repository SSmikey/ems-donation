'use client';

import { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import styles from './distribution.module.css';
import CreateRequestModal from './CreateRequestModal';

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
                alert('อนุมัติสำเร็จ');
                fetchRequests();
            } else {
                alert('ไม่สามารถอนุมัติได้ (สินค้าอาจไม่พอ หรือเกิดข้อผิดพลาด)');
            }
        } catch (error) {
            console.error('Error approving:', error);
        }
    };

    const getUrgencyClass = (urgency: string) => {
        switch (urgency) {
            case 'สูง': return styles.urgencyHigh;
            case 'กลาง': return styles.urgencyMedium;
            case 'ต่ำ': return styles.urgencyLow;
            default: return '';
        }
    };

    return (
        <div className={styles.container}>
            <Sidebar isOpen={sidebarOpen} />
            <div className={styles.mainContent}>
                <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />

                <div className={styles.contentArea}>
                    <div className={styles.pageHeader}>
                        <h1>การร้องขอและกระจายของ (Distribution & Requests)</h1>
                        <p style={{ color: 'rgba(255,255,255,0.5)', marginTop: '5px' }}>
                            จัดการคำร้องขอทรัพยากรจากศูนย์พักพิงต่างๆ และติดตามสถานะการจัดส่ง
                        </p>
                        <button 
                            onClick={() => setIsModalOpen(true)}
                            style={{ marginTop: '15px', padding: '10px 20px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}
                        >
                            + สร้างคำขอใหม่
                        </button>
                    </div>

                    {loading ? (
                        <div style={{ color: 'white', textAlign: 'center', padding: '20px' }}>กำลังโหลดข้อมูล...</div>
                    ) : (
                    <div className={styles.requestGrid}>
                        {requests.map((req) => (
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
        </div>
    );
}
