import axios from "axios";

import type {
  HotelDashboardResponse,
  HotelTrendResponse,
  RoomStatusResponse,
  RoomDetailResponse,
  InHouseStayResponse,
   ArrivalsResponse,
   DeparturesResponse,
} from "../types/hotel";



const api = axios.create({
  baseURL: "/api/v1",
  timeout: 30000,
});

api.interceptors.response.use(
  (response) => response,

  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("roc_access_token");
      localStorage.removeItem("roc_user");

      window.location.href = "/";
    }

    return Promise.reject(error);
  }
);

api.interceptors.request.use(
  (config) => {

    const token =
      localStorage.getItem(
        "roc_access_token"
      );

    if (token) {
      config.headers.Authorization =
        `Bearer ${token}`;
    }

    return config;
  }
);

export async function getDepartures(
  date: string
): Promise<DeparturesResponse> {
  const response =
    await api.get<DeparturesResponse>(
      "/hotel/stays/departures",
      {
        params: { date },
      }
    );

  return response.data;
}

export async function getArrivals(
  date: string
): Promise<ArrivalsResponse> {
  const response =
    await api.get<ArrivalsResponse>(
      "/hotel/stays/arrivals",
      {
        params: { date },
      }
    );

  return response.data;
}

export async function getInHouseStays():
  Promise<InHouseStayResponse[]> {

  const response =
    await api.get<InHouseStayResponse[]>(
      "/hotel/stays/in-house"
    );

  return response.data;
}

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

export async function getRoomDetail(
  roomCode: string
): Promise<RoomDetailResponse> {
  const response = await api.get<RoomDetailResponse>(
    `/hotel/rooms/${encodeURIComponent(roomCode)}`
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