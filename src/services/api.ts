import axios, { AxiosError } from "axios";
import type { ApiErrorResponse } from "../types";

const deployedApiBaseUrl = "https://hackaton-20261-front-587720740455.us-east1.run.app/api/v1";
const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || (import.meta.env.DEV ? "/api/v1" : deployedApiBaseUrl);

export const api = axios.create({
  baseURL: apiBaseUrl,
  timeout: 15000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("tropelcare_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiErrorResponse>) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("tropelcare_token");
    }
    return Promise.reject(error);
  }
);

export function getApiErrorMessage(error: unknown): string {
  if (axios.isAxiosError<ApiErrorResponse>(error)) {
    return error.response?.data?.message ?? error.message;
  }
  return "Error inesperado";
}
