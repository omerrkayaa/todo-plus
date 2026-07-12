(function registerSupabaseGateway(global) {
  const realtimeTables = [
    "projects", "categories", "tasks", "task_assignments", "task_givers",
    "task_history", "task_comments", "project_members", "project_invitations",
  ];

  function createGateway({ onRemoteChange, onStatusChange } = {}) {
    let client = null;
    let channel = null;
    let refreshTimer = null;

    function isConfigured() {
      const config = global.TODO_PLUS_SUPABASE;
      return Boolean(global.supabase && config?.url?.startsWith("https://") && config?.anonKey?.length > 20);
    }

    function getClient() {
      if (!isConfigured()) return null;
      if (!client) client = global.supabase.createClient(global.TODO_PLUS_SUPABASE.url, global.TODO_PLUS_SUPABASE.anonKey);
      return client;
    }

    function stopRealtime() {
      if (refreshTimer) global.clearTimeout(refreshTimer);
      refreshTimer = null;
      if (channel && client) client.removeChannel(channel);
      channel = null;
    }

    function startRealtime(userId) {
      const activeClient = getClient();
      if (!activeClient || !userId) return;
      stopRealtime();
      const refresh = (payload) => {
        global.clearTimeout(refreshTimer);
        refreshTimer = global.setTimeout(() => onRemoteChange?.(payload), 350);
      };
      channel = realtimeTables.reduce(
        (current, table) => current.on("postgres_changes", { event: "*", schema: "public", table }, refresh),
        activeClient.channel(`todo-plus-${userId}`),
      ).subscribe((status) => onStatusChange?.(status));
    }

    return Object.freeze({ isConfigured, getClient, startRealtime, stopRealtime });
  }

  global.TODO_PLUS_SUPABASE_GATEWAY = Object.freeze({ createGateway, realtimeTables: Object.freeze(realtimeTables) });
})(window);
