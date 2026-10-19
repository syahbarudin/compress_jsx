import { useState } from "react";
import { Button, Card, Dropzone, Notice, PageTitle, Spinner } from "./ui.jsx";
import { baseName, compressImagePdf, compressTextPdf, downloadBlob, kb, savingsPct } from "../lib/tools.js";

const MODES = {
  text: "📄 PDF Dokumen Teks / Campuran (Standar)",
  image: "🖼️ PDF Scan / Hasil Convert Gambar (Ekstrem Ala iLovePDF)",
};
const SHARPNESS = {
  "Sedang / Hemat Ukuran (DPI ~100)": 1.2,
  "Tinggi / Cukup Jelas (DPI ~135)": 1.5,
  "Sangat Tinggi (DPI ~180)": 2.0,
};

export default function PdfCompress() {
  const [file, setFile] = useState(null);
  const [mode, setMode] = useState("text");
  const [quality, setQuality] = useState(40);
  const [sharp, setSharp] = useState(Object.keys(SHARPNESS)[0]);
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);

  const run = async () => {
    setBusy("Sedang memproses dan mengompresi dokumen PDF...");
    setError("");
    setResult(null);
    try {
      const bytes = new Uint8Array(await file.arrayBuffer());
      const out =
        mode === "image"
          ? await compressImagePdf(bytes, quality, SHARPNESS[sharp], (i, n) => setBusy(`Memproses halaman ${i} dari ${n}...`))
          : await compressTextPdf(bytes);
      setResult(new Blob([out], { type: "application/pdf" }));
    } catch (e) {
      setError(`Gagal memproses PDF: ${e.message}`);
    } finally {
      setBusy("");
    }
  };

  return (
    <div>
      <PageTitle title="📄 Kompres Berkas PDF" subtitle="Optimalkan aliran teks atau pangkas ukuran PDF hasil scan/convert gambar." />
      <Dropzone accept="application/pdf" label="Unggah Berkas PDF" onFiles={([f]) => { setFile(f); setResult(null); setError(""); }} />

      {file && (
        <div className="mt-6 space-y-5">
          <Notice>📁 Berkas: <b>{file.name}</b> | Ukuran Asli: <b>{kb(file.size)} KB</b></Notice>

          <Card className="space-y-3">
            <p className="text-sm font-medium">Pilih Jenis PDF &amp; Metode Kompresi:</p>
            {Object.entries(MODES).map(([key, label]) => (
              <label key={key} className="flex cursor-pointer items-center gap-2 text-sm">
                <input type="radio" name="pdf-mode" checked={mode === key} onChange={() => setMode(key)} className="accent-red-500" />
                {label}
              </label>
            ))}
            <p className="text-xs text-zinc-500">
              Gunakan mode scan/gambar jika PDF kamu isinya foto/scan agar ukurannya turun drastis. Catatan: teks tidak bisa dipilih lagi setelahnya.
            </p>
          </Card>

          {mode === "image" && (
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <label className="flex items-center justify-between text-sm font-medium">
                  Kualitas Gambar di PDF
                  <span className="rounded bg-zinc-100 px-2 py-0.5 text-red-600">{quality}</span>
                </label>
                <input type="range" min={10} max={80} value={quality} onChange={(e) => setQuality(+e.target.value)} className="mt-3 w-full accent-red-500" />
              </Card>
              <Card>
                <label className="text-sm font-medium">Tingkat Kejelasan / Ketajaman</label>
                <select value={sharp} onChange={(e) => setSharp(e.target.value)} className="mt-3 w-full rounded-lg border border-zinc-300 bg-zinc-100 px-3 py-2 text-sm">
                  {Object.keys(SHARPNESS).map((k) => <option key={k}>{k}</option>)}
                </select>
              </Card>
            </div>
          )}

          <Button onClick={run} disabled={!!busy}>⚡ Mulai Kompresi PDF</Button>
          {busy && <Spinner text={busy} />}
          {error && <Notice tone="error">{error}</Notice>}

          {result && (
            <div className="space-y-3">
              <Notice tone="success">
                🎉 Selesai! Ukuran berkurang dari <b>{kb(file.size)} KB</b> menjadi <b>{kb(result.size)} KB</b> (Hemat <b>{savingsPct(file.size, result.size)}%</b>)
              </Notice>
              <Button onClick={() => downloadBlob(result, `${baseName(file.name)}_compress.pdf`)}>⬇️ Unduh PDF Hasil Kompresi</Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
