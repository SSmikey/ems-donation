'use client';

import { useState } from 'react';
import * as XLSX from 'xlsx';
import Toast from '@/components/Toast';
import FormSelect from './FormSelect';

interface QuickDonationContentProps {
    onSuccess?: () => void;
}

export default function QuickDonationContent({ onSuccess }: QuickDonationContentProps) {
    const [category, setCategory] = useState('อาหาร');
    const [itemName, setItemName] = useState('');
    const [quantity, setQuantity] = useState('');
    const [unit, setUnit] = useState('ชิ้น');
    const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' } | null>(null);
    const [importedData, setImportedData] = useState<any[]>([]);
    const [isImporting, setIsImporting] = useState(false);
    const [isDragging, setIsDragging] = useState(false);

    const categories = ['อาหาร', 'น้ำดื่ม', 'ยาและเวชภัณฑ์', 'เครื่องนุ่งห่ม', 'อื่นๆ'];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const qtyNum = Number(quantity);
            if (isNaN(qtyNum) || qtyNum <= 0) {
                setToast({ message: 'กรุณาระบุจำนวนที่มากกว่า 0', type: 'error' });
                return;
            }

            const res = await fetch('/api/inventory', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    itemName,
                    category,
                    quantity: qtyNum,
                    unit
                })
            });

            const data = await res.json();

            if (res.ok) {
                setToast({ message: `บันทึกสำเร็จ: ${itemName}`, type: 'success' });
                setItemName('');
                setQuantity('');
                if (onSuccess) onSuccess();
            } else {
                setToast({ message: data.error || 'เกิดข้อผิดพลาดในการบันทึก', type: 'error' });
            }
        } catch (error) {
            console.error('Submit error:', error);
            setToast({ message: 'ไม่สามารถติดต่อเซิร์ฟเวอร์ได้', type: 'error' });
        }
    };

    const VALID_SYSTEM_CATEGORIES = ['อาหาร', 'น้ำดื่ม', 'ยาและเวชภัณฑ์', 'เครื่องนุ่งห่ม', 'อื่นๆ'];

    const normalizeCategory = (cat: string) => {
        const trimmed = String(cat || '').trim();
        if (!trimmed) return 'อื่นๆ';
        if (VALID_SYSTEM_CATEGORIES.includes(trimmed)) return trimmed;

        // Fuzzy matching
        if (trimmed.includes('อาหาร')) return 'อาหาร';
        if (trimmed.includes('น้ำ')) return 'น้ำดื่ม';
        if (trimmed.includes('ยา') || trimmed.includes('เวชภัณฑ์')) return 'ยาและเวชภัณฑ์';
        if (trimmed.includes('เสื้อ') || trimmed.includes('ผ้า') || trimmed.includes('นุ่งห่ม')) return 'เครื่องนุ่งห่ม';

        return 'อื่นๆ';
    };

    const processFile = (file: File) => {
        const reader = new FileReader();
        reader.onload = (evt) => {
            try {
                const data = new Uint8Array(evt.target?.result as ArrayBuffer);
                const workbook = XLSX.read(data, { type: 'array' });
                const sheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[sheetName];
                const jsonData = XLSX.utils.sheet_to_json(worksheet);

                const mappedData = jsonData.map((row: any) => {
                    // Try various column name variations
                    const rawCategory = row['หมวดหมู่'] || row['Category'] || row['หมวด'] || row['category'];
                    const rawItemName = row['ชื่อรายการ'] || row['ItemName'] || row['ชื่อ'] || row['item'];
                    const rawQuantity = row['จำนวน'] || row['Quantity'] || row['จำนวน'] || row['qty'] || row['amount'];
                    const rawUnit = row['หน่วย'] || row['Unit'] || row['หน่วย'] || row['unit'];

                    return {
                        category: normalizeCategory(rawCategory),
                        itemName: String(rawItemName || '').trim(),
                        quantity: Number(rawQuantity) || 0,
                        unit: String(rawUnit || 'ชิ้น').trim()
                    };
                }).filter(item => item.itemName && item.quantity > 0);

                if (mappedData.length === 0) {
                    setToast({ message: 'ไม่พบข้อมูลที่ถูกต้องในไฟล์ (ตรวจสอบชื่อรายการและจำนวนต้องมากกว่า 0)', type: 'error' });
                    return;
                }

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

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) processFile(file);
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files?.[0];
        if (file && (file.name.endsWith('.xlsx') || file.name.endsWith('.xls'))) {
            processFile(file);
        } else {
            setToast({ message: 'กรุณาอัปโหลดไฟล์ Excel (.xlsx, .xls) เท่านั้น', type: 'error' });
        }
    };

    const downloadTemplate = () => {
        const ws = XLSX.utils.json_to_sheet([
            { 'หมวดหมู่': 'อาหาร', 'ชื่อรายการ': 'ข้าวสาร', 'จำนวน': 10, 'หน่วย': 'กิโลกรัม' },
            { 'หมวดหมู่': 'น้ำดื่ม', 'ชื่อรายการ': 'น้ำเปล่าแพ็คโหล', 'จำนวน': 50, 'หน่วย': 'แพ็ค' },
            { 'หมวดหมู่': 'ยาและเวชภัณฑ์', 'ชื่อรายการ': 'หน้ากากอนามัย', 'จำนวน': 100, 'หน่วย': 'กล่อง' }
        ]);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Template");
        XLSX.writeFile(wb, "donation_template.xlsx");
    };

    const handleBulkSubmit = async () => {
        let successCount = 0;
        let failCount = 0;
        let duplicateCount = 0;
        let lastErrorMessage = '';

        for (const item of importedData) {
            try {
                if (item.quantity <= 0) {
                    failCount++;
                    lastErrorMessage = `สินค้า "${item.itemName}" จำนวนต้องมากกว่า 0`;
                    continue;
                }

                const res = await fetch('/api/inventory', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(item)
                });

                if (res.ok) {
                    successCount++;
                } else {
                    const errorData = await res.json().catch(() => ({ error: 'Unknown Error' }));
                    const errorMessage = errorData.error || errorData.message || 'ข้อมูลไม่ถูกต้องตามเงื่อนไขของระบบ';

                    if (errorMessage.toLowerCase().includes('duplicate')) {
                        duplicateCount++;
                    } else {
                        failCount++;
                        lastErrorMessage = errorMessage;
                    }
                }
            } catch (error) {
                failCount++;
                lastErrorMessage = 'ไม่สามารถเชื่อมต่อ Server ได้';
            }
        }

        setToast({
            message: `ผลการนำเข้า: บันทึกสำเร็จ ${successCount} รายการ ${failCount > 0 ? `, ล้มเหลว ${failCount} รายการ (ตัวอย่าง: ${lastErrorMessage})` : ''}`,
            type: failCount === 0 ? 'success' : 'error'
        });

        if (failCount === 0) {
            setImportedData([]);
            setIsImporting(false);
            if (onSuccess) onSuccess();
        }
    };

    return (
        <div className="card shadow-none border-0" style={{ width: '100%', background: 'transparent' }}>
            <div className="card-body p-0">
                <div className="text-center mb-4">
                    <h2 className="fw-bold mb-2" style={{ fontSize: '24px', color: '#111827' }}>บันทึกของเข้าด่วน (Quick Donation)</h2>
                    <p style={{ color: '#868e96', marginBottom: 0 }}>รับของบริจาคเข้าสต็อกส่วนกลางอย่างรวดเร็ว</p>

                    {!isImporting && (
                        <div
                            className="mt-4 p-4 text-center"
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                            style={{
                                border: `2px dashed ${isDragging ? '#198754' : '#dee2e6'}`,
                                borderRadius: '16px',
                                backgroundColor: isDragging ? '#f0fff4' : '#ffffff',
                                transition: 'all 0.2s ease',
                                cursor: 'pointer'
                            }}
                        >
                            <i className="bi bi-cloud-upload" style={{ fontSize: '32px', color: isDragging ? '#198754' : '#adb5bd' }}></i>
                            <h5 className="mt-2 mb-1" style={{ fontSize: '16px', color: '#495057' }}>ลากไฟล์ Excel มาวางที่นี่</h5>
                            <p className="text-muted small mb-3">หรือคลิกเพื่อเลือกไฟล์</p>

                            <label className="btn btn-outline-success btn-sm px-4" style={{ borderRadius: '20px', cursor: 'pointer' }}>
                                เลือกไฟล์
                                <input type="file" accept=".xlsx, .xls" hidden onChange={handleFileUpload} />
                            </label>

                            <div className="mt-3">
                                <button onClick={downloadTemplate} className="btn btn-link btn-sm text-decoration-none text-muted" style={{ fontSize: '12px' }}>
                                    <i className="bi bi-download me-1"></i> ดาวน์โหลดแบบฟอร์มตัวอย่าง
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {isImporting ? (
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
                                ยืนยันนำเข้า ({importedData.length})
                            </button>
                            <button
                                className="btn btn-light w-100 fw-bold text-muted"
                                onClick={() => { setIsImporting(false); setImportedData([]); }}
                                style={{ padding: '16px', fontSize: '18px', borderRadius: '12px' }}
                            >
                                ยกเลิก
                            </button>
                        </div>
                    </div>
                ) : (
                    <>
                        <div className="d-flex align-items-center my-4">
                            <span className="text-muted small w-100 text-center">--- หรือ กรอกข้อมูลด้วยตัวเอง ---</span>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="mb-4">
                                <label className="form-label d-block mb-3" style={{ color: '#6b7280', fontSize: '13px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.025em' }}>
                                    เลือกหมวดหมู่
                                </label>
                                <div className="d-flex gap-2 flex-wrap">
                                    {categories.map((cat) => {
                                        const isActive = category === cat;
                                        return (
                                            <button
                                                key={cat}
                                                type="button"
                                                className={`btn btn-sm px-3 py-2 rounded-pill fw-600 transition-all ${isActive ? 'shadow-sm' : ''}`}
                                                onClick={() => setCategory(cat)}
                                                style={{
                                                    fontSize: '13px',
                                                    backgroundColor: isActive ? '#10b981' : '#f3f4f6',
                                                    color: isActive ? '#ffffff' : '#4b5563',
                                                    border: isActive ? '1px solid #059669' : '1px solid #e5e7eb',
                                                    transform: isActive ? 'scale(1.05)' : 'scale(1)',
                                                }}
                                            >
                                                {cat}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            <div className="mb-4">
                                <label className="form-label d-block mb-2" style={{ color: '#6b7280', fontSize: '13px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.025em' }}>
                                    ชื่อรายการสิ่งของ
                                </label>
                                <input
                                    type="text"
                                    placeholder="เช่น ข้าวสาร, ยาแก้ปวด..."
                                    className="form-control"
                                    style={{
                                        background: '#f9fafb',
                                        border: '1px solid #e5e7eb',
                                        color: '#111827',
                                        borderRadius: '10px',
                                        height: '44px',
                                        padding: '0 16px',
                                        fontSize: '15px',
                                        transition: 'all 0.2s ease'
                                    }}
                                    value={itemName}
                                    onChange={(e) => setItemName(e.target.value)}
                                    onFocus={(e) => {
                                        e.target.style.borderColor = '#2563eb';
                                        e.target.style.boxShadow = '0 0 0 4px rgba(37, 99, 235, 0.1)';
                                        e.target.style.backgroundColor = '#ffffff';
                                    }}
                                    onBlur={(e) => {
                                        e.target.style.borderColor = '#e5e7eb';
                                        e.target.style.boxShadow = 'none';
                                        e.target.style.backgroundColor = '#f9fafb';
                                    }}
                                    required
                                />
                            </div>

                            <div className="row g-3 mb-4">
                                <div className="col-8">
                                    <label className="form-label" style={{
                                        color: '#6b7280',
                                        fontSize: '12px',
                                        fontWeight: 600,
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.025em',
                                        marginBottom: '6px',
                                        display: 'block'
                                    }}>
                                        จำนวน
                                    </label>
                                    <input
                                        type="number"
                                        placeholder="0"
                                        min="1"
                                        className="form-control"
                                        style={{
                                            background: '#f9fafb',
                                            border: '1px solid #e5e7eb',
                                            color: '#111827',
                                            borderRadius: '10px',
                                            height: '44px',
                                            padding: '0 16px',
                                            fontSize: '15px',
                                            transition: 'all 0.2s ease'
                                        }}
                                        value={quantity}
                                        onChange={(e) => {
                                            const val = e.target.value;
                                            if (val !== '' && Number(val) < 0) return;
                                            setQuantity(val);
                                        }}
                                        onFocus={(e) => {
                                            e.target.style.borderColor = '#2563eb';
                                            e.target.style.boxShadow = '0 0 0 4px rgba(37, 99, 235, 0.1)';
                                            e.target.style.backgroundColor = '#ffffff';
                                        }}
                                        onBlur={(e) => {
                                            e.target.style.borderColor = '#e5e7eb';
                                            e.target.style.boxShadow = 'none';
                                            e.target.style.backgroundColor = '#f9fafb';
                                        }}
                                        required
                                    />
                                </div>
                                <div className="col-4">
                                    <FormSelect
                                        label="หน่วย"
                                        value={unit}
                                        onChange={setUnit}
                                        options={[
                                            { value: 'ชิ้น', label: 'ชิ้น' },
                                            { value: 'ถุง', label: 'ถุง' },
                                            { value: 'แพ็ค', label: 'แพ็ค' },
                                            { value: 'กล่อง', label: 'กล่อง' },
                                            { value: 'กิโลกรัม', label: 'กิโลกรัม' }
                                        ]}
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                className="btn w-100 fw-bold transition-all shadow-sm"
                                style={{
                                    padding: '14px',
                                    fontSize: '16px',
                                    borderRadius: '12px',
                                    backgroundColor: '#10b981',
                                    color: '#ffffff',
                                    border: 'none',
                                    marginTop: '10px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '10px'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.backgroundColor = '#059669';
                                    e.currentTarget.style.transform = 'translateY(-2px)';
                                    e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(16, 185, 129, 0.2)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.backgroundColor = '#10b981';
                                    e.currentTarget.style.transform = 'translateY(0)';
                                    e.currentTarget.style.boxShadow = 'none';
                                }}
                            >
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="20 6 9 17 4 12" />
                                </svg>
                                ยืนยันการบันทึก (Confirm)
                            </button>
                        </form>
                    </>
                )}
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
