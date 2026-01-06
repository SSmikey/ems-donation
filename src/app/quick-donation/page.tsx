'use client';

import { useState } from 'react';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import Toast from '@/components/Toast';

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
        <div className="d-flex" style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)', color: '#ffffff' }}>
            <Sidebar isOpen={sidebarOpen} />
            <div className="flex-grow-1 d-flex flex-column" style={{ overflow: 'hidden' }}>
                <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />

                <div className="flex-grow-1 overflow-y-auto d-flex justify-content-center align-items-start p-4" style={{ paddingTop: '40px' }}>
                    <div className="card shadow-lg border-0" style={{ width: '100%', maxWidth: '600px', background: 'rgba(255, 255, 255, 0.05)', backdropFilter: 'blur(20px)' }}>
                        <div className="card-body p-5">
                            <div className="text-center mb-4">
                                <h2 className="fw-bold mb-2" style={{ fontSize: '24px' }}>⚡ บันทึกของเข้าด่วน (Quick Donation)</h2>
                                <p style={{ color: 'rgba(255,255,255,0.5)', marginBottom: 0 }}>รับของบริจาคเข้าสต็อกส่วนกลางอย่างรวดเร็ว</p>
                            </div>

                            <form onSubmit={handleSubmit}>
                                <div className="mb-3">
                                    <label className="form-label" style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '14px' }}>
                                        เลือกหมวดหมู่
                                    </label>
                                    <div className="d-flex gap-2 flex-wrap">
                                        {categories.map((cat) => (
                                            <button
                                                key={cat}
                                                type="button"
                                                className={category === cat ? 'btn btn-success btn-sm' : 'btn btn-outline-light btn-sm'}
                                                onClick={() => setCategory(cat)}
                                                style={{ borderRadius: '20px', fontSize: '13px' }}
                                            >
                                                {cat}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="mb-3">
                                    <label className="form-label" style={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                                        ชื่อรายการสิ่งของ
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="เช่น ข้าวสาร, ยาแก้ปวด..."
                                        className="form-control"
                                        style={{
                                            background: 'rgba(0, 0, 0, 0.2)',
                                            border: '1px solid rgba(255, 255, 255, 0.1)',
                                            color: '#fff',
                                            borderRadius: '12px'
                                        }}
                                        value={itemName}
                                        onChange={(e) => setItemName(e.target.value)}
                                        required
                                    />
                                </div>

                                <div className="row g-3 mb-3">
                                    <div className="col-8">
                                        <label className="form-label" style={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                                            จำนวน
                                        </label>
                                        <input
                                            type="number"
                                            placeholder="0"
                                            className="form-control"
                                            style={{
                                                background: 'rgba(0, 0, 0, 0.2)',
                                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                                color: '#fff',
                                                borderRadius: '12px'
                                            }}
                                            value={quantity}
                                            onChange={(e) => setQuantity(e.target.value)}
                                            required
                                        />
                                    </div>
                                    <div className="col-4">
                                        <label className="form-label" style={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                                            หน่วย
                                        </label>
                                        <select
                                            className="form-select"
                                            style={{
                                                background: 'rgba(0, 0, 0, 0.2)',
                                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                                color: '#fff',
                                                borderRadius: '12px'
                                            }}
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

                                <button type="submit" className="btn btn-success w-100 fw-bold" style={{ padding: '16px', fontSize: '18px', borderRadius: '12px' }}>
                                    ยืนยันการบันทึก (Confirm)
                                </button>
                            </form>
                        </div>
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
