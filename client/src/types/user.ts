// src/types/user.ts
export interface User {
  id: string;
  _id?: string;
  name: string;
  email: string;
  role: 'user' | 'sales' | 'admin';
  phone?: string;
  avatar?: string;
  isActive: boolean;  // Make required (not optional)
  lastLogin?: string;
  createdAt?: string;
  updatedAt?: string;
  
  // Google Auth fields
  provider: 'local' | 'google';
  googleId?: string;
}

export interface UserListResponse {
  users: User[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface CreateUserRequest {
  name: string;
  email: string;
  password?: string;  // Make optional for Google users
  role?: 'user' | 'sales';
  phone?: string;
  provider?: 'local' | 'google';  // Allow specifying provider
}

export interface UpdateUserRequest {
  name?: string;
  email?: string;
  role?: 'user' | 'sales' | 'admin';
  phone?: string;
  isActive?: boolean;
  avatar?: string;
}