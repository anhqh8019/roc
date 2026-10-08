export interface DistributionItem {
  group?: string;
  gender?: string;
  nationality?: string;
  label?: string;
  count: number;
  percent: number;
}

export interface CustomerDemographicsResponse {
  date: string;
  totalGuests: number;
  knownAge?: number;
  unknownAge?: number;
  knownAgeGuests?: number;
  unknownAgeGuests?: number;
  ageCoveragePercent?: number;
  coveragePercent?: number;
  ageGroups: DistributionItem[];
  genders?: DistributionItem[];
  genderGroups?: DistributionItem[];
  nationalities?: DistributionItem[];
  nationalityGroups?: DistributionItem[];
}

export interface ServiceUsage {
  available: boolean;
  usedGuests: number | null;
  notUsedGuests: number | null;
  conversionPercent: number | null;
}

export interface BreakfastUsage {
  available: boolean;
  eligibleGuests: number | null;
  usedGuests: number | null;
  notUsedGuests: number | null;
  utilizationPercent: number | null;
}

export interface CustomerMixResponse {
  date: string;
  hotelGuests: number;
  onsen: ServiceUsage;
  breakfast: BreakfastUsage;
}

export type BusinessUnit = "HOTEL" | "F&B" | "ONSEN" | "SPA" | "OTHER";

export interface BusinessUnitRevenue {
  businessUnit: BusinessUnit;
  revenue: number;
  contributionPercent: number;
}

export interface RevenueMixResponse {
  date: string;
  totalRevenue: number;
  businessUnits: BusinessUnitRevenue[];
}

export interface RevenuePoint {
  date: string;
  revenue: number;
}

export interface RevenueTrendResponse {
  fromDate: string;
  toDate: string;
  data: RevenuePoint[];
}
