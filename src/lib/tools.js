import { PDFDocument } from "pdf-lib";
import * as pdfjs from "pdfjs-dist";
import workerUrl from "pdfjs-dist/build/pdf.worker.min.mjs?url";

pdfjs.GlobalWorkerOptions.workerSrc = workerUrl;

// ---------- helpers umum ----------
export const kb = (bytes) => Math.round((bytes / 1024) * 100) / 100;
export const savingsPct = (orig, now) =>
  orig > 0 ? Math.max(0, Math.round((1 - now / orig) * 1000) / 10) : 0;
export const baseName = (name) => name.replace(/\.[^.]+$/, "");

export function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

const canvasToBlob = (canvas, type, quality) =>
  new Promise((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("Gagal membuat gambar"))), type, quality)
  );

// ---------- gambar ----------
/** Muat gambar dengan koreksi rotasi EXIF (setara ImageOps.exif_transpose). */
export async function loadBitmap(file) {
  return createImageBitmap(file, { imageOrientation: "from-image" });
}

function bitmapToCanvas(bmp, maxDim) {
  let w = bmp.width;
  let h = bmp.height;
  if (maxDim && Math.max(w, h) > maxDim) {
    const r = maxDim / Math.max(w, h);
    w = Math.round(w * r);
    h = Math.round(h * r);
  }
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#fff"; // transparansi PNG/WEBP -> putih (seperti convert RGB)
  ctx.fillRect(0, 0, w, h);
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(bmp, 0, 0, w, h);
  return canvas;
}

export async function compressImage(file, quality) {
  const bmp = await loadBitmap(file);
  const canvas = bitmapToCanvas(bmp);
  bmp.close?.();
  return canvasToBlob(canvas, "image/jpeg", quality / 100);
}

export async function imagesToPdf(files, fit = true) {
  const pdf = await PDFDocument.create();
  for (const file of files) {
    const bmp = await loadBitmap(file);
    const canvas = bitmapToCanvas(bmp, fit ? 1754 : null);
    bmp.close?.();
    const blob = await canvasToBlob(canvas, "image/jpeg", 0.92);
    const jpg = await pdf.embedJpg(new Uint8Array(await blob.arrayBuffer()));
    // 150 dpi -> ukuran halaman = ukuran gambar (tanpa border putih)
    const w = (canvas.width * 72) / 150;
    const h = (canvas.height * 72) / 150;
    const page = pdf.addPage([w, h]);
    page.drawImage(jpg, { x: 0, y: 0, width: w, height: h });
  }
  return new Blob([await pdf.save()], { type: "application/pdf" });
}

// ---------- PDF ----------
async function openPdfJs(bytes) {
  return pdfjs.getDocument({ data: bytes.slice(0) }).promise;
}

export async function pdfThumbnail(file, scale = 0.6) {
  try {
    const pdf = await openPdfJs(new Uint8Array(await file.arrayBuffer()));
    const page = await pdf.getPage(1);
    const vp = page.getViewport({ scale });
    const canvas = document.createElement("canvas");
    canvas.width = vp.width;
    canvas.height = vp.height;
    await page.render({ canvasContext: canvas.getContext("2d"), viewport: vp }).promise;
    return canvas.toDataURL("image/jpeg", 0.75);
  } catch {
    return null;
  }
}

/** Kompresi ringan untuk PDF teks/vektor (re-save dengan object streams). */
export async function compressTextPdf(bytes) {
  const doc = await PDFDocument.load(bytes, { ignoreEncryption: true });
  doc.setTitle("");
  doc.setAuthor("");
  doc.setSubject("");
  doc.setKeywords([]);
  doc.setProducer("");
  doc.setCreator("");
  const out = await doc.save({ useObjectStreams: true });
  return out.length < bytes.length ? out : bytes;
}

