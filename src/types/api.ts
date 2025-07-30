export interface ApiKey {
  id: string;
  name: string;
  key: string;
  lastUsedAt?: Date;
  expiresAt?: Date;
  revoked: boolean;
}

export interface ApiError {
  code: string;
  message: string;
  status: number;
}

export interface ApiResponse<T = any> {
  data?: T;
  error?: ApiError;
  meta?: {
    page?: number;
    perPage?: number;
    total?: number;
  };
}