export interface OnsenDashboardResponse {
  businessDate: string;
  currentGuests: number;
  checkIns: number;
  checkOuts: number;
  live: boolean;
}
export interface OnsenPackageSummary {
  packageCode: string;
  packageName: string | null;
  transactionSubCode: string | null;
  guests: number;
  checkIns: number;
  checkOuts: number;
}

export interface OnsenCurrentGuest {
  cardNo: string;
  folioNum: number | null;
  packageCode: string | null;
  checkInTime: string;
  durationMinutes: number;
}