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

export interface SessionUser {
  id: string;
  email: string;
  name?: string;
  role: UserRole;
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
  description?: string;
  created_at?: string;
  updated_at?: string;
}

export interface CreateAdTemplateRequest {
  name: string;
  html: string;
  description?: string;
}

export interface UpdateAdTemplateRequest {
  id: number;
  name?: string;
  html?: string;
  description?: string;
}

export interface UrlTemplate {
  id: number;
  name: string;
  url_template: string; // プレースホルダーを含むURLテンプレート（例: "{{baseUrl}}?utm_source=kijinaka&utm_campaign=03"）
  description?: string;
  created_at?: string;
  updated_at?: string;
}

export interface CreateUrlTemplateRequest {
  name: string;
  url_template: string;
  description?: string;
}

export interface UpdateUrlTemplateRequest {
  id: number;
  name?: string;
  url_template?: string;
  description?: string;
}

export type AdContentStatus = 'draft' | 'active' | 'paused' | 'archived';

export interface AdImage {
  id: number;
  ad_content_id: number;
  blob_url: string;
  original_filename?: string;
  file_size?: number;
  mime_type?: string;
  alt_text?: string;
  placeholder_name?: string;
  created_at?: string;
}

export interface AdContent {
  id: number;
  name: string;
  template_id: number;
  url_template_id: number;
  content_data: Record<string, string | number | boolean>;
  status: AdContentStatus;
  created_by?: number;
  created_at?: string;
  updated_at?: string;
  impressions?: number;
  clicks?: number;
  // 関連データ
  template?: AdTemplate;
  url_template?: UrlTemplate;
  images?: AdImage[];
  created_by_user?: {
    id: number;
    name: string;
    email: string;
  };
}

export interface CreateAdContentRequest {
  name: string;
  template_id: number;
  url_template_id: number;
  content_data: Record<string, string | number | boolean>;
  status?: AdContentStatus;
}

export interface UpdateAdContentRequest {
  id: number;
  name?: string;
  template_id?: number;
  url_template_id?: number;
  content_data?: Record<string, string | number | boolean>;
  status?: AdContentStatus;
}

export interface CreateAdImageRequest {
  ad_content_id: number;
  blob_url: string;
  original_filename?: string;
  file_size?: number;
  mime_type?: string;
  alt_text?: string;
  placeholder_name?: string;
}

export interface UpdateAdImageRequest {
  id: number;
  alt_text?: string;
  placeholder_name?: string;
}


// Import result interfaces
export interface ImportedItem {
  id: number;
  name: string;
}

export interface ImportError {
  row: number;
  name?: string;
  message: string;
}

export interface ImportResult {
  success: number;
  errors: ImportError[];
  total: number;
  createdItems: ImportedItem[];
  updatedItems: ImportedItem[];
  skippedItems: ImportedItem[];
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
