import axios from "axios";

import type {
  HotelDashboardResponse,
  HotelTrendResponse,
  RoomStatusResponse,
} from "../types/hotel";

const api = axios.create({
  baseURL: "http://localhost:8080/api/v1",
  timeout: 30000,
});

export async function getHotelDashboard(
  date: string
): Promise<HotelDashboardResponse> {
  const response = await api.get<HotelDashboardResponse>(
    "/hotel/dashboard",
    {
      params: {
        date,
      },
    }
  );

  return response.data;
}

export async function getRooms(): Promise<RoomStatusResponse[]> {
  const response = await api.get<RoomStatusResponse[]>(
    "/hotel/rooms"
  );

  return response.data;
}

export async function getHotelTrend(
  from: string,
  to: string
): Promise<HotelTrendResponse[]> {
  const response = await api.get<HotelTrendResponse[]>(
    "/hotel/dashboard/trend",
    {
      params: {
        from,
        to,
      },
    }
  );

  return response.data;
}