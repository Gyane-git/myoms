"use client";

import { useState } from "react";
import { Mail, ArrowLeft, Loader2, CheckCircle2 } from "lucide-react";
import AuthLayout from "@/components/auth/AuthLayout";
import AuthField from "@/components/auth/AuthField";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError("Enter the email linked to your account");
      return;
    }
    setError("");
    setSubmitting(true);
    try {
      // Replace with your .NET API endpoint:
      // await fetch("/api/auth/forgot-password", {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify({ email }),
      // });
      await new Promise((r) => setTimeout(r, 700));
      setSent(true);
    } finally {
      setSubmitting(false);
    }
  };

  if (sent) {
    return (
      <AuthLayout eyebrow="ERP Demo Company" title="Check your email">
        <div className="biz-forgot-sent">
          <CheckCircle2 size={32} className="biz-forgot-sent__icon" />
          <p>
            If an account exists for <strong>{email}</strong>, we've sent a
            link to reset the password. It expires in 30 minutes.
          </p>
          <a href="/login" className="biz-forgot-sent__back">
            <ArrowLeft size={14} /> Back to sign in
          </a>
        </div>

        <style jsx>{`
          .biz-forgot-sent {
            display: flex;
            flex-direction: column;
            align-items: flex-start;
            gap: 12px;
          }
          .biz-forgot-sent__icon {
            color: #2f9e5c;
          }
          .biz-forgot-sent p {
            margin: 0;
            font-family: ui-sans-serif, system-ui, -apple-system, sans-serif;
            font-size: 13.5px;
            line-height: 1.6;
            color: #4b5468;
          }
          .biz-forgot-sent__back {
            display: flex;
            align-items: center;
            gap: 6px;
            font-family: ui-sans-serif, system-ui, -apple-system, sans-serif;
            font-size: 13px;
            font-weight: 500;
            color: #1c2b48;
            text-decoration: none;
            margin-top: 6px;
          }
          .biz-forgot-sent__back:hover {
            text-decoration: underline;
          }
        `}</style>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      eyebrow="ERP Demo Company"
      title="Reset your password"
      subtitle="Enter your account email and we'll send you a reset link."
      footer={
        <a href="/login" className="biz-forgot-back">
          <ArrowLeft size={13} style={{ marginRight: 4, verticalAlign: -2 }} />
          Back to sign in
        </a>
      }
    >
      <form onSubmit={handleSubmit} className="biz-forgot-form" noValidate>
        <AuthField
          id="email"
          label="Email address"
          type="email"
          icon={Mail}
          placeholder="you@company.com"
          value={email}
          onChange={setEmail}
          error={error}
          required
        />
        <button type="submit" className="biz-forgot-form__submit" disabled={submitting}>
          {submitting ? (
            <>
              <Loader2 size={15} className="biz-forgot-form__spinner" />
              Sending…
            </>
          ) : (
            "Send reset link"
          )}
        </button>
      </form>

      <style jsx>{`
        .biz-forgot-form {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .biz-forgot-form__submit {
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
        }
        .biz-forgot-form__submit:hover {
          opacity: 0.92;
        }
        .biz-forgot-form__submit:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        .biz-forgot-form__spinner {
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