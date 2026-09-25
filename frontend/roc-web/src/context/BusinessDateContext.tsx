import {
  createContext,
  useContext,
  useState,
} from "react";

import type {
  ReactNode,
} from "react";

interface BusinessDateContextValue {
  businessDate: string;
  setBusinessDate: (date: string) => void;
}

const BusinessDateContext =
  createContext<
    BusinessDateContextValue | undefined
  >(undefined);

function getTodayLocal(): string {
  const date = new Date();

  const year =
    date.getFullYear();

  const month =
    String(
      date.getMonth() + 1
    ).padStart(2, "0");

  const day =
    String(
      date.getDate()
    ).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export function BusinessDateProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [
    businessDate,
    setBusinessDate,
  ] = useState<string>(
    getTodayLocal
  );

  return (
    <BusinessDateContext.Provider
      value={{
        businessDate,
        setBusinessDate,
      }}
    >
      {children}
    </BusinessDateContext.Provider>
  );
}

export function useBusinessDate() {
  const context =
    useContext(
      BusinessDateContext
    );

  if (!context) {
    throw new Error(
      "useBusinessDate must be used inside BusinessDateProvider"
    );
  }

  return context;
}