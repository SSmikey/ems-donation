'use client';

import { useState, useEffect } from 'react';

interface Center {
  _id?: string;
  name: string;
  district: string;
  subdistrict: string;
  capacity?: number | null;
  capacityStatus: 'รองรับได้' | 'ใกล้เต็ม' | 'เต็มแล้ว';
  shelterType: string;
  phoneNumbers: string[];
  responsible: {
    name: string;
    position: string;
    phone: string;
  }[];
}

interface CenterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (center: Center) => void;
  editCenter?: Center | null;
}

export default function CenterModal({ isOpen, onClose, onSave, editCenter }: CenterModalProps) {
  const [formData, setFormData] = useState<Center>({
    name: '',
    district: '',
    subdistrict: '',
    capacity: null,
    capacityStatus: 'รองรับได้',
    shelterType: 'โรงเรียน',
    phoneNumbers: [''],
    responsible: [{ name: '', position: '', phone: '' }],
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Load data เมื่อ Edit
  useEffect(() => {
    if (editCenter) {
      setFormData({
        ...editCenter,
        phoneNumbers: editCenter.phoneNumbers.length > 0 ? editCenter.phoneNumbers : [''],
        responsible: editCenter.responsible.length > 0 ? editCenter.responsible : [{ name: '', position: '', phone: '' }],
      });
    } else {
      setFormData({
        name: '',
        district: '',
        subdistrict: '',
        capacity: null,
        capacityStatus: 'รองรับได้',
        shelterType: 'โรงเรียน',
        phoneNumbers: [''],
        responsible: [{ name: '', position: '', phone: '' }],
      });
    }
    setErrors({});
  }, [editCenter, isOpen]);

  // Validate phone number (10 digits)
  const validatePhone = (phone: string): boolean => {
    return /^[0-9]{10}$/.test(phone);
  };

  // Validate form
  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'กรุณากรอกชื่อศูนย์';
    }

    if (!formData.district.trim()) {
      newErrors.district = 'กรุณากรอกอำเภอ';
    }

    if (!formData.subdistrict.trim()) {
      newErrors.subdistrict = 'กรุณากรอกตำบล';
    }

    if (formData.capacity && formData.capacity < 0) {
      newErrors.capacity = 'ความจุต้องเป็นจำนวนบวก';
    }

    // Validate phone numbers
    const validPhones = formData.phoneNumbers.filter(p => p.trim());
    if (validPhones.length === 0) {
      newErrors.phoneNumbers = 'กรุณากรอกเบอร์โทรศัพท์อย่างน้อย 1 เบอร์';
    } else {
      const invalidPhones = validPhones.filter(p => !validatePhone(p));
      if (invalidPhones.length > 0) {
        newErrors.phoneNumbers = 'เบอร์โทรศัพท์ต้องเป็นตัวเลข 10 หลัก';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (validate()) {
      // Filter empty data
      const cleanedData = {
        ...formData,
        phoneNumbers: formData.phoneNumbers.filter(p => p.trim()),
        responsible: formData.responsible.filter(r => r.name.trim() && r.position.trim()),
      };

      onSave(cleanedData);
      onClose();
    }
  };

  // Handle input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'capacity' ? (value ? Number(value) : null) : value
    }));

    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // Phone numbers handlers
  const handlePhoneChange = (index: number, value: string) => {
    const newPhones = [...formData.phoneNumbers];
    newPhones[index] = value;
    setFormData(prev => ({ ...prev, phoneNumbers: newPhones }));
    
    if (errors.phoneNumbers) {
      setErrors(prev => ({ ...prev, phoneNumbers: '' }));
    }
  };

  const addPhone = () => {
    setFormData(prev => ({
      ...prev,
      phoneNumbers: [...prev.phoneNumbers, '']
    }));
  };

  const removePhone = (index: number) => {
    if (formData.phoneNumbers.length > 1) {
      setFormData(prev => ({
        ...prev,
        phoneNumbers: prev.phoneNumbers.filter((_, i) => i !== index)
      }));
    }
  };

  // Responsible handlers
  const handleResponsibleChange = (index: number, field: 'name' | 'position' | 'phone', value: string) => {
    const newResponsible = [...formData.responsible];
    newResponsible[index][field] = value;
    setFormData(prev => ({ ...prev, responsible: newResponsible }));
  };

  const addResponsible = () => {
    setFormData(prev => ({
      ...prev,
      responsible: [...prev.responsible, { name: '', position: '', phone: '' }]
    }));
  };

  const removeResponsible = (index: number) => {
    if (formData.responsible.length > 1) {
      setFormData(prev => ({
        ...prev,
        responsible: prev.responsible.filter((_, i) => i !== index)
      }));
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 animate-fadeIn"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-slideUp">
        <div
          className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-5 text-white">
            <h2 className="text-2xl font-bold">
              {editCenter ? '✏️ แก้ไขศูนย์พักพิง' : '➕ เพิ่มศูนย์พักพิงใหม่'}
            </h2>
            <p className="text-indigo-100 text-sm mt-1">
              {editCenter ? 'แก้ไขข้อมูลศูนย์พักพิง' : 'เพิ่มศูนย์พักพิงใหม่เข้าสู่ระบบ'}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Basic Info */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-gray-800 border-b pb-2">ข้อมูลพื้นฐาน</h3>

              {/* Center Name */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  ชื่อศูนย์พักพิง <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="เช่น ศูนย์พักพิงโรงเรียนบ้านหนองบัว"
                  className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                    errors.name ? 'border-red-500' : 'border-gray-200'
                  }`}
                />
                {errors.name && <p className="text-red-500 text-sm mt-1">⚠️ {errors.name}</p>}
              </div>

              {/* District & Subdistrict */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    อำเภอ <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="district"
                    value={formData.district}
                    onChange={handleChange}
                    placeholder="เช่น เมือง"
                    className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                      errors.district ? 'border-red-500' : 'border-gray-200'
                    }`}
                  />
                  {errors.district && <p className="text-red-500 text-sm mt-1">⚠️ {errors.district}</p>}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    ตำบล <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="subdistrict"
                    value={formData.subdistrict}
                    onChange={handleChange}
                    placeholder="เช่น ในเมือง"
                    className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                      errors.subdistrict ? 'border-red-500' : 'border-gray-200'
                    }`}
                  />
                  {errors.subdistrict && <p className="text-red-500 text-sm mt-1">⚠️ {errors.subdistrict}</p>}
                </div>
              </div>

              {/* Capacity & Status */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">ความจุ (คน)</label>
                  <input
                    type="number"
                    name="capacity"
                    value={formData.capacity || ''}
                    onChange={handleChange}
                    min="0"
                    placeholder="เช่น 100"
                    className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                      errors.capacity ? 'border-red-500' : 'border-gray-200'
                    }`}
                  />
                  {errors.capacity && <p className="text-red-500 text-sm mt-1">⚠️ {errors.capacity}</p>}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">สถานะความจุ</label>
                  <select
                    name="capacityStatus"
                    value={formData.capacityStatus}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                  >
                    <option value="รองรับได้">🟢 รองรับได้</option>
                    <option value="ใกล้เต็ม">🟡 ใกล้เต็ม</option>
                    <option value="เต็มแล้ว">🔴 เต็มแล้ว</option>
                  </select>
                </div>
              </div>

              {/* Shelter Type */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">ประเภทศูนย์</label>
                <select
                  name="shelterType"
                  value={formData.shelterType}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                >
                  <option value="โรงเรียน">🏫 โรงเรียน</option>
                  <option value="วัด">⛩️ วัด</option>
                  <option value="โรงพยาบาล">🏥 โรงพยาบาล</option>
                  <option value="อาคารสาธารณะ">🏢 อาคารสาธารณะ</option>
                  <option value="อื่นๆ">📦 อื่นๆ</option>
                </select>
              </div>
            </div>

            {/* Phone Numbers */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-gray-800 border-b pb-2">เบอร์โทรศัพท์</h3>
              {formData.phoneNumbers.map((phone, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => handlePhoneChange(index, e.target.value)}
                    placeholder="0812345678"
                    maxLength={10}
                    className={`flex-1 px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                      errors.phoneNumbers ? 'border-red-500' : 'border-gray-200'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={addPhone}
                    className="px-4 py-3 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-all"
                  >
                    ➕
                  </button>
                  {formData.phoneNumbers.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removePhone(index)}
                      className="px-4 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-all"
                    >
                      ❌
                    </button>
                  )}
                </div>
              ))}
              {errors.phoneNumbers && <p className="text-red-500 text-sm">⚠️ {errors.phoneNumbers}</p>}
            </div>

            {/* Responsible Persons */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-gray-800 border-b pb-2">ผู้รับผิดชอบ</h3>
              {formData.responsible.map((person, index) => (
                <div key={index} className="border-2 border-gray-200 rounded-xl p-4 space-y-3">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-semibold text-gray-700">คนที่ {index + 1}</span>
                    {formData.responsible.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeResponsible(index)}
                        className="text-red-500 hover:text-red-700 font-semibold"
                      >
                        ❌ ลบ
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="text"
                      value={person.name}
                      onChange={(e) => handleResponsibleChange(index, 'name', e.target.value)}
                      placeholder="ชื่อ-นามสกุล"
                      className="px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <input
                      type="text"
                      value={person.position}
                      onChange={(e) => handleResponsibleChange(index, 'position', e.target.value)}
                      placeholder="ตำแหน่ง"
                      className="px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <input
                    type="text"
                    value={person.phone}
                    onChange={(e) => handleResponsibleChange(index, 'phone', e.target.value)}
                    placeholder="เบอร์โทร"
                    maxLength={10}
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              ))}
              <button
                type="button"
                onClick={addResponsible}
                className="w-full px-4 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-all"
              >
                ➕ เพิ่มผู้รับผิดชอบ
              </button>
            </div>
          </form>

          {/* Footer */}
          <div className="border-t bg-gray-50 px-6 py-4 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-all"
            >
              ❌ ยกเลิก
            </button>
            <button
              onClick={handleSubmit}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg"
            >
              {editCenter ? '💾 บันทึกการแก้ไข' : '✅ เพิ่มศูนย์'}
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }

        .animate-slideUp {
          animation: slideUp 0.3s ease-out;
        }
      `}</style>
    </>
  );
}