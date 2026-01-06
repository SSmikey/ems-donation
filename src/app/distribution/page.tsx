'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import CreateRequestModal from './CreateRequestModal';
import Toast from '@/components/Toast';
import ConfirmDialog from '@/components/ConfirmDialog';

interface Request {
    _id: string;
    shelterName: string;
    items: { itemName: string; quantity: number }[];
    status: 'รอดำเนินการ' | 'อนุมัติแล้ว' | 'กำลังจัดส่ง' | 'ส่งมอบแล้ว' | 'ยกเลิกแล้ว';
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
            // Updated to use system user info for approval
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
            case 'กลาง': return 'badge bg-warning';
            default: return 'badge bg-info';
        }
    };

    const getStatusBadgeClass = (status: string) => {
        switch (status) {
            case 'รอดำเนินการ': return 'badge bg-warning';
            case 'อนุมัติแล้ว': return 'badge bg-info';
            case 'กำลังจัดส่ง': return 'badge bg-primary';
            case 'ส่งมอบแล้ว': return 'badge bg-success';
            case 'ยกเลิกแล้ว': return 'badge bg-secondary';
            default: return 'badge bg-secondary';
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

    return (
        <div className="d-flex" style={{ minHeight: '100vh', background: '#ffffff', color: '#212529' }}>
            <Sidebar isOpen={sidebarOpen} />
            <div className="flex-grow-1 d-flex flex-column" style={{ overflow: 'hidden' }}>
                <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />

                <div className="flex-grow-1 overflow-y-auto p-4" style={{ backgroundColor: '#f8f9fa' }}>
                    <div className="d-flex justify-content-between align-items-center mb-4">
                        <h1 className="fw-bold" style={{ fontSize: '32px', margin: 0, color: '#212529' }}>
                            รายการคำขอเบิกสิ่งของ (Distribution Requests)
                        </h1>
                        <button
                            className="btn btn-primary fw-bold"
                            onClick={() => setIsModalOpen(true)}
                        >
                            + สร้างคำขอใหม่
                        </button>
                    </div>

                    <div className="row g-3 mb-4">
                        <div className="col-12 col-md-4">
                            <label className="form-label" style={{ color: '#495057' }}>สถานะ</label>
                            <select
                                className="form-select"
                                style={{ background: '#ffffff', border: '1px solid #dee2e6', color: '#212529', borderRadius: '8px' }}
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value)}
                            >
                                <option value="all">ทั้งหมด</option>
                                <option value="รอดำเนินการ">รอดำเนินการ</option>
                                <option value="อนุมัติแล้ว">อนุมัติแล้ว</option>
                                <option value="กำลังจัดส่ง">กำลังจัดส่ง</option>
                                <option value="ส่งมอบแล้ว">ส่งมอบแล้ว</option>
                                <option value="ยกเลิกแล้ว">ยกเลิกแล้ว</option>
                            </select>
                        </div>

                        <div className="col-12 col-md-4">
                            <label className="form-label" style={{ color: '#495057' }}>ความเร่งด่วน</label>
                            <select
                                className="form-select"
                                style={{ background: '#ffffff', border: '1px solid #dee2e6', color: '#212529', borderRadius: '8px' }}
                                value={filterUrgency}
                                onChange={(e) => setFilterUrgency(e.target.value)}
                            >
                                <option value="all">ทั้งหมด</option>
                                <option value="สูง">สูง</option>
                                <option value="กลาง">กลาง</option>
                                <option value="ต่ำ">ต่ำ</option>
                            </select>
                        </div>

                        <div className="col-12 col-md-4">
                            <label className="form-label" style={{ color: '#495057' }}>วันที่</label>
                            <input
                                type="date"
                                className="form-control"
                                style={{ background: '#ffffff', border: '1px solid #dee2e6', color: '#212529', borderRadius: '8px' }}
                                value={filterDate}
                                onChange={(e) => setFilterDate(e.target.value)}
                            />
                        </div>
                    </div>

                    {loading ? (
                        <p style={{ color: '#868e96' }}>กำลังโหลดข้อมูลคำขอเบิกสิ่งของ...</p>
                    ) : (
                        <>
                            <div className="table-responsive">
                                <table className="table table-hover align-middle" style={{ backgroundColor: '#ffffff', borderColor: '#dee2e6' }}>
                                    <thead style={{ borderColor: '#dee2e6', backgroundColor: '#f8f9fa' }}>
                                        <tr>
                                            <th style={{ color: '#495057' }}>เลขที่คำขอ</th>
                                            <th style={{ color: '#495057' }}>ศูนย์พักพิง</th>
                                            <th style={{ color: '#495057' }}>สินค้าที่ขอ</th>
                                            <th style={{ color: '#495057' }}>ความเร่งด่วน</th>
                                            <th style={{ color: '#495057' }}>สถานะ</th>
                                            <th style={{ color: '#495057' }}>วันที่สร้าง</th>
                                            <th style={{ color: '#495057' }}>จัดการ</th>
                                        </tr>
                                    </thead>
                                    <tbody style={{ borderColor: '#dee2e6' }}>
                                        {filteredRequests.map((req) => (
                                            <tr
                                                key={req._id}
                                                id={`request-${req._id}`}
                                                style={{
                                                    borderColor: '#dee2e6',
                                                    opacity: req.status === 'ยกเลิกแล้ว' ? 0.6 : 1,
                                                    backgroundColor: highlightedId === req._id ? 'rgba(37, 99, 235, 0.05)' : 'transparent',
                                                    borderLeft: highlightedId === req._id ? '4px solid #2563eb' : 'none',
                                                    transition: 'all 0.3s ease'
                                                }}
                                            >
                                                <td style={{ fontWeight: highlightedId === req._id ? '700' : '500', color: highlightedId === req._id ? '#2563eb' : '#212529' }}>
                                                    {highlightedId === req._id && <span className="me-1">📌</span>}
                                                    REQ-{req._id.slice(-4)}
                                                </td>
                                                <td style={{ color: '#495057' }}>{req.shelterName}</td>
                                                <td>
                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                                        {req.items.map((item, idx) => (
                                                            <span key={idx} style={{ fontSize: '0.9rem', color: '#495057' }}>{item.itemName} x{item.quantity}</span>
                                                        ))}
                                                    </div>
                                                </td>
                                                <td>
                                                    <span className={getUrgencyBadgeClass(req.urgency)}>
                                                        {req.urgency}
                                                    </span>
                                                </td>
                                                <td>
                                                    <span className={getStatusBadgeClass(req.status)}>
                                                        {req.status}
                                                    </span>
                                                </td>
                                                <td>{new Date(req.createdAt).toLocaleDateString('th-TH')}</td>
                                                <td>
                                                    <div className="d-flex gap-2">
                                                        {req.status === 'รอดำเนินการ' && (
                                                            <button
                                                                className="btn btn-sm btn-success"
                                                                onClick={() => handleApproveRequest(req._id, req.shelterName || 'ศูนย์พักพิง')}
                                                            >
                                                                อนุมัติ
                                                            </button>
                                                        )}
                                                        {['รอดำเนินการ', 'อนุมัติแล้ว', 'กำลังจัดส่ง'].includes(req.status) && (
                                                            <button
                                                                className="btn btn-sm btn-outline-danger"
                                                                onClick={() => handleCancelRequest(req._id, req.shelterName || 'ศูนย์พักพิง')}
                                                            >
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

                            {filteredRequests.length === 0 && (
                                <div className="text-center" style={{ marginTop: '50px', color: '#868e96' }}>
                                    <p>ไม่พบรายการคำขอเบิกสิ่งของ</p>
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
