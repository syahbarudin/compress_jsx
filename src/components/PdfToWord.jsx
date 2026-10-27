import { useState } from "react";
import { Button, Dropzone, Notice, PageTitle, Spinner } from "./ui.jsx";
import { baseName, downloadBlob, kb, pdfToDocx } from "../lib/tools.js";

export default function PdfToWord() {
  const [file, setFile] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);

  const run = async () => {
    setBusy(true);
    setError("");
    setResult(null);
    try {
      setResult(await pdfToDocx(file));
    } catch (e) {
      setError(`Gagal melakukan konversi berkas: ${e.message}`);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <PageTitle title="📄➔📑 Ubah Dokumen PDF ke Word" subtitle="Ekstrak teks PDF menjadi dokumen Microsoft Word (.docx) yang dapat disunting." />
      <Dropzone accept="application/pdf" label="Unggah Berkas PDF" onFiles={([f]) => { setFile(f); setResult(null); setError(""); }} disabled={busy} />

      {file && (
        <div className="mt-6 space-y-4">
          <Notice>📁 Dokumen: <b>{file.name}</b> | Ukuran: <b>{kb(file.size)} KB</b></Notice>
          <Notice tone="warn">
            Yang diekstrak hanya teks per baris. Gambar, tabel, dan tata letak asli tidak ikut terbawa, dan PDF hasil scan tidak bisa dikonversi tanpa OCR.
          </Notice>
          <Button onClick={run} disabled={busy}>⚡ Konversi ke Word Sekarang</Button>
          {busy && <Spinner text="Sedang mengekstrak teks PDF ke Word..." />}
          {error && <Notice tone="error">{error}</Notice>}
          {result && (
            <div className="space-y-3">
              <Notice tone="success">🎉 Berhasil diubah ke Word! Ukuran berkas: <b>{kb(result.size)} KB</b></Notice>
              <Button onClick={() => downloadBlob(result, `${baseName(file.name)}_pdf2word.docx`)}>⬇️ Unduh Berkas Word (.docx)</Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
