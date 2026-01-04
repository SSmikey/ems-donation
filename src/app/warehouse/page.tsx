'use client';

import { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ReservedStockModal } from '@/components/stock';
import InventoryModal from './InventoryModal';

interface InventoryItem {
  _id: string;
  itemName: string;
  category: string;
  quantity: number;
  reservedQuantity?: number;
  availableQuantity?: number;
  unit: string;
  minThreshold?: number;
  lastUpdated?: string;
  lastUpdatedBy?: string;
}

export default function WarehousePage() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [showReservedStock, setShowReservedStock] = useState(false);
  const [reservedStocks, setReservedStocks] = useState<any[]>([]);

  const fetchInventory = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/inventory');
      const data = await res.json();
      if (data.success) {
        setInventory(data.data);
      }
    } catch (error) {
      console.error('Fetch inventory error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const filteredItems = inventory.filter(item => {
    const matchesSearch = item.itemName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const getStockStatus = (item: InventoryItem) => {
    const total = item.quantity || 0;
    const reserved = item.reservedQuantity || 0;
    const available = item.availableQuantity || (total - reserved);
    const minThreshold = item.minThreshold || 20;

    if (available <= 0) {
      return { label: 'ขาดแคลน', color: 'bg-red-100 text-red-800', icon: '🔴' };
    } else if (available <= minThreshold) {
      return { label: 'ต่ำ', color: 'bg-amber-100 text-amber-800', icon: '🟡' };
    } else {
      return { label: 'พอเพียง', color: 'bg-green-100 text-green-800', icon: '🟢' };
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`ยืนยันการลบรายการ: ${name}?`)) return;

    try {
      const res = await fetch(`/api/inventory/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchInventory();
      }
    } catch (error) {
      console.error('Delete error:', error);
    }
  };

  const totalQuantity = inventory.reduce((sum, item) => sum + (item.quantity || 0), 0);
  const totalReserved = inventory.reduce((sum, item) => sum + (item.reservedQuantity || 0), 0);
  const totalAvailable = totalQuantity - totalReserved;

  return (
    <div className="flex h-screen bg-background">
      <Sidebar isOpen={sidebarOpen} />

      <div className={`flex-1 flex flex-col transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-20'}`}>
        <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />

        <main className="flex-1 overflow-y-auto p-6">
          {/* Page Header */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-foreground">คลังสินค้าส่วนกลาง</h1>
            <p className="text-muted-foreground mt-1">จัดการสต็อกสิ่งของบริจาคและทรัพยากรทั้งหมด</p>
          </div>

          {/* Stock Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">รวมทั้งหมด</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalQuantity.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground mt-1">หน่วย</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">จองไว้</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-amber-600">{totalReserved.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground mt-1">หน่วยรอส่งมอบ</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">พร้อมใช้</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{totalAvailable.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground mt-1">หน่วยพร้อมใช้</p>
              </CardContent>
            </Card>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 mb-6">
            <Button onClick={() => {
              setEditingItem(null);
              setIsModalOpen(true);
            }}>
              + เพิ่มสินค้าใหม่
            </Button>
            <Button variant="outline" onClick={() => setShowReservedStock(true)}>
              📋 ดูสต็อกที่จองไว้
            </Button>
          </div>

          {/* Filters */}
          <div className="flex gap-3 mb-6">
            <div className="flex-1">
              <Input
                placeholder="ค้นหาชื่อสินค้า..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-2 rounded-md border border-input bg-background text-foreground"
            >
              <option value="all">ทั้งหมด</option>
              <option value="อาหาร">อาหาร</option>
              <option value="น้ำดื่ม">น้ำดื่ม</option>
              <option value="ยาและเวชภัณฑ์">ยาและเวชภัณฑ์</option>
              <option value="เครื่องนุ่งห่ม">เครื่องนุ่งห่ม</option>
              <option value="อื่นๆ">อื่นๆ</option>
            </select>
          </div>

          {/* Inventory Table */}
          <Card>
            <CardContent className="p-0">
              {loading ? (
                <div className="text-center py-12 text-muted-foreground">
                  กำลังโหลดข้อมูลคลังสินค้า...
                </div>
              ) : filteredItems.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  ไม่พบรายการสินค้าที่ต้องการ
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ชื่อสินค้า</TableHead>
                      <TableHead>หมวดหมู่</TableHead>
                      <TableHead className="text-right">รวม</TableHead>
                      <TableHead className="text-right">จองไว้</TableHead>
                      <TableHead className="text-right">พร้อมใช้</TableHead>
                      <TableHead>สถานะ</TableHead>
                      <TableHead>หน่วย</TableHead>
                      <TableHead className="text-right">การจัดการ</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredItems.map(item => {
                      const status = getStockStatus(item);
                      const reserved = item.reservedQuantity || 0;
                      const available = item.availableQuantity || (item.quantity - reserved);

                      return (
                        <TableRow key={item._id}>
                          <TableCell className="font-medium">{item.itemName}</TableCell>
                          <TableCell>
                            <Badge variant="secondary">{item.category}</Badge>
                          </TableCell>
                          <TableCell className="text-right">{(item.quantity || 0).toLocaleString()}</TableCell>
                          <TableCell className="text-right text-amber-600 font-medium">{reserved.toLocaleString()}</TableCell>
                          <TableCell className="text-right font-medium">{available.toLocaleString()}</TableCell>
                          <TableCell>
                            <Badge className={status.color}>{status.icon} {status.label}</Badge>
                          </TableCell>
                          <TableCell>{item.unit}</TableCell>
                          <TableCell className="text-right space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setEditingItem(item);
                                setIsModalOpen(true);
                              }}
                            >
                              แก้ไข
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(item._id, item.itemName)}
                            >
                              ลบ
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </main>
      </div>

      {/* Reserved Stock Modal */}
      <ReservedStockModal
        open={showReservedStock}
        onOpenChange={setShowReservedStock}
        stocks={reservedStocks}
      />

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <InventoryModal
          item={editingItem}
          onClose={() => setIsModalOpen(false)}
          onSuccess={() => {
            setIsModalOpen(false);
            fetchInventory();
          }}
        />
      )}
    </div>
  );
}
