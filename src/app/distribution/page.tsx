'use client';

import { useState } from 'react';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import styles from './distribution.module.css';

interface Request {
    id: string;
    shelterName: string;
    items: { name: string; quantity: number }[];
    status: 'รอดำเนินการ' | 'อนุมัติแล้ว' | 'จัดส่งแล้ว';
    urgency: 'สูง' | 'กลาง' | 'ต่ำ';
    requestDate: string;
}

const MOCK_REQUESTS: Request[] = [
    {
        id: 'R001',
        shelterName: 'ศูนย์พักพิงเทศบาลสวนหลวง',
        items: [{ name: 'ข้าวสาร', quantity: 20 }, { name: 'น้ำดื่ม', quantity: 50 }],
        status: 'รอดำเนินการ',
        urgency: 'สูง',
        requestDate: '2025-12-22 10:30',
    },
    {
        id: 'R002',
        shelterName: 'ศูนย์วัดหนองป่าพง',
        items: [{ name: 'ยาแก้ปวด', quantity: 10 }, { name: 'ผ้าห่ม', quantity: 20 }],
        status: 'รอดำเนินการ',
        urgency: 'กลาง',
        requestDate: '2025-12-22 11:15',
    },
    {
        id: 'R003',
        shelterName: 'โรงเรียนสาธิตมหาวิทยาลัย',
        items: [{ name: 'นมผงเด็ก', quantity: 15 }],
        status: 'อนุมัติแล้ว',
        urgency: 'สูง',
        requestDate: '2025-12-22 09:00',
    },
    {
        id: 'R004',
        shelterName: 'ศูนย์พักพิง อบต.บางม่วง',
        items: [{ name: 'บะหมี่กึ่งสำเร็จรูป', quantity: 100 }],
        status: 'จัดส่งแล้ว',
        urgency: 'ต่ำ',
        requestDate: '2025-12-21 15:45',
    },
];

export default function DistributionPage() {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [requests, setRequests] = useState<Request[]>(MOCK_REQUESTS);

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
                    </div>

                    <div className={styles.requestGrid}>
                        {requests.map((req) => (
                            <div key={req.id} className={styles.requestCard}>
                                <div className={styles.cardTop}>
                                    <div>
                                        <span className={styles.statusBadge}>{req.id}</span>
                                        <h3 className={styles.shelterName}>{req.shelterName}</h3>
                                    </div>
                                    <span className={`${styles.urgencyBadge} ${getUrgencyClass(req.urgency)}`}>
                                        เร่งด่วน{req.urgency}
                                    </span>
                                </div>

                                <div className={styles.itemList}>
                                    {req.items.map((item, idx) => (
                                        <div key={idx} className={styles.itemEntry}>
                                            <span>{item.name}</span>
                                            <span style={{ fontWeight: '600' }}>{item.quantity} รายการ</span>
                                        </div>
                                    ))}
                                </div>

                                <div className={styles.footer}>
                                    <span className={styles.statusText}>
                                        สถานะ: {req.status} (เมื่อ {req.requestDate})
                                    </span>
                                    {req.status === 'รอดำเนินการ' && (
                                        <button className={styles.actionBtn}>อนุมัติและจัดส่ง</button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
