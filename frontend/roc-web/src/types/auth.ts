export interface LoginRequest {
  username: string;
  password: string;
  captchaId: string;
  captchaAnswer: string;
}

export interface CaptchaResponse {
  captchaId: string;
  question: string;
  expiresInSeconds: number;
}

export interface AuthUser {
  id: number;
  username: string;
  fullName: string;
  role: string;
}

export interface LoginResponse {
  token: string;
  tokenType: string;
  user: AuthUser;
}
