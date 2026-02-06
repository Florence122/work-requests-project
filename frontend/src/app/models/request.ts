export interface Request {
  id: number;
  title: string;
  description: string;
  priority: 'Low' | 'Medium' | 'High';
  status: 'Open' | 'In Progress' | 'Done';
  createdDate: Date;
  updatedDate?: Date;
  assignedAgentId?: number;
  assignedAgentName?: string;
  comments?: Comment[];
  // Add for sorting
  lastUpdated?: Date;
}

export interface Comment {
  id: number;
  requestId: number;
  userId: number;
  userName: string;
  content: string;
  createdAt: Date;
}

// Priority order for sorting
export const PRIORITY_ORDER = {
  'High': 1,
  'Medium': 2,
  'Low': 3
};