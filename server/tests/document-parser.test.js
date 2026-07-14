import test from "node:test";
import assert from "node:assert/strict";
import JSZip from "jszip";
import PDFDocument from "pdfkit";
import { parseDocument } from "../services/document-parser.js";

async function createMinimalPdf(text) {
  const document = new PDFDocument({ autoFirstPage: true, compress: false });
  const chunks = [];
  document.on("data", (chunk) => chunks.push(chunk));
  const completed = new Promise((resolve, reject) => {
    document.on("end", () => resolve(Buffer.concat(chunks)));
    document.on("error", reject);
  });
  document.fontSize(12).text(text);
  document.end();
  return completed;
}

async function createMinimalDocx(text) {
  const zip = new JSZip();
  zip.file("[Content_Types].xml", `<?xml version="1.0"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/></Types>`);
  zip.file("_rels/.rels", `<?xml version="1.0"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>`);
  zip.file("word/document.xml", `<?xml version="1.0"?><w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body><w:p><w:r><w:t>${text}</w:t></w:r></w:p></w:body></w:document>`);
  return zip.generateAsync({ type: "nodebuffer" });
}

test("TXT içeriğini UTF-8 olarak çıkarır ve normalize eder", async () => {
  const result = await parseDocument({
    fileName: "gorev.txt",
    buffer: Buffer.from("Başlık\r\n\r\n  Birinci görev.\n\n\nİkinci görev.", "utf8"),
  });
  assert.equal(result.text, "Başlık\n\n  Birinci görev.\n\nİkinci görev.");
  assert.equal(result.characterCount, result.text.length);
});

test("desteklenmeyen asistan dosyasını reddeder", async () => {
  await assert.rejects(
    parseDocument({ fileName: "tablo.xlsx", buffer: Buffer.from("x") }),
    (error) => error.status === 415 && error.code === "unsupported_document_type",
  );
});

test("PDF dosyasından metin çıkarır", async () => {
  const result = await parseDocument({ fileName: "plan.pdf", buffer: await createMinimalPdf("Delivery date is July 20") });
  assert.match(result.text, /Delivery date is July 20/);
});

test("DOCX dosyasından metin çıkarır", async () => {
  const result = await parseDocument({ fileName: "plan.docx", buffer: await createMinimalDocx("Teslim tarihi 20 Temmuz") });
  assert.match(result.text, /Teslim tarihi 20 Temmuz/);
});
