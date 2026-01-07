'use client';

import { useState } from 'react';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import QuickDonationContent from '@/components/QuickDonationContent';

export default function QuickDonationPage() {
    const [sidebarOpen, setSidebarOpen] = useState(true);

    return (
        <div className="d-flex" style={{ minHeight: '100vh', background: '#ffffff', color: '#111827' }}>
            <Sidebar isOpen={sidebarOpen} />
            <div className="flex-grow-1 d-flex flex-column" style={{ overflow: 'hidden' }}>
                <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />

                <div className="flex-grow-1 overflow-y-auto d-flex justify-content-center align-items-start p-4" style={{ paddingTop: '40px', backgroundColor: '#f8f9fa' }}>
                    <div className="card shadow-lg border-0" style={{ width: '100%', maxWidth: '900px', background: '#ffffff', border: '1px solid #dee2e6' }}>
                        <div className="card-body p-5">
                            <QuickDonationContent />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
