import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";

import {
  getAlertUnreadCount,
  markAlertRead as markAlertReadApi,
} from "../api/alertApi";

import { useBusinessDate } from "./BusinessDateContext";
import { useAuth } from "../auth/AuthContext";

interface AlertContextValue {
  unreadCount: number;
  loading: boolean;

  refreshUnreadCount: () => Promise<void>;

  markAlertRead: (
    stateId: number
  ) => Promise<void>;
}


const AlertContext =
  createContext<AlertContextValue | undefined>(
    undefined
  );


interface AlertProviderProps {
  children: ReactNode;
}


export function AlertProvider({
  children,
}: AlertProviderProps) {

    const { businessDate } = useBusinessDate();
    const { token } = useAuth();
    const requestVersion = useRef(0);

  const [unreadCount, setUnreadCount] =
    useState(0);

  const [loading, setLoading] =
    useState(true);


  const refreshUnreadCount =
  useCallback(async () => {

    const version = ++requestVersion.current;

    if (!token) {
      setUnreadCount(0);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      const count =
        await getAlertUnreadCount(
          businessDate
        );

      if (version === requestVersion.current) {
        setUnreadCount(count);
      }

    } catch (error) {

      if (version !== requestVersion.current) return;
      console.error(
        "Load alert unread count error:",
        error
      );

    } finally {

      if (version === requestVersion.current) setLoading(false);

    }

  }, [businessDate, token]);


  const markAlertRead =
    useCallback(
      async (stateId: number) => {

        await markAlertReadApi(stateId);

        /*
         * Backend là source of truth.
         * Sau PATCH lấy count lại thay vì tự count - 1.
         */
        await refreshUnreadCount();

      },
      [refreshUnreadCount]
    );


  useEffect(() => {

    void refreshUnreadCount();
    return () => { requestVersion.current += 1; };

  }, [refreshUnreadCount]);


  return (
    <AlertContext.Provider
      value={{
        unreadCount,
        loading,
        refreshUnreadCount,
        markAlertRead,
      }}
    >
      {children}
    </AlertContext.Provider>
  );
}


export function useAlert() {

  const context =
    useContext(AlertContext);

  if (!context) {

    throw new Error(
      "useAlert must be used inside AlertProvider"
    );

  }

  return context;
}