import axios from "axios";
import { api } from "./api";
import type { Signal, SignalFeedResponse, SignalStatus } from "../types";

const deployedApiBaseUrl = "https://hackaton-20261-front-587720740455.us-east1.run.app/api/v1";

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
  if (import.meta.env.DEV) {
    const { data } = await api.patch<Signal>(`/signals/${id}/status`, { status });
    return data;
  }

  const token = localStorage.getItem("tropelcare_token");
  try {
    const { data } = await axios.patch<Signal>(`/api/signals/${id}/status`, { status }, {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      timeout: 15000,
    });
    return data;
  } catch {
    const { data } = await axios.patch<Signal>(`${deployedApiBaseUrl}/signals/${id}/status`, { status }, {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      timeout: 15000,
    });
    return data;
  }
}
