'use client';

import { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import CreateRequestModal from '@/app/distribution/CreateRequestModal';
import Toast from '@/components/Toast';

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

    const getStatusBadgeClass = (status: string) => {
        switch (status) {
            case 'รองรับได้': return 'badge bg-success';
            case 'ใกล้เต็ม': return 'badge bg-warning';
            case 'เต็มแล้ว': return 'badge bg-danger';
            default: return 'badge bg-secondary';
        }
    };

    const handleCreateRequest = (shelterId: string) => {
        setSelectedShelter(shelterId);
        setIsModalOpen(true);
    };

    return (
        <div className="d-flex" style={{ minHeight: '100vh', background: '#ffffff', color: '#212529' }}>
            <Sidebar isOpen={sidebarOpen} />
            <div className="flex-grow-1 d-flex flex-column" style={{ overflow: 'hidden' }}>
                <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />

                <div className="flex-grow-1 overflow-y-auto p-4" style={{ backgroundColor: '#f8f9fa' }}>
                    <h1 className="fw-bold mb-4" style={{ fontSize: '32px', margin: 0, color: '#212529' }}>
                        สร้างคำขอเบิกสิ่งของ ({shelters.length} แห่ง)
                    </h1>

                    <div className="row g-2 mb-4">
                        <div className="col-12 col-sm-6 col-md-4 col-lg-3">
                            <input
                                type="text"
                                placeholder="ชื่อศูนย์พักพิง..."
                                className="form-control"
                                style={{ background: '#ffffff', border: '1px solid #dee2e6', color: '#212529', borderRadius: '8px' }}
                                value={filterName}
                                onChange={(e) => setFilterName(e.target.value)}
                            />
                        </div>
                        <div className="col-12 col-sm-6 col-md-4 col-lg-3">
                            <select
                                className="form-select"
                                style={{ background: '#ffffff', border: '1px solid #dee2e6', color: '#212529', borderRadius: '8px' }}
                                value={filterDistrict}
                                onChange={(e) => setFilterDistrict(e.target.value)}
                            >
                                <option value="">ทั้งหมด (อำเภอ)</option>
                                {uniqueDistricts.map(district => (
                                    <option key={district} value={district}>{district}</option>
                                ))}
                            </select>
                        </div>
                        <div className="col-12 col-sm-6 col-md-4 col-lg-3">
                            <select
                                className="form-select"
                                style={{ background: '#ffffff', border: '1px solid #dee2e6', color: '#212529', borderRadius: '8px' }}
                                value={filterSubdistrict}
                                onChange={(e) => setFilterSubdistrict(e.target.value)}
                                disabled={!filterDistrict}
                            >
                                <option value="">ทั้งหมด (ตำบล)</option>
                                {uniqueSubdistricts.map(subdistrict => (
                                    <option key={subdistrict} value={subdistrict}>{subdistrict}</option>
                                ))}
                            </select>
                        </div>
                        <div className="col-12 col-sm-6 col-md-4 col-lg-3">
                            <select
                                className="form-select"
                                style={{ background: '#ffffff', border: '1px solid #dee2e6', color: '#212529', borderRadius: '8px' }}
                                value={filterType}
                                onChange={(e) => setFilterType(e.target.value)}
                            >
                                <option value="">ทั้งหมด (ประเภท)</option>
                                {uniqueTypes.map(type => (
                                    <option key={type} value={type}>{type}</option>
                                ))}
                            </select>
                        </div>
                        <div className="col-12 col-sm-6 col-md-4 col-lg-3">
                            <select
                                className="form-select"
                                style={{ background: '#ffffff', border: '1px solid #dee2e6', color: '#212529', borderRadius: '8px' }}
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value)}
                            >
                                <option value="all">ทั้งหมด (สถานะ)</option>
                                <option value="รองรับได้">รองรับได้</option>
                                <option value="ใกล้เต็ม">ใกล้เต็ม</option>
                                <option value="เต็มแล้ว">เต็มแล้ว</option>
                            </select>
                        </div>
                    </div>

                    {loading ? (
                        <p style={{ color: '#868e96' }}>กำลังโหลดข้อมูลศูนย์พักพิง...</p>
                    ) : (
                        <>
                            <div className="table-responsive mb-3">
                                <table className="table table-hover align-middle" style={{ backgroundColor: '#ffffff', borderColor: '#dee2e6' }}>
                                    <thead style={{ borderColor: '#dee2e6', backgroundColor: '#f8f9fa' }}>
                                        <tr>
                                            <th style={{ color: '#495057' }}>ชื่อศูนย์พักพิง</th>
                                            <th style={{ color: '#495057' }}>ตำบล/อำเภอ</th>
                                            <th style={{ color: '#495057' }}>ประเภท</th>
                                            <th style={{ color: '#495057' }}>สถานะ</th>
                                            <th style={{ color: '#495057' }}>จัดการ</th>
                                        </tr>
                                    </thead>
                                    <tbody style={{ borderColor: '#dee2e6' }}>
                                        {paginatedShelters.map((s) => (
                                            <tr key={s._id} style={{ borderColor: '#dee2e6' }}>
                                                <td style={{ fontWeight: '500', color: '#212529' }}>{s.name}</td>
                                                <td style={{ color: '#495057' }}>ต.{s.subdistrict} อ.{s.district}</td>
                                                <td style={{ color: '#495057' }}>{s.shelterType}</td>
                                                <td>
                                                    <span className={getStatusBadgeClass((s as any).capacityStatus)}>
                                                        {(s as any).capacityStatus || 'ปกติ'}
                                                    </span>
                                                </td>
                                                <td>
                                                    <button
                                                        className="btn btn-sm btn-primary"
                                                        onClick={() => handleCreateRequest(s._id)}
                                                    >
                                                        สร้างคำขอ
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {filteredShelters.length === 0 ? (
                                <div className="text-center" style={{ marginTop: '50px', color: 'rgba(255,255,255,0.5)' }}>
                                    <p>ไม่พบข้อมูลศูนย์ที่ตรงกับการค้นหา</p>
                                </div>
                            ) : (
                                <nav aria-label="Page navigation">
                                    <ul className="pagination justify-content-center">
                                        <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                                            <button className="page-link" onClick={() => setCurrentPage(1)} disabled={currentPage === 1}>
                                                ⇤ หน้าแรก
                                            </button>
                                        </li>
                                        <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                                            <button className="page-link" onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1}>
                                                ← ก่อนหน้า
                                            </button>
                                        </li>
                                        <li className="page-item active">
                                            <span className="page-link">
                                                หน้า {currentPage} จาก {totalPages} ({filteredShelters.length} รายการ)
                                            </span>
                                        </li>
                                        <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                                            <button className="page-link" onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages}>
                                                ถัดไป →
                                            </button>
                                        </li>
                                        <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                                            <button className="page-link" onClick={() => setCurrentPage(totalPages)} disabled={currentPage === totalPages}>
                                                หน้าสุดท้าย ⇥
                                            </button>
                                        </li>
                                    </ul>
                                </nav>
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

            <style>{`
                select option {
                    background-color: #1a1a2e;
                    color: #ffffff;
                    padding: 8px;
                }
            `}</style>
        </div>
    );
}
