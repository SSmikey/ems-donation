'use client';

import { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import CreateRequestModal from './CreateRequestModal';
import Toast from '@/components/Toast';
import ConfirmDialog from '@/components/ConfirmDialog';

interface Request {
    _id: string;
    shelterName: string;
    items: { itemName: string; quantity: number }[];
    status: 'รอดำเนินการ' | 'อนุมัติแล้ว' | 'กำลังจัดส่ง' | 'ส่งมอบแล้ว';
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

    const handleCreateRequest = async (id: string, shelterName: string) => {
        setConfirmDialog({ requestId: id, shelterName });
    };

    const confirmCreateRequest = async () => {
        if (!confirmDialog) return;

        try {
            const res = await fetch(`/api/distribution-requests/${confirmDialog.requestId}/approve`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ approvedBy: 'Admin (System)' })
            });

            if (res.ok) {
                setToast({ message: 'อนุมัติคำขอสำเร็จ สต็อกสินค้าจะถูกตัดทันที', type: 'success' });
                fetchRequests();
            } else {
                const errorData = await res.json();
                setToast({ message: errorData.error || 'ไม่สามารถอนุมัติคำขอได้ (สินค้าอาจไม่พอ)', type: 'error' });
            }
        } catch (error) {
            console.error('Error approving request:', error);
            setToast({ message: 'เกิดข้อผิดพลาดในการอนุมัติคำขอ', type: 'error' });
        } finally {
            setConfirmDialog(null);
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
                                            <tr key={req._id} style={{ borderColor: '#dee2e6' }}>
                                                <td style={{ fontWeight: '500', color: '#212529' }}>REQ-{req._id.slice(-4)}</td>
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
                                                    {req.status === 'รอดำเนินการ' && (
                                                        <button
                                                            className="btn btn-sm btn-success"
                                                            onClick={() => handleCreateRequest(req._id, req.shelterName || 'ศูนย์พักพิง')}
                                                        >
                                                            อนุมัติคำขอ
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {filteredRequests.length === 0 && (
                                <div className="text-center" style={{ marginTop: '50px', color: 'rgba(255,255,255,0.5)' }}>
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
                    message={`ยืนยันการอนุมัติคำขอเบิกสิ่งของสำหรับ "${confirmDialog.shelterName}"? สต็อกสินค้าจะถูกตัดทันที`}
                    confirmText="อนุมัติคำขอ"
                    cancelText="ยกเลิก"
                    isDangerous={true}
                    onConfirm={confirmCreateRequest}
                    onCancel={() => setConfirmDialog(null)}
                />
            )}
        </div>
    );
}