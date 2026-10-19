import { useEffect, useRef, useState } from "react";
import ImageCompress from "./components/ImageCompress.jsx";
import PdfCompress from "./components/PdfCompress.jsx";
import MergePdf from "./components/MergePdf.jsx";
import WordToPdf from "./components/WordToPdf.jsx";
import PdfToWord from "./components/PdfToWord.jsx";
import ImageToPdf from "./components/ImageToPdf.jsx";

// category: kompres | organisir | konversi
const TOOLS = [
  {
    id: "merge_pdf",
    name: "Gabung PDF",
    desc: "Gabungkan beberapa PDF dengan urutan yang kamu mau, tinggal seret dan lepas.",
    icon: "🧩",
    tint: "bg-orange-100 text-orange-600",
    category: "organisir",
    Component: MergePdf,
  },
  {
    id: "pdf",
    name: "Kompres PDF",
    desc: "Perkecil ukuran PDF, termasuk hasil scan, dengan kualitas yang tetap terbaca.",
    icon: "🗜️",
    tint: "bg-green-100 text-green-600",
    category: "kompres",
    Component: PdfCompress,
  },
  {
    id: "gambar",
    name: "Kompres Gambar",
    desc: "Kecilkan ukuran JPG, PNG, atau WEBP dengan pratinjau langsung.",
    icon: "🖼️",
    tint: "bg-emerald-100 text-emerald-600",
    category: "kompres",
    Component: ImageCompress,
  },
  {
    id: "img2pdf",
    name: "Gambar ke PDF",
    desc: "Ubah foto JPG, PNG, atau WEBP menjadi PDF full image tanpa border putih.",
    icon: "📷",
    tint: "bg-yellow-100 text-yellow-600",
    category: "konversi",
    Component: ImageToPdf,
  },
  {
    id: "word2pdf",
    name: "Word ke PDF",
    desc: "Ubah dokumen Word (.docx) menjadi PDF langsung di browser.",
    icon: "📘",
    tint: "bg-blue-100 text-blue-600",
    category: "konversi",
    Component: WordToPdf,
  },
  {
    id: "pdf2word",
    name: "PDF ke Word",
    desc: "Ekstrak teks PDF menjadi dokumen Word (.docx) yang bisa disunting.",
    icon: "📝",
    tint: "bg-indigo-100 text-indigo-600",
    category: "konversi",
    Component: PdfToWord,
  },
];

const CATEGORIES = [
  { id: "semua", label: "Semua" },
  { id: "kompres", label: "Kompres" },
  { id: "organisir", label: "Organisir" },
  { id: "konversi", label: "Konversi" },
];

