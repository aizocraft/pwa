// src/types/user.ts
export interface User {
  id: string;
  _id?: string;
  name: string;
  email: string;
  role: 'user' | 'sales' | 'admin';
  phone?: string;
  avatar?: string;
  isActive?: boolean;
  lastLogin?: string;
  createdAt?: string;
  updatedAt?: string;
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
  password: string;
  role?: 'user' | 'sales';
  phone?: string;
}

export interface UpdateUserRequest {
  name?: string;
  email?: string;
  role?: 'user' | 'sales' | 'admin';
  phone?: string;
  isActive?: boolean;
}