import { useRef, useState } from "react";

export function PageTitle({ title, subtitle }) {
  return (
    <div className="mb-8 text-center">
      <h1 className="text-3xl font-bold tracking-tight text-zinc-900 md:text-4xl">{title}</h1>
      <p className="mx-auto mt-2 max-w-xl text-base text-zinc-500">{subtitle}</p>
    </div>
  );
}

export function Dropzone({ accept, multiple = false, label, onFiles, disabled = false }) {
  const inputRef = useRef(null);
  const [over, setOver] = useState(false);

  const handle = (list) => {
    const files = Array.from(list || []);
    if (files.length) onFiles(multiple ? files : files.slice(0, 1));
  };

  return (
    <div
      onClick={() => !disabled && inputRef.current?.click()}
      onDragOver={(e) => {
        e.preventDefault();
        if (!disabled) setOver(true);
      }}
      onDragLeave={() => setOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setOver(false);
        if (!disabled) handle(e.dataTransfer.files);
      }}
      aria-disabled={disabled}
      className={`flex flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 py-12 text-center transition ${
        disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"
      } ${
        over ? "border-red-400 bg-red-50" : "border-zinc-300 bg-white hover:border-red-300 hover:bg-red-50/40"
      }`}
    >
      <span className="rounded-xl bg-red-600 px-6 py-3 text-base font-bold text-white shadow-sm">{label}</span>
      <p className="mt-3 text-sm text-zinc-500">atau klik / seret berkas ke sini</p>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        disabled={disabled}
        className="hidden"
        onChange={(e) => {
          handle(e.target.files);
          e.target.value = "";
        }}
      />
    </div>
  );
}

const variants = {
  primary: "bg-red-600 text-white hover:bg-red-700 disabled:bg-red-300",
  secondary: "bg-zinc-100 text-zinc-800 hover:bg-zinc-200 disabled:opacity-50",
};

export function Button({ variant = "primary", className = "", ...props }) {
  return (
    <button
      {...props}
      className={`w-full rounded-xl px-4 py-3 text-sm font-semibold transition disabled:cursor-not-allowed ${variants[variant]} ${className}`}
    />
  );
}

const tones = {
  info: "border-sky-200 bg-sky-50 text-sky-800",
  success: "border-emerald-200 bg-emerald-50 text-emerald-800",
  error: "border-red-200 bg-red-50 text-red-800",
  warn: "border-amber-200 bg-amber-50 text-amber-800",
};

export function Notice({ tone = "info", children }) {
  return <div className={`rounded-xl border px-4 py-3 text-sm ${tones[tone]}`}>{children}</div>;
}

export function Spinner({ text }) {
  return (
    <div className="flex items-center gap-3 text-sm text-zinc-600">
      <span className="h-4 w-4 animate-spin rounded-full border-2 border-zinc-300 border-t-red-600" />
      {text}
    </div>
  );
}

export function Card({ children, className = "" }) {
  return <div className={`rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm ${className}`}>{children}</div>;
}
