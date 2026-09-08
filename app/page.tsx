"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import DarkAuthBackground from "@/components/auth/DarkAuthBackground";
import { buildApiUrl, storeAuthSession, type AuthResponse } from "@/lib/authSession";

export default function LoginPage() {
  const router = useRouter();

  const [companyCode, setCompanyCode] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError("");

    const nextErrors: Record<string, string> = {};
    if (!companyCode.trim()) nextErrors.companyCode = "Required";
    if (!username.trim()) nextErrors.username = "Required";
    if (!password) nextErrors.password = "Required";
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(buildApiUrl("/api/Auth/login"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyCode: companyCode.trim(),
          username: username.trim(),
          password,
        }),
      });

      const data = (await res.json().catch(() => null)) as AuthResponse | null;

      if (!res.ok || !data?.success) {
        throw new Error(data?.message || "Invalid credentials.");
      }

      if (!data.token || !data.refreshToken) {
        throw new Error("Login succeeded but token was missing.");
      }

      storeAuthSession(
        {
          token: data.token,
          refreshToken: data.refreshToken,
          user: data.user,
        },
        remember
      );

      router.push("/select-fiscal-year");
    } catch (error) {
      setServerError(
        error instanceof Error
          ? error.message
          : "Invalid company code, username, or password."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="biz-login">
      <DarkAuthBackground />

      <div className="biz-login__card">
        <div className="biz-login__brand">
          <div className="biz-login__brand-badge">
            <Image src="/biz-logo.png" alt="BIZ" width={40} height={40} />
          </div>
        </div>

        <h1 className="biz-login__title">Sign in to your account</h1>
        <p className="biz-login__subtitle">Business Integration System</p>

        <form onSubmit={handleSubmit} className="biz-login__form" noValidate>
          <div className="biz-login__field">
            <label htmlFor="companyCode">Company code</label>
            <input
              id="companyCode"
              value={companyCode}
              onChange={(e) => setCompanyCode(e.target.value)}
              placeholder="ERPDEMO1"
              autoComplete="organization"
            />
            {errors.companyCode && (
              <span className="biz-login__error">{errors.companyCode}</span>
            )}
          </div>

          <div className="biz-login__field">
            <label htmlFor="username">Username</label>
            <input
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="demo"
              autoComplete="username"
            />
            {errors.username && (
              <span className="biz-login__error">{errors.username}</span>
            )}
          </div>

          <div className="biz-login__field">
            <label htmlFor="password">Password</label>
            <div className="biz-login__password-wrap">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                className="biz-login__eye"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.password && (
              <span className="biz-login__error">{errors.password}</span>
            )}
          </div>

          <div className="biz-login__row">
            <label className="biz-login__remember">
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
              />
              Remember me
            </label>
          </div>

          {serverError && <p className="biz-login__server-error">{serverError}</p>}

          <button type="submit" className="biz-login__submit" disabled={submitting}>
            {submitting ? (
              <>
                <Loader2 size={16} className="biz-login__spinner" />
                Signing in…
              </>
            ) : (
              "Login"
            )}
          </button>
        </form>

        <div className="biz-login__footer">
          <span>Powered by</span>
          <Image
            src="/devmind-logo.png"
            alt="DevMind Solutions"
            width={16}
            height={16}
          />
          <span className="biz-login__footer-name">DevMind Solutions</span>
        </div>
      </div>

      <style jsx>{`
        .biz-login {
          position: relative;
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px;
          overflow: hidden;
        }

        .biz-login__card {
          position: relative;
          z-index: 1;
          width: 100%;
          max-width: 380px;
          padding: 34px 32px 26px;
          border-radius: 16px;
          background: rgba(22, 34, 58, 0.72);
          backdrop-filter: blur(18px);
          -webkit-backdrop-filter: blur(18px);
          border: 1px solid rgba(231, 197, 131, 0.18);
          box-shadow: 0 30px 80px rgba(4, 8, 20, 0.55),
            0 0 0 1px rgba(255, 255, 255, 0.02) inset;
        }

        .biz-login__brand {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          margin-bottom: 18px;
        }
        .biz-login__brand-badge {
          width: 48px;
          height: 48px;
          border-radius: 999px;
          background: #faf9f6;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          box-shadow: 0 0 0 3px rgba(231, 197, 131, 0.25);
        }

        .biz-login__title {
          margin: 0 0 4px;
          text-align: center;
          font-family: Georgia, "Times New Roman", serif;
          font-size: 19px;
          font-weight: 600;
          color: #fff;
        }
        .biz-login__subtitle {
          margin: 0 0 26px;
          text-align: center;
          font-family: ui-sans-serif, system-ui, -apple-system, sans-serif;
          font-size: 11.5px;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: #c79a45;
        }

        .biz-login__form {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .biz-login__field {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .biz-login__field label {
          font-family: ui-sans-serif, system-ui, -apple-system, sans-serif;
          font-size: 12.5px;
          color: rgba(255, 255, 255, 0.7);
        }
        .biz-login__field input {
          width: 100%;
          padding: 11px 12px;
          border-radius: 8px;
          border: 1px solid rgba(255, 255, 255, 0.12);
          background: rgba(10, 16, 30, 0.55);
          color: #fff;
          font-family: ui-sans-serif, system-ui, -apple-system, sans-serif;
          font-size: 13.5px;
          outline: none;
          transition: border-color 0.15s ease, box-shadow 0.15s ease;
        }
        .biz-login__field input::placeholder {
          color: rgba(255, 255, 255, 0.3);
        }
        .biz-login__field input:focus {
          border-color: #c79a45;
          box-shadow: 0 0 0 3px rgba(199, 154, 69, 0.18);
        }

        .biz-login__password-wrap {
          position: relative;
        }
        .biz-login__password-wrap input {
          padding-right: 38px;
        }
        .biz-login__eye {
          position: absolute;
          right: 10px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          color: rgba(255, 255, 255, 0.45);
          cursor: pointer;
          display: flex;
        }
        .biz-login__eye:hover {
          color: #fff;
        }

        .biz-login__error {
          font-size: 11.5px;
          color: #e18b7f;
          font-family: ui-sans-serif, system-ui, -apple-system, sans-serif;
        }

        .biz-login__row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-top: -4px;
        }
        .biz-login__remember {
          display: flex;
          align-items: center;
          gap: 7px;
          font-family: ui-sans-serif, system-ui, -apple-system, sans-serif;
          font-size: 12.5px;
          color: rgba(255, 255, 255, 0.65);
        }
        .biz-login__remember input {
          accent-color: #c79a45;
        }

        .biz-login__server-error {
          margin: 0;
          padding: 9px 12px;
          border-radius: 6px;
          background: rgba(225, 139, 127, 0.12);
          color: #f2a99d;
          font-family: ui-sans-serif, system-ui, -apple-system, sans-serif;
          font-size: 12.5px;
        }

        .biz-login__submit {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          margin-top: 4px;
          padding: 12px;
          border: none;
          border-radius: 8px;
          background: linear-gradient(135deg, #d9ac57 0%, #b8842f 100%);
          color: #1c1305;
          font-family: ui-sans-serif, system-ui, -apple-system, sans-serif;
          font-size: 14px;
          font-weight: 600;
          letter-spacing: 0.01em;
          cursor: pointer;
          box-shadow: 0 8px 20px rgba(199, 154, 69, 0.3);
          transition: transform 0.12s ease, box-shadow 0.12s ease;
        }
        .biz-login__submit:hover {
          transform: translateY(-1px);
          box-shadow: 0 10px 24px rgba(199, 154, 69, 0.4);
        }
        .biz-login__submit:disabled {
          opacity: 0.65;
          cursor: not-allowed;
          transform: none;
        }
        .biz-login__spinner {
          animation: biz-spin 0.8s linear infinite;
        }
        @keyframes biz-spin {
          to {
            transform: rotate(360deg);
          }
        }

        .biz-login__footer {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          margin-top: 24px;
          padding-top: 16px;
          border-top: 1px solid rgba(255, 255, 255, 0.08);
        }
        .biz-login__footer span {
          font-family: ui-sans-serif, system-ui, -apple-system, sans-serif;
          font-size: 11px;
          color: rgba(255, 255, 255, 0.4);
        }
        .biz-login__footer-name {
          color: rgba(255, 255, 255, 0.6) !important;
          font-weight: 500;
        }
      `}</style>
    </div>
  );
}
