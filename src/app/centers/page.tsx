'use client';

import { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import { Shelter } from '@/lib/models/shelter';
import ShelterModal from './ShelterModal';
import Toast from '@/components/Toast';
import ConfirmDialog from '@/components/ConfirmDialog';

export default function CentersPage() {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [shelters, setShelters] = useState<Shelter[]>([]);
    const [filteredShelters, setFilteredShelters] = useState<Shelter[]>([]);
    const [loading, setLoading] = useState(true); // For white theme
    const [filterName, setFilterName] = useState('');
    const [filterDistrict, setFilterDistrict] = useState('');
    const [filterSubdistrict, setFilterSubdistrict] = useState('');
    const [filterType, setFilterType] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' } | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingShelter, setEditingShelter] = useState<Shelter | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const [errorInfo, setErrorInfo] = useState<any>(null);
    const [confirmDialog, setConfirmDialog] = useState<{ shelterName: string; shelterId: string } | null>(null);

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
            const matchName = !filterName || s.name.toLowerCase().includes(filterName.toLowerCase());
            const matchDistrict = !filterDistrict || s.district?.toLowerCase().includes(filterDistrict.toLowerCase());
            const matchSubdistrict = !filterSubdistrict || s.subdistrict?.toLowerCase().includes(filterSubdistrict.toLowerCase());
            const matchType = !filterType || s.shelterType === filterType;
            const matchStatus = filterStatus === 'all' || s.capacityStatus === filterStatus;
            return matchName && matchDistrict && matchSubdistrict && matchType && matchStatus;
        });
        setFilteredShelters(results);
    }, [filterName, filterDistrict, filterSubdistrict, filterType, filterStatus, shelters]);

    const handleDelete = async (id: string, name: string) => {
        setConfirmDialog({ shelterName: name, shelterId: id });
    };

    const confirmDelete = async () => {
        if (!confirmDialog) return;

        try {
            const res = await fetch(`/api/shelters`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ _id: confirmDialog.shelterId })
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
        } finally {
            setConfirmDialog(null);
        }
    };

    const getStatusBadgeClass = (status: string) => {
        switch (status) {
            case 'รองรับได้': return 'badge bg-success';
            case 'ใกล้เต็ม': return 'badge bg-warning';
            case 'เต็มแล้ว': return 'badge bg-danger';
            default: return 'badge bg-secondary';
        }
    };

    const uniqueDistricts = Array.from(new Set(shelters.map(s => s.district).filter(Boolean))).sort();
    const uniqueSubdistricts = Array.from(new Set(
        shelters
            .filter(s => !filterDistrict || s.district === filterDistrict)
            .map(s => s.subdistrict)
            .filter(Boolean)
    )).sort();
    const uniqueTypes = Array.from(new Set(shelters.map(s => s.shelterType).filter(Boolean))).sort();

    // Pagination logic
    const totalPages = Math.ceil(filteredShelters.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedShelters = filteredShelters.slice(startIndex, startIndex + itemsPerPage);

    // Reset to page 1 when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [filterName, filterDistrict, filterSubdistrict, filterType, filterStatus]);

    return (
        <div className="d-flex" style={{ minHeight: '100vh', background: '#ffffff', color: '#111827' }}>
            <Sidebar isOpen={sidebarOpen} />
            <div className="flex-grow-1 d-flex flex-column" style={{ overflow: 'hidden' }}>
                <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />

                <div className="flex-grow-1 overflow-y-auto p-4" style={{ backgroundColor: '#f8f9fa' }}>
                    {/* Header Section */}
                    <div className="d-flex justify-content-between align-items-center mb-4">
                        <h1 className="fw-bold" style={{ fontSize: '28px', margin: 0, color: '#111827' }}>
                            จัดการศูนย์พักพิง
                        </h1>
                        <button
                            className="btn btn-primary fw-bold px-4 py-2"
                            style={{ fontSize: '15px', borderRadius: '8px' }}
                            onClick={() => {
                                setEditingShelter(null);
                                setIsModalOpen(true);
                            }}
                        >
                            + เพิ่มศูนย์พักพิงใหม่
                        </button>
                    </div>

                    {/* Summary Cards */}
                    <div className="row g-3 mb-4">
                        <div className="col-12 col-sm-6 col-lg-3">
                            <div className="card shadow-sm border-0 h-100">
                                <div className="card-body">
                                    <div>
                                        <p className="text-muted mb-1" style={{ fontSize: '14px' }}>ทั้งหมด</p>
                                        <h3 className="fw-bold mb-0" style={{ fontSize: '28px', color: '#111827' }}>
                                            {shelters.length}
                                        </h3>
                                        <p className="text-muted mb-0" style={{ fontSize: '13px' }}>แห่ง</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="col-12 col-sm-6 col-lg-3">
                            <div className="card shadow-sm border-0 h-100" style={{ borderLeft: '4px solid #28a745' }}>
                                <div className="card-body">
                                    <div>
                                        <p className="text-muted mb-1" style={{ fontSize: '14px' }}>รองรับได้</p>
                                        <h3 className="fw-bold mb-0" style={{ fontSize: '28px', color: '#28a745' }}>
                                            {shelters.filter(s => s.capacityStatus === 'รองรับได้').length}
                                        </h3>
                                        <p className="text-muted mb-0" style={{ fontSize: '13px' }}>แห่ง</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="col-12 col-sm-6 col-lg-3">
                            <div className="card shadow-sm border-0 h-100" style={{ borderLeft: '4px solid #ffc107' }}>
                                <div className="card-body">
                                    <div>
                                        <p className="text-muted mb-1" style={{ fontSize: '14px' }}>ใกล้เต็ม</p>
                                        <h3 className="fw-bold mb-0" style={{ fontSize: '28px', color: '#ffc107' }}>
                                            {shelters.filter(s => s.capacityStatus === 'ใกล้เต็ม').length}
                                        </h3>
                                        <p className="text-muted mb-0" style={{ fontSize: '13px' }}>แห่ง</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="col-12 col-sm-6 col-lg-3">
                            <div className="card shadow-sm border-0 h-100" style={{ borderLeft: '4px solid #dc3545' }}>
                                <div className="card-body">
                                    <div>
                                        <p className="text-muted mb-1" style={{ fontSize: '14px' }}>เต็มแล้ว</p>
                                        <h3 className="fw-bold mb-0" style={{ fontSize: '28px', color: '#dc3545' }}>
                                            {shelters.filter(s => s.capacityStatus === 'เต็มแล้ว').length}
                                        </h3>
                                        <p className="text-muted mb-0" style={{ fontSize: '13px' }}>แห่ง</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Filter Section */}
                    <div className="card shadow-sm border-0 mb-4">
                        <div className="card-body">
                            <h5 className="fw-bold mb-3" style={{ fontSize: '16px', color: '#495057' }}>ค้นหาและกรอง</h5>
                            <div className="row g-3">
                                <div className="col-12 col-sm-6 col-md-4 col-lg">
                                    <label className="form-label fw-semibold" style={{ fontSize: '14px', color: '#495057' }}>ชื่อศูนย์พักพิง</label>
                                    <input
                                        type="text"
                                        placeholder="ค้นหาชื่อ..."
                                        className="form-control"
                                        style={{ background: '#ffffff', border: '1px solid #dee2e6', color: '#212529', borderRadius: '8px', fontSize: '15px' }}
                                        value={filterName}
                                        onChange={(e) => setFilterName(e.target.value)}
                                    />
                                </div>
                                <div className="col-12 col-sm-6 col-md-4 col-lg">
                                    <label className="form-label fw-semibold" style={{ fontSize: '14px', color: '#495057' }}>อำเภอ</label>
                                    <select
                                        className="form-select"
                                        style={{ background: '#ffffff', border: '1px solid #dee2e6', color: '#212529', borderRadius: '8px', fontSize: '15px' }}
                                        value={filterDistrict}
                                        onChange={(e) => setFilterDistrict(e.target.value)}
                                    >
                                        <option value="">ทั้งหมด</option>
                                        {uniqueDistricts.map(district => (
                                            <option key={district} value={district}>{district}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="col-12 col-sm-6 col-md-4 col-lg">
                                    <label className="form-label fw-semibold" style={{ fontSize: '14px', color: '#495057' }}>ตำบล</label>
                                    <select
                                        className="form-select"
                                        style={{ background: '#ffffff', border: '1px solid #dee2e6', color: '#212529', borderRadius: '8px', fontSize: '15px' }}
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
                                <div className="col-12 col-sm-6 col-md-4 col-lg">
                                    <label className="form-label fw-semibold" style={{ fontSize: '14px', color: '#495057' }}>ประเภท</label>
                                    <select
                                        className="form-select"
                                        style={{ background: '#ffffff', border: '1px solid #dee2e6', color: '#212529', borderRadius: '8px', fontSize: '15px' }}
                                        value={filterType}
                                        onChange={(e) => setFilterType(e.target.value)}
                                    >
                                        <option value="">ทั้งหมด</option>
                                        {uniqueTypes.map(type => (
                                            <option key={type} value={type}>{type}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="col-12 col-sm-6 col-md-4 col-lg">
                                    <label className="form-label fw-semibold" style={{ fontSize: '14px', color: '#495057' }}>สถานะ</label>
                                    <select
                                        className="form-select"
                                        style={{ background: '#ffffff', border: '1px solid #dee2e6', color: '#212529', borderRadius: '8px', fontSize: '15px' }}
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

                    {loading ? (
                        <div className="text-center py-5">
                            <div className="spinner-border text-primary" role="status">
                                <span className="visually-hidden">Loading...</span>
                            </div>
                            <p className="mt-3" style={{ color: '#868e96', fontSize: '15px' }}>กำลังโหลดข้อมูลศูนย์พักพิง...</p>
                        </div>
                    ) : (
                        <>
                            {/* Table Section */}
                            <div className="card shadow-sm border-0 mb-4">
                                <div className="card-body p-0">
                                    <div className="table-responsive">
                                        <table className="table table-hover align-middle mb-0" style={{ backgroundColor: '#ffffff' }}>
                                            <thead style={{ backgroundColor: '#f8f9fa', borderBottom: '2px solid #dee2e6' }}>
                                                <tr>
                                                    <th style={{ color: '#495057', fontSize: '15px', fontWeight: '600', padding: '16px' }}>ชื่อศูนย์พักพิง</th>
                                                    <th style={{ color: '#495057', fontSize: '15px', fontWeight: '600', padding: '16px' }}>ตำบล/อำเภอ</th>
                                                    <th style={{ color: '#495057', fontSize: '15px', fontWeight: '600', padding: '16px' }}>ประเภท</th>
                                                    <th style={{ color: '#495057', fontSize: '15px', fontWeight: '600', padding: '16px' }}>เบอร์โทร</th>
                                                    <th style={{ color: '#495057', fontSize: '15px', fontWeight: '600', padding: '16px' }}>ผู้ดูแล</th>
                                                    <th style={{ color: '#495057', fontSize: '15px', fontWeight: '600', padding: '16px' }}>สถานะ</th>
                                                    <th style={{ color: '#495057', fontSize: '15px', fontWeight: '600', padding: '16px' }}>จัดการ</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {paginatedShelters.map((s) => (
                                                    <tr key={s._id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                                                        <td style={{ fontWeight: '600', color: '#212529', fontSize: '15px', padding: '16px' }}>{s.name}</td>
                                                        <td style={{ color: '#6c757d', fontSize: '15px', padding: '16px' }}>ต.{s.subdistrict} อ.{s.district}</td>
                                                        <td style={{ color: '#6c757d', fontSize: '15px', padding: '16px' }}>
                                                            <span className="badge bg-secondary" style={{ fontSize: '13px', padding: '6px 12px' }}>{s.shelterType}</span>
                                                        </td>
                                                        <td style={{ color: '#6c757d', fontSize: '15px', padding: '16px' }}>{s.phoneNumbers?.[0] || '-'}</td>
                                                        <td style={{ color: '#6c757d', fontSize: '15px', padding: '16px' }}>{s.responsible?.[0]?.firstName || '-'}</td>
                                                        <td style={{ padding: '16px' }}>
                                                            <span className={getStatusBadgeClass(s.capacityStatus)} style={{ fontSize: '13px', padding: '6px 12px' }}>
                                                                {s.capacityStatus || 'ปกติ'}
                                                            </span>
                                                        </td>
                                                        <td style={{ padding: '16px' }}>
                                                            <div className="d-flex gap-2">
                                                                <button
                                                                    className="btn btn-sm btn-warning"
                                                                    style={{ fontSize: '14px', padding: '6px 12px', borderRadius: '6px' }}
                                                                    title="แก้ไข"
                                                                    onClick={() => {
                                                                        setEditingShelter(s);
                                                                        setIsModalOpen(true);
                                                                    }}
                                                                >
                                                                    แก้ไข
                                                                </button>
                                                                <button
                                                                    className="btn btn-sm btn-danger"
                                                                    style={{ fontSize: '14px', padding: '6px 12px', borderRadius: '6px' }}
                                                                    title="ลบ"
                                                                    onClick={() => s._id && handleDelete(s._id, s.name)}
                                                                >
                                                                    ลบ
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>

                            {filteredShelters.length === 0 ? null : (
                                <div className="card shadow-sm border-0 mt-4">
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
                                                        หน้าแรก
                                                    </button>
                                                </li>
                                                <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                                                    <button
                                                        className="page-link border-0 me-2"
                                                        style={{ borderRadius: '8px', padding: '8px 16px' }}
                                                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                                        disabled={currentPage === 1}
                                                    >
                                                        ก่อนหน้า
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
                                                        ถัดไป
                                                    </button>
                                                </li>
                                                <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                                                    <button
                                                        className="page-link border-0"
                                                        style={{ borderRadius: '8px', padding: '8px 16px' }}
                                                        onClick={() => setCurrentPage(totalPages)}
                                                        disabled={currentPage === totalPages}
                                                    >
                                                        หน้าสุดท้าย
                                                    </button>
                                                </li>
                                            </ul>
                                        </nav>
                                    </div>
                                </div>
                            )}
                        </>
                    )}

                    {!loading && filteredShelters.length === 0 && (
                        <div className="card shadow-sm border-0 text-center py-5">
                            <div className="card-body">

                                <h5 className="fw-bold" style={{ color: '#6c757d', fontSize: '18px' }}>ไม่พบข้อมูลศูนย์ที่ตรงกับการค้นหา</h5>
                                <p style={{ color: '#adb5bd', fontSize: '15px', marginTop: '8px' }}>ลองปรับเงื่อนไขการค้นหาใหม่</p>
                                {errorInfo && (
                                    <div className="alert alert-danger mt-4 text-start" style={{ fontSize: '14px' }}>
                                        <h6 className="fw-bold">Debug Information:</h6>
                                        <p className="mb-1"><strong>DB Name:</strong> {errorInfo.dbName || '-'}</p>
                                        <p className="mb-1"><strong>Collections Found:</strong> {errorInfo.availableCollections?.join(', ') || 'none'}</p>
                                        <p className="mb-1"><strong>Error:</strong> {errorInfo.error}</p>
                                        <p className="text-muted small mt-2 mb-0">
                                            * โปรดตรวจสอบว่า MONGODB_URI ใน .env.local ระบุฐานข้อมูลที่ถูกต้อง
                                            และข้อมูลศูนย์พักพิงอยู่ในคอลเลกชันที่ระบบหาพบ
                                        </p>
                                    </div>
                                )}
                            </div>
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
            {confirmDialog && (
                <ConfirmDialog
                    title="ยืนยันการลบศูนย์พักพิง"
                    message={`คุณต้องการลบศูนย์พักพิง "${confirmDialog.shelterName}" หรือไม่? การกระทำนี้ไม่สามารถย้อนกลับได้`}
                    confirmText="ลบ"
                    cancelText="ยกเลิก"
                    isDangerous={true}
                    onConfirm={confirmDelete}
                    onCancel={() => setConfirmDialog(null)}
                />
            )}

            <style>{`
                select option {
                    background-color: #ffffff;
                    color: #212529;
                    padding: 10px;
                    font-size: 15px;
                }
                select option:hover {
                    background-color: #f8f9fa;
                    color: #0d6efd;
                }
                select option:checked {
                    background-color: #e7f1ff;
                    color: #0d6efd;
                    font-weight: 600;
                }
            `}</style>
        </div>
    );
}
