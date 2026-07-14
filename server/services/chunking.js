const findBoundary = (text, start, targetEnd) => {
  if (targetEnd >= text.length) return text.length;
  const minimum = start + Math.floor((targetEnd - start) * 0.65);
  for (const separator of ["\n\n", "\n", ". ", " "]) {
    const index = text.lastIndexOf(separator, targetEnd);
    if (index >= minimum) return index + separator.length;
  }
  return targetEnd;
};

export function chunkDocument(text, { chunkSize = 4000, overlap = 500 } = {}) {
  if (!text?.trim()) return [];
  if (overlap < 0 || overlap >= chunkSize) throw new Error("Chunk overlap değeri chunk boyutundan küçük olmalıdır.");

  const chunks = [];
  let start = 0;
  while (start < text.length) {
    const end = findBoundary(text, start, Math.min(start + chunkSize, text.length));
    const content = text.slice(start, end).trim();
    if (content) {
      chunks.push({
        chunkIndex: chunks.length,
        content,
        tokenCount: Math.ceil(content.length / 4),
        sourceLabel: `Bölüm ${chunks.length + 1}`,
      });
    }
    if (end >= text.length) break;
    const nextStart = Math.max(start + 1, end - overlap);
    start = nextStart;
  }
  return chunks;
}
