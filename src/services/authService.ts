import { api } from "./api";
import type { LoginResponse, User } from "../types";

export async function login(teamCode: string, email: string, password: string): Promise<LoginResponse> {
  const { data } = await api.post<LoginResponse>("/auth/login", { teamCode, email, password });
  return data;
}

export async function me(): Promise<User> {
  const { data } = await api.get<User>("/auth/me");
  return data;
}
