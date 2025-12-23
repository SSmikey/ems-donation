'use client';

import { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import styles from './warehouse.module.css';
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
        <div className={styles.container}>
            <Sidebar isOpen={sidebarOpen} />
            <div className={styles.mainContent}>
                <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />

                <div className={styles.contentArea}>
                    <div className={styles.pageHeader}>
                        <div>
                            <h1>คลังสินค้าส่วนกลาง (Central Warehouse)</h1>
                            <p style={{ color: 'rgba(255,255,255,0.5)', marginTop: '5px' }}>จัดการสต็อกสิ่งของบริจาคและทรัพยากรทั้งหมด</p>
                        </div>
                        <div className={styles.actionButtons}>
                            <button
                                className={styles.primaryButton}
                                onClick={() => {
                                    setEditingItem(null);
                                    setIsModalOpen(true);
                                }}
                            >
                                + เพิ่มรายการสินค้าใหม่
                            </button>
                        </div>
                    </div>

                    <div className={styles.filterSection}>
                        <div className={styles.filterGroup} style={{ flex: 1 }}>
                            <label>ค้นหาสินค้า</label>
                            <input
                                type="text"
                                placeholder="ค้นหาชื่อสินค้า..."
                                className={styles.inputField}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className={styles.filterGroup}>
                            <label>หมวดหมู่</label>
                            <select
                                className={styles.inputField}
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
                        <div style={{ textAlign: 'center', marginTop: '50px', color: 'rgba(255,255,255,0.4)' }}>
                            <p>กำลังโหลดข้อมูลคลังสินค้า...</p>
                        </div>
                    ) : (
                        <>
                            <table className={styles.inventoryTable}>
                                <thead>
                                    <tr>
                                        <th>ชื่อสินค้า</th>
                                        <th>หมวดหมู่</th>
                                        <th>จำนวนคงเหลือ</th>
                                        <th>หน่วย</th>
                                        <th>สถานะสต็อก</th>
                                        <th>จัดการ</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredItems.map(item => {
                                        const status = getStatusInfo(item.quantity);
                                        return (
                                            <tr key={item._id}>
                                                <td style={{ fontWeight: '500' }}>{item.itemName}</td>
                                                <td><span className={styles.categoryTag}>{item.category}</span></td>
                                                <td style={{ color: status.color, fontWeight: '600' }}>{item.quantity.toLocaleString()}</td>
                                                <td>{item.unit}</td>
                                                <td>
                                                    <div className={styles.stockLevel}>
                                                        <div className={styles.levelBar}>
                                                            <div
                                                                className={styles.levelFill}
                                                                style={{
                                                                    width: status.percent,
                                                                    backgroundColor: status.color
                                                                }}
                                                            ></div>
                                                        </div>
                                                        <span style={{ fontSize: '12px' }}>{status.label}</span>
                                                    </div>
                                                </td>
                                                <td>
                                                    <div className={styles.actions}>
                                                        <button
                                                            className={styles.editBtn}
                                                            title="แก้ไข"
                                                            onClick={() => {
                                                                setEditingItem(item);
                                                                setIsModalOpen(true);
                                                            }}
                                                        >
                                                            ✏️
                                                        </button>
                                                        <button
                                                            className={styles.deleteBtn}
                                                            title="ลบ"
                                                            onClick={() => handleDelete(item._id, item.itemName)}
                                                        >
                                                            🗑️
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>

                            {filteredItems.length === 0 && (
                                <div style={{ textAlign: 'center', marginTop: '50px', color: 'rgba(255,255,255,0.4)' }}>
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
