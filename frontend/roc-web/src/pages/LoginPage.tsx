import { useState } from "react";
import type { FormEvent } from "react";

import { useAuth }
  from "../auth/AuthContext";

import "./LoginPage.css";

export default function LoginPage() {
  const { login } = useAuth();

  const [username, setUsername] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  async function handleSubmit(
    event: FormEvent
  ) {
    event.preventDefault();

    try {
      setLoading(true);
      setError(null);

      await login(
        username,
        password
      );
    } catch (error) {
      console.error(
        "Login error",
        error
      );

      setError(
        "Tên đăng nhập hoặc mật khẩu không đúng"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-page">
      <div className="login-bg-glow login-bg-glow-1" />
      <div className="login-bg-glow login-bg-glow-2" />

      <div className="login-wrapper">
        <div className="login-brand">
          <div className="login-brand-mark">
            R
          </div>

          <div>
            <div className="login-brand-name">
              RESOFT
            </div>

            <div className="login-brand-subtitle">
              OPERATION CENTER
            </div>
          </div>
        </div>

        <form
          className="login-card"
          onSubmit={handleSubmit}
        >
          <div className="login-card-header">
            <h1>Đăng nhập</h1>

            <p>
              Truy cập hệ thống quản lý vận hành resort
            </p>
          </div>

          <div className="login-field">
            <label>
              Tên đăng nhập
            </label>

            <input
              type="text"
              value={username}
              onChange={(e) =>
                setUsername(
                  e.target.value
                )
              }
              placeholder="Nhập tên đăng nhập"
              autoComplete="username"
              autoFocus
            />
          </div>

          <div className="login-field">
            <label>
              Mật khẩu
            </label>

            <input
              type="password"
              value={password}
              onChange={(e) =>
                setPassword(
                  e.target.value
                )
              }
              placeholder="Nhập mật khẩu"
              autoComplete="current-password"
            />
          </div>

          {error && (
            <div className="login-error">
              {error}
            </div>
          )}

          <button
            className="login-submit"
            type="submit"
            disabled={
              loading ||
              !username ||
              !password
            }
          >
            {loading
              ? "Đang đăng nhập..."
              : "Đăng nhập"}
          </button>

          <div className="login-footer">
            Resoft Operation Center
            <span>•</span>
            Resort Management Platform
          </div>
        </form>
      </div>
    </div>
  );
}