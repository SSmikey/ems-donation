'use client';

import { useState } from 'react';
import * as XLSX from 'xlsx';
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
    const [importedData, setImportedData] = useState<any[]>([]);
    const [isImporting, setIsImporting] = useState(false);

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

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (evt) => {
            try {
                const data = new Uint8Array(evt.target?.result as ArrayBuffer);
                const workbook = XLSX.read(data, { type: 'array' });
                const sheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[sheetName];
                const jsonData = XLSX.utils.sheet_to_json(worksheet);
                
                // Map ข้อมูลให้ตรงกับ Structure ของเรา (รองรับทั้ง Header ไทยและอังกฤษ)
                const mappedData = jsonData.map((row: any) => ({
                    category: row['หมวดหมู่'] || row['Category'] || 'อื่นๆ',
                    itemName: row['ชื่อรายการ'] || row['ItemName'] || '',
                    quantity: Number(row['จำนวน'] || row['Quantity'] || 0),
                    unit: row['หน่วย'] || row['Unit'] || 'ชิ้น'
                })).filter(item => item.itemName); // กรองแถวที่ไม่มีชื่อออก

                setImportedData(mappedData);
                setIsImporting(true);
                setToast({ message: `อ่านไฟล์สำเร็จ พบข้อมูล ${mappedData.length} รายการ`, type: 'success' });
            } catch (error) {
                console.error('Excel read error:', error);
                setToast({ message: 'เกิดข้อผิดพลาดในการอ่านไฟล์ Excel', type: 'error' });
            }
        };
        reader.readAsArrayBuffer(file);
    };

    const handleBulkSubmit = async () => {
        let successCount = 0;
        let failCount = 0;

        // Loop บันทึกทีละรายการ (หรือจะปรับเป็น Bulk API ทีเดียวก็ได้ถ้า Backend รองรับ)
        for (const item of importedData) {
            try {
                const res = await fetch('/api/inventory', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(item)
                });
                if (res.ok) successCount++;
                else failCount++;
            } catch (error) {
                failCount++;
            }
        }

        setToast({ 
            message: `บันทึกเสร็จสิ้น: สำเร็จ ${successCount}, ล้มเหลว ${failCount}`, 
            type: failCount === 0 ? 'success' : 'error' 
        });

        if (successCount > 0) {
            setImportedData([]);
            setIsImporting(false);
        }
    };

    return (
        <div className="d-flex" style={{ minHeight: '100vh', background: '#ffffff', color: '#212529' }}>
            <Sidebar isOpen={sidebarOpen} />
            <div className="flex-grow-1 d-flex flex-column" style={{ overflow: 'hidden' }}>
                <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />

                <div className="flex-grow-1 overflow-y-auto d-flex justify-content-center align-items-start p-4" style={{ paddingTop: '40px', backgroundColor: '#f8f9fa' }}>
                    <div className="card shadow-lg border-0" style={{ width: '100%', maxWidth: isImporting ? '900px' : '600px', background: '#ffffff', border: '1px solid #dee2e6', transition: 'max-width 0.3s' }}>
                        <div className="card-body p-5">
                            <div className="text-center mb-4">
                                <h2 className="fw-bold mb-2" style={{ fontSize: '24px', color: '#212529' }}>บันทึกของเข้าด่วน (Quick Donation)</h2>
                                <p style={{ color: '#868e96', marginBottom: 0 }}>รับของบริจาคเข้าสต็อกส่วนกลางอย่างรวดเร็ว</p>
                                
                                {/* ปุ่ม Import Excel */}
                                <div className="mt-3">
                                    {!isImporting ? (
                                        <label className="btn btn-outline-primary btn-sm" style={{ borderRadius: '20px' }}>
                                            <i className="bi bi-file-earmark-excel me-2"></i> Import from Excel
                                            <input type="file" accept=".xlsx, .xls" hidden onChange={handleFileUpload} />
                                        </label>
                                    ) : (
                                        <button 
                                            className="btn btn-outline-secondary btn-sm" 
                                            onClick={() => { setIsImporting(false); setImportedData([]); }}
                                            style={{ borderRadius: '20px' }}
                                        >
                                            ยกเลิกการ Import
                                        </button>
                                    )}
                                </div>
                            </div>

                            {isImporting ? (
                                // ส่วนแสดงผลตาราง Preview ข้อมูลจาก Excel
                                <div>
                                    <div className="table-responsive mb-4" style={{ maxHeight: '400px' }}>
                                        <table className="table table-bordered table-hover">
                                            <thead className="table-light">
                                                <tr>
                                                    <th>หมวดหมู่</th>
                                                    <th>ชื่อรายการ</th>
                                                    <th>จำนวน</th>
                                                    <th>หน่วย</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {importedData.map((item, index) => (
                                                    <tr key={index}>
                                                        <td>{item.category}</td>
                                                        <td>{item.itemName}</td>
                                                        <td>{item.quantity}</td>
                                                        <td>{item.unit}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                    <div className="d-flex gap-2">
                                        <button 
                                            className="btn btn-success w-100 fw-bold" 
                                            onClick={handleBulkSubmit}
                                            style={{ padding: '16px', fontSize: '18px', borderRadius: '12px' }}
                                        >
                                            ยืนยันการนำเข้า {importedData.length} รายการ
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                // ฟอร์มเดิมสำหรับการกรอกทีละรายการ
                                <form onSubmit={handleSubmit}>
                                <div className="mb-3">
                                    <label className="form-label" style={{ color: '#495057', fontSize: '14px' }}>
                                        เลือกหมวดหมู่
                                    </label>
                                    <div className="d-flex gap-2 flex-wrap">
                                        {categories.map((cat) => (
                                            <button
                                                key={cat}
                                                type="button"
                                                className={category === cat ? 'btn btn-success btn-sm' : 'btn btn-outline-secondary btn-sm'}
                                                onClick={() => setCategory(cat)}
                                                style={{ borderRadius: '20px', fontSize: '13px' }}
                                            >
                                                {cat}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="mb-3">
                                    <label className="form-label" style={{ color: '#495057' }}>
                                        ชื่อรายการสิ่งของ
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="เช่น ข้าวสาร, ยาแก้ปวด..."
                                        className="form-control"
                                        style={{
                                            background: '#ffffff',
                                            border: '1px solid #dee2e6',
                                            color: '#212529',
                                            borderRadius: '12px'
                                        }}
                                        value={itemName}
                                        onChange={(e) => setItemName(e.target.value)}
                                        required
                                    />
                                </div>

                                <div className="row g-3 mb-3">
                                    <div className="col-8">
                                        <label className="form-label" style={{ color: '#495057' }}>
                                            จำนวน
                                        </label>
                                        <input
                                            type="number"
                                            placeholder="0"
                                            className="form-control"
                                            style={{
                                                background: '#ffffff',
                                                border: '1px solid #dee2e6',
                                                color: '#212529',
                                                borderRadius: '12px'
                                            }}
                                            value={quantity}
                                            onChange={(e) => setQuantity(e.target.value)}
                                            required
                                        />
                                    </div>
                                    <div className="col-4">
                                        <label className="form-label" style={{ color: '#495057' }}>
                                            หน่วย
                                        </label>
                                        <select
                                            className="form-select"
                                            style={{
                                                background: '#ffffff',
                                                border: '1px solid #dee2e6',
                                                color: '#212529',
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
                            )}
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
