export interface DashboardNeed {
  id: string;
  title: string;
  categoryTag: string;
  status: string;
  pledgeCount: number;
  daysLeft: number;
  location: string;
}

export interface DashboardPledge {
  id: string;
  needId: string;
  needTitle: string;
  donorName: string;
  donorEmail: string;
  description: string;
  status: string;
  createdAt: string;
}
