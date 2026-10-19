import { useRef, useState } from "react";

export function PageTitle({ title, subtitle }) {
  return (
    <div className="mb-6">
      <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
      <p className="mt-1 text-sm text-zinc-400">{subtitle}</p>
    </div>
  );
}

export function Dropzone({ accept, multiple = false, label, onFiles }) {
  const inputRef = useRef(null);
  const [over, setOver] = useState(false);

  const handle = (list) => {
    const files = Array.from(list || []);
    if (files.length) onFiles(multiple ? files : files.slice(0, 1));
  };

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
        handle(e.dataTransfer.files);
      }}
      className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-10 text-center transition ${
        over ? "border-amber-400 bg-amber-400/5" : "border-zinc-700 hover:border-zinc-500 hover:bg-zinc-900"
      }`}
    >
      <span className="text-3xl">📂</span>
      <p className="mt-2 text-sm font-medium">{label}</p>
      <p className="mt-1 text-xs text-zinc-500">Klik atau seret berkas ke sini</p>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
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
  primary: "bg-red-600 text-white hover:bg-red-500 disabled:bg-red-900 disabled:text-red-300",
  secondary: "bg-zinc-800 text-zinc-100 hover:bg-zinc-700 disabled:opacity-50",
};

export function Button({ variant = "primary", className = "", ...props }) {
  return (
    <button
      {...props}
      className={`w-full rounded-lg px-4 py-2.5 text-sm font-semibold transition disabled:cursor-not-allowed ${variants[variant]} ${className}`}
    />
  );
}

const tones = {
  info: "border-sky-500/30 bg-sky-500/10 text-sky-200",
  success: "border-emerald-500/30 bg-emerald-500/10 text-emerald-200",
  error: "border-red-500/30 bg-red-500/10 text-red-200",
  warn: "border-amber-500/30 bg-amber-500/10 text-amber-200",
};

export function Notice({ tone = "info", children }) {
  return <div className={`rounded-lg border px-4 py-3 text-sm ${tones[tone]}`}>{children}</div>;
}

export function Spinner({ text }) {
  return (
    <div className="flex items-center gap-3 text-sm text-zinc-300">
      <span className="h-4 w-4 animate-spin rounded-full border-2 border-zinc-600 border-t-amber-400" />
      {text}
    </div>
  );
}

export function Card({ children, className = "" }) {
  return <div className={`rounded-xl border border-zinc-800 bg-zinc-900/60 p-4 ${className}`}>{children}</div>;
}
