'use client';

import { useState } from 'react';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import styles from './quick-donation.module.css';
import Toast from '@/components/Toast';
import 'bootstrap/dist/css/bootstrap.min.css';

export default function QuickDonationPage() {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [category, setCategory] = useState('อาหาร');
    const [itemName, setItemName] = useState('');
    const [quantity, setQuantity] = useState('');
    const [unit, setUnit] = useState('ชิ้น');
    const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' } | null>(null);

    const categories = ['อาหาร', 'น้ำดื่ม', 'ยาและเวชภัณฑ์', 'เครื่องนุ่งห่ม', 'อื่นๆ'];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const res = await fetch('/api/inventory', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    itemName,
                    category,
                    quantity: Number(quantity),
                    unit
                })
            });

            const data = await res.json();

            if (res.ok) {
                setToast({ message: `บันทึกสำเร็จ: ${itemName}`, type: 'success' });
                setItemName('');
                setQuantity('');
            } else {
                setToast({ message: data.error || 'เกิดข้อผิดพลาดในการบันทึก', type: 'error' });
            }
        } catch (error) {
            console.error('Submit error:', error);
            setToast({ message: 'ไม่สามารถติดต่อเซิร์ฟเวอร์ได้', type: 'error' });
        }
    };

    return (
        <div className={`d-flex min-vh-100 ${styles.container}`}>
            <Sidebar isOpen={sidebarOpen} />
            <div className={`flex-grow-1 d-flex flex-column ${styles.mainContent}`}>
                <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />

                <div className={`flex-grow-1 d-flex justify-content-center align-items-start p-4 p-md-5 ${styles.contentArea}`}>
                    <div className={styles.formCard}>
                        <div className={`text-center mb-4 ${styles.formHeader}`}>
                            <h1 className="fw-bold text-white" style={{ fontSize: '24px', marginBottom: '10px' }}>บันทึกของเข้าด่วน (Quick Donation)</h1>
                            <p style={{ color: 'rgba(255,255,255,0.5)', margin: 0 }}>รับของบริจาคเข้าสต็อกส่วนกลางอย่างรวดเร็ว</p>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div className={`d-flex flex-column gap-2 mb-3 ${styles.formGroup}`}>
                                <label className="small">เลือกหมวดหมู่</label>
                                <div className={`d-flex gap-2 flex-wrap ${styles.categoryGroup}`}>
                                    {categories.map((cat) => (
                                        <button
                                            key={cat}
                                            type="button"
                                            className={`btn btn-sm ${category === cat ? styles.categoryBtnActive : styles.categoryBtn}`}
                                            onClick={() => setCategory(cat)}
                                        >
                                            {cat}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className={`d-flex flex-column gap-2 mb-3 ${styles.formGroup}`}>
                                <label className="small">ชื่อรายการสิ่งของ</label>
                                <input
                                    type="text"
                                    placeholder="เช่น ข้าวสาร, ยาแก้ปวด..."
                                    className={styles.inputField}
                                    value={itemName}
                                    onChange={(e) => setItemName(e.target.value)}
                                    required
                                />
                            </div>

                            <div className={`row g-3 mb-3 ${styles.row}`}>
                                <div className={`col-6 ${styles.formGroup}`}>
                                    <label className="small">จำนวน</label>
                                    <input
                                        type="number"
                                        placeholder="0"
                                        className={styles.inputField}
                                        value={quantity}
                                        onChange={(e) => setQuantity(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className={`col-6 ${styles.formGroup}`}>
                                    <label className="small">หน่วย</label>
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

                            <button type="submit" className={`btn btn-primary w-100 fw-bold ${styles.submitBtn}`}>
                                ยืนยันการบันทึก (Confirm)
                            </button>
                        </form>
                    </div>
                </div>
            </div>
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
