// src/types/user.ts - Extended with password functions
export interface User {
  id: string;
  _id?: string;
  name: string;
  email: string;
  role: 'user' | 'sales' | 'admin';
  phone?: string;
  avatar?: string;
  isActive: boolean;
  lastLogin?: string;
  createdAt?: string;
  updatedAt?: string;
  
  provider: 'local' | 'google';
  googleId?: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
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

export interface UserResponse {
  success: boolean;
  data: User;
  stats?: {
    orderCount: number;
    totalSpent: number;
  };
  message?: string;
}

export interface BulkStatusResponse {
  success: boolean;
  message: string;
  data: {
    matched: number;
    modified: number;
  };
}

export interface CreateUserRequest {
  name: string;
  email: string;
  password?: string;
  role?: 'user' | 'sales' | 'admin';
  phone?: string;
  provider?: 'local' | 'google';
}

export interface UpdateUserRequest {
  name?: string;
  email?: string;
  role?: 'user' | 'sales' | 'admin';
  phone?: string;
  isActive?: boolean;
  avatar?: string;
}
