import { useEffect, useMemo, useState } from "react";
import { Card, Dropzone, Notice, PageTitle, Button } from "./ui.jsx";
import { baseName, compressImage, downloadBlob, kb, savingsPct } from "../lib/tools.js";

export default function ImageCompress() {
  const [file, setFile] = useState(null);
  const [quality, setQuality] = useState(50);
  const [result, setResult] = useState(null); // { blob, url }
  const [error, setError] = useState("");

  const origUrl = useMemo(() => (file ? URL.createObjectURL(file) : null), [file]);
  useEffect(() => () => origUrl && URL.revokeObjectURL(origUrl), [origUrl]);

  // kompres ulang (debounce) setiap slider/berkas berubah
  useEffect(() => {
    if (!file) return;
    let cancelled = false;
    let url = null;
    const t = setTimeout(async () => {
      try {
        const blob = await compressImage(file, quality);
        if (cancelled) return;
        url = URL.createObjectURL(blob);
        setResult({ blob, url });
        setError("");
      } catch (e) {
        if (!cancelled) setError(e.message);
      }
    }, 200);
    return () => {
      cancelled = true;
      clearTimeout(t);
      if (url) setTimeout(() => URL.revokeObjectURL(url), 1000);
    };
  }, [file, quality]);

  return (
    <div>
      <PageTitle title="🖼️ Kompres Gambar" subtitle="Kecilkan ukuran berkas JPG, PNG, atau WEBP dengan pratinjau langsung." />
      <Dropzone accept="image/jpeg,image/png,image/webp" label="Unggah Gambar" onFiles={([f]) => { setFile(f); setResult(null); }} />

      {file && (
        <div className="mt-6 space-y-6">
          <Card>
            <label className="flex items-center justify-between text-sm font-medium">
              Tingkat Kualitas Kompresi (Quality)
              <span className="rounded bg-zinc-100 px-2 py-0.5 text-red-600">{quality}</span>
            </label>
            <input
              type="range" min={5} max={100} value={quality}
              onChange={(e) => setQuality(+e.target.value)}
              className="mt-3 w-full accent-red-500"
            />
            <p className="mt-1 text-xs text-zinc-500">Semakin kecil nilai slider, semakin kecil ukuran berkas akhirnya.</p>
          </Card>

          {error && <Notice tone="error">{error}</Notice>}

          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-3">
              <h2 className="text-lg font-semibold">Gambar Asli</h2>
              <Notice>Ukuran: <b>{kb(file.size)} KB</b></Notice>
              <img src={origUrl} alt="asli" className="w-full rounded-lg border border-zinc-200" />
            </div>
            <div className="space-y-3">
              <h2 className="text-lg font-semibold">Hasil Kompresi</h2>
              {result ? (
                <>
                  <Notice tone="success">
                    Ukuran: <b>{kb(result.blob.size)} KB</b> (Hemat <b>{savingsPct(file.size, result.blob.size)}%</b>)
                  </Notice>
                  <img src={result.url} alt="hasil" className="w-full rounded-lg border border-zinc-200" />
                  <Button onClick={() => downloadBlob(result.blob, `${baseName(file.name)}_compress.jpg`)}>
                    ⬇️ Unduh Gambar Hasil Kompresi
                  </Button>
                </>
              ) : (
                <Notice>Memproses…</Notice>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
