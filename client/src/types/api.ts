// src/types/api.ts
export interface ApiResponse<T = any> {
  data?: T;
  message?: string;
  error?: string;
}

export interface AuthResponse {
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: 'user' | 'sales' | 'admin';
    isActive?: boolean;
  };
  message?: string;
}

export interface ProfileResponse {
  user: {
    id: string;
    name: string;
    email: string;
    role: 'user' | 'sales' | 'admin';
    phone?: string;
    avatar?: string;
    isActive?: boolean;
    lastLogin?: string;
    createdAt: string;
    updatedAt: string;
  };
}