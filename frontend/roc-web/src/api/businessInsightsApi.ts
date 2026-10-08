import { api } from "./hotelApi";
import type {
  CustomerDemographicsResponse,
  CustomerMixResponse,
  RevenueMixResponse,
  RevenueTrendResponse,
} from "../types/businessInsights";

export async function getCustomerDemographics(date: string) {
  const response = await api.get<CustomerDemographicsResponse>(
    "/business-insights/customer-demographics",
    { params: { date } }
  );
  return response.data;
}

export async function getCustomerMix(date: string) {
  const response = await api.get<CustomerMixResponse>(
    "/business-insights/customer-mix",
    { params: { date } }
  );
  return response.data;
}

export async function getRevenueMix(date: string) {
  const response = await api.get<RevenueMixResponse>(
    "/business-insights/revenue-mix",
    { params: { date } }
  );
  return response.data;
}

export async function getRevenueTrend(date: string, days = 7) {
  const response = await api.get<RevenueTrendResponse>(
    "/business-insights/revenue-trend",
    { params: { date, days } }
  );
  return response.data;
}
