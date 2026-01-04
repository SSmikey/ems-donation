'use client';

interface TimelineEvent {
  status: string;
  note?: string;
  createdBy: string;
  createdAt: Date;
}

interface RequestTimelineProps {
  events: TimelineEvent[];
}

const STATUS_LABELS: Record<string, { label: string; icon: string; color: string }> = {
  pending: { label: 'รอดำเนินการ', icon: '⏳', color: 'bg-yellow-500' },
  reserved: { label: 'จองสต็อก', icon: '✋', color: 'bg-blue-500' },
  approved: { label: 'อนุมัติแล้ว', icon: '✅', color: 'bg-green-500' },
  shipping: { label: 'จัดส่งแล้ว', icon: '🚚', color: 'bg-purple-500' },
  completed: { label: 'ส่งมอบแล้ว', icon: '🎉', color: 'bg-green-600' },
  cancelled: { label: 'ยกเลิก', icon: '❌', color: 'bg-red-500' },
  released: { label: 'คืนสต็อก', icon: '↩️', color: 'bg-orange-500' },
  deducted: { label: 'หักสต็อก', icon: '📉', color: 'bg-indigo-500' },
};

export function RequestTimeline({ events }: RequestTimelineProps) {
  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-lg">ประวัติการเปลี่ยนสถานะ</h3>

      <div className="relative">
        {events.length === 0 ? (
          <p className="text-sm text-muted-foreground">ไม่มีประวัติ</p>
        ) : (
          <div className="space-y-4">
            {events.map((event, index) => {
              const config = STATUS_LABELS[event.status] || {
                label: event.status,
                icon: '•',
                color: 'bg-gray-500',
              };

              return (
                <div key={index} className="flex gap-4">
                  {/* Timeline dot */}
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-10 h-10 rounded-full ${config.color} flex items-center justify-center text-white font-bold`}
                    >
                      {config.icon}
                    </div>
                    {index < events.length - 1 && (
                      <div className="w-0.5 h-12 bg-border mt-2"></div>
                    )}
                  </div>

                  {/* Event content */}
                  <div className="pb-4 pt-2">
                    <p className="font-semibold text-sm">{config.label}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(event.createdAt).toLocaleString('th-TH')}
                    </p>
                    {event.note && (
                      <p className="text-sm mt-1 text-foreground">{event.note}</p>
                    )}
                    <p className="text-xs text-muted-foreground mt-1">
                      โดย: {event.createdBy}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
