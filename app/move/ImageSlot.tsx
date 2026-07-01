"use client";

import { useRef, useState } from "react";

/**
 * Lightweight port of the design's <image-slot>: a user-fillable image
 * placeholder. Empty state shows a subtly-toned frame, a dashed ring and a
 * caption explaining what to drop. Click or drag-drop a photo to fill it.
 */
export function ImageSlot({
  src,
  placeholder,
  onPick,
  style,
}: {
  src?: string;
  placeholder: string;
  onPick: (dataUrl: string) => void;
  style?: React.CSSProperties;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [over, setOver] = useState(false);

  function readFile(file: File | undefined | null) {
    if (!file || !file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = () => onPick(String(reader.result));
    reader.readAsDataURL(file);
  }

  return (
    <div
      onClick={() => inputRef.current?.click()}
      onDragOver={(e) => {
        e.preventDefault();
        setOver(true);
      }}
      onDragLeave={() => setOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setOver(false);
        readFile(e.dataTransfer.files?.[0]);
      }}
      style={{
        position: "absolute",
        inset: 0,
        cursor: "pointer",
        overflow: "hidden",
        background: src ? "#ece6da" : "rgba(0,0,0,.04)",
        ...style,
      }}
    >
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={placeholder}
          style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
        />
      ) : (
        <>
          {/* dashed ring */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              pointerEvents: "none",
              border: `1.5px dashed ${over ? "#c96442" : "rgba(0,0,0,.25)"}`,
              transition: "border-color .12s",
            }}
          />
          {/* caption */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
              textAlign: "center",
              padding: 12,
              color: "rgba(0,0,0,.55)",
              fontFamily: "var(--font-plex-mono), ui-monospace, monospace",
            }}
          >
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" style={{ opacity: 0.45 }}>
              <rect x="3" y="4" width="18" height="16" rx="2.5" stroke="currentColor" strokeWidth="1.6" />
              <circle cx="8.5" cy="9.5" r="1.8" fill="currentColor" />
              <path d="M4 17l5-5 4 4 3-3 4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span style={{ maxWidth: "90%", fontWeight: 500, fontSize: 12, letterSpacing: ".01em", lineHeight: 1.3 }}>
              {placeholder}
            </span>
          </div>
        </>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        hidden
        onChange={(e) => readFile(e.target.files?.[0])}
      />
    </div>
  );
}
