interface StatCardProps {
  title: string;
  value: string;
  color: 'cyan' | 'purple' | 'red';
}

const colorMap = {
  cyan: '#00d4ff',
  purple: '#c084fc',
  red: '#f87171'
};

export default function StatCard({
  title,
  value,
  color,
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
          <h6 className="text-uppercase fw-700 mb-3" style={{ fontSize: '13px', letterSpacing: '0.8px', color: '#111827' }}>
            {title}
          </h6>
        </div>
        <div>
          <p className="display-6 fw-bold mb-0" style={{ fontSize: '32px', color: '#111827' }}>
            {value}
          </p>
        </div>
      </div>
    </div>
  );
}
