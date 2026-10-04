import { getConfig } from "../config.js";
import { HttpError } from "../errors.js";

async function requestEmbeddings(input, inputType) {
  const config = getConfig();
  let response;
  try {
    response = await fetch("https://api.voyageai.com/v1/embeddings", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${config.voyageApiKey}`,
        "Content-Type": "application/json",
      },
      signal: AbortSignal.timeout(30_000),
      body: JSON.stringify({
        input,
        model: config.voyageModel,
        input_type: inputType,
        output_dimension: 1024,
        truncation: true,
      }),
    });
  } catch (error) {
    throw new HttpError(502, "Embedding servisine ulaşılamadı.", "embedding_provider_error", String(error?.message || error));
  }
  if (!response.ok) {
    const detail = await response.text();
    throw new HttpError(502, "Embedding servisine ulaşılamadı.", "embedding_provider_error", detail.slice(0, 500));
  }
  const payload = await response.json();
  return payload.data.sort((a, b) => a.index - b.index).map((item) => item.embedding);
}

export async function embedDocuments(contents) {
  const embeddings = [];
  for (let index = 0; index < contents.length; index += 64) {
    embeddings.push(...await requestEmbeddings(contents.slice(index, index + 64), "document"));
  }
  return embeddings;
}

export async function embedQuery(question) {
  const [embedding] = await requestEmbeddings([question], "query");
  return embedding;
}