const toolById = (id) => TOOLS.find((t) => t.id === id);
const readHash = () => {
  const id = window.location.hash.replace(/^#\/?/, "");
  return toolById(id) ? id : null;
};

function Logo({ small = false }) {
  return (
    <div
      className={`flex items-center gap-1.5 font-black tracking-tight text-zinc-900 ${small ? "text-xl" : "text-2xl"}`}
    >
      <span>File</span>
      <img src="/star.svg" alt="" className={small ? "h-5 w-5" : "h-7 w-7"} />
      <span>Compress</span>
    </div>
  );
}

function ToolLink({ tool, onPick }) {
  return (
    <button
      onClick={() => onPick(tool.id)}
      className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm font-semibold text-zinc-700 hover:bg-zinc-100 hover:text-red-600"
    >
      <span
        className={`flex h-7 w-7 items-center justify-center rounded-md text-base ${tool.tint}`}
      >
        {tool.icon}
      </span>
      {tool.name}
    </button>
  );
}

function Navbar({ active, onPick, onHome, darkMode, onToggleTheme }) {
  const [menu, setMenu] = useState(null); // "konversi" | "semua" | null
  const [mobile, setMobile] = useState(false);
  const wrapRef = useRef(null);

  useEffect(() => {
    const close = (e) =>
      wrapRef.current && !wrapRef.current.contains(e.target) && setMenu(null);
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  const pick = (id) => {
    setMenu(null);
    setMobile(false);
    onPick(id);
  };

  const link = (id, label) => (
    <button
      onClick={() => pick(id)}
      className={`px-1 py-5 text-sm font-bold uppercase tracking-wide hover:text-red-600 ${active === id ? "text-red-600" : "text-zinc-800"}`}
    >
      {label}
    </button>
  );

  const dropBtn = (key, label, isActive) => (
    <button
      onClick={() => setMenu(menu === key ? null : key)}
      className={`flex items-center gap-1 px-1 py-5 text-sm font-bold uppercase tracking-wide hover:text-red-600 ${isActive || menu === key ? "text-red-600" : "text-zinc-800"}`}
    >
      {label}
      <span
        className={`text-[10px] transition ${menu === key ? "rotate-180" : ""}`}
      >
        ▼
      </span>
    </button>
  );

  const fromPdf = TOOLS.filter((t) => t.id === "pdf2word");
  const toPdf = TOOLS.filter((t) => t.id === "img2pdf" || t.id === "word2pdf");

  return (
    <header className="sticky top-0 z-40 border-b border-zinc-200 bg-white">
      <div
        ref={wrapRef}
        className="mx-auto flex max-w-7xl items-center justify-between px-5"
      >
        <button onClick={onHome} aria-label="Beranda" className="py-3">
          <Logo />
        </button>

        <nav className="hidden items-center gap-8 lg:flex">
          {link("merge_pdf", "Gabung PDF")}
          {link("pdf", "Kompres PDF")}
          <div className="relative">
            {dropBtn(
              "konversi",
              "Konversi",
              ["img2pdf", "word2pdf", "pdf2word"].includes(active),
            )}
            {menu === "konversi" && (
              <div className="absolute left-1/2 top-full grid w-[34rem] -translate-x-1/2 grid-cols-2 gap-6 rounded-2xl border border-zinc-200 bg-white p-5 shadow-xl">
                <div>
                  <p className="mb-2 px-3 text-xs font-bold uppercase tracking-wider text-zinc-500">
                    Konversi ke PDF
                  </p>
                  {toPdf.map((t) => (
                    <ToolLink key={t.id} tool={t} onPick={pick} />
                  ))}
                </div>
                <div>
                  <p className="mb-2 px-3 text-xs font-bold uppercase tracking-wider text-zinc-500">
                    Konversi dari PDF
                  </p>
                  {fromPdf.map((t) => (
                    <ToolLink key={t.id} tool={t} onPick={pick} />
                  ))}
                </div>
              </div>
            )}
          </div>
          <div className="relative">
            {dropBtn("semua", "Semua Tools", false)}
            {menu === "semua" && (
              <div className="absolute right-0 top-full w-64 rounded-2xl border border-zinc-200 bg-white p-3 shadow-xl">
                {TOOLS.map((t) => (
                  <ToolLink key={t.id} tool={t} onPick={pick} />
                ))}
              </div>
            )}
          </div>
        </nav>

        <div className="hidden items-center gap-2 text-xs font-semibold text-zinc-500 lg:flex">
          🔒 Diproses di browser, tanpa unggah ke server
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onToggleTheme}
            aria-label={
              darkMode ? "Aktifkan mode terang" : "Aktifkan mode gelap"
            }
            title={darkMode ? "Aktifkan mode terang" : "Aktifkan mode gelap"}
            className="rounded-lg border border-zinc-200 px-3 py-1.5 text-sm font-semibold"
          >
            <span aria-hidden="true">{darkMode ? "☀️" : "🌙"}</span>
          </button>
          <button
            onClick={() => setMobile((v) => !v)}
            className="rounded-lg border border-zinc-200 px-3 py-1.5 text-sm font-semibold lg:hidden"
          >
            {mobile ? "✕" : "☰ Menu"}
          </button>
        </div>
      </div>

      {mobile && (
        <div className="border-t border-zinc-200 bg-white px-4 py-3 lg:hidden">
          {TOOLS.map((t) => (
            <ToolLink key={t.id} tool={t} onPick={pick} />
          ))}
        </div>
      )}
    </header>
  );
}

function ToolCard({ tool, onPick }) {
  return (
    <button
      onClick={() => onPick(tool.id)}
      className="group flex flex-col rounded-2xl border border-zinc-200 bg-white p-6 text-left transition hover:-translate-y-0.5 hover:shadow-lg"
    >
      <span
        className={`flex h-12 w-12 items-center justify-center rounded-xl text-2xl ${tool.tint}`}
      >
        {tool.icon}
      </span>
      <h3 className="mt-5 text-xl font-bold text-zinc-900 group-hover:text-red-600">
        {tool.name}
      </h3>
      <p className="mt-2 text-sm leading-relaxed text-zinc-500">{tool.desc}</p>
    </button>
  );
}

function Home({ onPick }) {
  const [cat, setCat] = useState("semua");
  const shown =
    cat === "semua" ? TOOLS : TOOLS.filter((t) => t.category === cat);

  return (
    <>
      <section className="hero-bg px-5 pb-16 pt-14 md:pt-20">
        <div className="mx-auto max-w-5xl text-center">
          <h1 className="text-4xl font-extrabold tracking-tight text-zinc-900 md:text-6xl">
            Semua tools untuk PDF &amp; gambar kamu dalam satu tempat
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-zinc-500">
            Kompres, gabung, dan konversi berkas langsung di browser. Gratis,
            cepat, dan berkasmu tidak pernah diunggah ke server.
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-3">
            {CATEGORIES.map((c) => (
              <button
                key={c.id}
                onClick={() => setCat(c.id)}
                className={`rounded-full border px-5 py-2 text-sm font-semibold transition ${
                  cat === c.id
                    ? "border-zinc-900 bg-zinc-900 text-white"
                    : "border-zinc-300 bg-white text-zinc-700 hover:bg-zinc-100"
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>

          <div className="mt-10 grid gap-5 text-left sm:grid-cols-2 lg:grid-cols-3">
            {shown.map((t) => (
              <ToolCard key={t.id} tool={t} onPick={onPick} />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

export default function App() {
  const [active, setActive] = useState(readHash);
  const [darkMode, setDarkMode] = useState(
    () => window.localStorage.getItem("file-compress-theme") === "dark",
  );

  useEffect(() => {
    const onHash = () => setActive(readHash());
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
    document.documentElement.style.colorScheme = darkMode ? "dark" : "light";
    window.localStorage.setItem(
      "file-compress-theme",
      darkMode ? "dark" : "light",
    );
  }, [darkMode]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [active]);

  const go = (id) => {
    window.location.hash = id ? `/${id}` : "";
    if (!id) history.replaceState(null, "", window.location.pathname);
    setActive(id);
  };

  const tool = active ? toolById(active) : null;

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar
        active={active}
        onPick={go}
        onHome={() => go(null)}
        darkMode={darkMode}
        onToggleTheme={() => setDarkMode((mode) => !mode)}
      />

      <main className="flex-1">
        {tool ? (
          <div className="hero-bg min-h-full px-5 py-10 md:py-14">
            <div className="mx-auto max-w-4xl">
              <button
                onClick={() => go(null)}
                className="mb-6 text-sm font-semibold text-zinc-500 hover:text-red-600"
              >
                ← Semua tools
              </button>
              <tool.Component key={tool.id} />
            </div>
          </div>
        ) : (
          <Home onPick={go} />
        )}
      </main>

      <footer className="border-t border-zinc-200 bg-white px-5 py-6 text-center">
        <p className="text-[11px] uppercase tracking-wider text-zinc-400">
          Project created by
        </p>
        <p className="text-sm font-bold text-zinc-800">Syahbarudin Abdillah</p>
      </footer>
    </div>
  );
}
