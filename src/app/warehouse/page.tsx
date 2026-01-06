'use client';

import { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import Toast from '@/components/Toast';
import InventoryModal from './InventoryModal';

interface InventoryItem {
    _id: string;
    itemName: string;
    category: string;
    quantity: number;
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

    const getStatusInfo = (quantity: number) => {
        if (quantity >= 100) return { label: 'พอเพียง', color: '#4ade80', percent: '100%' };
        if (quantity >= 20) return { label: 'เหลือน้อย', color: '#fbbf24', percent: '40%' };
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
        <div className="d-flex" style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)', color: '#ffffff' }}>
            <Sidebar isOpen={sidebarOpen} />
            <div className="flex-grow-1 d-flex flex-column" style={{ overflow: 'hidden' }}>
                <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />

                <div className="flex-grow-1 overflow-y-auto p-4">
                    <div className="d-flex justify-content-between align-items-center mb-4">
                        <div>
                            <h1 className="fw-bold" style={{ fontSize: '32px', margin: 0 }}>
                                คลังสินค้าส่วนกลาง (Central Warehouse)
                            </h1>
                        </div>
                        <div>
                            <button
                                className="btn btn-primary fw-bold"
                                onClick={() => {
                                    setEditingItem(null);
                                    setIsModalOpen(true);
                                }}
                            >
                                + เพิ่มรายการสินค้าใหม่
                            </button>
                        </div>
                    </div>

                    <div className="row g-3 mb-4">
                        <div className="col-12 col-md-8">
                            <label className="form-label" style={{ color: 'rgba(255, 255, 255, 0.6)' }}>ค้นหาสินค้า</label>
                            <input
                                type="text"
                                placeholder="ค้นหาชื่อสินค้า..."
                                className="form-control"
                                style={{ background: 'rgba(0, 0, 0, 0.2)', border: '1px solid rgba(255, 255, 255, 0.1)', color: '#fff', borderRadius: '8px' }}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="col-12 col-md-4">
                            <label className="form-label" style={{ color: 'rgba(255, 255, 255, 0.6)' }}>หมวดหมู่</label>
                            <select
                                className="form-select"
                                style={{ background: 'rgba(0, 0, 0, 0.2)', border: '1px solid rgba(255, 255, 255, 0.1)', color: '#fff', borderRadius: '8px' }}
                                value={categoryFilter}
                                onChange={(e) => setCategoryFilter(e.target.value)}
                            >
                                <option value="all">ทั้งหมด</option>
                                <option value="อาหาร">อาหาร</option>
                                <option value="น้ำดื่ม">น้ำดื่ม</option>
                                <option value="ยาและเวชภัณฑ์">ยาและเวชภัณฑ์</option>
                                <option value="เครื่องนุ่งห่ม">เครื่องนุ่งห่ม</option>
                            </select>
                        </div>
                    </div>

                    {loading ? (
                        <div className="text-center" style={{ marginTop: '50px', color: 'rgba(255,255,255,0.4)' }}>
                            <p>กำลังโหลดข้อมูลคลังสินค้า...</p>
                        </div>
                    ) : (
                        <>
                            <div className="table-responsive">
                                <table className="table table-hover align-middle" style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}>
                                    <thead style={{ borderColor: 'rgba(255, 255, 255, 0.1)', color: 'rgba(255, 255, 255, 0.7)' }}>
                                        <tr>
                                            <th>ชื่อสินค้า</th>
                                            <th>หมวดหมู่</th>
                                            <th>จำนวนคงเหลือ</th>
                                            <th>หน่วย</th>
                                            <th>สถานะสต็อก</th>
                                            <th>จัดการ</th>
                                        </tr>
                                    </thead>
                                    <tbody style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}>
                                        {filteredItems.map(item => {
                                            const status = getStatusInfo(item.quantity);
                                            return (
                                                <tr key={item._id} style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}>
                                                    <td style={{ fontWeight: '500' }}>{item.itemName}</td>
                                                    <td>
                                                        <span className="badge bg-secondary">{item.category}</span>
                                                    </td>
                                                    <td style={{ color: status.color, fontWeight: '600' }}>{item.quantity.toLocaleString()}</td>
                                                    <td>{item.unit}</td>
                                                    <td>
                                                        <div className="d-flex align-items-center gap-2">
                                                            <div style={{ flex: 1, height: '8px', background: 'rgba(255, 255, 255, 0.1)', borderRadius: '4px', overflow: 'hidden', minWidth: '60px' }}>
                                                                <div
                                                                    style={{
                                                                        width: status.percent,
                                                                        height: '100%',
                                                                        backgroundColor: status.color,
                                                                        borderRadius: '4px'
                                                                    }}
                                                                ></div>
                                                            </div>
                                                            <span style={{ fontSize: '12px', minWidth: '60px' }}>{status.label}</span>
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <div className="d-flex gap-2">
                                                            <button
                                                                className="btn btn-sm btn-warning"
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

                            {filteredItems.length === 0 && (
                                <div className="text-center" style={{ marginTop: '50px', color: 'rgba(255,255,255,0.4)' }}>
                                    <p>ไม่พบรายการสินค้าที่ต้องการ</p>
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
