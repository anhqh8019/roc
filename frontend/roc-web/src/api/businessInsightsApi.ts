import { api } from "./hotelApi";
import type {
  CustomerDemographicsResponse,
  CustomerMixResponse,
  CustomerTrendResponse,
  RevenueMixResponse,
  RevenueTrendResponse,
  RevenueUnitTrendResponse,
} from "../types/businessInsights";

export async function getCustomerDemographics(date:string){ const r=await api.get<CustomerDemographicsResponse>("/business-insights/customer-demographics",{params:{date}}); return r.data; }
export async function getCustomerMix(date:string){ const r=await api.get<CustomerMixResponse>("/business-insights/customer-mix",{params:{date}}); return r.data; }
export async function getRevenueMix(date:string){ const r=await api.get<RevenueMixResponse>("/business-insights/revenue-mix",{params:{date}}); return r.data; }
export async function getRevenueTrend(date:string,days=7){ const r=await api.get<RevenueTrendResponse>("/business-insights/revenue-trend",{params:{date,days}}); return r.data; }
export async function getCustomerTrend(date:string,days=7){ const r=await api.get<CustomerTrendResponse>("/business-insights/customer-trend",{params:{date,days}}); return r.data; }
export async function getRevenueUnitTrend(date:string,days=7){ const r=await api.get<RevenueUnitTrendResponse>("/business-insights/revenue-unit-trend",{params:{date,days}}); return r.data; }
