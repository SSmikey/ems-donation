'use client';

import { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import CreateRequestModal from './CreateRequestModal';

interface Request {
    _id: string;
    requestNo?: string;
    shelterName: string;
    items: { itemName: string; quantity: number }[];
    status: 'รอดำเนินการ' | 'อนุมัติแล้ว' | 'กำลังจัดส่ง' | 'ส่งมอบแล้ว';
    urgency: 'สูง' | 'กลาง' | 'ต่ำ';
    createdAt: string;
}

export default function DistributionPage() {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [requests, setRequests] = useState<Request[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState('all');
    const [filterUrgency, setFilterUrgency] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');

    const fetchRequests = async () => {
        try {
            setLoading(true);
            const res = await fetch('/api/distribution-requests');

            const contentType = res.headers.get("content-type");
            if (contentType && contentType.includes("application/json")) {
                const data = await res.json();
                if (data.success) {
                    setRequests(data.data);
                }
            } else {
                console.warn("API not ready, using mock data");
                setRequests([
                    {
                        _id: 'MOCK-001',
                        shelterName: 'ศูนย์พักพิงเทศบาล (Mock)',
                        items: [{ itemName: 'ข้าวสาร', quantity: 20 }, { itemName: 'น้ำดื่ม', quantity: 50 }],
                        status: 'รอดำเนินการ',
                        urgency: 'สูง',
                        createdAt: new Date().toISOString()
                    }
                ]);
            }
        } catch (error) {
            console.error('Failed to fetch requests', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRequests();
    }, []);

    const getUrgencyColor = (urgency: string) => {
        switch (urgency) {
            case 'สูง': return 'bg-red-100 text-red-800';
            case 'กลาง': return 'bg-amber-100 text-amber-800';
            default: return 'bg-green-100 text-green-800';
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'รอดำเนินการ': return 'bg-blue-100 text-blue-800';
            case 'อนุมัติแล้ว': return 'bg-cyan-100 text-cyan-800';
            case 'กำลังจัดส่ง': return 'bg-purple-100 text-purple-800';
            default: return 'bg-green-100 text-green-800';
        }
    };

    const filteredRequests = requests.filter(req => {
        const matchesStatus = filterStatus === 'all' || req.status === filterStatus;
        const matchesUrgency = filterUrgency === 'all' || req.urgency === filterUrgency;
        const matchesSearch = req.shelterName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            req.requestNo?.includes(searchTerm);
        return matchesStatus && matchesUrgency && matchesSearch;
    });

    const pendingCount = requests.filter(r => r.status === 'รอดำเนินการ').length;
    const approvedCount = requests.filter(r => r.status === 'อนุมัติแล้ว').length;
    const shippingCount = requests.filter(r => r.status === 'กำลังจัดส่ง').length;

    return (
        <div className="flex h-screen bg-background">
            <Sidebar isOpen={sidebarOpen} />

            <div className={`flex-1 flex flex-col transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-20'}`}>
                <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />

                <main className="flex-1 overflow-y-auto p-6">
                    {/* Page Header */}
                    <div className="mb-6">
                        <h1 className="text-3xl font-bold text-foreground">รายการคำขอเบิกสิ่งของ</h1>
                        <p className="text-muted-foreground mt-1">จัดการคำขอเบิกสินค้าและการจัดส่งไปยังศูนย์พักพิง</p>
                    </div>

                    {/* Request Summary */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-sm font-medium">รอดำเนินการ</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-blue-600">{pendingCount}</div>
                                <p className="text-xs text-muted-foreground mt-1">คำขออพยพ</p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-sm font-medium">อนุมัติแล้ว</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-cyan-600">{approvedCount}</div>
                                <p className="text-xs text-muted-foreground mt-1">รอจัดส่ง</p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-sm font-medium">กำลังจัดส่ง</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-purple-600">{shippingCount}</div>
                                <p className="text-xs text-muted-foreground mt-1">ในขั้นจัดส่ง</p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Action Button */}
                    <div className="mb-6">
                        <Button onClick={() => setIsModalOpen(true)}>
                            + สร้างคำขอใหม่
                        </Button>
                    </div>

                    {/* Filters */}
                    <div className="flex gap-3 mb-6 flex-wrap">
                        <div className="flex-1 min-w-64">
                            <Input
                                placeholder="ค้นหาศูนย์พักพิงหรือเลขที่คำขอ..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="px-3 py-2 rounded-md border border-input bg-background text-foreground"
                        >
                            <option value="all">สถานะทั้งหมด</option>
                            <option value="รอดำเนินการ">รอดำเนินการ</option>
                            <option value="อนุมัติแล้ว">อนุมัติแล้ว</option>
                            <option value="กำลังจัดส่ง">กำลังจัดส่ง</option>
                            <option value="ส่งมอบแล้ว">ส่งมอบแล้ว</option>
                        </select>
                        <select
                            value={filterUrgency}
                            onChange={(e) => setFilterUrgency(e.target.value)}
                            className="px-3 py-2 rounded-md border border-input bg-background text-foreground"
                        >
                            <option value="all">ความเร่งด่วนทั้งหมด</option>
                            <option value="สูง">สูง</option>
                            <option value="กลาง">กลาง</option>
                            <option value="ต่ำ">ต่ำ</option>
                        </select>
                    </div>

                    {/* Requests Table */}
                    <Card>
                        <CardContent className="p-0">
                            {loading ? (
                                <div className="text-center py-12 text-muted-foreground">
                                    กำลังโหลดข้อมูลคำขอเบิกสิ่งของ...
                                </div>
                            ) : filteredRequests.length === 0 ? (
                                <div className="text-center py-12 text-muted-foreground">
                                    ไม่พบรายการคำขอเบิกสิ่งของ
                                </div>
                            ) : (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>เลขที่คำขอ</TableHead>
                                            <TableHead>ศูนย์พักพิง</TableHead>
                                            <TableHead>สินค้าที่ขอ</TableHead>
                                            <TableHead>ความเร่งด่วน</TableHead>
                                            <TableHead>สถานะ</TableHead>
                                            <TableHead className="text-right">วันที่สร้าง</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredRequests.map((req) => (
                                            <TableRow key={req._id}>
                                                <TableCell className="font-medium">{req.requestNo || `REQ-${req._id.slice(-4)}`}</TableCell>
                                                <TableCell>{req.shelterName}</TableCell>
                                                <TableCell>
                                                    <div className="text-sm space-y-1">
                                                        {req.items.slice(0, 2).map((item, idx) => (
                                                            <div key={idx}>{item.itemName} x{item.quantity}</div>
                                                        ))}
                                                        {req.items.length > 2 && (
                                                            <div className="text-xs text-muted-foreground">+{req.items.length - 2} เพิ่มเติม</div>
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge className={getUrgencyColor(req.urgency)}>
                                                        {req.urgency}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge className={getStatusColor(req.status)}>
                                                        {req.status}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-right text-sm text-muted-foreground">
                                                    {new Date(req.createdAt).toLocaleDateString('th-TH')}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            )}
                        </CardContent>
                    </Card>
                </main>
            </div>

            {/* Create Request Modal */}
            {isModalOpen && (
                <CreateRequestModal
                    onClose={() => setIsModalOpen(false)}
                    onSuccess={() => {
                        setIsModalOpen(false);
                        fetchRequests();
                    }}
                />
            )}
        </div>
    );
}