import axios from "axios";

import type {
  CaptchaResponse,
  LoginRequest,
  LoginResponse,
} from "../types/auth";

const authApi = axios.create({
  baseURL: "/api/v1",
  timeout: 30000,
});

export async function getCaptcha(): Promise<CaptchaResponse> {
  const response = await authApi.get<CaptchaResponse>(
    "/auth/captcha"
  );
  return response.data;
}

export async function login(
  request: LoginRequest
): Promise<LoginResponse> {
  const response = await authApi.post<LoginResponse>(
    "/auth/login",
    request
  );
  return response.data;
}
