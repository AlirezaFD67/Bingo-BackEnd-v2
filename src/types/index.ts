// Auth types
export type { User as AuthUser } from './auth';
export type { LoginDto, RegisterDto, AuthResponse, RequestOtpDto, RequestOtpResponse, VerifyOtpDto, VerifyOtpResponse, RefreshTokenDto, JwtPayload, SessionData } from './auth';
export { UserRole, AuthProvider } from './auth';

// User types
export * from './user';

// Common types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  timestamp: string;
  duration?: number;
}

export interface PaginatedResponse<T = any> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface ErrorResponse {
  error: string;
  status: number;
  timestamp: string;
  path?: string;
  method?: string;
}

export interface ValidationError {
  field: string;
  message: string;
  value?: any;
}

export interface FileUpload {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  destination: string;
  filename: string;
  path: string;
  size: number;
}

// Database types
export interface BaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface SoftDeleteEntity extends BaseEntity {
  deletedAt?: Date;
}

// Generic types
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

// Status types
export enum Status {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  PENDING = 'pending',
  SUSPENDED = 'suspended',
}

// Sort types
export type SortOrder = 'asc' | 'desc';
export interface SortOptions {
  field: string;
  order: SortOrder;
}

// Filter types
export interface BaseFilters {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: SortOrder;
}
