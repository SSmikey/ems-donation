'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import CreateRequestModal from './CreateRequestModal';
import Toast from '@/components/Toast';
import ConfirmDialog from '@/components/ConfirmDialog';
import FormSelect from '@/components/FormSelect';

interface Request {
    _id: string;
    shelterName: string;
    items: { itemName: string; quantity: number }[];
    status: 'รอดำเนินการ' | 'อนุมัติแล้ว' | 'กำลังจัดส่ง' | 'ส่งมอบแล้ว' | 'ยกเลิกแล้ว';
    urgency: 'สูง' | 'กลาง' | 'ต่ำ';
    createdAt: string;
}

function DistributionContent() {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [requests, setRequests] = useState<Request[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState('all');
    const [filterUrgency, setFilterUrgency] = useState('all');
    const [filterDate, setFilterDate] = useState('');
    const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' } | null>(null);
    const [confirmDialog, setConfirmDialog] = useState<{ requestId: string; shelterName: string } | null>(null);
    const [cancelDialog, setCancelDialog] = useState<{ requestId: string; shelterName: string } | null>(null);

    const searchParams = useSearchParams();
    const [highlightedId, setHighlightedId] = useState<string | null>(null);

    useEffect(() => {
        const hId = searchParams.get('highlightId');
        if (hId) {
            setHighlightedId(hId);
            // Optional: Scroll to the element if it's a long list
            setTimeout(() => {
                const element = document.getElementById(`request-${hId}`);
                if (element) {
                    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            }, 500);
        }
    }, [searchParams]);

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

    const handleApproveRequest = (id: string, shelterName: string) => {
        setConfirmDialog({ requestId: id, shelterName });
    };

    const confirmApproveRequest = async () => {
        if (!confirmDialog) return;

        try {
            const res = await fetch(`/api/distribution-requests/${confirmDialog.requestId}/approve`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    approvedBy: {
                        userId: 'admin-001',
                        username: 'admin',
                        firstName: 'เจ้าหน้าที่',
                        lastName: 'ดูแลคลัง',
                        role: 'ADMIN',
                        approvedAt: new Date().toISOString()
                    }
                })
            });

            if (res.ok) {
                setToast({ message: 'อนุมัติคำขอสำเร็จ ยอดจองจะถูกตัดออกจากสต็อกจริง', type: 'success' });
                setHighlightedId(null); // Clear highlight on success
                fetchRequests();
            } else {
                const errorData = await res.json();
                setToast({ message: errorData.error || 'ไม่สามารถอนุมัติคำขอได้', type: 'error' });
            }
        } catch (error) {
            console.error('Error approving request:', error);
            setToast({ message: 'เกิดข้อผิดพลาดในการอนุมัติคำขอ', type: 'error' });
        } finally {
            setConfirmDialog(null);
        }
    };

    const handleCancelRequest = (id: string, shelterName: string) => {
        setCancelDialog({ requestId: id, shelterName });
    };

    const confirmCancelRequest = async () => {
        if (!cancelDialog) return;

        try {
            const res = await fetch(`/api/distribution-requests/${cancelDialog.requestId}/cancel`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    cancelledBy: {
                        userId: 'admin-001',
                        username: 'admin'
                    },
                    note: 'ยกเลิกโดยผู้ดูแลระบบ'
                })
            });

            if (res.ok) {
                setToast({ message: 'ยกเลิกคำขอเบิกสิ่งของคืนเรียบร้อยแล้ว', type: 'success' });
                fetchRequests();
            } else {
                const errorData = await res.json();
                setToast({ message: errorData.error || 'ไม่สามารถยกเลิกคำขอได้', type: 'error' });
            }
        } catch (error) {
            console.error('Error cancelling request:', error);
            setToast({ message: 'เกิดข้อผิดพลาดในการยกเลิกคำขอ', type: 'error' });
        } finally {
            setCancelDialog(null);
        }
    };

    const getUrgencyBadgeClass = (urgency: string) => {
        switch (urgency) {
            case 'สูง': return 'badge bg-danger';
            case 'กลาง': return 'badge bg-warning text-dark';
            default: return 'badge bg-info';
        }
    };

    const getStatusBadgeClass = (status: string) => {
        switch (status) {
            case 'รอดำเนินการ': return 'badge bg-warning text-white fw-semibold';
            case 'อนุมัติแล้ว': return 'badge bg-info text-white fw-semibold';
            case 'กำลังจัดส่ง': return 'badge bg-primary text-white fw-semibold';
            case 'ส่งมอบแล้ว': return 'badge bg-success text-white fw-semibold';
            case 'ยกเลิกแล้ว': return 'badge bg-secondary text-white fw-semibold';
            default: return 'badge bg-secondary text-white fw-semibold';
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

    // สถิติคำขอ
    const stats = {
        total: requests.length,
        pending: requests.filter(r => r.status === 'รอดำเนินการ').length,
        approved: requests.filter(r => r.status === 'อนุมัติแล้ว').length,
        completed: requests.filter(r => r.status === 'ส่งมอบแล้ว').length
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
                            <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
                                <div>
                                    <h1 className="fw-bold mb-1" style={{ fontSize: '28px', color: '#2c3e50' }}>
                                        รายการคำขอเบิกสิ่งของ
                                    </h1>
                                    <p className="text-muted mb-0">
                                        <i className="bi bi-clipboard-check me-2"></i>
                                        Distribution Requests Management
                                    </p>
                                </div>
                                <button
                                    className="btn btn-primary btn-lg fw-semibold shadow-sm"
                                    style={{ borderRadius: '10px', padding: '12px 30px' }}
                                    onClick={() => setIsModalOpen(true)}
                                >
                                    <i className="bi bi-plus-circle me-2"></i>
                                    สร้างคำขอใหม่
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Statistics Cards */}
                    <div className="row g-3 mb-4">
                        <div className="col-12 col-sm-6 col-lg-3">
                            <div className="card border-0 shadow-sm h-100" style={{ borderLeft: '4px solid #6c757d' }}>
                                <div className="card-body">
                                    <p className="text-muted mb-2" style={{ fontSize: '14px', fontWeight: '500' }}>คำขอทั้งหมด</p>
                                    <h2 className="fw-bold mb-1" style={{ fontSize: '28px', color: '#111827' }}>{stats.total}</h2>
                                    <span className="text-muted" style={{ fontSize: '13px' }}>รายการ</span>
                                </div>
                            </div>
                        </div>
                        <div className="col-12 col-sm-6 col-lg-3">
                            <div className="card border-0 shadow-sm h-100" style={{ borderLeft: '4px solid #fbbf24' }}>
                                <div className="card-body">
                                    <p className="text-muted mb-2" style={{ fontSize: '14px', fontWeight: '500' }}>รอดำเนินการ</p>
                                    <h2 className="fw-bold mb-1" style={{ fontSize: '28px', color: '#111827' }}>{stats.pending}</h2>
                                    <span className="text-muted" style={{ fontSize: '13px' }}>รายการ</span>
                                </div>
                            </div>
                        </div>
                        <div className="col-12 col-sm-6 col-lg-3">
                            <div className="card border-0 shadow-sm h-100" style={{ borderLeft: '4px solid #3b82f6' }}>
                                <div className="card-body">
                                    <p className="text-muted mb-2" style={{ fontSize: '14px', fontWeight: '500' }}>อนุมัติแล้ว</p>
                                    <h2 className="fw-bold mb-1" style={{ fontSize: '28px', color: '#111827' }}>{stats.approved}</h2>
                                    <span className="text-muted" style={{ fontSize: '13px' }}>รายการ</span>
                                </div>
                            </div>
                        </div>
                        <div className="col-12 col-sm-6 col-lg-3">
                            <div className="card border-0 shadow-sm h-100" style={{ borderLeft: '4px solid #4ade80' }}>
                                <div className="card-body">
                                    <p className="text-muted mb-2" style={{ fontSize: '14px', fontWeight: '500' }}>ส่งมอบแล้ว</p>
                                    <h2 className="fw-bold mb-1" style={{ fontSize: '28px', color: '#111827' }}>{stats.completed}</h2>
                                    <span className="text-muted" style={{ fontSize: '13px' }}>รายการ</span>
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
                                <div className="col-12 col-md-4">
                                    <FormSelect
                                        label="สถานะคำขอ"
                                        value={filterStatus}
                                        onChange={setFilterStatus}
                                        options={[
                                            { value: 'all', label: 'ทั้งหมด (สถานะ)' },
                                            { value: 'รอดำเนินการ', label: 'รอดำเนินการ' },
                                            { value: 'อนุมัติแล้ว', label: 'อนุมัติแล้ว' },
                                            { value: 'กำลังจัดส่ง', label: 'กำลังจัดส่ง' },
                                            { value: 'ส่งมอบแล้ว', label: 'ส่งมอบแล้ว' },
                                            { value: 'ยกเลิกแล้ว', label: 'ยกเลิกแล้ว' }
                                        ]}
                                    />
                                </div>

                                <div className="col-12 col-md-4">
                                    <FormSelect
                                        label="ความเร่งด่วน"
                                        value={filterUrgency}
                                        onChange={setFilterUrgency}
                                        options={[
                                            { value: 'all', label: 'ทั้งหมด (ความเร่งด่วน)' },
                                            { value: 'สูง', label: 'สูง' },
                                            { value: 'กลาง', label: 'กลาง' },
                                            { value: 'ต่ำ', label: 'ต่ำ' }
                                        ]}
                                    />
                                </div>

                                <div className="col-12 col-md-4">
                                    <label className="form-label" style={{
                                        color: '#6b7280',
                                        fontSize: '12px',
                                        fontWeight: 600,
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.025em',
                                        marginBottom: '6px',
                                        display: 'block'
                                    }}>
                                        วันที่สร้างคำขอ
                                    </label>
                                    <input
                                        type="date"
                                        className="form-control"
                                        style={{
                                            background: '#ffffff',
                                            border: '1px solid #e5e7eb',
                                            color: '#111827',
                                            borderRadius: '10px',
                                            height: '44px',
                                            padding: '0 16px',
                                            fontSize: '14px',
                                            transition: 'all 0.25s ease'
                                        }}
                                        value={filterDate}
                                        onChange={(e) => setFilterDate(e.target.value)}
                                        onFocus={(e) => {
                                            e.target.style.borderColor = '#2563eb';
                                            e.target.style.boxShadow = '0 0 0 4px rgba(37, 99, 235, 0.1)';
                                        }}
                                        onBlur={(e) => {
                                            e.target.style.borderColor = '#e5e7eb';
                                            e.target.style.boxShadow = 'none';
                                        }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Table Section with Card */}
                    {loading ? (
                        <div className="card border-0 shadow-sm">
                            <div className="card-body text-center py-5">
                                <div className="spinner-border text-primary mb-3" role="status" style={{ width: '3rem', height: '3rem' }}>
                                    <span className="visually-hidden">กำลังโหลด...</span>
                                </div>
                                <p className="text-muted mb-0">กำลังโหลดข้อมูลคำขอเบิกสิ่งของ...</p>
                            </div>
                        </div>
                    ) : (
                        <>
                            <div className="card border-0 shadow-sm">
                                <div className="card-body p-0">
                                    <div className="table-responsive">
                                        <table className="table table-hover align-middle mb-0">
                                            <thead style={{ backgroundColor: '#f8f9fa', borderBottom: '2px solid #dee2e6' }}>
                                                <tr>
                                                    <th className="py-3 ps-4" style={{ color: '#495057', fontWeight: '600', fontSize: '14px' }}>
                                                        <i className="bi bi-hash me-2"></i>
                                                        เลขที่คำขอ
                                                    </th>
                                                    <th className="py-3" style={{ color: '#495057', fontWeight: '600', fontSize: '14px' }}>
                                                        <i className="bi bi-building me-2"></i>
                                                        ศูนย์พักพิง
                                                    </th>
                                                    <th className="py-3" style={{ color: '#495057', fontWeight: '600', fontSize: '14px' }}>
                                                        <i className="bi bi-box-seam me-2"></i>
                                                        สินค้าที่ขอ
                                                    </th>
                                                    <th className="py-3" style={{ color: '#495057', fontWeight: '600', fontSize: '14px' }}>
                                                        <i className="bi bi-exclamation-triangle me-2"></i>
                                                        ความเร่งด่วน
                                                    </th>
                                                    <th className="py-3" style={{ color: '#495057', fontWeight: '600', fontSize: '14px' }}>
                                                        <i className="bi bi-info-circle me-2"></i>
                                                        สถานะ
                                                    </th>
                                                    <th className="py-3" style={{ color: '#495057', fontWeight: '600', fontSize: '14px' }}>
                                                        <i className="bi bi-calendar-event me-2"></i>
                                                        วันที่สร้าง
                                                    </th>
                                                    <th className="py-3 pe-4 text-end" style={{ color: '#495057', fontWeight: '600', fontSize: '14px' }}>
                                                        <i className="bi bi-gear me-2"></i>
                                                        จัดการ
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {filteredRequests.map((req) => (
                                                    <tr
                                                        key={req._id}
                                                        style={{
                                                            borderBottom: '1px solid #f1f3f5',
                                                            opacity: req.status === 'ยกเลิกแล้ว' ? 0.6 : 1
                                                        }}
                                                    >
                                                        <td className="ps-4 py-3">
                                                            <span className="badge bg-light text-primary border border-primary" style={{ fontSize: '13px', padding: '6px 12px', fontWeight: '600' }}>
                                                                REQ-{req._id.slice(-4)}
                                                            </span>
                                                        </td>
                                                        <td className="py-3">
                                                            <span className="fw-semibold" style={{ color: '#2c3e50', fontSize: '15px' }}>
                                                                {req.shelterName}
                                                            </span>
                                                        </td>
                                                        <td className="py-3">
                                                            <div className="d-flex flex-column gap-1">
                                                                {req.items.map((item, idx) => (
                                                                    <span key={idx} className="badge bg-light text-dark border" style={{ fontSize: '12px', padding: '5px 10px', width: 'fit-content' }}>
                                                                        {item.itemName} × {item.quantity}
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        </td>
                                                        <td className="py-3">
                                                            <span className={getUrgencyBadgeClass(req.urgency)} style={{ fontSize: '13px', padding: '6px 12px', fontWeight: '500' }}>
                                                                <i className={`bi ${req.urgency === 'สูง' ? 'bi-exclamation-circle' : req.urgency === 'กลาง' ? 'bi-dash-circle' : 'bi-info-circle'} me-1`}></i>
                                                                {req.urgency}
                                                            </span>
                                                        </td>
                                                        <td className="py-3">
                                                            <span className={getStatusBadgeClass(req.status)} style={{ fontSize: '13px', padding: '6px 12px', fontWeight: '500' }}>
                                                                {req.status}
                                                            </span>
                                                        </td>
                                                        <td className="py-3">
                                                            <span style={{ color: '#6c757d', fontSize: '14px' }}>
                                                                {new Date(req.createdAt).toLocaleDateString('th-TH', {
                                                                    year: 'numeric',
                                                                    month: 'short',
                                                                    day: 'numeric'
                                                                })}
                                                            </span>
                                                        </td>
                                                        <td className="pe-4 py-3">
                                                            <div className="d-flex gap-2 justify-content-end">
                                                                {req.status === 'รอดำเนินการ' && (
                                                                    <button
                                                                        className="btn btn-success btn-sm"
                                                                        style={{
                                                                            borderRadius: '8px',
                                                                            padding: '6px 16px',
                                                                            fontWeight: '500',
                                                                            fontSize: '13px'
                                                                        }}
                                                                        onClick={() => handleApproveRequest(req._id, req.shelterName || 'ศูนย์พักพิง')}
                                                                    >
                                                                        <i className="bi bi-check-circle me-1"></i>
                                                                        อนุมัติ
                                                                    </button>
                                                                )}
                                                                {['รอดำเนินการ', 'อนุมัติแล้ว', 'กำลังจัดส่ง'].includes(req.status) && (
                                                                    <button
                                                                        className="btn btn-outline-danger btn-sm"
                                                                        style={{
                                                                            borderRadius: '8px',
                                                                            padding: '6px 16px',
                                                                            fontWeight: '500',
                                                                            fontSize: '13px'
                                                                        }}
                                                                        onClick={() => handleCancelRequest(req._id, req.shelterName || 'ศูนย์พักพิง')}
                                                                    >
                                                                        <i className="bi bi-x-circle me-1"></i>
                                                                        ยกเลิก
                                                                    </button>
                                                                )}
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>

                            {filteredRequests.length > 0 && (
                                <div className="card shadow-sm border-0 mt-4">
                                    <div className="card-body">
                                        <nav aria-label="Page navigation">
                                            <ul className="pagination justify-content-center mb-0">
                                                <li className="page-item disabled">
                                                    <button
                                                        className="page-link border-0 me-2"
                                                        style={{ borderRadius: '8px', padding: '8px 16px' }}
                                                        disabled
                                                    >
                                                        หน้าแรก
                                                    </button>
                                                </li>
                                                <li className="page-item disabled">
                                                    <button
                                                        className="page-link border-0 me-2"
                                                        style={{ borderRadius: '8px', padding: '8px 16px' }}
                                                        disabled
                                                    >
                                                        ก่อนหน้า
                                                    </button>
                                                </li>
                                                <li className="page-item active">
                                                    <span
                                                        className="page-link border-0 bg-primary me-2"
                                                        style={{ borderRadius: '8px', padding: '8px 20px', fontWeight: '500' }}
                                                    >
                                                        หน้า 1 / 1 ({filteredRequests.length} รายการ)
                                                    </span>
                                                </li>
                                                <li className="page-item disabled">
                                                    <button
                                                        className="page-link border-0 me-2"
                                                        style={{ borderRadius: '8px', padding: '8px 16px' }}
                                                        disabled
                                                    >
                                                        ถัดไป
                                                    </button>
                                                </li>
                                                <li className="page-item disabled">
                                                    <button
                                                        className="page-link border-0"
                                                        style={{ borderRadius: '8px', padding: '8px 16px' }}
                                                        disabled
                                                    >
                                                        หน้าสุดท้าย
                                                    </button>
                                                </li>
                                            </ul>
                                        </nav>
                                    </div>
                                </div>
                            )}

                            {filteredRequests.length === 0 && (
                                <div className="card border-0 shadow-sm mt-4">
                                    <div className="card-body text-center py-5">
                                        <i className="bi bi-inbox" style={{ fontSize: '48px', color: '#adb5bd' }}></i>
                                        <p className="text-muted mt-3 mb-0">ไม่พบรายการคำขอเบิกสิ่งของ</p>
                                        <p className="text-muted small">ลองปรับเปลี่ยนตัวกรองหรือสร้างคำขอใหม่</p>
                                    </div>
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
                    message={`ยืนยันการอนุมัติคำขอเบิกสิ่งของสำหรับ "${confirmDialog.shelterName}"? ระบบจะตัดยอดสินค้าที่ "จองไว้" ออกจากคลังสินค้าจริงทันที`}
                    confirmText="ยืนยันอนุมัติ"
                    cancelText="ยกเลิก"
                    isDangerous={false}
                    onConfirm={confirmApproveRequest}
                    onCancel={() => setConfirmDialog(null)}
                />
            )}
            {cancelDialog && (
                <ConfirmDialog
                    title="ยกเลิกคำขอเบิกสิ่งของ"
                    message={`คุณแน่ใจหรือไม่ว่าต้องการยกเลิกคำขอของ "${cancelDialog.shelterName}"? ระบบจะทำการคืนสินค้าที่จองไว้หรือที่หักไปแล้วกลับเข้าคลัง`}
                    confirmText="ยืนยันการยกเลิก"
                    cancelText="ไม่ยกเลิก"
                    isDangerous={true}
                    onConfirm={confirmCancelRequest}
                    onCancel={() => setCancelDialog(null)}
                />
            )}
        </div>
    );
}

export default function DistributionPage() {
    return (
        <Suspense fallback={
            <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
                <div className="spinner-border text-primary" role="status" style={{ width: '3rem', height: '3rem' }}>
                    <span className="visually-hidden">กำลังโหลด...</span>
                </div>
            </div>
        }>
            <DistributionContent />
        </Suspense>
    );
}