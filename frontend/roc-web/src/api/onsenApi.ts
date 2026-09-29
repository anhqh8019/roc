import { api } from "./hotelApi";

import type {
  OnsenDashboardResponse,
  OnsenPackageSummary,
  OnsenCurrentGuest,
} from "../types/onsen";


export async function getOnsenDashboard(
  businessDate: string
): Promise<OnsenDashboardResponse> {

  const response =
    await api.get<OnsenDashboardResponse>(
      "/onsen/dashboard",
      {
        params: {
          date: businessDate,
        },
      }
    );

  return response.data;
}


export async function getOnsenPackageSummary(
  businessDate: string
): Promise<OnsenPackageSummary[]> {

  const response =
    await api.get<OnsenPackageSummary[]>(
      "/onsen/package-summary",
      {
        params: {
          date: businessDate,
        },
      }
    );

  return response.data;
}


export async function getOnsenCurrentGuests(
  businessDate: string
): Promise<OnsenCurrentGuest[]> {

  const response =
    await api.get<OnsenCurrentGuest[]>(
      "/onsen/current-guests",
      {
        params: {
          date: businessDate,
        },
      }
    );

  return response.data;
}