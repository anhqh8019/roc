import { api } from "./hotelApi";

export interface MonthlyReportRow {
  month: number;
  villaRevenue: number;
  hotelRevenue: number;
  onsenRevenue: number;
  restaurantRevenue: number;
  villaRoomsSold: number;
  hotelRoomsSold: number;
  unallocatedRoomRevenue: number;
  totalRoomRevenue: number;
  reconciliationDifference: number;
}

export interface MonthlyOperationsReportResponse {
  year: number;
  toMonth: number;
  months: MonthlyReportRow[];
}

export async function getMonthlyOperationsReport(year: number, toMonth: number) {
  const response = await api.get<MonthlyOperationsReportResponse>("/reports/monthly-operations", {
    params: { year, toMonth },
  });
  return response.data;
}
