interface EmptyChartStateProps {
  message: string;
}

export default function EmptyChartState({ message }: EmptyChartStateProps) {
  return (
    <div
      className="d-flex flex-column justify-content-center align-items-center h-100"
      style={{ color: '#9ca3af' }}
    >
      <svg
        width="64"
        height="64"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="mb-3"
      >
        <line x1="18" y1="20" x2="18" y2="10"></line>
        <line x1="12" y1="20" x2="12" y2="4"></line>
        <line x1="6" y1="20" x2="6" y2="14"></line>
      </svg>
      <p className="mb-0 text-center" style={{ fontSize: '14px', fontWeight: 500 }}>
        {message}
      </p>
    </div>
  );
}
