import { useEffect, useMemo, useState } from "react";
import { Button, Dropzone, Notice, PageTitle, Spinner } from "./ui.jsx";
import { baseName, downloadBlob, imagesToPdf, kb } from "../lib/tools.js";

export default function ImageToPdf() {
  const [files, setFiles] = useState([]);
  const [fit, setFit] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);

  const urls = useMemo(() => files.map((f) => URL.createObjectURL(f)), [files]);
  useEffect(() => () => urls.forEach((u) => URL.revokeObjectURL(u)), [urls]);

  const run = async () => {
    setBusy(true);
    setError("");
    setResult(null);
    try {
      setResult(await imagesToPdf(files, fit));
    } catch (e) {
      setError(`Gagal mengonversi gambar ke PDF: ${e.message}`);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <PageTitle title="🖼️➡️📄 Ubah Gambar ke PDF" subtitle="Gabungkan foto (JPG, PNG, WEBP) menjadi berkas PDF full image tanpa border/padding putih." />
      <Dropzone
        accept="image/jpeg,image/png,image/webp"
        multiple
        disabled={busy}
        label="Unggah Berkas Gambar (bisa pilih banyak sekaligus)"
        onFiles={(f) => { setFiles(f); setResult(null); setError(""); }}
      />

      {files.length > 0 && (
        <div className="mt-6 space-y-5">
          <Notice>📁 Total gambar diunggah: <b>{files.length} berkas</b></Notice>

          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {files.map((f, i) => (
              <div key={f.name + i} className="rounded-xl border border-zinc-200 bg-white p-2">
                <img src={urls[i]} alt={f.name} className="aspect-square w-full rounded-lg object-cover" />
                <p className="mt-1 truncate text-center text-xs text-zinc-500" title={f.name}>{f.name}</p>
              </div>
            ))}
          </div>

          <label className="flex cursor-pointer items-start gap-2 text-sm">
            <input type="checkbox" checked={fit} onChange={(e) => setFit(e.target.checked)} className="mt-0.5 accent-red-500" />
            Optimalkan skala gambar (mencegah PDF raksasa &amp; menjaga full image tanpa border)
          </label>

          <Button onClick={run} disabled={busy}>⚡ Konversi ke PDF Sekarang</Button>
          {busy && <Spinner text="Sedang memproses dan mengonversi gambar ke PDF..." />}
          {error && <Notice tone="error">{error}</Notice>}
          {result && (
            <div className="space-y-3">
              <Notice tone="success">🎉 Berhasil diubah ke PDF! Ukuran berkas: <b>{kb(result.size)} KB</b></Notice>
              <Button onClick={() => downloadBlob(result, `${baseName(files[0].name)}_img2pdf.pdf`)}>⬇️ Unduh Berkas PDF</Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
