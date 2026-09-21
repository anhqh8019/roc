import {
  createContext,
  useContext,
  useState,
} from "react";

import type { ReactNode } from "react";
import type { AuthUser } from "../types/auth";

import { login as loginApi } from "../api/authApi";

interface AuthContextValue {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;

  login: (
    username: string,
    password: string
  ) => Promise<void>;

  logout: () => void;
}

const AuthContext =
  createContext<AuthContextValue | null>(null);

export function AuthProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [token, setToken] =
    useState<string | null>(
      localStorage.getItem("roc_access_token")
    );

  const [user, setUser] =
    useState<AuthUser | null>(() => {
      const value =
        localStorage.getItem("roc_user");

      if (!value) {
        return null;
      }

      try {
        return JSON.parse(value);
      } catch {
        return null;
      }
    });

  async function login(
    username: string,
    password: string
  ) {
    const response =
      await loginApi({
        username,
        password,
      });

    localStorage.setItem(
      "roc_access_token",
      response.token
    );

    localStorage.setItem(
      "roc_user",
      JSON.stringify(response.user)
    );

    setToken(response.token);
    setUser(response.user);
  }

  function logout() {
    localStorage.removeItem(
      "roc_access_token"
    );

    localStorage.removeItem(
      "roc_user"
    );

    setToken(null);
    setUser(null);
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: Boolean(
          token && user
        ),
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context =
    useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used inside AuthProvider"
    );
  }

  return context;
}