import { api } from "./hotelApi";

import type {
  OnsenDashboardResponse,
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