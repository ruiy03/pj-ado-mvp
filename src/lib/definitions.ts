export type UserRole = 'admin' | 'editor';

export interface User {
  id: number;
  email: string;
  password: string;
  name?: string;
  role: UserRole;
  created_at?: string;
  updated_at?: string;
}

export interface CreateUserRequest {
  name: string;
  email: string;
  password: string;
  role: UserRole;
}

export interface UpdateUserRequest {
  id: number;
  name?: string;
  email?: string;
  role?: UserRole;
  password?: string;
}

export interface AdTemplate {
  id: number;
  name: string;
  html: string;
  placeholders: string[];
  description?: string;
  created_at?: string;
  updated_at?: string;
}

export interface CreateAdTemplateRequest {
  name: string;
  html: string;
  placeholders: string[];
  description?: string;
}

export interface UpdateAdTemplateRequest {
  id: number;
  name?: string;
  html?: string;
  placeholders?: string[];
  description?: string;
}

export interface UrlTemplate {
  id: number;
  name: string;
  url: string;
  parameters: Record<string, string>;
  description?: string;
  created_at?: string;
  updated_at?: string;
}

export interface CreateUrlTemplateRequest {
  name: string;
  url: string;
  parameters: Record<string, string>;
  description?: string;
}

export interface UpdateUrlTemplateRequest {
  id: number;
  name?: string;
  url?: string;
  parameters?: Record<string, string>;
  description?: string;
}

// NextAuth拡張用の型定義
declare module "next-auth" {
  interface User {
    role: UserRole;
  }
  interface Session {
    user: {
      id: string;
      email: string;
      name?: string;
      role: UserRole;
    }
  }
}
