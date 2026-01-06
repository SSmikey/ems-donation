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
      className="card shadow-sm border-0 h-100"
      style={{
        borderBottom: `4px solid ${colorMap[color]}`,
        transition: 'all 0.3s ease',
        cursor: 'pointer'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-4px)';
        e.currentTarget.style.boxShadow = '0 8px 20px rgba(0, 0, 0, 0.2)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '';
      }}
    >
      <div className="card-body d-flex flex-column justify-content-between">
        <div>
          <h6 className="text-muted text-uppercase fw-500 mb-3" style={{ fontSize: '14px', letterSpacing: '0.5px' }}>
            {title}
          </h6>
        </div>
        <div>
          <p className="display-6 fw-bold mb-0" style={{ fontSize: '28px' }}>
            {value}
          </p>
        </div>
      </div>
    </div>
  );
}
