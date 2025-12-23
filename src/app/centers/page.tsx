'use client';

import { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import styles from './centers.module.css';
import { Shelter } from '@/lib/models/shelter';
import ShelterModal from './ShelterModal';
import Toast from '@/components/Toast';

export default function CentersPage() {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [shelters, setShelters] = useState<Shelter[]>([]);
    const [filteredShelters, setFilteredShelters] = useState<Shelter[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' } | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingShelter, setEditingShelter] = useState<Shelter | null>(null);

    const [errorInfo, setErrorInfo] = useState<any>(null);

    const fetchShelters = async () => {
        try {
            setLoading(true);
            const res = await fetch('/api/shelters');
            const result = await res.json();

            if (result.data && Array.isArray(result.data)) {
                setShelters(result.data);
                setFilteredShelters(result.data);
            } else if (Array.isArray(result)) {
                setShelters(result);
                setFilteredShelters(result);
            } else if (result.error) {
                setErrorInfo(result);
            }
        } catch (error) {
            console.error('Error fetching shelters:', error);
            setErrorInfo({ error: 'Failed to connect to API', details: String(error) });
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchShelters();
    }, []);

    useEffect(() => {
        const results = shelters.filter(s => {
            const matchSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                s.district?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                s.subdistrict?.toLowerCase().includes(searchTerm.toLowerCase());
            const matchStatus = filterStatus === 'all' || s.capacityStatus === filterStatus;
            return matchSearch && matchStatus;
        });
        setFilteredShelters(results);
    }, [searchTerm, filterStatus, shelters]);

    const handleDelete = async (id: string, name: string) => {
        if (!confirm(`ยืนยันการลบศูนย์พักพิง: ${name}?`)) return;

        try {
            const res = await fetch(`/api/shelters`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ _id: id })
            });

            if (res.ok) {
                setToast({ message: 'ลบศูนย์พักพิงสำเร็จ', type: 'success' });
                fetchShelters();
            } else {
                const data = await res.json();
                setToast({ message: data.error || 'ลบไม่สำเร็จ', type: 'error' });
            }
        } catch (error) {
            setToast({ message: 'เกิดข้อผิดพลาดในการลบ', type: 'error' });
        }
    };

    const getStatusClass = (status: string) => {
        switch (status) {
            case 'รองรับได้': return styles.statusNormal;
            case 'ใกล้เต็ม': return styles.statusWarn;
            case 'เต็มแล้ว': return styles.statusCritical;
            default: return styles.statusNormal;
        }
    };

    return (
        <div className={styles.container}>
            <Sidebar isOpen={sidebarOpen} />
            <div className={styles.mainContent}>
                <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />

                <div className={styles.contentArea}>
                    <div className={styles.pageHeader}>
                        <h1>จัดการศูนย์พักพิง ({shelters.length} แห่ง)</h1>
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
                            onClick={() => {
                                setEditingShelter(null);
                                setIsModalOpen(true);
                            }}
                        >
                            + เพิ่มศูนย์พักพิงใหม่
                        </button>
                    </div>

                    <div className={styles.searchSection}>
                        <input
                            type="text"
                            placeholder="ค้นหาชื่อศูนย์, อำเภอ, ตำบล..."
                            className={styles.searchInput}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <select
                            className={styles.filterSelect}
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                        >
                            <option value="all">ทุกสถานะ</option>
                            <option value="รองรับได้">รองรับได้</option>
                            <option value="ใกล้เต็ม">ใกล้เต็ม</option>
                            <option value="เต็มแล้ว">เต็มแล้ว</option>
                        </select>
                    </div>

                    {loading ? (
                        <p>กำลังโหลดข้อมูลศูนย์พักพิง...</p>
                    ) : (
                        <div className={styles.centersGrid}>
                            {filteredShelters.map((s) => (
                                <div key={s._id} className={styles.centerCard}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                        <span className={`${styles.statusBadge} ${getStatusClass(s.capacityStatus)}`}>
                                            {s.capacityStatus || 'ปกติ'}
                                        </span>
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            <button
                                                style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem' }}
                                                title="แก้ไข"
                                                onClick={() => {
                                                    setEditingShelter(s);
                                                    setIsModalOpen(true);
                                                }}
                                            >
                                                ✏️
                                            </button>
                                            <button
                                                style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem' }}
                                                title="ลบ"
                                                onClick={() => s._id && handleDelete(s._id, s.name)}
                                            >
                                                🗑️
                                            </button>
                                        </div>
                                    </div>
                                    <h3 className={styles.centerName}>{s.name}</h3>
                                    <p className={styles.centerLocation}>📍 ต.{s.subdistrict} อ.{s.district}</p>

                                    <div className={styles.infoRow}>
                                        <span className={styles.label}>ประเภท:</span>
                                        <span>{s.shelterType}</span>
                                    </div>
                                    <div className={styles.infoRow}>
                                        <span className={styles.label}>เบอร์โทร:</span>
                                        <span>{s.phoneNumbers?.[0] || '-'}</span>
                                    </div>
                                    <div className={styles.infoRow}>
                                        <span className={styles.label}>ผู้ดูแล:</span>
                                        <span>{s.responsible?.[0]?.firstName || '-'}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {!loading && filteredShelters.length === 0 && (
                        <div style={{ textAlign: 'center', marginTop: '50px', color: 'rgba(255,255,255,0.5)' }}>
                            <p>ไม่พบข้อมูลศูนย์ที่ตรงกับการค้นหา</p>
                            {errorInfo && (
                                <div style={{ marginTop: '20px', padding: '20px', background: 'rgba(255,0,0,0.1)', borderRadius: '10px', textAlign: 'left', color: '#f87171' }}>
                                    <h4 style={{ color: '#fff' }}>Debug Information:</h4>
                                    <p><strong>DB Name:</strong> {errorInfo.dbName || '-'}</p>
                                    <p><strong>Collections Found:</strong> {errorInfo.availableCollections?.join(', ') || 'none'}</p>
                                    <p><strong>Error:</strong> {errorInfo.error}</p>
                                    <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)', marginTop: '10px' }}>
                                        * โปรดตรวจสอบว่า MONGODB_URI ใน .env.local ระบุฐานข้อมูลที่ถูกต้อง
                                        และข้อมูลศูนย์พักพิงอยู่ในคอลเลกชันที่ระบบหาพบ
                                    </p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
            {isModalOpen && (
                <ShelterModal
                    shelter={editingShelter}
                    onClose={() => setIsModalOpen(false)}
                    onSuccess={() => {
                        setIsModalOpen(false);
                        setToast({ message: editingShelter ? 'แก้ไขข้อมูลสำเร็จ' : 'เพิ่มศูนย์พักพิงสำเร็จ', type: 'success' });
                        fetchShelters();
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
