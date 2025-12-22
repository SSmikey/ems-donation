'use client';

import { useState } from 'react';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import styles from './quick-donation.module.css';

export default function QuickDonationPage() {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [category, setCategory] = useState('อาหาร');
    const [itemName, setItemName] = useState('');
    const [quantity, setQuantity] = useState('');
    const [unit, setUnit] = useState('ชิ้น');

    const categories = ['อาหาร', 'น้ำดื่ม', 'ยาและเวชภัณฑ์', 'เครื่องนุ่งห่ม', 'อื่นๆ'];

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        alert(`บันทึกสำเร็จ: ${itemName} (${category}) จำนวน ${quantity} ${unit}`);
        setItemName('');
        setQuantity('');
    };

    return (
        <div className={styles.container}>
            <Sidebar isOpen={sidebarOpen} />
            <div className={styles.mainContent}>
                <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />

                <div className={styles.contentArea}>
                    <div className={styles.formCard}>
                        <div className={styles.formHeader}>
                            <h1>⚡ บันทึกของเข้าด่วน (Quick Donation)</h1>
                            <p style={{ color: 'rgba(255,255,255,0.5)' }}>รับของบริจาคเข้าสต็อกส่วนกลางอย่างรวดเร็ว</p>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div className={styles.formGroup}>
                                <label>เลือกหมวดหมู่</label>
                                <div className={styles.categoryGroup}>
                                    {categories.map((cat) => (
                                        <button
                                            key={cat}
                                            type="button"
                                            className={`${styles.categoryBtn} ${category === cat ? styles.categoryBtnActive : ''}`}
                                            onClick={() => setCategory(cat)}
                                        >
                                            {cat}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className={styles.formGroup}>
                                <label>ชื่อรายการสิ่งของ</label>
                                <input
                                    type="text"
                                    placeholder="เช่น ข้าวสาร, ยาแก้ปวด..."
                                    className={styles.inputField}
                                    value={itemName}
                                    onChange={(e) => setItemName(e.target.value)}
                                    required
                                />
                            </div>

                            <div className={styles.row}>
                                <div className={styles.formGroup}>
                                    <label>จำนวน</label>
                                    <input
                                        type="number"
                                        placeholder="0"
                                        className={styles.inputField}
                                        value={quantity}
                                        onChange={(e) => setQuantity(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className={styles.formGroup}>
                                    <label>หน่วย</label>
                                    <select
                                        className={styles.inputField}
                                        value={unit}
                                        onChange={(e) => setUnit(e.target.value)}
                                    >
                                        <option value="ชิ้น">ชิ้น</option>
                                        <option value="ถุง">ถุง</option>
                                        <option value="แพ็ค">แพ็ค</option>
                                        <option value="กล่อง">กล่อง</option>
                                        <option value="กิโลกรัม">กิโลกรัม</option>
                                    </select>
                                </div>
                            </div>

                            <button type="submit" className={styles.submitBtn}>
                                ยืนยันการบันทึก (Confirm)
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
