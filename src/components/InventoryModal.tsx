'use client';

import { useState, useEffect } from 'react';

interface InventoryItem {
  _id?: string;
  itemName: string;
  category: 'อาหาร' | 'ยาและเวชภัณฑ์' | 'เครื่องนุ่งห่ม' | 'น้ำดื่ม' | 'อื่นๆ';
  quantity: number;
  unit: string;
}

interface InventoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (item: InventoryItem) => void;
  editItem?: InventoryItem | null;
}

export default function InventoryModal({ isOpen, onClose, onSave, editItem }: InventoryModalProps) {
  const [formData, setFormData] = useState<InventoryItem>({
    itemName: '',
    category: 'อาหาร',
    quantity: 0,
    unit: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (editItem) {
      setFormData(editItem);
    } else {
      setFormData({
        itemName: '',
        category: 'อาหาร',
        quantity: 0,
        unit: '',
      });
    }
    setErrors({});
  }, [editItem, isOpen]);

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.itemName.trim()) {
      newErrors.itemName = 'กรุณากรอกชื่อสินค้า';
    }

    if (formData.quantity <= 0) {
      newErrors.quantity = 'จำนวนต้องมากกว่า 0';
    }

    if (!formData.unit.trim()) {
      newErrors.unit = 'กรุณากรอกหน่วย';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (validate()) {
      onSave(formData);
      onClose();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'quantity' ? Number(value) : value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  if (!isOpen) return null;

  return (
    <div>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9998]" onClick={onClose} />

      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
        <div
          className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-5 text-white">
            <h2 className="text-2xl font-bold">
              {editItem ? '✏️ แก้ไขสินค้า' : '➕ เพิ่มสินค้าใหม่'}
            </h2>
            <p className="text-emerald-100 text-sm mt-1">
              {editItem ? 'แก้ไขข้อมูลสินค้าในคลัง' : 'เพิ่มสินค้าใหม่เข้าสู่คลัง'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                ชื่อสินค้า <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="itemName"
                value={formData.itemName}
                onChange={handleChange}
                placeholder="เช่น ข้าวสาร, น้ำดื่ม, ยาพาราเซตามอล"
                className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                  errors.itemName ? 'border-red-500' : 'border-gray-200'
                }`}
              />
              {errors.itemName && <p className="text-red-500 text-sm mt-1">⚠️ {errors.itemName}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                ประเภท <span className="text-red-500">*</span>
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
              >
                <option value="อาหาร">🍚 อาหาร</option>
                <option value="ยาและเวชภัณฑ์">💊 ยาและเวชภัณฑ์</option>
                <option value="เครื่องนุ่งห่ม">👕 เครื่องนุ่งห่ม</option>
                <option value="น้ำดื่ม">💧 น้ำดื่ม</option>
                <option value="อื่นๆ">📦 อื่นๆ</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  จำนวน <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleChange}
                  min="0"
                  placeholder="0"
                  className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                    errors.quantity ? 'border-red-500' : 'border-gray-200'
                  }`}
                />
                {errors.quantity && <p className="text-red-500 text-sm mt-1">⚠️ {errors.quantity}</p>}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  หน่วย <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="unit"
                  value={formData.unit}
                  onChange={handleChange}
                  placeholder="เช่น ถุง, กล่อง, ขวด"
                  className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                    errors.unit ? 'border-red-500' : 'border-gray-200'
                  }`}
                />
                {errors.unit && <p className="text-red-500 text-sm mt-1">⚠️ {errors.unit}</p>}
              </div>
            </div>

            <div className="bg-gray-50 px-6 py-4 flex gap-3 -mx-6 -mb-6 mt-6">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-300 transition-all"
              >
                ❌ ยกเลิก
              </button>
              <button
                type="submit"
                className="flex-1 px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl font-semibold hover:from-emerald-700 hover:to-teal-700 transition-all shadow-lg"
              >
                {editItem ? '💾 บันทึกการแก้ไข' : '✅ เพิ่มสินค้า'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}