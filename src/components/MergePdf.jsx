import { useEffect, useState } from "react";
import { Button, Dropzone, Notice, PageTitle, Spinner } from "./ui.jsx";
import { baseName, compressImagePdf, downloadBlob, kb, mergePdfs, pdfThumbnail, savingsPct } from "../lib/tools.js";

export default function MergePdf() {
  // items: { id, file, thumb }
  const [items, setItems] = useState([]);
  const [dragId, setDragId] = useState(null);
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");
  const [merged, setMerged] = useState(null); // Uint8Array
  const [compressed, setCompressed] = useState(null);

  const addFiles = (files) => {
    const fresh = files.map((file) => ({ id: crypto.randomUUID(), file, thumb: null }));
    setItems((prev) => [...prev, ...fresh]);
    setMerged(null);
    setCompressed(null);
    fresh.forEach(async (it) => {
      const thumb = await pdfThumbnail(it.file);
      setItems((prev) => prev.map((p) => (p.id === it.id ? { ...p, thumb } : p)));
    });
  };

  const move = (from, to) => {
    if (to < 0 || to >= items.length || from === to) return;
    setItems((prev) => {
      const next = [...prev];
      const [m] = next.splice(from, 1);
      next.splice(to, 0, m);
      return next;
    });
    setMerged(null);
    setCompressed(null);
  };

  const remove = (id) => {
    setItems((prev) => prev.filter((p) => p.id !== id));
    setMerged(null);
    setCompressed(null);
  };

  const doMerge = async () => {
    setBusy("Menggabungkan seluruh PDF...");
    setError("");
    try {
      setMerged(await mergePdfs(items.map((i) => i.file)));
      setCompressed(null);
    } catch (e) {
      setError(`Gagal menggabungkan: ${e.message}`);
    } finally {
      setBusy("");
    }
  };

  const doCompress = async () => {
    setBusy("Mengompresi dan merampingkan dokumen gabungan...");
    setError("");
    try {
      setCompressed(await compressImagePdf(merged, 40, 1.2));
    } catch (e) {
      setError(`Gagal kompresi: ${e.message}`);
    } finally {
      setBusy("");
    }
  };

  const firstBase = items[0] ? baseName(items[0].file.name) : "merge";

  return (
    <div>
      <PageTitle title="🧩 Gabung PDF (Merge)" subtitle="Susun urutan berkas dengan drag & drop, lalu gabungkan jadi satu PDF." />
      <Dropzone accept="application/pdf" multiple label="Pilih berkas PDF" onFiles={addFiles} />

      {items.length === 0 ? (
        <div className="mt-6"><Notice>Unggah 2 atau lebih berkas PDF untuk mulai menyusun urutan.</Notice></div>
      ) : (
        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_280px]">
          <div>
            <h2 className="text-lg font-semibold">🛠️ Atur Urutan Berkas</h2>
            <p className="mb-3 text-xs text-zinc-500">Seret kartu untuk mengubah urutan, atau pakai tombol panah.</p>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-4">
              {items.map((it, idx) => (
                <div
                  key={it.id}
                  draggable
                  onDragStart={() => setDragId(it.id)}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={() => {
                    const from = items.findIndex((p) => p.id === dragId);
                    move(from, idx);
                    setDragId(null);
                  }}
                  onDragEnd={() => setDragId(null)}
                  className={`cursor-grab rounded-xl border bg-zinc-900 p-2 transition ${
                    dragId === it.id ? "border-amber-400 opacity-50" : "border-zinc-800"
                  }`}
                >
                  <div className="flex aspect-[3/4] items-center justify-center overflow-hidden rounded-lg bg-zinc-800">
                    {it.thumb ? <img src={it.thumb} alt="" className="h-full w-full object-contain" draggable={false} /> : <span className="text-4xl">📄</span>}
                  </div>
                  <p className="mt-2 truncate text-center text-xs font-bold" title={it.file.name}>{it.file.name}</p>
                  <p className="text-center text-[11px] font-bold text-red-500">Urutan #{idx + 1}</p>
                  <div className="mt-1 flex items-center justify-center gap-1">
                    <button onClick={() => move(idx, idx - 1)} disabled={idx === 0} className="rounded bg-zinc-800 px-2 py-0.5 text-xs hover:bg-zinc-700 disabled:opacity-30">←</button>
                    <button onClick={() => move(idx, idx + 1)} disabled={idx === items.length - 1} className="rounded bg-zinc-800 px-2 py-0.5 text-xs hover:bg-zinc-700 disabled:opacity-30">→</button>
                    <button onClick={() => remove(it.id)} className="rounded bg-zinc-800 px-2 py-0.5 text-xs text-red-400 hover:bg-zinc-700">✕</button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <aside className="space-y-3">
            <h2 className="text-2xl font-bold">Merge PDF</h2>
            <Notice>ℹ️ Dokumen paling kiri akan menjadi halaman terdepan.</Notice>
            {items.length < 2 ? (
              <Notice tone="warn">Pilih minimal 2 dokumen.</Notice>
            ) : (
              <Button onClick={doMerge} disabled={!!busy}>Merge PDF ➔</Button>
            )}
            {busy && <Spinner text={busy} />}
            {error && <Notice tone="error">{error}</Notice>}

            {merged && (
              <div className="space-y-3">
                <Notice tone="success">🎉 Dokumen siap! ({kb(merged.length)} KB)</Notice>
                <Button onClick={() => downloadBlob(new Blob([merged], { type: "application/pdf" }), `${firstBase}_merge.pdf`)}>
                  ⬇️ Unduh PDF ({kb(merged.length)} KB)
                </Button>
                <Button variant="secondary" onClick={doCompress} disabled={!!busy}>🗜️ Kompres Hasil Ini</Button>
                {compressed && (
                  <div className="space-y-2">
                    <p className="text-xs text-zinc-400">
                      Hemat <b>{savingsPct(merged.length, compressed.length)}%</b> (Ukuran: {kb(compressed.length)} KB)
                    </p>
                    <Button variant="secondary" onClick={() => downloadBlob(new Blob([compressed], { type: "application/pdf" }), `${firstBase}_merge_compress.pdf`)}>
                      ⬇️ Unduh PDF Terkompresi ({kb(compressed.length)} KB)
                    </Button>
                  </div>
                )}
              </div>
            )}
          </aside>
        </div>
      )}
    </div>
  );
}
