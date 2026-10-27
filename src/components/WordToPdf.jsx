import { useState } from "react";
import { Button, Dropzone, Notice, PageTitle, Spinner } from "./ui.jsx";
import { baseName, docxToPdf, downloadBlob, kb } from "../lib/tools.js";

export default function WordToPdf() {
  const [file, setFile] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);

  const run = async () => {
    setBusy(true);
    setError("");
    setResult(null);
    try {
      setResult(await docxToPdf(file));
    } catch (e) {
      setError(`Gagal melakukan konversi berkas: ${e.message}`);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <PageTitle title="📑➔📄 Ubah Dokumen Word ke PDF" subtitle="Konversi dokumen Microsoft Word (.docx) menjadi berkas PDF langsung di browser." />
      <Dropzone
        accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        label="Unggah Berkas Word (.docx)"
        disabled={busy}
        onFiles={([f]) => { setFile(f); setResult(null); setError(""); }}
      />

      {file && (
        <div className="mt-6 space-y-4">
          <Notice>📁 Dokumen: <b>{file.name}</b> | Ukuran: <b>{kb(file.size)} KB</b></Notice>
          <Notice tone="warn">
            Konversi dilakukan di browser, jadi tata letak kompleks (header/footer, font khusus, text box) bisa berbeda dari aslinya dan teks pada PDF berupa gambar.
          </Notice>
          <Button onClick={run} disabled={busy}>⚡ Konversi ke PDF Sekarang</Button>
          {busy && <Spinner text="Sedang mengonversi format dokumen ke PDF..." />}
          {error && <Notice tone="error">{error}</Notice>}
          {result && (
            <div className="space-y-3">
              <Notice tone="success">🎉 Berhasil diubah ke PDF! Ukuran berkas: <b>{kb(result.size)} KB</b></Notice>
              <Button onClick={() => downloadBlob(result, `${baseName(file.name)}_word2pdf.pdf`)}>⬇️ Unduh Berkas PDF</Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
