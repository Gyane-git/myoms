"use client";

import { useState } from "react";
import type { LucideIcon } from "lucide-react";
import { Eye, EyeOff } from "lucide-react";

type AuthFieldProps = {
  id: string;
  label: string;
  type?: "text" | "password" | "email";
  icon?: LucideIcon;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  error?: string;
};

export default function AuthField({
  id,
  label,
  type = "text",
  icon: Icon,
  placeholder,
  value,
  onChange,
  required,
  error,
}: AuthFieldProps) {
  const [show, setShow] = useState(false);
  const isPassword = type === "password";
  const resolvedType = isPassword ? (show ? "text" : "password") : type;

  return (
    <div className="biz-field">
      <label htmlFor={id}>{label}</label>
      <div className="biz-field__control">
        {Icon && <Icon size={15} className="biz-field__icon" />}
        <input
          id={id}
          type={resolvedType}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          required={required}
          autoComplete={isPassword ? "current-password" : "on"}
        />
        {isPassword && (
          <button
            type="button"
            className="biz-field__toggle"
            onClick={() => setShow((s) => !s)}
            aria-label={show ? "Hide password" : "Show password"}
          >
            {show ? <EyeOff size={15} /> : <Eye size={15} />}
          </button>
        )}
      </div>
      {error && <span className="biz-field__error">{error}</span>}

      <style jsx>{`
        .biz-field {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .biz-field label {
          font-family: ui-sans-serif, system-ui, -apple-system, sans-serif;
          font-size: 12.5px;
          font-weight: 500;
          color: #1c2b48;
        }
        .biz-field__control {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 0 10px;
          border: 1px solid rgba(28, 43, 72, 0.16);
          border-radius: 7px;
          background: #fff;
          transition: border-color 0.15s ease, box-shadow 0.15s ease;
        }
        .biz-field__control:focus-within {
          border-color: #c79a45;
          box-shadow: 0 0 0 3px rgba(199, 154, 69, 0.15);
        }
        .biz-field__icon {
          color: #8890a0;
          flex-shrink: 0;
        }
        .biz-field__control input {
          flex: 1;
          border: none;
          outline: none;
          padding: 10px 0;
          font-family: ui-sans-serif, system-ui, -apple-system, sans-serif;
          font-size: 13.5px;
          color: #1c2b48;
          background: transparent;
        }
        .biz-field__toggle {
          background: none;
          border: none;
          padding: 4px;
          cursor: pointer;
          color: #8890a0;
          display: flex;
        }
        .biz-field__toggle:hover {
          color: #1c2b48;
        }
        .biz-field__error {
          font-family: ui-sans-serif, system-ui, -apple-system, sans-serif;
          font-size: 12px;
          color: #c0392b;
        }
      `}</style>
    </div>
  );
}