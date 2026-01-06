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
            const matchStatus = filterStatus === 'all' || (s as any).capacityStatus === filterStatus;
            return matchName && matchDistrict && matchSubdistrict && matchType && matchStatus;
        });
        setFilteredShelters(results);
    }, [filterName, filterDistrict, filterSubdistrict, filterType, filterStatus, shelters]);

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

    const totalPages = Math.ceil(filteredShelters.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedShelters = filteredShelters.slice(startIndex, startIndex + itemsPerPage);

    const getStatusBadgeClass = (status: string) => {
        switch (status) {
            case 'รองรับได้': return 'badge bg-success';
            case 'ใกล้เต็ม': return 'badge bg-warning text-dark';
            case 'เต็มแล้ว': return 'badge bg-danger';
            default: return 'badge bg-secondary';
        }
    };

    const handleCreateRequest = (shelterId: string) => {
        setSelectedShelter(shelterId);
        setIsModalOpen(true);
    };

    return (
        <div className="d-flex" style={{ minHeight: '100vh', background: '#f8f9fa' }}>
            <Sidebar isOpen={sidebarOpen} />
            <div className="flex-grow-1 d-flex flex-column" style={{ overflow: 'hidden' }}>
                <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />

                <div className="flex-grow-1 overflow-y-auto p-4">
                    {/* Header Section with Card */}
                    <div className="card border-0 shadow-sm mb-4">
                        <div className="card-body py-4">
                            <div className="d-flex justify-content-between align-items-center">
                                <div>
                                    <h1 className="fw-bold mb-1" style={{ fontSize: '28px', color: '#2c3e50' }}>
                                        สร้างคำขอเบิกสิ่งของ
                                    </h1>
                                    <p className="text-muted mb-0">
                                        <i className="bi bi-building me-2"></i>
                                        จำนวนศูนย์พักพิงทั้งหมด: <span className="fw-bold text-primary">{shelters.length}</span> แห่ง
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Filter Section with Card */}
                    <div className="card border-0 shadow-sm mb-4">
                        <div className="card-body">
                            <h6 className="fw-bold mb-3 text-secondary">
                                <i className="bi bi-funnel me-2"></i>
                                ตัวกรองข้อมูล
                            </h6>
                            <div className="row g-3">
                                <div className="col-12 col-lg">
                                    <label className="form-label small fw-semibold text-secondary mb-2">
                                        <i className="bi bi-search me-1"></i>
                                        ชื่อศูนย์พักพิง
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="ค้นหาชื่อศูนย์พักพิง..."
                                        className="form-control form-control-lg"
                                        style={{
                                            background: '#ffffff',
                                            border: '2px solid #e9ecef',
                                            borderRadius: '10px',
                                            fontSize: '15px'
                                        }}
                                        value={filterName}
                                        onChange={(e) => setFilterName(e.target.value)}
                                    />
                                </div>
                                <div className="col-12 col-lg">
                                    <label className="form-label small fw-semibold text-secondary mb-2">
                                        <i className="bi bi-geo-alt me-1"></i>
                                        อำเภอ
                                    </label>
                                    <select
                                        className="form-select form-select-lg"
                                        style={{
                                            background: '#ffffff',
                                            border: '2px solid #e9ecef',
                                            borderRadius: '10px',
                                            fontSize: '15px'
                                        }}
                                        value={filterDistrict}
                                        onChange={(e) => setFilterDistrict(e.target.value)}
                                    >
                                        <option value="">ทั้งหมด</option>
                                        {uniqueDistricts.map(district => (
                                            <option key={district} value={district}>{district}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="col-12 col-lg">
                                    <label className="form-label small fw-semibold text-secondary mb-2">
                                        <i className="bi bi-geo me-1"></i>
                                        ตำบล
                                    </label>
                                    <select
                                        className="form-select form-select-lg"
                                        style={{
                                            background: '#ffffff',
                                            border: '2px solid #e9ecef',
                                            borderRadius: '10px',
                                            fontSize: '15px'
                                        }}
                                        value={filterSubdistrict}
                                        onChange={(e) => setFilterSubdistrict(e.target.value)}
                                        disabled={!filterDistrict}
                                    >
                                        <option value="">ทั้งหมด</option>
                                        {uniqueSubdistricts.map(subdistrict => (
                                            <option key={subdistrict} value={subdistrict}>{subdistrict}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="col-12 col-lg">
                                    <label className="form-label small fw-semibold text-secondary mb-2">
                                        <i className="bi bi-tag me-1"></i>
                                        ประเภทศูนย์
                                    </label>
                                    <select
                                        className="form-select form-select-lg"
                                        style={{
                                            background: '#ffffff',
                                            border: '2px solid #e9ecef',
                                            borderRadius: '10px',
                                            fontSize: '15px'
                                        }}
                                        value={filterType}
                                        onChange={(e) => setFilterType(e.target.value)}
                                    >
                                        <option value="">ทั้งหมด</option>
                                        {uniqueTypes.map(type => (
                                            <option key={type} value={type}>{type}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="col-12 col-lg">
                                    <label className="form-label small fw-semibold text-secondary mb-2">
                                        <i className="bi bi-info-circle me-1"></i>
                                        สถานะความจุ
                                    </label>
                                    <select
                                        className="form-select form-select-lg"
                                        style={{
                                            background: '#ffffff',
                                            border: '2px solid #e9ecef',
                                            borderRadius: '10px',
                                            fontSize: '15px'
                                        }}
                                        value={filterStatus}
                                        onChange={(e) => setFilterStatus(e.target.value)}
                                    >
                                        <option value="all">ทั้งหมด</option>
                                        <option value="รองรับได้">รองรับได้</option>
                                        <option value="ใกล้เต็ม">ใกล้เต็ม</option>
                                        <option value="เต็มแล้ว">เต็มแล้ว</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Table Section with Card */}
                    {loading ? (
                        <div className="card border-0 shadow-sm">
                            <div className="card-body text-center py-5">
                                <div className="spinner-border text-primary mb-3" role="status">
                                    <span className="visually-hidden">กำลังโหลด...</span>
                                </div>
                                <p className="text-muted mb-0">กำลังโหลดข้อมูลศูนย์พักพิง...</p>
                            </div>
                        </div>
                    ) : (
                        <>
                            <div className="card border-0 shadow-sm mb-4">
                                <div className="card-body p-0">
                                    <div className="table-responsive">
                                        <table className="table table-hover align-middle mb-0">
                                            <thead style={{ backgroundColor: '#f8f9fa', borderBottom: '2px solid #dee2e6' }}>
                                                <tr>
                                                    <th className="py-3 ps-4" style={{ color: '#495057', fontWeight: '600', fontSize: '14px' }}>
                                                        <i className="bi bi-building me-2"></i>
                                                        ชื่อศูนย์พักพิง
                                                    </th>
                                                    <th className="py-3" style={{ color: '#495057', fontWeight: '600', fontSize: '14px' }}>
                                                        <i className="bi bi-geo-alt me-2"></i>
                                                        ที่อยู่
                                                    </th>
                                                    <th className="py-3" style={{ color: '#495057', fontWeight: '600', fontSize: '14px' }}>
                                                        <i className="bi bi-tag me-2"></i>
                                                        ประเภท
                                                    </th>
                                                    <th className="py-3" style={{ color: '#495057', fontWeight: '600', fontSize: '14px' }}>
                                                        <i className="bi bi-info-circle me-2"></i>
                                                        สถานะ
                                                    </th>
                                                    <th className="py-3 pe-4 text-end" style={{ color: '#495057', fontWeight: '600', fontSize: '14px' }}>
                                                        <i className="bi bi-gear me-2"></i>
                                                        จัดการ
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {paginatedShelters.map((s) => (
                                                    <tr key={s._id} style={{ borderBottom: '1px solid #f1f3f5' }}>
                                                        <td className="ps-4 py-3">
                                                            <span className="fw-semibold" style={{ color: '#2c3e50', fontSize: '15px' }}>
                                                                {s.name}
                                                            </span>
                                                        </td>
                                                        <td className="py-3">
                                                            <span style={{ color: '#6c757d', fontSize: '14px' }}>
                                                                ต.{s.subdistrict} อ.{s.district}
                                                            </span>
                                                        </td>
                                                        <td className="py-3">
                                                            <span className="badge bg-light text-dark border" style={{ fontSize: '13px', padding: '6px 12px' }}>
                                                                {s.shelterType}
                                                            </span>
                                                        </td>
                                                        <td className="py-3">
                                                            <span className={getStatusBadgeClass((s as any).capacityStatus)} style={{ fontSize: '13px', padding: '6px 12px' }}>
                                                                {(s as any).capacityStatus || 'ปกติ'}
                                                            </span>
                                                        </td>
                                                        <td className="pe-4 py-3 text-end">
                                                            <button
                                                                className="btn btn-primary btn-sm"
                                                                style={{
                                                                    borderRadius: '8px',
                                                                    padding: '8px 20px',
                                                                    fontWeight: '500',
                                                                    fontSize: '14px'
                                                                }}
                                                                onClick={() => handleCreateRequest(s._id)}
                                                            >
                                                                <i className="bi bi-plus-circle me-1"></i>
                                                                สร้างคำขอ
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>

                            {filteredShelters.length === 0 ? (
                                <div className="card border-0 shadow-sm">
                                    <div className="card-body text-center py-5">
                                        <i className="bi bi-inbox" style={{ fontSize: '48px', color: '#adb5bd' }}></i>
                                        <p className="text-muted mt-3 mb-0">ไม่พบข้อมูลศูนย์ที่ตรงกับการค้นหา</p>
                                    </div>
                                </div>
                            ) : (
                                <div className="card border-0 shadow-sm">
                                    <div className="card-body">
                                        <nav aria-label="Page navigation">
                                            <ul className="pagination justify-content-center mb-0">
                                                <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                                                    <button
                                                        className="page-link border-0 me-2"
                                                        style={{ borderRadius: '8px', padding: '8px 16px' }}
                                                        onClick={() => setCurrentPage(1)}
                                                        disabled={currentPage === 1}
                                                    >
                                                        <i className="bi bi-chevron-bar-left"></i> หน้าแรก
                                                    </button>
                                                </li>
                                                <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                                                    <button
                                                        className="page-link border-0 me-2"
                                                        style={{ borderRadius: '8px', padding: '8px 16px' }}
                                                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                                        disabled={currentPage === 1}
                                                    >
                                                        <i className="bi bi-chevron-left"></i> ก่อนหน้า
                                                    </button>
                                                </li>
                                                <li className="page-item active">
                                                    <span
                                                        className="page-link border-0 bg-primary me-2"
                                                        style={{ borderRadius: '8px', padding: '8px 20px', fontWeight: '500' }}
                                                    >
                                                        หน้า {currentPage} / {totalPages} ({filteredShelters.length} รายการ)
                                                    </span>
                                                </li>
                                                <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                                                    <button
                                                        className="page-link border-0 me-2"
                                                        style={{ borderRadius: '8px', padding: '8px 16px' }}
                                                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                                        disabled={currentPage === totalPages}
                                                    >
                                                        ถัดไป <i className="bi bi-chevron-right"></i>
                                                    </button>
                                                </li>
                                                <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                                                    <button
                                                        className="page-link border-0"
                                                        style={{ borderRadius: '8px', padding: '8px 16px' }}
                                                        onClick={() => setCurrentPage(totalPages)}
                                                        disabled={currentPage === totalPages}
                                                    >
                                                        หน้าสุดท้าย <i className="bi bi-chevron-bar-right"></i>
                                                    </button>
                                                </li>
                                            </ul>
                                        </nav>
                                    </div>
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