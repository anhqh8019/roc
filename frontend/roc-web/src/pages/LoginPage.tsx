import { useCallback, useEffect, useState } from "react";
import type { FormEvent } from "react";
import { useAuth } from "../auth/AuthContext";
import { getCaptcha } from "../api/authApi";
import "./LoginPage.css";

export default function LoginPage() {
  const { login } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [captchaId, setCaptchaId] = useState("");
  const [captchaQuestion, setCaptchaQuestion] = useState("");
  const [captchaAnswer, setCaptchaAnswer] = useState("");
  const [captchaLoading, setCaptchaLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshCaptcha = useCallback(async () => {
    setCaptchaLoading(true);
    setCaptchaAnswer("");
    try {
      const captcha = await getCaptcha();
      setCaptchaId(captcha.captchaId);
      setCaptchaQuestion(captcha.question);
    } catch {
      setCaptchaId("");
      setCaptchaQuestion("Không tải được mã xác minh");
    } finally {
      setCaptchaLoading(false);
    }
  }, []);

  useEffect(() => { void refreshCaptcha(); }, [refreshCaptcha]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    try {
      setLoading(true);
      setError(null);
      await login(username, password, captchaId, captchaAnswer);
    } catch (loginError) {
      console.error("Login error", loginError);
      setError("Thông tin đăng nhập hoặc mã xác minh không đúng");
      await refreshCaptcha();
    } finally {
      setLoading(false);
    }
  }

  return <div className="login-page">
    <div className="login-bg-glow login-bg-glow-1" /><div className="login-bg-glow login-bg-glow-2" />
    <div className="login-wrapper">
      <div className="login-brand"><div className="login-brand-mark">R</div><div><div className="login-brand-name">RESOFT</div><div className="login-brand-subtitle">OPERATION CENTER</div></div></div>
      <form className="login-card" onSubmit={handleSubmit}>
        <div className="login-card-header"><h1>Đăng nhập</h1><p>Truy cập hệ thống quản lý vận hành resort</p></div>
        <div className="login-field"><label>Tên đăng nhập</label><input type="text" value={username} onChange={e=>setUsername(e.target.value)} placeholder="Nhập tên đăng nhập" autoComplete="username" autoFocus /></div>
        <div className="login-field"><label>Mật khẩu</label><input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Nhập mật khẩu" autoComplete="current-password" /></div>
        <div className="login-field"><label>Xác minh</label><div className="login-captcha-row">
          <div className="login-captcha-question">{captchaLoading ? "Đang tải..." : captchaQuestion}</div>
          <button className="login-captcha-refresh" type="button" onClick={()=>void refreshCaptcha()} disabled={captchaLoading||loading} title="Đổi câu hỏi" aria-label="Đổi câu hỏi xác minh">↻</button>
          <input type="text" inputMode="numeric" value={captchaAnswer} onChange={e=>setCaptchaAnswer(e.target.value.replace(/[^0-9]/g,""))} placeholder="Kết quả" autoComplete="off" aria-label="Kết quả xác minh" />
        </div></div>
        {error && <div className="login-error">{error}</div>}
        <button className="login-submit" type="submit" disabled={loading||captchaLoading||!username||!password||!captchaId||!captchaAnswer}>{loading?"Đang đăng nhập...":"Đăng nhập"}</button>
        <div className="login-footer">Resoft Operation Center <span>•</span> Resort Management Platform</div>
      </form>
    </div>
  </div>;
}
