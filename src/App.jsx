import { useState } from "react";
import ImageCompress from "./components/ImageCompress.jsx";
import PdfCompress from "./components/PdfCompress.jsx";
import MergePdf from "./components/MergePdf.jsx";
import WordToPdf from "./components/WordToPdf.jsx";
import PdfToWord from "./components/PdfToWord.jsx";
import ImageToPdf from "./components/ImageToPdf.jsx";

const MENU = [
  { id: "gambar", label: "🖼️  Kompres Gambar", Component: ImageCompress },
  { id: "pdf", label: "📄  Kompres PDF", Component: PdfCompress },
  { id: "merge_pdf", label: "🧩  Gabung PDF (Merge)", Component: MergePdf },
  { id: "word2pdf", label: "📑➔📄  Word ke PDF", Component: WordToPdf },
  { id: "pdf2word", label: "📄➔📑  PDF ke Word", Component: PdfToWord },
  { id: "img2pdf", label: "🖼️➡️📄  Gambar ke PDF", Component: ImageToPdf },
];

export default function App() {
  const [active, setActive] = useState("gambar");
  const [open, setOpen] = useState(false);
  const Current = MENU.find((m) => m.id === active).Component;

  const sidebar = (
    <div className="flex h-full flex-col p-5">
      <div className="mb-5">
        <div className="flex items-center gap-2 text-2xl font-black tracking-tight">
          <span>File</span>
          <img src="/star.svg" alt="" className="h-7 w-7" />
          <span>Compress</span>
        </div>
        <p className="mt-0.5 text-xs text-zinc-500">Multi-Format Media Tools</p>
      </div>

      <p className="mb-2 text-xs font-semibold tracking-wider text-zinc-500">PILIH TOOLS:</p>
      <nav className="space-y-2">
        {MENU.map((m) => (
          <button
            key={m.id}
            onClick={() => { setActive(m.id); setOpen(false); }}
            className={`w-full rounded-lg px-4 py-2.5 text-left text-sm font-semibold transition ${
              active === m.id ? "bg-red-600 text-white" : "bg-zinc-800/70 text-zinc-200 hover:bg-zinc-800"
            }`}
          >
            {m.label}
          </button>
        ))}
      </nav>

      <hr className="my-5 border-zinc-800" />
      <p className="text-sm font-bold">🔒 100% Aman &amp; Privat</p>
      <p className="mt-1 text-xs text-zinc-500">
        Semua berkas diproses langsung di browser kamu dan tidak pernah diunggah ke server.
      </p>

      <div className="mt-auto border-t border-dashed border-white/15 pt-4 text-center">
        <p className="text-[11px] uppercase tracking-wider text-zinc-500">Project created by</p>
        <p className="text-[13px] font-bold text-zinc-100">Syahbarudin Abdillah</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen lg:flex">
      {/* sidebar desktop */}
      <aside className="hidden w-72 shrink-0 border-r border-zinc-800 bg-zinc-900 lg:block">
        <div className="sticky top-0 h-screen">{sidebar}</div>
      </aside>

      {/* topbar + drawer mobile */}
      <div className="flex items-center justify-between border-b border-zinc-800 bg-zinc-900 px-4 py-3 lg:hidden">
        <div className="flex items-center gap-2 text-lg font-black">
          File <img src="/star.svg" alt="" className="h-5 w-5" /> Compress
        </div>
        <button onClick={() => setOpen(true)} className="rounded-lg bg-zinc-800 px-3 py-1.5 text-sm">☰ Menu</button>
      </div>
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setOpen(false)} />
          <div className="absolute inset-y-0 left-0 w-72 bg-zinc-900 shadow-xl">{sidebar}</div>
        </div>
      )}

      <main className="min-w-0 flex-1 p-5 md:p-10">
        <div className="mx-auto max-w-5xl">
          <Current key={active} />
        </div>
      </main>
    </div>
  );
}
