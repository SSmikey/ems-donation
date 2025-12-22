'use client';

import { useState } from 'react';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import styles from './warehouse.module.css';

interface InventoryItem {
    id: string;
    name: string;
    category: string;
    quantity: number;
    unit: string;
    status: 'พอเพียง' | 'เหลือน้อย' | 'ขาดแคลน';
}

const MOCK_INVENTORY: InventoryItem[] = [
    { id: '1', name: 'ข้าวสาร (5กก.)', category: 'อาหาร', quantity: 500, unit: 'ถุง', status: 'พอเพียง' },
    { id: '2', name: 'น้ำดื่ม (1.5ลิตร)', category: 'น้ำดื่ม', quantity: 1200, unit: 'แพ็ค', status: 'พอเพียง' },
    { id: '3', name: 'หน้ากากอนามัย', category: 'ยาและเวชภัณฑ์', quantity: 50, unit: 'กล่อง', status: 'ขาดแคลน' },
    { id: '4', name: 'ปลากระป๋อง', category: 'อาหาร', quantity: 300, unit: 'แพ็ค', status: 'เหลือน้อย' },
    { id: '5', name: 'ยาพาราเซตามอล', category: 'ยาและเวชภัณฑ์', quantity: 150, unit: 'กระปุก', status: 'พอเพียง' },
    { id: '6', name: 'ผ้าห่มคงทน', category: 'เครื่องนิ่งห่ม', quantity: 80, unit: 'ผืน', status: 'ขาดแคลน' },
];

export default function WarehousePage() {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [inventory, setInventory] = useState<InventoryItem[]>(MOCK_INVENTORY);
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('all');

    const filteredItems = inventory.filter(item => {
        const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
        return matchesSearch && matchesCategory;
    });

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'พอเพียง': return '#4ade80';
            case 'เหลือน้อย': return '#fbbf24';
            case 'ขาดแคลน': return '#f87171';
            default: return '#ccc';
        }
    };

    const getStockPercentage = (status: string) => {
        switch (status) {
            case 'พอเพียง': return '85%';
            case 'เหลือน้อย': return '40%';
            case 'ขาดแคลน': return '15%';
            default: return '0%';
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
                            <button className={styles.primaryButton}>+ เพิ่มรายการสินค้าใหม่</button>
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
                            {filteredItems.map(item => (
                                <tr key={item.id}>
                                    <td style={{ fontWeight: '500' }}>{item.name}</td>
                                    <td><span className={styles.categoryTag}>{item.category}</span></td>
                                    <td style={{ color: getStatusColor(item.status), fontWeight: '600' }}>{item.quantity.toLocaleString()}</td>
                                    <td>{item.unit}</td>
                                    <td>
                                        <div className={styles.stockLevel}>
                                            <div className={styles.levelBar}>
                                                <div
                                                    className={styles.levelFill}
                                                    style={{
                                                        width: getStockPercentage(item.status),
                                                        backgroundColor: getStatusColor(item.status)
                                                    }}
                                                ></div>
                                            </div>
                                            <span style={{ fontSize: '12px' }}>{item.status}</span>
                                        </div>
                                    </td>
                                    <td>
                                        <div className={styles.actions}>
                                            <button className={styles.editBtn} title="แก้ไข">✏️</button>
                                            <button className={styles.deleteBtn} title="ลบ">🗑️</button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {filteredItems.length === 0 && (
                        <div style={{ textAlign: 'center', marginTop: '50px', color: 'rgba(255,255,255,0.4)' }}>
                            <p>ไม่พบรายการสินค้าที่ต้องการ</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
