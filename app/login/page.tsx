"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Building2, User, Lock, Loader2 } from "lucide-react";
import AuthLayout from "@/components/auth/AuthLayout";
import AuthField from "@/components/auth/AuthField";

export default function LoginPage() {
  const router = useRouter();
  const [companyCode, setCompanyCode] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError("");

    const nextErrors: Record<string, string> = {};
    if (!companyCode.trim()) nextErrors.companyCode = "Company code is required";
    if (!username.trim()) nextErrors.username = "Username is required";
    if (!password) nextErrors.password = "Password is required";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSubmitting(true);
    try {
      // Replace with your .NET API auth endpoint:
      // const res = await fetch("/api/auth/login", {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify({ companyCode, username, password, remember }),
      // });
      // if (!res.ok) throw new Error("Invalid credentials");
      // const { token } = await res.json();
      // store token (httpOnly cookie set by the API is preferred over localStorage)

      await new Promise((r) => setTimeout(r, 700)); // placeholder for the real call
      router.push("/dashboard");
    } catch {
      setServerError("Invalid company code, username, or password.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout
      eyebrow="ERP Demo Company"
      title="Sign in"
      subtitle="Enter your company code and credentials to continue."
      footer={
        <span>
          Need access? <a href="/contact-admin">Contact your administrator</a>
        </span>
      }
    >
      <form onSubmit={handleSubmit} className="biz-login-form" noValidate>
        <AuthField
          id="companyCode"
          label="Company code"
          icon={Building2}
          placeholder="ERPDEMO1"
          value={companyCode}
          onChange={setCompanyCode}
          error={errors.companyCode}
          required
        />
        <AuthField
          id="username"
          label="Username"
          icon={User}
          placeholder="demo"
          value={username}
          onChange={setUsername}
          error={errors.username}
          required
        />
        <AuthField
          id="password"
          label="Password"
          type="password"
          icon={Lock}
          placeholder="••••••••"
          value={password}
          onChange={setPassword}
          error={errors.password}
          required
        />

        <div className="biz-login-form__row">
          <label className="biz-login-form__remember">
            <input
              type="checkbox"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
            />
            Remember this device
          </label>
          <a href="/forgot-password" className="biz-login-form__link">
            Forgot password?
          </a>
        </div>

        {serverError && <p className="biz-login-form__server-error">{serverError}</p>}

        <button type="submit" className="biz-login-form__submit" disabled={submitting}>
          {submitting ? (
            <>
              <Loader2 size={15} className="biz-login-form__spinner" />
              Signing in…
            </>
          ) : (
            "Sign in"
          )}
        </button>
      </form>

      <style jsx>{`
        .biz-login-form__row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-top: -4px;
        }
        .biz-login-form__remember {
          display: flex;
          align-items: center;
          gap: 6px;
          font-family: ui-sans-serif, system-ui, -apple-system, sans-serif;
          font-size: 12.5px;
          color: #4b5468;
        }
        .biz-login-form__link {
          font-family: ui-sans-serif, system-ui, -apple-system, sans-serif;
          font-size: 12.5px;
          color: #c79a45;
          text-decoration: none;
        }
        .biz-login-form__link:hover {
          text-decoration: underline;
        }
        .biz-login-form__server-error {
          margin: 0;
          padding: 9px 12px;
          border-radius: 6px;
          background: rgba(192, 57, 43, 0.08);
          color: #c0392b;
          font-family: ui-sans-serif, system-ui, -apple-system, sans-serif;
          font-size: 12.5px;
        }
        .biz-login-form__submit {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 11px;
          border: none;
          border-radius: 7px;
          background: #1c2b48;
          color: #fff;
          font-family: ui-sans-serif, system-ui, -apple-system, sans-serif;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: opacity 0.15s ease;
        }
        .biz-login-form__submit:hover {
          opacity: 0.92;
        }
        .biz-login-form__submit:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        .biz-login-form__spinner {
          animation: biz-spin 0.8s linear infinite;
        }
        @keyframes biz-spin {
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </AuthLayout>
  );
}