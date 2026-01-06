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
    const [loading, setLoading] = useState(true);
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
        <div className="d-flex" style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)', color: '#ffffff' }}>
            <Sidebar isOpen={sidebarOpen} />
            <div className="flex-grow-1 d-flex flex-column" style={{ overflow: 'hidden' }}>
                <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />

                <div className="flex-grow-1 overflow-y-auto p-4">
                    <div className="d-flex justify-content-between align-items-center mb-4">
                        <h1 className="fw-bold" style={{ fontSize: '32px', margin: 0 }}>
                            จัดการศูนย์พักพิง ({shelters.length} แห่ง)
                        </h1>
                        <button
                            className="btn btn-primary fw-bold"
                            onClick={() => {
                                setEditingShelter(null);
                                setIsModalOpen(true);
                            }}
                        >
                            + เพิ่มศูนย์พักพิงใหม่
                        </button>
                    </div>

                    <div className="row g-2 mb-4">
                        <div className="col-12 col-sm-6 col-md-4 col-lg-3">
                            <input
                                type="text"
                                placeholder="ชื่อศูนย์พักพิง..."
                                className="form-control"
                                style={{ background: 'rgba(0, 0, 0, 0.2)', border: '1px solid rgba(255, 255, 255, 0.1)', color: '#fff', borderRadius: '8px' }}
                                value={filterName}
                                onChange={(e) => setFilterName(e.target.value)}
                            />
                        </div>
                        <div className="col-12 col-sm-6 col-md-4 col-lg-3">
                            <select
                                className="form-select"
                                style={{ background: 'rgba(0, 0, 0, 0.2)', border: '1px solid rgba(255, 255, 255, 0.1)', color: '#fff', borderRadius: '8px' }}
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
                                style={{ background: 'rgba(0, 0, 0, 0.2)', border: '1px solid rgba(255, 255, 255, 0.1)', color: '#fff', borderRadius: '8px' }}
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
                                style={{ background: 'rgba(0, 0, 0, 0.2)', border: '1px solid rgba(255, 255, 255, 0.1)', color: '#fff', borderRadius: '8px' }}
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
                                style={{ background: 'rgba(0, 0, 0, 0.2)', border: '1px solid rgba(255, 255, 255, 0.1)', color: '#fff', borderRadius: '8px' }}
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
                        <p>กำลังโหลดข้อมูลศูนย์พักพิง...</p>
                    ) : (
                        <>
                            <div className="table-responsive mb-3">
                                <table className="table table-hover align-middle" style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}>
                                    <thead style={{ borderColor: 'rgba(255, 255, 255, 0.1)', color: 'rgba(255, 255, 255, 0.7)' }}>
                                        <tr>
                                            <th>ชื่อศูนย์พักพิง</th>
                                            <th>ตำบล/อำเภอ</th>
                                            <th>ประเภท</th>
                                            <th>เบอร์โทร</th>
                                            <th>ผู้ดูแล</th>
                                            <th>สถานะ</th>
                                            <th>จัดการ</th>
                                        </tr>
                                    </thead>
                                    <tbody style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}>
                                        {paginatedShelters.map((s) => (
                                            <tr key={s._id} style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}>
                                                <td style={{ fontWeight: '500' }}>{s.name}</td>
                                                <td>ต.{s.subdistrict} อ.{s.district}</td>
                                                <td>{s.shelterType}</td>
                                                <td>{s.phoneNumbers?.[0] || '-'}</td>
                                                <td>{s.responsible?.[0]?.firstName || '-'}</td>
                                                <td>
                                                    <span className={getStatusBadgeClass(s.capacityStatus)}>
                                                        {s.capacityStatus || 'ปกติ'}
                                                    </span>
                                                </td>
                                                <td>
                                                    <div className="d-flex gap-2">
                                                        <button
                                                            className="btn btn-sm btn-warning"
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

                            {filteredShelters.length === 0 ? null : (
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

                    {!loading && filteredShelters.length === 0 && (
                        <div className="text-center" style={{ marginTop: '50px', color: 'rgba(255,255,255,0.5)' }}>
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
                    background-color: #1a1a2e;
                    color: #ffffff;
                    padding: 8px;
                }
            `}</style>
        </div>
    );
}
