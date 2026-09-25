import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import {
  getAlertUnreadCount,
  markAlertRead as markAlertReadApi,
} from "../api/alertApi";


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

  const [unreadCount, setUnreadCount] =
    useState(0);

  const [loading, setLoading] =
    useState(true);


  const refreshUnreadCount =
    useCallback(async () => {

      try {

        const count =
          await getAlertUnreadCount();

        setUnreadCount(count);

      } catch (error) {

        console.error(
          "Load alert unread count error:",
          error
        );

      } finally {

        setLoading(false);

      }

    }, []);


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