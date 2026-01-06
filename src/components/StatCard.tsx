interface StatCardProps {
  title: string;
  value: string;
  subtitle?: string;
  color: 'cyan' | 'purple' | 'red' | 'green' | 'gray' | 'blue' | 'orange' | 'pink' | 'indigo';
  progress?: number;
}

const colorMap = {
  cyan: '#00d4ff',
  purple: '#c084fc',
  red: '#f87171',
  green: '#10b981',
  gray: '#9ca3af',
  blue: '#3b82f6',
  orange: '#f59e0b',
  pink: '#ec4899',
  indigo: '#6366f1'
};

export default function StatCard({
  title,
  value,
  subtitle,
  color,
  progress,
}: StatCardProps) {
  return (
    <div
      className="card shadow-sm h-100"
      style={{
        background: '#ffffff',
        border: '1px solid #e9ecef',
        borderBottom: `4px solid ${colorMap[color]}`,
        transition: 'all 0.3s ease',
        cursor: 'pointer'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-4px)';
        e.currentTarget.style.boxShadow = '0 8px 20px rgba(0, 0, 0, 0.1)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)';
      }}
    >
      <div className="card-body d-flex flex-column justify-content-between">
        <div>
          <h6 className="text-uppercase fw-700 mb-3" style={{ fontSize: '11px', letterSpacing: '0.8px', color: '#6b7280' }}>
            {title}
          </h6>
        </div>
        <div>
          <div className="d-flex align-items-baseline gap-2">
            <p className="display-6 fw-bold mb-0" style={{ fontSize: '28px', color: '#111827' }}>
              {value}
            </p>
            {subtitle && (
              <span className="fw-500" style={{ fontSize: '13px', color: '#ef4444' }}>
                {subtitle}
              </span>
            )}
          </div>
          {progress !== undefined && (
            <div className="mt-3">
              <div className="progress" style={{ height: '6px', backgroundColor: '#f3f4f6', borderRadius: '3px' }}>
                <div
                  className="progress-bar"
                  style={{
                    width: `${Math.max(0, Math.min(100, progress))}%`,
                    backgroundColor: colorMap[color],
                    borderRadius: '3px',
                    transition: 'width 1s ease-in-out'
                  }}
                />
              </div>
              <div className="d-flex justify-content-between mt-1">
                <span className="fw-600" style={{ fontSize: '10px', color: '#6b7280' }}>
                  {progress.toFixed(1)}% พัสดุคงเหลือ
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
