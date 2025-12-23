'use client';

import { useState, useRef } from 'react';

interface InventoryItem {
  itemName: string;
  category: 'อาหาร' | 'ยาและเวชภัณฑ์' | 'เครื่องนุ่งห่ม' | 'น้ำดื่ม' | 'อื่นๆ';
  quantity: number;
  unit: string;
}

interface BulkImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (items: InventoryItem[]) => Promise<void>;
}

export default function BulkImportModal({ isOpen, onClose, onImport }: BulkImportModalProps) {
  const [previewData, setPreviewData] = useState<InventoryItem[]>([]);
  const [fileName, setFileName] = useState('');
  const [isImporting, setIsImporting] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validCategories = ['อาหาร', 'ยาและเวชภัณฑ์', 'เครื่องนุ่งห่ม', 'น้ำดื่ม', 'อื่นๆ'];

  const resetData = () => {
    setPreviewData([]);
    setFileName('');
    setErrors([]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const validateData = (data: any[]) => {
    const valid: InventoryItem[] = [];
    const errors: string[] = [];

    data.forEach((row, index) => {
      const rowNum = index + 2;
      if (!row.itemName?.trim()) {
        errors.push(`แถวที่ ${rowNum}: ชื่อสินค้าว่างเปล่า`);
        return;
      }
      if (!validCategories.includes(row.category)) {
        errors.push(`แถวที่ ${rowNum}: ประเภทไม่ถูกต้อง`);
        return;
      }
      const qty = Number(row.quantity);
      if (isNaN(qty) || qty <= 0) {
        errors.push(`แถวที่ ${rowNum}: จำนวนต้องมากกว่า 0`);
        return;
      }
      if (!row.unit?.trim()) {
        errors.push(`แถวที่ ${rowNum}: หน่วยว่างเปล่า`);
        return;
      }
      valid.push({
        itemName: row.itemName.trim(),
        category: row.category,
        quantity: qty,
        unit: row.unit.trim(),
      });
    });

    return { valid, errors };
  };

  const parseCSV = (text: string) => {
    const lines = text.split('\n').filter(l => l.trim());
    if (lines.length < 2) return [];
    const headers = lines[0].split(',').map(h => h.trim());
    return lines.slice(1).map(line => {
      const values = line.split(',').map(v => v.trim());
      const row: any = {};
      headers.forEach((h, i) => row[h] = values[i] || '');
      return row;
    });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    setErrors([]);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const data = parseCSV(text);
        if (data.length === 0) {
          setErrors(['ไฟล์ว่างเปล่า']);
          return;
        }
        const { valid, errors: errs } = validateData(data);
        setPreviewData(valid);
        setErrors(errs);
      } catch (err) {
        setErrors(['เกิดข้อผิดพลาด']);
      }
    };
    reader.readAsText(file, 'UTF-8');
  };

  const handleImport = async () => {
    if (previewData.length === 0) return;
    setIsImporting(true);
    try {
      await onImport(previewData);
      resetData();
      onClose();
    } finally {
      setIsImporting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/60 z-[9998]" onClick={() => { resetData(); onClose(); }} />
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-5 text-white">
            <h2 className="text-2xl font-bold">📊 นำเข้าข้อมูล CSV</h2>
          </div>
          <div className="flex-1 overflow-y-auto p-6">
            <input ref={fileInputRef} type="file" accept=".csv" onChange={handleFileUpload} className="hidden" id="file-upload" />
            <label htmlFor="file-upload" className="block border-2 border-dashed border-gray-300 rounded-xl p-8 text-center cursor-pointer hover:border-blue-500">
              <div className="text-6xl mb-3">📁</div>
              <p className="text-lg font-semibold">{fileName || 'คลิกเพื่ออัพโหลด'}</p>
            </label>
            
            {errors.length > 0 && (
              <div className="mt-4 bg-red-50 border-l-4 border-red-500 p-4 rounded">
                <h3 className="font-semibold text-red-800">⚠️ พบข้อผิดพลาด</h3>
                <ul className="text-sm text-red-700 mt-2">
                  {errors.slice(0, 5).map((e, i) => <li key={i}>• {e}</li>)}
                </ul>
              </div>
            )}
            
            {previewData.length > 0 && (
              <div className="mt-4">
                <h3 className="font-semibold mb-2">✅ ตัวอย่าง ({previewData.length} รายการ)</h3>
                <div className="border rounded-xl overflow-auto max-h-96">
                  <table className="w-full">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="px-4 py-3 text-left">#</th>
                        <th className="px-4 py-3 text-left">ชื่อสินค้า</th>
                        <th className="px-4 py-3 text-left">ประเภท</th>
                        <th className="px-4 py-3 text-right">จำนวน</th>
                        <th className="px-4 py-3 text-left">หน่วย</th>
                      </tr>
                    </thead>
                    <tbody>
                      {previewData.map((item, i) => (
                        <tr key={i} className="border-t">
                          <td className="px-4 py-3">{i + 1}</td>
                          <td className="px-4 py-3 font-medium">{item.itemName}</td>
                          <td className="px-4 py-3">{item.category}</td>
                          <td className="px-4 py-3 text-right">{item.quantity}</td>
                          <td className="px-4 py-3">{item.unit}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
          <div className="border-t bg-gray-50 px-6 py-4 flex justify-end gap-3">
            <button onClick={() => { resetData(); onClose(); }} className="px-6 py-3 bg-gray-200 rounded-xl font-semibold">ยกเลิก</button>
            <button onClick={handleImport} disabled={previewData.length === 0 || isImporting} className="px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold disabled:opacity-50">
              {isImporting ? 'กำลังนำเข้า...' : `นำเข้า (${previewData.length})`}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}