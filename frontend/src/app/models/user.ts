export interface User {
  id: number;
  username: string;
  email: string;
  role: 'Admin' | 'Agent';
}

// Mock users for the project
export const MOCK_USERS: User[] = [
  { id: 1, username: 'Admin User', email: 'admin@company.com', role: 'Admin' },
  { id: 2, username: 'Agent Smith', email: 'agent@company.com', role: 'Agent' }
];