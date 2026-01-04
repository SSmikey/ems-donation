'use client';

import { useState } from 'react';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

interface ToastMessage {
    message: string;
    type: 'success' | 'error';
}

const CATEGORIES = ['อาหาร', 'น้ำดื่ม', 'ยาและเวชภัณฑ์', 'เครื่องนุ่งห่ม', 'อื่นๆ'];
const UNITS = ['ชิ้น', 'ถุง', 'แพ็ค', 'กล่อง', 'กิโลกรัม', 'ผืน'];

export default function QuickDonationPage() {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [category, setCategory] = useState('อาหาร');
    const [itemName, setItemName] = useState('');
    const [quantity, setQuantity] = useState('');
    const [unit, setUnit] = useState('ชิ้น');
    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState<ToastMessage | null>(null);
    const [successCount, setSuccessCount] = useState(0);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!itemName.trim() || !quantity || Number(quantity) <= 0) {
            setToast({ message: 'กรุณากรอกชื่อและจำนวนสินค้า', type: 'error' });
            return;
        }

        setLoading(true);
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
                setToast({ message: `✓ บันทึกสำเร็จ: ${itemName}`, type: 'success' });
                setItemName('');
                setQuantity('');
                setSuccessCount(successCount + 1);
            } else {
                setToast({ message: data.error || 'เกิดข้อผิดพลาดในการบันทึก', type: 'error' });
            }
        } catch (error) {
            console.error('Submit error:', error);
            setToast({ message: 'ไม่สามารถติดต่อเซิร์ฟเวอร์ได้', type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex h-screen bg-background">
            <Sidebar isOpen={sidebarOpen} />

            <div className={`flex-1 flex flex-col transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-20'}`}>
                <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />

                <main className="flex-1 overflow-y-auto p-6 flex items-center justify-center">
                    <div className="w-full max-w-2xl">
                        {/* Page Header */}
                        <div className="mb-6 text-center">
                            <h1 className="text-4xl font-bold text-foreground">⚡ บันทึกของเข้าด่วน</h1>
                            <p className="text-muted-foreground mt-2">บันทึกของบริจาคเข้าสต็อกส่วนกลางอย่างรวดเร็วใน 3 ขั้นตอน</p>
                        </div>

                        {/* Success Stats */}
                        {successCount > 0 && (
                            <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                                <p className="text-sm text-green-800 dark:text-green-200">
                                    ✓ บันทึกสำเร็จแล้ว <span className="font-semibold">{successCount}</span> รายการในเซッชันนี้
                                </p>
                            </div>
                        )}

                        {/* Main Form Card */}
                        <Card className="shadow-lg">
                            <CardHeader className="border-b">
                                <CardTitle>บันทึกสินค้าใหม่</CardTitle>
                                <CardDescription>กรอกข้อมูลสินค้าที่ต้องการบันทึก</CardDescription>
                            </CardHeader>

                            <CardContent className="p-8">
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    {/* Step 1: Category Selection */}
                                    <div>
                                        <label className="text-sm font-semibold text-foreground mb-3 block">
                                            ขั้นตอนที่ 1: เลือกหมวดหมู่
                                        </label>
                                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                            {CATEGORIES.map((cat) => (
                                                <button
                                                    key={cat}
                                                    type="button"
                                                    onClick={() => setCategory(cat)}
                                                    className={`p-3 rounded-lg border-2 transition-all font-medium text-sm ${
                                                        category === cat
                                                            ? 'border-primary bg-primary/10 text-primary'
                                                            : 'border-border bg-background text-foreground hover:border-primary/50'
                                                    }`}
                                                >
                                                    {cat}
                                                </button>
                                            ))}
                                        </div>
                                        {category && (
                                            <p className="text-xs text-muted-foreground mt-2">
                                                ✓ เลือก: {category}
                                            </p>
                                        )}
                                    </div>

                                    {/* Step 2: Item Details */}
                                    <div>
                                        <label className="text-sm font-semibold text-foreground mb-3 block">
                                            ขั้นตอนที่ 2: กรอกข้อมูลสินค้า
                                        </label>
                                        <div className="space-y-3">
                                            <div>
                                                <label className="text-xs font-medium text-muted-foreground mb-1 block">
                                                    ชื่อรายการสิ่งของ
                                                </label>
                                                <Input
                                                    type="text"
                                                    placeholder="เช่น ข้าวสาร 5 กิโลกรัม, ยาแก้ปวด..."
                                                    value={itemName}
                                                    onChange={(e) => setItemName(e.target.value)}
                                                    autoFocus
                                                    className="text-base"
                                                />
                                            </div>

                                            <div className="grid grid-cols-2 gap-3">
                                                <div>
                                                    <label className="text-xs font-medium text-muted-foreground mb-1 block">
                                                        จำนวน
                                                    </label>
                                                    <Input
                                                        type="number"
                                                        placeholder="0"
                                                        value={quantity}
                                                        onChange={(e) => setQuantity(e.target.value)}
                                                        min="1"
                                                        className="text-base"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="text-xs font-medium text-muted-foreground mb-1 block">
                                                        หน่วย
                                                    </label>
                                                    <select
                                                        value={unit}
                                                        onChange={(e) => setUnit(e.target.value)}
                                                        className="w-full px-3 py-2 rounded-md border border-input bg-background text-foreground text-base"
                                                    >
                                                        {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                                                    </select>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Step 3: Confirmation */}
                                    {itemName && quantity && (
                                        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                                            <p className="text-sm text-foreground mb-2">
                                                <span className="font-semibold">ขั้นตอนที่ 3: ยืนยันการบันทึก</span>
                                            </p>
                                            <p className="text-sm text-muted-foreground">
                                                บันทึก: <span className="font-semibold text-foreground">{itemName}</span> {quantity} {unit} จากหมวดหมู่ <Badge variant="outline">{category}</Badge>
                                            </p>
                                        </div>
                                    )}

                                    {/* Submit Button */}
                                    <Button
                                        type="submit"
                                        disabled={loading || !itemName.trim() || !quantity}
                                        className="w-full py-6 text-base font-semibold"
                                        size="lg"
                                    >
                                        {loading ? 'กำลังบันทึก...' : '✓ ยืนยันการบันทึก'}
                                    </Button>
                                </form>

                                {/* Quick Tip */}
                                <div className="mt-6 p-3 bg-muted rounded-lg border border-border">
                                    <p className="text-xs text-muted-foreground">
                                        💡 <span className="font-medium">เคล็ดลับ:</span> กด Enter หลังกรอกจำนวนเพื่อบันทึกเร็วขึ้น หรือกดปุ่ม ✓ ด้านล่าง
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </main>
            </div>

            {/* Toast Notification */}
            {toast && (
                <div className={`fixed bottom-6 right-6 p-4 rounded-lg shadow-lg text-white max-w-sm z-50 transition-all ${
                    toast.type === 'success'
                        ? 'bg-green-500 dark:bg-green-600'
                        : 'bg-red-500 dark:bg-red-600'
                }`}>
                    <p className="text-sm font-medium">{toast.message}</p>
                    <button
                        onClick={() => setToast(null)}
                        className="absolute top-2 right-2 text-white/70 hover:text-white text-xl leading-none"
                    >
                        ✕
                    </button>
                </div>
            )}
        </div>
    );
}
