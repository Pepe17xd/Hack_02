import { api } from "./api";
import type { Signal, SignalFeedResponse, SignalStatus } from "../types";

export interface FeedQuery {
  cursor?: string | null;
  limit?: number;
  signalType?: string;
  severity?: string;
  status?: string;
  q?: string;
}

export async function getSignalFeed(params: FeedQuery, signal?: AbortSignal): Promise<SignalFeedResponse> {
  const cleanParams = Object.fromEntries(Object.entries(params).filter(([, v]) => v !== "" && v !== null && v !== undefined));
  const { data } = await api.get<SignalFeedResponse>("/signals/feed", { params: cleanParams, signal });
  return data;
}

export async function getSignal(id: string, signal?: AbortSignal): Promise<Signal> {
  const { data } = await api.get<Signal>(`/signals/${id}`, { signal });
  return data;
}

export async function updateSignalStatus(id: string, status: Extract<SignalStatus, "PROCESANDO" | "ATENDIDA">): Promise<Signal> {
  const { data } = await api.patch<Signal>(`/signals/${id}/status`, { status });
  return data;
}
