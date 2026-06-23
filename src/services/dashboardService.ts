import { api } from "./api";
import type { DashboardSummary } from "../types";

export async function getDashboardSummary(signal?: AbortSignal): Promise<DashboardSummary> {
  const { data } = await api.get<DashboardSummary>("/dashboard/summary", { signal });
  return data;
}
