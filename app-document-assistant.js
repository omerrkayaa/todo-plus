(function registerDocumentAssistant(global) {
  function createClient({ apiBaseUrl, getAccessToken }) {
    const request = async (path, options = {}) => {
      const accessToken = await getAccessToken();
      if (!accessToken) throw new Error("Doküman asistanı için Supabase oturumu gerekli.");
      const response = await fetch(`${apiBaseUrl}${path}`, {
        ...options,
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
          ...(options.headers || {}),
        },
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.error?.message || "Doküman asistanı isteği başarısız oldu.");
      return payload;
    };

    return Object.freeze({
      process: (documentId) => request(`/documents/${documentId}/process`, { method: "POST" }),
      status: (documentId) => request(`/documents/${documentId}/status`),
      messages: (documentId) => request(`/documents/${documentId}/messages`),
      chat: (documentId, question) => request(`/documents/${documentId}/chat`, { method: "POST", body: JSON.stringify({ question }) }),
      summary: (documentId, force = false) => request(`/documents/${documentId}/summary`, { method: "POST", body: JSON.stringify({ force }) }),
    });
  }

  global.TODO_PLUS_DOCUMENT_ASSISTANT = Object.freeze({ createClient });
})(window);
