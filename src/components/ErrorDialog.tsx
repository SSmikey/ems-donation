'use client';

interface ErrorDialogProps {
  title: string;
  message: string;
  details?: string[];
  onClose: () => void;
}

export default function ErrorDialog({ title, message, details, onClose }: ErrorDialogProps) {
  return (
    <div
      className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
      style={{
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        zIndex: 10000,
        backdropFilter: 'blur(4px)',
        animation: 'fadeIn 0.2s ease-out'
      }}
      onClick={onClose}
    >
      <div
        className="card border-0 shadow-2xl"
        style={{
          width: '90%',
          maxWidth: '500px',
          borderRadius: '16px',
          overflow: 'hidden',
          animation: 'slideDown 0.3s ease-out'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with gradient */}
        <div
          className="card-header border-0 text-white p-4"
          style={{
            background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
          }}
        >
          <div className="d-flex align-items-center gap-3">
            <div
              className="d-flex align-items-center justify-content-center rounded-circle bg-white bg-opacity-25"
              style={{ width: '48px', height: '48px' }}
            >
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
            </div>
            <div className="flex-grow-1">
              <h5 className="mb-0 fw-bold" style={{ fontSize: '20px' }}>{title}</h5>
            </div>
            <button
              onClick={onClose}
              className="btn-close btn-close-white"
              aria-label="Close"
              style={{ opacity: 0.9 }}
            ></button>
          </div>
        </div>

        {/* Body */}
        <div className="card-body p-4">
          <div className="mb-3">
            <p className="mb-0" style={{ fontSize: '15px', color: '#374151', lineHeight: '1.6' }}>
              {message}
            </p>
          </div>

          {details && details.length > 0 && (
            <div
              className="p-3 rounded-3"
              style={{
                backgroundColor: '#fef2f2',
                border: '1px solid #fecaca'
              }}
            >
              <div className="small fw-semibold text-danger mb-2" style={{ fontSize: '13px' }}>
                รายละเอียด:
              </div>
              <ul className="mb-0 ps-3" style={{ fontSize: '14px', color: '#991b1b' }}>
                {details.map((detail, idx) => (
                  <li key={idx} className="mb-1">{detail}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="card-footer bg-white border-0 p-4 pt-0">
          <button
            onClick={onClose}
            className="btn btn-danger w-100 fw-bold py-2 rounded-3"
            style={{
              fontSize: '15px',
              backgroundColor: '#ef4444',
              border: 'none',
              boxShadow: '0 2px 4px rgba(239, 68, 68, 0.2)'
            }}
          >
            ตรวจสอบแล้ว
          </button>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-20px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        .shadow-2xl {
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25) !important;
        }
      `}</style>
    </div>
  );
}
