export type UserRole = 'REQUESTER' | 'ANALYST' | 'ADMIN';

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
}

export interface UserResponse {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export interface AdminUserResponse extends UserResponse {
  is_current_user: boolean;
}

export interface UserRoleUpdate {
  role: 'REQUESTER' | 'ANALYST';
}

export interface UserRoleHistoryResponse {
  id: number;
  target_user_id: number;
  target_user_name: string | null;
  admin_user_id: number;
  admin_user_name: string | null;
  previous_role: UserRole;
  new_role: UserRole;
  created_at: string;
}