/** Kompresi ekstrem: render tiap halaman jadi JPEG lalu susun ulang jadi PDF. */
export async function compressImagePdf(bytes, quality = 40, scale = 1.2, onProgress) {
  const src = await openPdfJs(bytes);
  const out = await PDFDocument.create();

  for (let i = 1; i <= src.numPages; i++) {
    const page = await src.getPage(i);
    const base = page.getViewport({ scale: 1 }); // ukuran halaman asli (pt)
    const vp = page.getViewport({ scale });
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(vp.width);
    canvas.height = Math.round(vp.height);
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    await page.render({ canvasContext: ctx, viewport: vp }).promise;

    const blob = await canvasToBlob(canvas, "image/jpeg", quality / 100);
    const jpg = await out.embedJpg(new Uint8Array(await blob.arrayBuffer()));
    const p = out.addPage([base.width, base.height]);
    p.drawImage(jpg, { x: 0, y: 0, width: base.width, height: base.height });
    onProgress?.(i, src.numPages);
  }
  return new Uint8Array(await out.save());
}

export async function mergePdfs(files) {
  const out = await PDFDocument.create();
  for (const f of files) {
    const doc = await PDFDocument.load(await f.arrayBuffer(), { ignoreEncryption: true });
    const pages = await out.copyPages(doc, doc.getPageIndices());
    pages.forEach((p) => out.addPage(p));
  }
  return new Uint8Array(await out.save());
}

// ---------- Word <-> PDF ----------
export async function docxToPdf(file) {
  const [{ default: mammoth }, { default: html2pdf }] = await Promise.all([
    import("mammoth/mammoth.browser"),
    import("html2pdf.js"),
  ]);
  const { value: html } = await mammoth.convertToHtml({ arrayBuffer: await file.arrayBuffer() });

  const host = document.createElement("div");
  host.style.cssText = "position:fixed;left:-10000px;top:0;width:794px;background:#fff;color:#000;";
  host.innerHTML = `
    <style>
      .doc{font-family:Calibri,Arial,sans-serif;font-size:12pt;line-height:1.5;padding:0}
      .doc img{max-width:100%}
      .doc table{border-collapse:collapse;width:100%}
      .doc td,.doc th{border:1px solid #999;padding:4px 6px}
    </style>
    <div class="doc">${html}</div>`;
  document.body.appendChild(host);

  try {
    const blob = await html2pdf()
      .set({
        margin: [15, 15, 15, 15],
        image: { type: "jpeg", quality: 0.95 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
        pagebreak: { mode: ["css", "legacy"] },
      })
      .from(host.querySelector(".doc"))
      .outputPdf("blob");
    return blob;
  } finally {
    host.remove();
  }
}

export async function pdfToDocx(file) {
  const { Document, Packer, Paragraph, TextRun, PageBreak } = await import("docx");
  const pdf = await openPdfJs(new Uint8Array(await file.arrayBuffer()));
  const children = [];

  for (let p = 1; p <= pdf.numPages; p++) {
    const page = await pdf.getPage(p);
    const content = await page.getTextContent();

    // kelompokkan item teks menjadi baris berdasarkan koordinat Y
    const lines = [];
    for (const item of content.items) {
      if (!("str" in item) || item.str === "") continue;
      const y = item.transform[5];
      const x = item.transform[4];
      let line = lines.find((l) => Math.abs(l.y - y) < 3);
      if (!line) {
        line = { y, parts: [] };
        lines.push(line);
      }
      line.parts.push({ x, str: item.str });
    }
    lines.sort((a, b) => b.y - a.y);

    for (const line of lines) {
      line.parts.sort((a, b) => a.x - b.x);
      const text = line.parts.map((s) => s.str).join(" ").replace(/\s+/g, " ").trim();
      if (text) children.push(new Paragraph({ children: [new TextRun(text)] }));
    }
    if (p < pdf.numPages) children.push(new Paragraph({ children: [new PageBreak()] }));
  }

  if (!children.length) {
    throw new Error("Tidak ada teks yang bisa diekstrak (PDF mungkin hasil scan/gambar).");
  }
  const doc = new Document({ sections: [{ children }] });
  return Packer.toBlob(doc);
}
