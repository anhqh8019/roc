export interface HotelDashboardResponse {
  businessDate: string;

  inventory: {
    totalRooms: number;
    occupiedRooms: number;
    availableRooms: number;
    outOfOrderRooms: number;
    occupancyPercent: number;
  };

  guestFlow: {
    arrivals: number;
    departures: number;
    inHouse: number;
    adults: number;
    children: number;
  };

  revenue: {
    roomGrossRevenue: number;
    roomNetRevenue: number;

    foodBeverageRevenue: number;
    onsenRevenue: number;
    otherRevenue: number;

    totalGrossRevenue: number;
    totalNetRevenue: number;

    serviceCharge: number;
    tax: number;

    adr: number;
    revPar: number;
  };

  housekeeping: {
    clean: number;
    dirty: number;
    inspected: number;
    live: boolean;
  };
}

export interface RoomStatusResponse {
  roomCode: string;
  roomType: string;
  roomTypeName: string;
  zone: string;
  occupancyStatus: "OCCUPIED" | "VACANT";
  housekeepingStatus:
    | "CLEAN"
    | "DIRTY"
    | "INSPECTED";
  inspected: boolean;
}

export interface RoomStayInfo {
  folioNum: string;
  arrivalDate: string | null;
  departureDate: string | null;
  adults: number;
  children: number;
  rateAmount: number;
}

export interface RoomDetailResponse
  extends RoomStatusResponse {
  currentStay: RoomStayInfo | null;
}

export interface HotelTrendResponse {
  businessDate: string;
  occupiedRooms: number;
  occupancyPercent: number;
  roomNetRevenue: number;
  totalNetRevenue: number;
  adr: number;
  revPar: number;
}

export interface InHouseStayResponse {
  folioNum: string;
  roomCode: string;
  roomType: string;
  roomTypeName: string;

  arrivalDate: string | null;
  departureDate: string | null;

  adults: number;
  children: number;

  rateAmount: number;
  checkInTime: string | null;
}

export type ArrivalStatus =
  | "EXPECTED"
  | "CHECKED_IN"
  | "CANCELLED"
  | "NO_SHOW";

export interface ArrivalItemResponse {
  folioNum: string;
  roomCode: string;
  roomType: string;
  roomTypeName: string;

  arrivalDate: string | null;
  departureDate: string | null;

  adults: number;
  children: number;

  rateAmount: number;

  status: ArrivalStatus;

  checkInTime: string | null;
  cancelTime: string | null;

  noShow: boolean;
  walkIn: boolean;
}

export interface ArrivalSummary {
  total: number;
  expected: number;
  checkedIn: number;
  cancelled: number;
  noShow: number;
}

export interface ArrivalsResponse {
  businessDate: string;
  summary: ArrivalSummary;
  arrivals: ArrivalItemResponse[];
}

export type DepartureStatus =
  | "DUE_OUT"
  | "CHECKED_OUT";

export interface DepartureItemResponse {
  folioNum: string;
  roomCode: string;
  roomType: string;
  roomTypeName: string;

  arrivalDate: string | null;
  departureDate: string | null;

  adults: number;
  children: number;

  rateAmount: number;

  status: DepartureStatus;

  checkInTime: string | null;
  checkOutTime: string | null;
}

export interface DepartureSummary {
  total: number;
  dueOut: number;
  checkedOut: number;
}

export interface DeparturesResponse {
  businessDate: string;
  summary: DepartureSummary;
  departures: DepartureItemResponse[];
}