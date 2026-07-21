"use client";

import { MONEY } from "@/lib/money";

type MoneyInputProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  hint?: string;
  id?: string;
};

export function MoneyInput({ value, onChange, placeholder = "0", label, hint, id }: MoneyInputProps) {
  return (
    <label style={{ display: "block", width: "100%" }}>
      {label && (
        <span
          style={{
            display: "block",
            fontFamily: "var(--font-plex-mono), ui-monospace, monospace",
            fontSize: 11,
            letterSpacing: ".1em",
            textTransform: "uppercase",
            color: "#9aa097",
            marginBottom: 8,
          }}
        >
          {label}
        </span>
      )}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          borderRadius: 14,
          border: "1px solid #e4dfd5",
          background: "#fff",
          overflow: "hidden",
        }}
      >
        <span
          style={{
            padding: "14px 0 14px 16px",
            fontWeight: 800,
            fontSize: 15,
            color: "#1b231e",
            fontFamily: "var(--font-hanken), system-ui, sans-serif",
          }}
        >
          {MONEY.symbol}
        </span>
        <input
          id={id}
          inputMode="decimal"
          value={value}
          onChange={(e) => onChange(e.target.value.replace(/[^\d.]/g, ""))}
          placeholder={placeholder}
          style={{
            flex: 1,
            minWidth: 0,
            padding: "14px 16px 14px 8px",
            border: "none",
            outline: "none",
            fontFamily: "var(--font-hanken), system-ui, sans-serif",
            fontSize: 15,
            fontWeight: 600,
            background: "transparent",
          }}
        />
        <span
          style={{
            padding: "14px 16px 14px 0",
            fontSize: 12,
            fontWeight: 700,
            color: "#9aa097",
            fontFamily: "var(--font-plex-mono), ui-monospace, monospace",
          }}
        >
          {MONEY.code}
        </span>
      </div>
      {hint && (
        <span style={{ display: "block", marginTop: 6, fontSize: 12.5, color: "#6e746b" }}>{hint}</span>
      )}
    </label>
  );
}
