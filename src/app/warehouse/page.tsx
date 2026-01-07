'use client';

import { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import Toast from '@/components/Toast';
import InventoryModal from './InventoryModal';
import FormSelect from '@/components/FormSelect';

interface InventoryItem {
    _id: string;
    itemName: string;
    category: string;
    quantity: number;
    reservedQuantity: number;
    unit: string;
    lastUpdated?: string;
}

export default function WarehousePage() {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [inventory, setInventory] = useState<InventoryItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' } | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);

    const fetchInventory = async () => {
        try {
            setLoading(true);
            const res = await fetch('/api/inventory');
            const data = await res.json();
            if (data.success) {
                setInventory(data.data);
            }
        } catch (error) {
            console.error('Fetch inventory error:', error);
            setToast({ message: 'ไม่สามารถโหลดข้อมูลสินค้าได้', type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchInventory();
    }, []);

    const filteredItems = inventory.filter(item => {
        const matchesSearch = item.itemName.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
        return matchesSearch && matchesCategory;
    });

    const getStatusInfo = (available: number) => {
        if (available >= 100) return { label: 'พอเพียง', color: '#4ade80', percent: '100%' };
        if (available >= 20) return { label: 'เหลือน้อย', color: '#fbbf24', percent: '40%' };
        return { label: 'ขาดแคลน', color: '#f87171', percent: '15%' };
    };

    const handleDelete = async (id: string, name: string) => {
        if (!confirm(`ยืนยันการลบรายการ: ${name}?`)) return;

        try {
            const res = await fetch(`/api/inventory/${id}`, { method: 'DELETE' });
            if (res.ok) {
                setToast({ message: 'ลบรายการสำเร็จ', type: 'success' });
                fetchInventory();
            } else {
                const data = await res.json();
                setToast({ message: data.error || 'ลบไม่สำเร็จ', type: 'error' });
            }
        } catch (error) {
            setToast({ message: 'เกิดข้อผิดพลาดในการลบ', type: 'error' });
        }
    };

    return (
        <div className="d-flex" style={{ minHeight: '100vh', background: '#ffffff', color: '#111827' }}>
            <Sidebar isOpen={sidebarOpen} />
            <div className="flex-grow-1 d-flex flex-column" style={{ overflow: 'hidden' }}>
                <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />

                <div className="flex-grow-1 overflow-y-auto p-4" style={{ backgroundColor: '#f8f9fa' }}>
                    {/* Header Section */}
                    <div className="d-flex justify-content-between align-items-center mb-4">
                        <h1 className="fw-bold" style={{ fontSize: '28px', margin: 0, color: '#111827' }}>
                            คลังสินค้าส่วนกลาง
                        </h1>
                        <button
                            className="btn btn-primary fw-bold px-4 py-2"
                            style={{ fontSize: '15px', borderRadius: '8px' }}
                            onClick={() => {
                                setEditingItem(null);
                                setIsModalOpen(true);
                            }}
                        >
                            + เพิ่มรายการสินค้าใหม่
                        </button>
                    </div>

                    {/* Summary Cards */}
                    <div className="row g-3 mb-4">
                        <div className="col-12 col-sm-6 col-lg-3">
                            <div className="card shadow-sm border-0 h-100">
                                <div className="card-body">
                                    <div>
                                        <p className="text-muted mb-1" style={{ fontSize: '14px' }}>จำนวนสินค้าทั้งหมด</p>
                                        <h3 className="fw-bold mb-0" style={{ fontSize: '28px', color: '#111827' }}>
                                            {inventory.reduce((sum, item) => sum + (item.quantity - (item.reservedQuantity || 0)), 0)}
                                        </h3>
                                        <p className="text-muted mb-0" style={{ fontSize: '13px' }}>ชิ้น</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="col-12 col-sm-6 col-lg-3">
                            <div className="card shadow-sm border-0 h-100" style={{ borderLeft: '4px solid #4ade80' }}>
                                <div className="card-body">
                                    <div>
                                        <p className="text-muted mb-1" style={{ fontSize: '14px' }}>รายการทั้งหมด</p>
                                        <h3 className="fw-bold mb-0" style={{ fontSize: '28px', color: '#4ade80' }}>
                                            {inventory.length}
                                        </h3>
                                        <p className="text-muted mb-0" style={{ fontSize: '13px' }}>รายการ</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="col-12 col-sm-6 col-lg-3">
                            <div className="card shadow-sm border-0 h-100" style={{ borderLeft: '4px solid #fbbf24' }}>
                                <div className="card-body">
                                    <div>
                                        <p className="text-muted mb-1" style={{ fontSize: '14px' }}>เหลือน้อย</p>
                                        <h3 className="fw-bold mb-0" style={{ fontSize: '28px', color: '#fbbf24' }}>
                                            {inventory.filter(item => {
                                                const available = item.quantity - (item.reservedQuantity || 0);
                                                return available >= 20 && available < 100;
                                            }).length}
                                        </h3>
                                        <p className="text-muted mb-0" style={{ fontSize: '13px' }}>รายการ</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="col-12 col-sm-6 col-lg-3">
                            <div className="card shadow-sm border-0 h-100" style={{ borderLeft: '4px solid #f87171' }}>
                                <div className="card-body">
                                    <div>
                                        <p className="text-muted mb-1" style={{ fontSize: '14px' }}>ขาดแคลน</p>
                                        <h3 className="fw-bold mb-0" style={{ fontSize: '28px', color: '#f87171' }}>
                                            {inventory.filter(item => (item.quantity - (item.reservedQuantity || 0)) < 20).length}
                                        </h3>
                                        <p className="text-muted mb-0" style={{ fontSize: '13px' }}>รายการ</p>
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
                                <div className="col-12 col-md-8">
                                    <label className="form-label" style={{
                                        color: '#6b7280',
                                        fontSize: '12px',
                                        fontWeight: 600,
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.025em',
                                        marginBottom: '6px',
                                        display: 'block'
                                    }}>
                                        ค้นหาสินค้า
                                    </label>
                                    <div className="position-relative">
                                        <span className="position-absolute" style={{ left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}>
                                            <i className="bi bi-search"></i>
                                        </span>
                                        <input
                                            type="text"
                                            placeholder="ค้นหาชื่อสินค้า..."
                                            className="form-control"
                                            style={{
                                                background: '#ffffff',
                                                border: '1px solid #e5e7eb',
                                                color: '#111827',
                                                borderRadius: '10px',
                                                height: '44px',
                                                padding: '0 16px 0 40px',
                                                fontSize: '14px',
                                                transition: 'all 0.25s ease'
                                            }}
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
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
                                <div className="col-12 col-md-4">
                                    <FormSelect
                                        label="หมวดหมู่"
                                        value={categoryFilter}
                                        onChange={setCategoryFilter}
                                        options={[
                                            { value: 'all', label: 'ทั้งหมด' },
                                            { value: 'อาหาร', label: 'อาหาร' },
                                            { value: 'น้ำดื่ม', label: 'น้ำดื่ม' },
                                            { value: 'ยาและเวชภัณฑ์', label: 'ยาและเวชภัณฑ์' },
                                            { value: 'เครื่องนุ่งห่ม', label: 'เครื่องนุ่งห่ม' }
                                        ]}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {loading ? (
                        <div className="text-center py-5">
                            <div className="spinner-border text-primary" role="status">
                                <span className="visually-hidden">Loading...</span>
                            </div>
                            <p className="mt-3" style={{ color: '#868e96', fontSize: '15px' }}>กำลังโหลดข้อมูลคลังสินค้า...</p>
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
                                                    <th style={{ color: '#495057', fontSize: '15px', fontWeight: '600', padding: '16px' }}>ชื่อสินค้า</th>
                                                    <th style={{ color: '#495057', fontSize: '15px', fontWeight: '600', padding: '16px' }}>หมวดหมู่</th>
                                                    <th style={{ color: '#495057', fontSize: '15px', fontWeight: '600', padding: '16px' }} className="text-center">สต็อกจริง</th>
                                                    <th style={{ color: '#495057', fontSize: '15px', fontWeight: '600', padding: '16px' }} className="text-center">จองแล้ว</th>
                                                    <th style={{ color: '#495057', fontSize: '15px', fontWeight: '600', padding: '16px' }} className="text-center">ใช้ได้จริง</th>
                                                    <th style={{ color: '#495057', fontSize: '15px', fontWeight: '600', padding: '16px' }}>หน่วย</th>
                                                    <th style={{ color: '#495057', fontSize: '15px', fontWeight: '600', padding: '16px' }}>สถานะสต็อก</th>
                                                    <th style={{ color: '#495057', fontSize: '15px', fontWeight: '600', padding: '16px' }}>จัดการ</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {filteredItems.map(item => {
                                                    const reserved = item.reservedQuantity || 0;
                                                    const available = item.quantity - reserved;
                                                    const status = getStatusInfo(available);
                                                    return (
                                                        <tr key={item._id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                                                            <td style={{ fontWeight: '600', color: '#212529', fontSize: '15px', padding: '16px' }}>{item.itemName}</td>
                                                            <td style={{ padding: '16px' }}>
                                                                <span className="badge bg-secondary" style={{ fontSize: '13px', padding: '6px 12px' }}>{item.category}</span>
                                                            </td>
                                                            <td className="text-center" style={{ color: '#6c757d', fontSize: '15px', padding: '16px' }}>{item.quantity.toLocaleString()}</td>
                                                            <td className="text-center" style={{ color: '#fbbf24', fontSize: '15px', fontWeight: '600', padding: '16px' }}>{reserved > 0 ? reserved.toLocaleString() : '-'}</td>
                                                            <td className="text-center" style={{ color: status.color, fontWeight: '700', fontSize: '16px', padding: '16px' }}>{available.toLocaleString()}</td>
                                                            <td style={{ color: '#6c757d', fontSize: '15px', padding: '16px' }}>{item.unit}</td>
                                                            <td style={{ padding: '16px' }}>
                                                                <div className="d-flex align-items-center gap-2">
                                                                    <div style={{ flex: 1, height: '8px', background: '#e9ecef', borderRadius: '4px', overflow: 'hidden', minWidth: '60px' }}>
                                                                        <div
                                                                            style={{
                                                                                width: status.percent,
                                                                                height: '100%',
                                                                                backgroundColor: status.color,
                                                                                borderRadius: '4px'
                                                                            }}
                                                                        ></div>
                                                                    </div>
                                                                    <span style={{ fontSize: '13px', minWidth: '60px', color: '#6c757d', fontWeight: '500' }}>{status.label}</span>
                                                                </div>
                                                            </td>
                                                            <td style={{ padding: '16px' }}>
                                                                <div className="d-flex gap-2">
                                                                    <button
                                                                        className="btn btn-sm btn-warning"
                                                                        style={{ fontSize: '14px', padding: '6px 12px', borderRadius: '6px' }}
                                                                        title="แก้ไข"
                                                                        onClick={() => {
                                                                            setEditingItem(item);
                                                                            setIsModalOpen(true);
                                                                        }}
                                                                    >
                                                                        แก้ไข
                                                                    </button>
                                                                    <button
                                                                        className="btn btn-sm btn-danger"
                                                                        style={{ fontSize: '14px', padding: '6px 12px', borderRadius: '6px' }}
                                                                        title="ลบ"
                                                                        onClick={() => handleDelete(item._id, item.itemName)}
                                                                    >
                                                                        ลบ
                                                                    </button>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>

                            {filteredItems.length === 0 && (
                                <div className="card shadow-sm border-0 text-center py-5">
                                    <div className="card-body">
                                        <h5 className="fw-bold" style={{ color: '#6c757d', fontSize: '18px' }}>ไม่พบรายการสินค้าที่ต้องการ</h5>
                                        <p style={{ color: '#adb5bd', fontSize: '15px', marginTop: '8px' }}>ลองปรับเงื่อนไขการค้นหาใหม่</p>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
            {isModalOpen && (
                <InventoryModal
                    item={editingItem}
                    onClose={() => setIsModalOpen(false)}
                    onSuccess={() => {
                        setIsModalOpen(false);
                        setToast({ message: editingItem ? 'แก้ไขข้อมูลสำเร็จ' : 'เพิ่มสินค้าใหม่สำเร็จ', type: 'success' });
                        fetchInventory();
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
