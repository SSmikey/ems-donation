'use client';

import { useState, useEffect, useMemo } from 'react';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import InventoryModal from '@/components/InventoryModal';
import BulkImportModal from '@/components/BulkImportModal';
import ConfirmDialog from '@/components/ConfirmDialog';
import Toast from '@/components/Toast';
import styles from './warehouse.module.css';

interface InventoryItem {
  _id?: string;
  itemName: string;
  category: 'อาหาร' | 'ยาและเวชภัณฑ์' | 'เครื่องนุ่งห่ม' | 'น้ำดื่ม' | 'อื่นๆ';
  quantity: number;
  unit: string;
  lastUpdated?: Date;
}

export default function WarehousePage() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [showBulkImport, setShowBulkImport] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState({
    show: false,
    itemId: '',
    itemName: '',
  });
  const [toast, setToast] = useState({
    show: false,
    type: 'success' as 'success' | 'error' | 'warning' | 'info',
    message: '',
  });

  const showToast = (type: 'success' | 'error' | 'warning' | 'info', message: string) => {
    setToast({ show: true, type, message });
  };

  // Fetch Inventory from API
  const fetchInventory = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/inventory');
      const data = await response.json();

      if (data.success) {
        setInventory(data.data);
      } else {
        showToast('error', 'ไม่สามารถโหลดข้อมูลได้');
      }
    } catch (error) {
      showToast('error', 'เกิดข้อผิดพลาดในการเชื่อมต่อ');
      console.error('Fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  // Filter & Search Logic
  const filteredItems = useMemo(() => {
    let result = inventory;

    // Search
    if (searchTerm) {
      result = result.filter((item) =>
        item.itemName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by category
    if (categoryFilter !== 'all') {
      result = result.filter((item) => item.category === categoryFilter);
    }

    // Sort
    result = [...result].sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.itemName.localeCompare(b.itemName, 'th');
        case 'quantity':
          return b.quantity - a.quantity;
        case 'date':
          return (
            new Date(b.lastUpdated || 0).getTime() -
            new Date(a.lastUpdated || 0).getTime()
          );
        default:
          return 0;
      }
    });

    return result;
  }, [inventory, searchTerm, categoryFilter, sortBy]);

  // Get status based on quantity
  const getStatus = (quantity: number): 'พอเพียง' | 'เหลือน้อย' | 'ขาดแคลน' => {
    if (quantity > 100) return 'พอเพียง';
    if (quantity > 50) return 'เหลือน้อย';
    return 'ขาดแคลน';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'พอเพียง': return '#4ade80';
      case 'เหลือน้อย': return '#fbbf24';
      case 'ขาดแคลน': return '#f87171';
      default: return '#ccc';
    }
  };

  const getStockPercentage = (quantity: number) => {
    if (quantity > 100) return '85%';
    if (quantity > 50) return '40%';
    return '15%';
  };

  // CRUD Operations
  const handleAddItem = () => {
    setEditingItem(null);
    setIsModalOpen(true);
  };

  const handleEditItem = (item: InventoryItem) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };

  const handleSaveItem = async (item: InventoryItem) => {
    try {
      if (editingItem) {
        // Update
        const response = await fetch(`/api/inventory/${editingItem._id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(item),
        });

        if (response.ok) {
          showToast('success', '💾 แก้ไขสินค้าสำเร็จ');
          fetchInventory();
        } else {
          const error = await response.json();
          showToast('error', `❌ ${error.error || 'เกิดข้อผิดพลาด'}`);
        }
      } else {
        // Create
        const response = await fetch('/api/inventory', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(item),
        });

        if (response.ok) {
          showToast('success', '✅ เพิ่มสินค้าสำเร็จ');
          fetchInventory();
        } else {
          const error = await response.json();
          showToast('error', `❌ ${error.error || 'เกิดข้อผิดพลาด'}`);
        }
      }
    } catch (error) {
      showToast('error', '❌ ไม่สามารถเชื่อมต่อได้');
      console.error('Save error:', error);
    }
  };

  const handleDeleteClick = (item: InventoryItem) => {
    setConfirmDialog({
      show: true,
      itemId: item._id!,
      itemName: item.itemName,
    });
  };

  const handleConfirmDelete = async () => {
    try {
      const response = await fetch(`/api/inventory/${confirmDialog.itemId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        showToast('success', '🗑️ ลบสินค้าสำเร็จ');
        fetchInventory();
      } else {
        showToast('error', '❌ เกิดข้อผิดพลาด');
      }
    } catch (error) {
      showToast('error', '❌ ไม่สามารถเชื่อมต่อได้');
      console.error('Delete error:', error);
    } finally {
      setConfirmDialog({ show: false, itemId: '', itemName: '' });
    }
  };

  // Bulk Import
  const handleBulkImport = async (items: InventoryItem[]) => {
    setLoading(true);

    const results = {
      success: 0,
      failed: 0,
    };

    for (const item of items) {
      try {
        const response = await fetch('/api/inventory', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(item),
        });

        if (response.ok) {
          results.success++;
        } else {
          results.failed++;
        }
      } catch (error) {
        results.failed++;
      }
    }

    setLoading(false);

    if (results.failed === 0) {
      showToast('success', `✅ นำเข้าสินค้า ${results.success} รายการสำเร็จ`);
    } else {
      showToast(
        'warning',
        `⚠️ นำเข้าสำเร็จ ${results.success} รายการ, ล้มเหลว ${results.failed} รายการ`
      );
    }

    fetchInventory();
  };

  // Stock alerts
  const lowStockItems = inventory.filter((item) => item.quantity <= 50);

  return (
    <div className={styles.container}>
      <Sidebar isOpen={sidebarOpen} />
      <div className={styles.mainContent}>
        <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />

        <div className={styles.contentArea}>
          <div className={styles.pageHeader}>
            <div>
              <h1>คลังสินค้าส่วนกลาง (Central Warehouse)</h1>
              <p style={{ color: 'rgba(255,255,255,0.5)', marginTop: '5px' }}>
                จัดการสต็อกสิ่งของบริจาคและทรัพยากรทั้งหมด
              </p>
            </div>
            <div className={styles.actionButtons}>
              <button 
                className={styles.secondaryButton}
                onClick={() => setShowBulkImport(true)}
              >
                📊 นำเข้า CSV
              </button>
              <button 
                className={styles.primaryButton}
                onClick={handleAddItem}
              >
                + เพิ่มรายการสินค้าใหม่
              </button>
            </div>
          </div>

          {/* Stock Alert */}
          {lowStockItems.length > 0 && (
            <div style={{
              background: 'rgba(248, 113, 113, 0.1)',
              border: '2px solid #f87171',
              borderRadius: '10px',
              padding: '15px',
              marginBottom: '20px',
              color: '#f87171'
            }}>
              <strong>🚨 พบสินค้าเหลือน้อย {lowStockItems.length} รายการ!</strong>
              <p style={{ fontSize: '14px', marginTop: '5px', opacity: 0.8 }}>
                {lowStockItems.map((item) => item.itemName).join(', ')}
              </p>
            </div>
          )}

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
                <option value="อื่นๆ">อื่นๆ</option>
              </select>
            </div>
            <div className={styles.filterGroup}>
              <label>เรียงตาม</label>
              <select
                className={styles.inputField}
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="name">ชื่อ</option>
                <option value="quantity">จำนวน</option>
                <option value="date">วันที่</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', marginTop: '50px', color: 'rgba(255,255,255,0.6)' }}>
              <p>กำลังโหลดข้อมูล...</p>
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
                  {filteredItems.map((item) => {
                    const status = getStatus(item.quantity);
                    return (
                      <tr key={item._id}>
                        <td style={{ fontWeight: '500' }}>{item.itemName}</td>
                        <td>
                          <span className={styles.categoryTag}>{item.category}</span>
                        </td>
                        <td
                          style={{
                            color: getStatusColor(status),
                            fontWeight: '600',
                          }}
                        >
                          {item.quantity.toLocaleString()}
                        </td>
                        <td>{item.unit}</td>
                        <td>
                          <div className={styles.stockLevel}>
                            <div className={styles.levelBar}>
                              <div
                                className={styles.levelFill}
                                style={{
                                  width: getStockPercentage(item.quantity),
                                  backgroundColor: getStatusColor(status),
                                }}
                              ></div>
                            </div>
                            <span style={{ fontSize: '12px' }}>{status}</span>
                          </div>
                        </td>
                        <td>
                          <div className={styles.actions}>
                            <button
                              className={styles.editBtn}
                              title="แก้ไข"
                              onClick={() => handleEditItem(item)}
                            >
                              ✏️
                            </button>
                            <button
                              className={styles.deleteBtn}
                              title="ลบ"
                              onClick={() => handleDeleteClick(item)}
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
                <div
                  style={{
                    textAlign: 'center',
                    marginTop: '50px',
                    color: 'rgba(255,255,255,0.4)',
                  }}
                >
                  <p>ไม่พบรายการสินค้าที่ต้องการ</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Modals */}
      <InventoryModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingItem(null);
        }}
        onSave={handleSaveItem}
        editItem={editingItem}
      />

      <BulkImportModal
        isOpen={showBulkImport}
        onClose={() => setShowBulkImport(false)}
        onImport={handleBulkImport}
      />

      <ConfirmDialog
        isOpen={confirmDialog.show}
        title="ยืนยันการลบสินค้า"
        message={`คุณต้องการลบ "${confirmDialog.itemName}" ใช่หรือไม่?`}
        confirmText="ลบ"
        cancelText="ยกเลิก"
        type="danger"
        onConfirm={handleConfirmDelete}
        onCancel={() => setConfirmDialog({ show: false, itemId: '', itemName: '' })}
      />

      <Toast
        show={toast.show}
        type={toast.type}
        message={toast.message}
        onClose={() => setToast({ ...toast, show: false })}
      />
    </div>
  );
}