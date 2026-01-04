'use client';

import { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import styles from './create-request.module.css';
import CreateRequestModal from '@/app/distribution/CreateRequestModal';
import Toast from '@/components/Toast';
import 'bootstrap/dist/css/bootstrap.min.css';

interface Shelter {
    _id: string;
    name: string;
    district?: string;
    subdistrict?: string;
    shelterType?: string;
}

export default function CreateRequestPage() {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [shelters, setShelters] = useState<Shelter[]>([]);
    const [filteredShelters, setFilteredShelters] = useState<Shelter[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterName, setFilterName] = useState('');
    const [filterDistrict, setFilterDistrict] = useState('');
    const [filterSubdistrict, setFilterSubdistrict] = useState('');
    const [filterType, setFilterType] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' } | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedShelter, setSelectedShelter] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

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
            }
        } catch (error) {
            console.error('Error fetching shelters:', error);
            setToast({ message: 'ไม่สามารถโหลดข้อมูลศูนย์พักพิงได้', type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchShelters();
    }, []);

    useEffect(() => {
        const results = shelters.filter(s => {
            const matchName = !filterName || s.name.toLowerCase().includes(filterName.toLowerCase());
            const matchDistrict = !filterDistrict || s.district?.toLowerCase().includes(filterDistrict.toLowerCase());
            const matchSubdistrict = !filterSubdistrict || s.subdistrict?.toLowerCase().includes(filterSubdistrict.toLowerCase());
            const matchType = !filterType || s.shelterType === filterType;
            // Note: capacityStatus might be nested or direct, centers/page.tsx uses s.capacityStatus
            const matchStatus = filterStatus === 'all' || (s as any).capacityStatus === filterStatus;
            return matchName && matchDistrict && matchSubdistrict && matchType && matchStatus;
        });
        setFilteredShelters(results);
    }, [filterName, filterDistrict, filterSubdistrict, filterType, filterStatus, shelters]);

    // Reset to page 1 when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [filterName, filterDistrict, filterSubdistrict, filterType, filterStatus]);

    const uniqueDistricts = Array.from(new Set(shelters.map(s => s.district).filter(Boolean))).sort();
    const uniqueSubdistricts = Array.from(new Set(
        shelters
            .filter(s => !filterDistrict || s.district === filterDistrict)
            .map(s => s.subdistrict)
            .filter(Boolean)
    )).sort() as string[];
    const uniqueTypes = Array.from(new Set(shelters.map(s => s.shelterType).filter(Boolean))).sort();

    // Pagination logic
    const totalPages = Math.ceil(filteredShelters.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedShelters = filteredShelters.slice(startIndex, startIndex + itemsPerPage);

    const getStatusClass = (status: string) => {
        switch (status) {
            case 'รองรับได้': return styles.statusNormal;
            case 'ใกล้เต็ม': return styles.statusWarn;
            case 'เต็มแล้ว': return styles.statusCritical;
            default: return styles.statusNormal;
        }
    };

    const handleCreateRequest = (shelterId: string) => {
        setSelectedShelter(shelterId);
        setIsModalOpen(true);
    };

    return (
        <div className={`d-flex min-vh-100 ${styles.container}`}>
            <Sidebar isOpen={sidebarOpen} />
            <div className={`flex-grow-1 d-flex flex-column ${styles.mainContent}`}>
                <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />

                <div className={`flex-grow-1 overflow-auto p-4 p-md-5 ${styles.contentArea}`}>
                    <div className="mb-5">
                        <h1 className="fw-bold text-white" style={{ fontSize: '28px' }}>สร้างคำขอเบิกสิ่งของ ({shelters.length} แห่ง)</h1>
                    </div>

                    <div className={`d-flex gap-3 flex-wrap mb-4 ${styles.searchSection}`}>
                        <style>{`
                            select option {
                                background-color: #1a1a2e;
                                color: #ffffff;
                                padding: 8px;
                            }
                            select option:hover {
                                background: linear-gradient(rgba(0, 212, 255, 0.2), rgba(0, 212, 255, 0.2));
                                background-color: #16213e;
                            }
                            select option:checked {
                                background: linear-gradient(rgba(0, 212, 255, 0.3), rgba(0, 212, 255, 0.3));
                                background-color: #16213e;
                            }
                        `}</style>
                        <input
                            type="text"
                            placeholder="ชื่อศูนย์พักพิง..."
                            className={`flex-grow-1 ${styles.searchInput}`}
                            value={filterName}
                            onChange={(e) => setFilterName(e.target.value)}
                        />
                        <select
                            className={styles.filterSelect}
                            value={filterDistrict}
                            onChange={(e) => setFilterDistrict(e.target.value)}
                        >
                            <option value="">ทั้งหมด (อำเภอ)</option>
                            {uniqueDistricts.map(district => (
                                <option key={district} value={district}>{district}</option>
                            ))}
                        </select>
                        <select
                            className={styles.filterSelect}
                            value={filterSubdistrict}
                            onChange={(e) => setFilterSubdistrict(e.target.value)}
                            disabled={!filterDistrict}
                        >
                            <option value="">ทั้งหมด (ตำบล)</option>
                            {uniqueSubdistricts.map(subdistrict => (
                                <option key={subdistrict} value={subdistrict}>{subdistrict}</option>
                            ))}
                        </select>
                        <select
                            className={styles.filterSelect}
                            value={filterType}
                            onChange={(e) => setFilterType(e.target.value)}
                        >
                            <option value="">ทั้งหมด (ประเภท)</option>
                            {uniqueTypes.map(type => (
                                <option key={type} value={type}>{type}</option>
                            ))}
                        </select>
                        <select
                            className={styles.filterSelect}
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                        >
                            <option value="all">ทั้งหมด (สถานะ)</option>
                            <option value="รองรับได้">รองรับได้</option>
                            <option value="ใกล้เต็ม">ใกล้เต็ม</option>
                            <option value="เต็มแล้ว">เต็มแล้ว</option>
                        </select>
                    </div>

                    {loading ? (
                        <p>กำลังโหลดข้อมูลศูนย์พักพิง...</p>
                    ) : (
                        <>
                            <table className={styles.sheltersTable}>
                                <thead>
                                    <tr>
                                        <th>ชื่อศูนย์พักพิง</th>
                                        <th>ตำบล/อำเภอ</th>
                                        <th>ประเภท</th>
                                        <th>สถานะ</th>
                                        <th>จัดการ</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {paginatedShelters.map((s) => (
                                        <tr key={s._id}>
                                            <td className={styles.nameCell}>{s.name}</td>
                                            <td>ต.{s.subdistrict} อ.{s.district}</td>
                                            <td>{s.shelterType}</td>
                                            <td>
                                                <span className={`${styles.statusBadge} ${getStatusClass((s as any).capacityStatus)}`}>
                                                    {(s as any).capacityStatus || 'ปกติ'}
                                                </span>
                                            </td>
                                            <td className={styles.actionsCell}>
                                                <button
                                                    className={styles.createBtn}
                                                    onClick={() => handleCreateRequest(s._id)}
                                                >
                                                    สร้างคำขอ
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            {filteredShelters.length === 0 ? (
                                <div className="text-center mt-5" style={{ color: 'rgba(255,255,255,0.5)' }}>
                                    <p>ไม่พบข้อมูลศูนย์ที่ตรงกับการค้นหา</p>
                                </div>
                            ) : (
                                <div className={`d-flex justify-content-center align-items-center gap-4 mt-4 pt-3 border-top border-secondary ${styles.paginationContainer}`}>
                                    <button
                                        className={`${styles.paginationBtn} btn btn-sm`}
                                        onClick={() => setCurrentPage(1)}
                                        disabled={currentPage === 1}
                                    >
                                        ⇤ หน้าแรก
                                    </button>
                                    <button
                                        className={`${styles.paginationBtn} btn btn-sm`}
                                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                        disabled={currentPage === 1}
                                    >
                                        ← ก่อนหน้า
                                    </button>
                                    <div className="small" style={{ color: 'rgba(255,255,255,0.6)', minWidth: '200px', textAlign: 'center' }}>
                                        หน้า {currentPage} จาก {totalPages} ({filteredShelters.length} รายการ)
                                    </div>
                                    <button
                                        className={`${styles.paginationBtn} btn btn-sm`}
                                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                        disabled={currentPage === totalPages}
                                    >
                                        ถัดไป →
                                    </button>
                                    <button
                                        className={`${styles.paginationBtn} btn btn-sm`}
                                        onClick={() => setCurrentPage(totalPages)}
                                        disabled={currentPage === totalPages}
                                    >
                                        หน้าสุดท้าย ⇥
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>

            {isModalOpen && selectedShelter && (
                <CreateRequestModal
                    initialShelterId={selectedShelter}
                    onClose={() => {
                        setIsModalOpen(false);
                        setSelectedShelter(null);
                    }}
                    onSuccess={() => {
                        setIsModalOpen(false);
                        setSelectedShelter(null);
                        setToast({ message: 'สร้างคำขอสำเร็จ', type: 'success' });
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
