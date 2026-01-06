'use client';

interface ConfirmDialogProps {
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
  isDangerous?: boolean;
}

export default function ConfirmDialog({
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = 'ยืนยัน',
  cancelText = 'ยกเลิก',
  isDangerous = false
}: ConfirmDialogProps) {
  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 2000,
        backdropFilter: 'blur(4px)'
      }}
      onClick={onCancel}
    >
      <div
        className="card shadow-lg border-0"
        style={{
          maxWidth: '400px',
          width: '90%',
          animation: 'slideIn 0.3s ease-out'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="card-body">
          <h5 className="card-title mb-3 fw-bold">{title}</h5>
          <p className="card-text text-muted mb-4">{message}</p>
          <div className="d-flex gap-2 justify-content-end">
            <button
              className="btn btn-outline-secondary"
              onClick={onCancel}
            >
              {cancelText}
            </button>
            <button
              className={isDangerous ? 'btn btn-danger' : 'btn btn-primary'}
              onClick={onConfirm}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
      <style>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
