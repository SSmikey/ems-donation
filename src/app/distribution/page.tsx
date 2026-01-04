'use client';

import { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import styles from './distribution.module.css';
import CreateRequestModal from './CreateRequestModal';
import Toast from '@/components/Toast';
import ConfirmDialog from '@/components/ConfirmDialog';
import 'bootstrap/dist/css/bootstrap.min.css';

interface Request {
    _id: string;
    shelterName: string;
    items: { itemName: string; quantity: number }[];
    status: 'รอดำเนินการ' | 'อนุมัติแล้ว' | 'กำลังจัดส่ง' | 'สำเร็จ' | 'ยกเลิก';
    urgency: 'สูง' | 'กลาง' | 'ต่ำ';
    createdAt: string;
    cancelledAt?: string;
    cancellationReason?: string;
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
    const [confirmDialog, setConfirmDialog] = useState<{ requestId: string; shelterName: string; action: 'approve' | 'ship' | 'confirm' | 'cancel' } | null>(null);
    const [cancelReason, setCancelReason] = useState('');

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

    const handleAction = (id: string, shelterName: string, action: 'approve' | 'ship' | 'confirm' | 'cancel') => {
        setConfirmDialog({ requestId: id, shelterName, action });
    };

    const confirmAction = async () => {
        if (!confirmDialog) return;

        try {
            let endpoint = '';
            let method = 'PUT';
            let body: any = {};

            switch (confirmDialog.action) {
                case 'approve':
                    endpoint = `/api/distribution-requests/${confirmDialog.requestId}/approve`;
                    body = { approvedBy: 'Admin (System)' };
                    break;
                case 'ship':
                    endpoint = `/api/distribution-requests/${confirmDialog.requestId}/ship`;
                    break;
                case 'confirm':
                    endpoint = `/api/distribution-requests/${confirmDialog.requestId}/confirm`;
                    body = { confirmedBy: 'Admin (System)' };
                    break;
                case 'cancel':
                    endpoint = `/api/distribution-requests/${confirmDialog.requestId}/cancel`;
                    body = { cancelledBy: 'Admin (System)', cancellationReason: cancelReason || 'ไม่มีเหตุผลระบุ' };
                    break;
            }

            const res = await fetch(endpoint, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });

            if (res.ok) {
                const messages: Record<string, string> = {
                    approve: 'อนุมัติคำขอสำเร็จ (สต็อกถูกจองแล้วจากการสร้างคำขอ)',
                    ship: 'อัพเดทสถานะเป็นกำลังจัดส่งสำเร็จ',
                    confirm: 'ยืนยันรับของสำเร็จ (สต็อกถูกตัดแล้ว)',
                    cancel: 'ยกเลิกคำขอสำเร็จ (สต็อกถูกคืนแล้ว)'
                };
                setToast({ message: messages[confirmDialog.action], type: 'success' });
                setCancelReason('');
                fetchRequests();
            } else {
                const errorData = await res.json();
                setToast({ message: errorData.error || 'ไม่สามารถดำเนินการได้', type: 'error' });
            }
        } catch (error) {
            console.error('Error:', error);
            setToast({ message: 'เกิดข้อผิดพลาดในการดำเนินการ', type: 'error' });
        } finally {
            setConfirmDialog(null);
        }
    };

    const getUrgencyClass = (urgency: string) => {
        switch (urgency) {
            case 'สูง': return styles.urgencyHigh;
            case 'กลาง': return styles.urgencyMedium;
            default: return styles.urgencyLow;
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
        <div className={`d-flex min-vh-100 ${styles.container}`}>
            <Sidebar isOpen={sidebarOpen} />
            <div className={`flex-grow-1 d-flex flex-column ${styles.mainContent}`}>
                <div className={`flex-grow-1 overflow-auto p-4 p-md-5 ${styles.contentArea}`}>
                    <div className={`d-flex justify-content-between align-items-center mb-4 ${styles.pageHeader}`}>
                        <h1 className="fw-bold text-white" style={{ fontSize: '28px', margin: 0 }}>รายการคำขอเบิกสิ่งของ (Distribution Requests)</h1>
                        <button
                            className="btn btn-primary fw-bold"
                            onClick={() => setIsModalOpen(true)}
                        >
                            + สร้างคำขอใหม่
                        </button>
                    </div>

                    <div className={`d-flex gap-3 mb-4 p-3 rounded ${styles.filterSection}`} style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)' }}>
                        <div className={`d-flex flex-column gap-2 ${styles.filterGroup}`}>
                            <label className="small">สถานะ</label>
                            <select
                                className={styles.filterSelect}
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value)}
                            >
                                <option value="all">ทั้งหมด</option>
                                <option value="รอดำเนินการ">รอดำเนินการ</option>
                                <option value="อนุมัติแล้ว">อนุมัติแล้ว</option>
                                <option value="กำลังจัดส่ง">กำลังจัดส่ง</option>
                                <option value="สำเร็จ">สำเร็จ</option>
                                <option value="ยกเลิก">ยกเลิก</option>
                            </select>
                        </div>

                        <div className={`d-flex flex-column gap-2 ${styles.filterGroup}`}>
                            <label className="small">ความเร่งด่วน</label>
                            <select
                                className={styles.filterSelect}
                                value={filterUrgency}
                                onChange={(e) => setFilterUrgency(e.target.value)}
                            >
                                <option value="all">ทั้งหมด</option>
                                <option value="สูง">สูง</option>
                                <option value="กลาง">กลาง</option>
                                <option value="ต่ำ">ต่ำ</option>
                            </select>
                        </div>

                        <div className={`d-flex flex-column gap-2 ${styles.filterGroup}`}>
                            <label className="small">วันที่</label>
                            <input
                                type="date"
                                className={styles.filterSelect}
                                value={filterDate}
                                onChange={(e) => setFilterDate(e.target.value)}
                            />
                        </div>
                    </div>

                    {loading ? (
                        <p>กำลังโหลดข้อมูลคำขอเบิกสิ่งของ...</p>
                    ) : (
                        <>
                            <table className={styles.requestsTable}>
                                <thead>
                                    <tr>
                                        <th>เลขที่คำขอ</th>
                                        <th>ศูนย์พักพิง</th>
                                        <th>สินค้าที่ขอ</th>
                                        <th>ความเร่งด่วน</th>
                                        <th>สถานะ</th>
                                        <th>วันที่สร้าง</th>
                                        <th>จัดการ</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredRequests.map((req) => (
                                        <tr key={req._id}>
                                            <td className={styles.requestId}>REQ-{req._id.slice(-4)}</td>
                                            <td>{req.shelterName}</td>
                                            <td>
                                                <div className={styles.itemsList}>
                                                    {req.items.map((item, idx) => (
                                                        <div key={idx}>{item.itemName} x{item.quantity}</div>
                                                    ))}
                                                </div>
                                            </td>
                                            <td>
                                                <span className={`${styles.urgencyBadge} ${getUrgencyClass(req.urgency)}`}>
                                                    {req.urgency}
                                                </span>
                                            </td>
                                            <td>
                                                <span className={styles.statusBadge}>{req.status}</span>
                                            </td>
                                            <td>{new Date(req.createdAt).toLocaleDateString('th-TH')}</td>
                                            <td className={styles.actionsCell}>
                                                <div className="d-flex gap-2 flex-wrap">
                                                    {req.status === 'รอดำเนินการ' && (
                                                        <>
                                                            <button
                                                                className={`${styles.createBtn} btn btn-sm`}
                                                                onClick={() => handleAction(req._id, req.shelterName || 'ศูนย์พักพิง', 'approve')}
                                                            >
                                                                อนุมัติ
                                                            </button>
                                                            <button
                                                                className={`btn btn-sm btn-danger`}
                                                                onClick={() => handleAction(req._id, req.shelterName || 'ศูนย์พักพิง', 'cancel')}
                                                            >
                                                                ยกเลิก
                                                            </button>
                                                        </>
                                                    )}
                                                    {req.status === 'อนุมัติแล้ว' && (
                                                        <>
                                                            <button
                                                                className={`${styles.createBtn} btn btn-sm`}
                                                                onClick={() => handleAction(req._id, req.shelterName || 'ศูนย์พักพิง', 'ship')}
                                                            >
                                                                จัดส่ง
                                                            </button>
                                                            <button
                                                                className={`btn btn-sm btn-danger`}
                                                                onClick={() => handleAction(req._id, req.shelterName || 'ศูนย์พักพิง', 'cancel')}
                                                            >
                                                                ยกเลิก
                                                            </button>
                                                        </>
                                                    )}
                                                    {req.status === 'กำลังจัดส่ง' && (
                                                        <button
                                                            className={`btn btn-sm btn-success`}
                                                            onClick={() => handleAction(req._id, req.shelterName || 'ศูนย์พักพิง', 'confirm')}
                                                        >
                                                            ยืนยันรับของ
                                                        </button>
                                                    )}
                                                    {req.status === 'สำเร็จ' && (
                                                        <span className="badge bg-success">เสร็จสิ้น</span>
                                                    )}
                                                    {req.status === 'ยกเลิก' && (
                                                        <span className="badge bg-danger">ยกเลิก</span>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            {filteredRequests.length === 0 && (
                                <div className="text-center mt-5" style={{ color: 'rgba(255,255,255,0.5)' }}>
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
                <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">
                                    {confirmDialog.action === 'approve' && 'อนุมัติคำขอเบิกสิ่งของ'}
                                    {confirmDialog.action === 'ship' && 'จัดส่งสิ่งของ'}
                                    {confirmDialog.action === 'confirm' && 'ยืนยันรับสิ่งของ'}
                                    {confirmDialog.action === 'cancel' && 'ยกเลิกคำขอเบิกสิ่งของ'}
                                </h5>
                                <button type="button" className="btn-close" onClick={() => setConfirmDialog(null)}></button>
                            </div>
                            <div className="modal-body">
                                {confirmDialog.action === 'approve' && (
                                    <p>ยืนยันการอนุมัติคำขอเบิกสิ่งของสำหรับ "{confirmDialog.shelterName}"?<br/><small className="text-muted">สต็อกถูกจองแล้วตั้งแต่การสร้างคำขอ ตอนนี้เพียงแต่อนุมัติสถานะ</small></p>
                                )}
                                {confirmDialog.action === 'ship' && (
                                    <p>ยืนยันการจัดส่งสิ่งของให้กับ "{confirmDialog.shelterName}"?<br/><small className="text-muted">สต็อกยังไม่ถูกตัด จะตัดเมื่อยืนยันรับของ</small></p>
                                )}
                                {confirmDialog.action === 'confirm' && (
                                    <p>ยืนยันว่า "{confirmDialog.shelterName}" ได้รับสิ่งของแล้ว?<br/><small className="text-muted">สต็อกจะถูกตัดทันที</small></p>
                                )}
                                {confirmDialog.action === 'cancel' && (
                                    <>
                                        <p>ยกเลิกคำขอเบิกสิ่งของสำหรับ "{confirmDialog.shelterName}"?</p>
                                        <div className="mb-3">
                                            <label className="form-label">เหตุผลการยกเลิก</label>
                                            <textarea
                                                className="form-control"
                                                placeholder="ระบุเหตุผลการยกเลิก..."
                                                value={cancelReason}
                                                onChange={(e) => setCancelReason(e.target.value)}
                                                rows={3}
                                            />
                                        </div>
                                        <small className="text-muted">สต็อกที่จองไว้จะถูกคืนแล้ว</small>
                                    </>
                                )}
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={() => setConfirmDialog(null)}>ยกเลิก</button>
                                <button
                                    type="button"
                                    className={`btn ${confirmDialog.action === 'cancel' ? 'btn-danger' : 'btn-primary'}`}
                                    onClick={confirmAction}
                                >
                                    ยืนยัน
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}