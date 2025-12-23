'use client';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  type?: 'danger' | 'warning' | 'info';
}

export default function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmText = 'ยืนยัน',
  cancelText = 'ยกเลิก',
  onConfirm,
  onCancel,
  type = 'danger',
}: ConfirmDialogProps) {
  if (!isOpen) return null;

  const styles = {
    danger: { icon: '⚠️', bg: 'bg-red-100', text: 'text-red-600', btn: 'bg-red-600 hover:bg-red-700' },
    warning: { icon: '⚡', bg: 'bg-yellow-100', text: 'text-yellow-600', btn: 'bg-yellow-600 hover:bg-yellow-700' },
    info: { icon: 'ℹ️', bg: 'bg-blue-100', text: 'text-blue-600', btn: 'bg-blue-600 hover:bg-blue-700' },
  };

  const style = styles[type];

  return (
    <>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9998]" onClick={onCancel} />
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md" onClick={(e) => e.stopPropagation()}>
          <div className="flex justify-center pt-8 pb-4">
            <div className={`${style.bg} ${style.text} w-20 h-20 rounded-full flex items-center justify-center text-4xl`}>
              {style.icon}
            </div>
          </div>
          <div className="px-8 pb-6 text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-3">{title}</h2>
            <p className="text-gray-600">{message}</p>
            <p className="text-sm text-gray-500 mt-3">การกระทำนี้ไม่สามารถย้อนกลับได้</p>
          </div>
          <div className="bg-gray-50 px-8 py-6 flex gap-3">
            <button onClick={onCancel} className="flex-1 px-6 py-3 bg-white border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-100">
              {cancelText}
            </button>
            <button onClick={onConfirm} className={`flex-1 px-6 py-3 ${style.btn} text-white rounded-xl font-semibold shadow-lg`}>
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}