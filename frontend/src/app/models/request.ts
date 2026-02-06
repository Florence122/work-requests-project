export interface Request {
  id: number;
  title: string;
  description: string;
  priority: 'Low' | 'Medium' | 'High';
  status: 'Open' | 'In Progress' | 'Done';
  createdDate: Date;
  assignedAgentId?: number;
  assignedAgentName?: string;
  updatedDate?: Date;
  comments?: Comment[];
}

export interface Comment {
  id: number;
  requestId: number;
  userId: number;
  userName: string;
  content: string;
  createdAt: Date;
}