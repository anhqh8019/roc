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
  floor: string;
  occupancyStatus: "VACANT" | "OCCUPIED";
  housekeepingStatus:
    | "CLEAN"
    | "DIRTY"
    | "INSPECTED"
    | "TOUCH"
    | "STOP_SALE"
    | "UNKNOWN";
  inspected: boolean;
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