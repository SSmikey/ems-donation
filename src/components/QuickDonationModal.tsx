'use client';

import QuickDonationContent from './QuickDonationContent';

interface QuickDonationModalProps {
    onClose: () => void;
    onSuccess: () => void;
}

export default function QuickDonationModal({ onClose, onSuccess }: QuickDonationModalProps) {
    return (
        <div className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 9999 }}>
            <div className="card shadow-lg border-0" style={{ width: '90%', maxWidth: '900px', maxHeight: '95vh', overflowY: 'auto', backgroundColor: '#ffffff', borderRadius: '12px' }}>
                <div className="card-header bg-white border-0 d-flex justify-content-end p-3 pb-0">
                    <button type="button" className="btn-close" onClick={onClose} aria-label="Close"></button>
                </div>
                <div className="card-body p-5 pt-0">
                    <QuickDonationContent onSuccess={onSuccess} />
                </div>
            </div>
        </div>
    );
}
