import path from "node:path";
import { createRequire } from "node:module";
import mammoth from "mammoth";
import { HttpError } from "../errors.js";

const supportedExtensions = new Set([".pdf", ".docx", ".txt"]);
let pdfParseModule;

async function getPdfParse() {
  if (!Promise.withResolvers) {
    Promise.withResolvers = () => {
      let resolve;
      let reject;
      const promise = new Promise((resolvePromise, rejectPromise) => {
        resolve = resolvePromise;
        reject = rejectPromise;
      });
      return { promise, resolve, reject };
    };
  }
  if (!process.getBuiltinModule) {
    const require = createRequire(import.meta.url);
    process.getBuiltinModule = (specifier) => require(specifier);
  }
  if (!pdfParseModule) pdfParseModule = import("pdf-parse");
  return pdfParseModule;
}

function normalizeText(value) {
  return String(value || "")
    .replace(/\u0000/g, "")
    .replace(/\r\n?/g, "\n")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export async function parseDocument({ buffer, fileName }) {
  const extension = path.extname(fileName || "").toLocaleLowerCase("tr-TR");
  if (!supportedExtensions.has(extension)) {
    throw new HttpError(415, "Doküman asistanı yalnızca PDF, DOCX ve TXT dosyalarını işleyebilir.", "unsupported_document_type");
  }

  let text = "";
  if (extension === ".pdf") {
    const { PDFParse } = await getPdfParse();
    const parser = new PDFParse({ data: new Uint8Array(buffer) });
    try {
      const result = await parser.getText();
      text = result.text;
    } finally {
      await parser.destroy();
    }
  } else if (extension === ".docx") {
    const result = await mammoth.extractRawText({ buffer });
    text = result.value;
  } else {
    text = new TextDecoder("utf-8", { fatal: false }).decode(buffer);
  }

  const normalized = normalizeText(text);
  if (!normalized) throw new HttpError(422, "Dokümandan okunabilir metin çıkarılamadı.", "empty_document");
  return { text: normalized, characterCount: normalized.length, extension };
}

export { normalizeText, supportedExtensions };
