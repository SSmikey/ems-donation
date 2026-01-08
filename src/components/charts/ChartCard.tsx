interface ChartCardProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  loading?: boolean;
  error?: string;
  height?: number;
  actions?: React.ReactNode;
}

export default function ChartCard({
  title,
  subtitle,
  children,
  loading = false,
  error,
  height = 400,
  actions,
}: ChartCardProps) {
  return (
    <div
      className="card shadow-sm h-100"
      style={{
        background: '#ffffff',
        border: '1px solid #e9ecef',
        borderRadius: '12px',
        transition: 'all 0.3s ease',
      }}
    >
      <div className="card-body p-4">
        <div className="d-flex justify-content-between align-items-start mb-3">
          <div>
            <h6 className="fw-bold mb-1" style={{ fontSize: '16px', color: '#111827' }}>
              {title}
            </h6>
            {subtitle && (
              <p className="text-muted mb-0" style={{ fontSize: '13px' }}>
                {subtitle}
              </p>
            )}
          </div>
          {actions && <div>{actions}</div>}
        </div>

        <div style={{ height: `${height}px`, position: 'relative' }}>
          {loading ? (
            <div
              className="d-flex flex-column justify-content-center align-items-center h-100"
              style={{ color: '#6b7280' }}
            >
              <div className="spinner-border mb-3" role="status" style={{ color: '#6366f1' }}>
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="mb-0" style={{ fontSize: '14px' }}>
                กำลังโหลดข้อมูล...
              </p>
            </div>
          ) : error ? (
            <div
              className="d-flex flex-column justify-content-center align-items-center h-100"
              style={{ color: '#ef4444' }}
            >
              <svg
                width="48"
                height="48"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="mb-3"
              >
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
              <p className="mb-0 fw-500" style={{ fontSize: '14px' }}>
                {error}
              </p>
            </div>
          ) : (
            children
          )}
        </div>
      </div>
    </div>
  );
}
