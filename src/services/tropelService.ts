import { api } from "./api";
import type { PaginatedTropels, SectorStoryResponse, SectorsResponse, Tropel, TropelSort } from "../types";

export interface TropelQuery {
  page: number;
  size: 10 | 20 | 50;
  species?: string;
  vitalState?: string;
  sectorId?: string;
  q?: string;
  sort: TropelSort;
}

let sectorsCache: SectorsResponse | null = null;
let sectorsPromise: Promise<SectorsResponse> | null = null;

function cleanParams<T extends object>(params: T): Partial<T> {
  return Object.fromEntries(Object.entries(params).filter(([, value]) => value !== "" && value !== null && value !== undefined)) as Partial<T>;
}

export async function getTropels(params: TropelQuery, signal?: AbortSignal): Promise<PaginatedTropels> {
  const { data } = await api.get<PaginatedTropels>("/tropels", { params: cleanParams(params), signal });
  return data;
}

export async function getTropel(id: string): Promise<Tropel> {
  const { data } = await api.get<Tropel>(`/tropels/${id}`);
  return data;
}

export function getCachedSectors(): SectorsResponse | null {
  return sectorsCache;
}

export function preloadSectors(): Promise<SectorsResponse> {
  if (sectorsCache) return Promise.resolve(sectorsCache);
  if (!sectorsPromise) {
    sectorsPromise = api.get<SectorsResponse>("/sectors")
      .then(({ data }) => {
        sectorsCache = data;
        return data;
      })
      .finally(() => { sectorsPromise = null; });
  }
  return sectorsPromise;
}

export async function getSectors(signal?: AbortSignal): Promise<SectorsResponse> {
  if (sectorsCache) return sectorsCache;
  if (sectorsPromise) return sectorsPromise;
  if (!signal) return preloadSectors();
  const { data } = await api.get<SectorsResponse>("/sectors", { signal });
  sectorsCache = data;
  return data;
}

export async function getSectorStory(id: string, signal?: AbortSignal): Promise<SectorStoryResponse> {
  const { data } = await api.get<SectorStoryResponse>(`/sectors/${id}/story`, { signal });
  return data;
}

