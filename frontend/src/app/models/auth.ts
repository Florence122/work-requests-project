export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  role: 'Admin' | 'Agent';
}

export interface AuthResponse {
  user: {
    id: number;
    username: string;
    email: string;
    role: 'Admin' | 'Agent';
  };
  token?: string;
}