'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface CriticalAlert {
  id: string;
  type: 'low_stock' | 'critical_center' | 'pending_request';
  severity: 'critical' | 'warning' | 'info';
  title: string;
  description: string;
  action?: string;
  actionUrl?: string;
}

interface CriticalAlertsProps {
  alerts: CriticalAlert[];
  onDismiss?: (id: string) => void;
  onAction?: (id: string, action: string) => void;
}

const SEVERITY_CONFIG = {
  critical: { color: 'bg-red-100 text-red-800', icon: '🚨' },
  warning: { color: 'bg-amber-100 text-amber-800', icon: '⚠️' },
  info: { color: 'bg-blue-100 text-blue-800', icon: 'ℹ️' },
};

export function CriticalAlerts({ alerts, onDismiss, onAction }: CriticalAlertsProps) {
  if (alerts.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">การแจ้งเตือนสำคัญ</CardTitle>
          <CardDescription>ระบบปกติทั้งหมด</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-sm text-muted-foreground">✅ ไม่มีการแจ้งเตือนที่สำคัญ</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">การแจ้งเตือนสำคัญ</CardTitle>
        <CardDescription>
          มี {alerts.length} การแจ้งเตือนที่ต้องการความสนใจ
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {alerts.map((alert) => {
          const config = SEVERITY_CONFIG[alert.severity];
          return (
            <div
              key={alert.id}
              className={`p-4 rounded-md border-l-4 ${
                alert.severity === 'critical'
                  ? 'border-red-500 bg-red-50'
                  : alert.severity === 'warning'
                  ? 'border-amber-500 bg-amber-50'
                  : 'border-blue-500 bg-blue-50'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-lg">{config.icon}</span>
                    <h4 className="font-semibold text-sm">{alert.title}</h4>
                    <Badge className={config.color}>
                      {alert.severity === 'critical'
                        ? 'ฉุกเฉิน'
                        : alert.severity === 'warning'
                        ? 'เตือน'
                        : 'ข้อมูล'}
                    </Badge>
                  </div>
                  <p className="text-sm text-foreground/80">{alert.description}</p>
                </div>

                <div className="flex gap-2 ml-3">
                  {alert.action && (
                    <Button
                      size="sm"
                      variant="default"
                      onClick={() => onAction?.(alert.id, alert.action || '')}
                    >
                      {alert.action}
                    </Button>
                  )}
                  {onDismiss && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onDismiss(alert.id)}
                    >
                      ปิด
                    </Button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
