export interface RequestTimeline {
  _id?: string;
  requestId: string;
  status: string;
  note?: string;
  createdBy: string;
  createdAt: Date;
}
