const STORAGE_KEY = "todo_plus_state_v1";
const AUTH_STORAGE_KEY = "todo_plus_auth_accounts_v1";
const SESSION_STORAGE_KEY = "todo_plus_session_v1";

const priorityScores = {
  dusuk: 1,
  orta: 2,
  yuksek: 3,
};

const priorityLabels = {
  dusuk: "Düşük",
  orta: "Orta",
  yuksek: "Yüksek",
};

const statusLabels = {
  bekliyor: "Bekliyor",
  devam_ediyor: "Devam ediyor",
  tamamlandi: "Tamamlandı",
};

const defaultState = {
  activeUserId: "user-1",
  users: [
    { id: "user-1", fullName: "Ömer Kaya", email: "omer@example.com" },
    { id: "user-2", fullName: "Ayşe Demir", email: "ayse@example.com" },
    { id: "user-3", fullName: "Mehmet Yılmaz", email: "mehmet@example.com" },
  ],
  projects: [
    {
      id: "project-1",
      userId: "user-1",
      name: "ToDo+ Proje Geliştirme",
      description: "Görev takip sistemi için analiz, tasarım ve uygulama süreci.",
      createdAt: "2026-07-09",
    },
    {
      id: "project-2",
      userId: "user-1",
      name: "Veritabanı Tasarımı",
      description: "Supabase tabloları, ER diyagramı ve başarı oranı hesabı.",
      createdAt: "2026-07-09",
    },
  ],
  categories: [
    { id: "category-1", userId: "user-1", name: "Analiz", color: "#2563eb" },
    { id: "category-2", userId: "user-1", name: "Kodlama", color: "#15803d" },
    { id: "category-3", userId: "user-1", name: "Rapor", color: "#b45309" },
  ],
  tasks: [
    {
      id: "task-1",
      projectId: "project-2",
      categoryId: "category-1",
      createdBy: "user-1",
      title: "ER diyagramını hazırla",
      description: "Users, projects, tasks, categories ve history ilişkilerini göster.",
      priority: "yuksek",
      status: "tamamlandi",
      estimatedMinutes: 90,
      dueDate: "2026-07-10",
      createdAt: "2026-07-09",
    },
    {
      id: "task-2",
      projectId: "project-1",
      categoryId: "category-2",
      createdBy: "user-1",
      title: "Görev ekranını kodla",
      description: "Görev ekleme, filtreleme ve durum değiştirme işlemleri.",
      priority: "yuksek",
      status: "devam_ediyor",
      estimatedMinutes: 120,
      dueDate: "2026-07-12",
      createdAt: "2026-07-09",
    },
    {
      id: "task-3",
      projectId: "project-1",
      categoryId: "category-3",
      createdBy: "user-1",
      title: "Proje raporunu güncelle",
      description: "Yapılan çalışmaları ve kullanılan yapıları rapora ekle.",
      priority: "orta",
      status: "bekliyor",
      estimatedMinutes: 60,
      dueDate: "2026-07-14",
      createdAt: "2026-07-09",
    },
  ],
  assignments: [
    {
      id: "assignment-1",
      taskId: "task-1",
      userId: "user-1",
      isCompleted: true,
      completedAt: "2026-07-09",
      earnedScore: 3,
      assignedAt: "2026-07-09",
    },
    {
      id: "assignment-2",
      taskId: "task-2",
      userId: "user-2",
      isCompleted: false,
      completedAt: "",
      earnedScore: 0,
      assignedAt: "2026-07-09",
    },
    {
      id: "assignment-3",
      taskId: "task-3",
      userId: "user-1",
      isCompleted: false,
      completedAt: "",
      earnedScore: 0,
      assignedAt: "2026-07-09",
    },
  ],
  taskGivers: [
    { id: "giver-1", taskId: "task-1", userId: "user-1", assignedAt: "2026-07-09" },
    { id: "giver-2", taskId: "task-2", userId: "user-1", assignedAt: "2026-07-09" },
    { id: "giver-3", taskId: "task-2", userId: "user-3", assignedAt: "2026-07-09" },
    { id: "giver-4", taskId: "task-3", userId: "user-1", assignedAt: "2026-07-09" },
  ],
  history: [
    {
      id: "history-1",
      taskId: "task-1",
      changedBy: "user-1",
      oldStatus: "devam_ediyor",
      newStatus: "tamamlandi",
      note: "ER diyagramı tamamlandı.",
      changedAt: "2026-07-09",
    },
  ],
  taskComments: [
    {
      id: "comment-1",
      taskId: "task-2",
      userId: "user-1",
      body: "Kanban akışı ve görev düzenleme kontrolleri birlikte test edilecek.",
      createdAt: "2026-07-09",
    },
  ],
};

const defaultAuthAccounts = [
  {
    id: "user-1",
    fullName: "Ömer Kaya",
    email: "omer@example.com",
    password: "123456",
  },
];

const state = loadState();
let authAccounts = loadAuthAccounts();
let currentSession = loadSession();
let editingProjectId = null;
let editingCategoryId = null;
let editingTaskId = null;
let activeDetailTaskId = null;
let draggedTaskId = null;
let supabaseClient = null;
let supabaseReady = false;
let isLoadingRemoteData = false;

const elements = {
  authScreen: document.querySelector("#authScreen"),
  appShell: document.querySelector("#appShell"),
  showLoginBtn: document.querySelector("#showLoginBtn"),
  showRegisterBtn: document.querySelector("#showRegisterBtn"),
  loginForm: document.querySelector("#loginForm"),
  registerForm: document.querySelector("#registerForm"),
  loginEmail: document.querySelector("#loginEmail"),
  loginPassword: document.querySelector("#loginPassword"),
  registerName: document.querySelector("#registerName"),
  registerEmail: document.querySelector("#registerEmail"),
  registerPassword: document.querySelector("#registerPassword"),
  authMessage: document.querySelector("#authMessage"),
  activeUser: document.querySelector("#activeUser"),
  addUserBtn: document.querySelector("#addUserBtn"),
  resetDemoBtn: document.querySelector("#resetDemoBtn"),
  logoutBtn: document.querySelector("#logoutBtn"),
  navItems: document.querySelectorAll(".nav-item"),
  pageTitle: document.querySelector("#pageTitle"),
  newTaskBtn: document.querySelector("#newTaskBtn"),
  dashboardView: document.querySelector("#dashboardView"),
  projectsView: document.querySelector("#projectsView"),
  tasksView: document.querySelector("#tasksView"),
  totalTasks: document.querySelector("#totalTasks"),
  completedTasks: document.querySelector("#completedTasks"),
  inProgressTasks: document.querySelector("#inProgressTasks"),
  successRate: document.querySelector("#successRate"),
  userScores: document.querySelector("#userScores"),
  upcomingTasks: document.querySelector("#upcomingTasks"),
  historyList: document.querySelector("#historyList"),
  projectForm: document.querySelector("#projectForm"),
  projectFormTitle: document.querySelector("#projectFormTitle"),
  projectSubmitBtn: document.querySelector("#projectSubmitBtn"),
  cancelProjectEditBtn: document.querySelector("#cancelProjectEditBtn"),
  projectName: document.querySelector("#projectName"),
  projectDescription: document.querySelector("#projectDescription"),
  projectCount: document.querySelector("#projectCount"),
  projectList: document.querySelector("#projectList"),
  categoryForm: document.querySelector("#categoryForm"),
  categoryFormTitle: document.querySelector("#categoryFormTitle"),
  categorySubmitBtn: document.querySelector("#categorySubmitBtn"),
  cancelCategoryEditBtn: document.querySelector("#cancelCategoryEditBtn"),
  categoryName: document.querySelector("#categoryName"),
  categoryColor: document.querySelector("#categoryColor"),
  categoryCount: document.querySelector("#categoryCount"),
  categoryList: document.querySelector("#categoryList"),
  searchInput: document.querySelector("#searchInput"),
  statusFilter: document.querySelector("#statusFilter"),
  priorityFilter: document.querySelector("#priorityFilter"),
  taskForm: document.querySelector("#taskForm"),
  taskFormTitle: document.querySelector("#taskFormTitle"),
  taskSubmitBtn: document.querySelector("#taskSubmitBtn"),
  cancelTaskEditBtn: document.querySelector("#cancelTaskEditBtn"),
  taskTitle: document.querySelector("#taskTitle"),
  taskDescription: document.querySelector("#taskDescription"),
  taskProject: document.querySelector("#taskProject"),
  taskCategory: document.querySelector("#taskCategory"),
  taskAssignee: document.querySelector("#taskAssignee"),
  taskGivers: document.querySelector("#taskGivers"),
  taskPriority: document.querySelector("#taskPriority"),
  taskStatus: document.querySelector("#taskStatus"),
  taskMinutes: document.querySelector("#taskMinutes"),
  taskDueDate: document.querySelector("#taskDueDate"),
  taskCount: document.querySelector("#taskCount"),
  kanbanBoard: document.querySelector("#kanbanBoard"),
  taskList: document.querySelector("#taskList"),
  taskDetailModal: document.querySelector("#taskDetailModal"),
  closeTaskDetailBtn: document.querySelector("#closeTaskDetailBtn"),
  taskDetailTitle: document.querySelector("#taskDetailTitle"),
  taskDetailBody: document.querySelector("#taskDetailBody"),
  taskCommentForm: document.querySelector("#taskCommentForm"),
  taskCommentText: document.querySelector("#taskCommentText"),
};

function loadState() {
  const storedState = localStorage.getItem(STORAGE_KEY);

  if (!storedState) {
    return structuredClone(defaultState);
  }

  try {
    const parsed = JSON.parse(storedState);
    const nextState = { ...structuredClone(defaultState), ...parsed };
    return migrateState(nextState, parsed);
  } catch {
    return structuredClone(defaultState);
  }
}

function migrateState(nextState, parsedState) {
  if (!Array.isArray(parsedState.taskGivers)) {
    nextState.taskGivers = nextState.tasks.map((task) => ({
      id: createId("giver"),
      taskId: task.id,
      userId: task.createdBy,
      assignedAt: task.createdAt || today(),
    }));
  }

  if (!Array.isArray(parsedState.taskComments)) {
    nextState.taskComments = [];
  }

  return nextState;
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));

  if (supabaseReady && currentSession?.userId && !isLoadingRemoteData) {
    syncStateToSupabase();
  }
}

function isSupabaseConfigured() {
  const config = window.TODO_PLUS_SUPABASE;
  return Boolean(
    window.supabase &&
      config?.url &&
      config?.anonKey &&
      config.url.startsWith("https://") &&
      config.anonKey.length > 20,
  );
}

function getSupabaseClient() {
  if (!isSupabaseConfigured()) {
    return null;
  }

  if (!supabaseClient) {
    supabaseClient = window.supabase.createClient(
      window.TODO_PLUS_SUPABASE.url,
      window.TODO_PLUS_SUPABASE.anonKey,
    );
  }

  return supabaseClient;
}

function toSupabaseRows() {
  return {
    users: state.users.map((user) => ({
      id: user.id,
      full_name: user.fullName,
      email: user.email,
    })),
    projects: state.projects.map((project) => ({
      id: project.id,
      user_id: project.userId,
      name: project.name,
      description: project.description,
      created_at: project.createdAt,
      updated_at: project.updatedAt || project.createdAt,
    })),
    categories: state.categories.map((category) => ({
      id: category.id,
      user_id: category.userId,
      name: category.name,
      color: category.color,
      created_at: category.createdAt,
    })),
    tasks: state.tasks.map((task) => ({
      id: task.id,
      project_id: task.projectId,
      category_id: task.categoryId || null,
      created_by: task.createdBy,
      title: task.title,
      description: task.description,
      priority: task.priority,
      status: task.status,
      estimated_minutes: task.estimatedMinutes,
      due_date: task.dueDate || null,
      created_at: task.createdAt,
      updated_at: task.updatedAt || task.createdAt,
    })),
    task_assignments: state.assignments.map((assignment) => ({
      id: assignment.id,
      task_id: assignment.taskId,
      user_id: assignment.userId,
      is_completed: assignment.isCompleted,
      completed_at: assignment.completedAt || null,
      earned_score: assignment.earnedScore,
      assigned_at: assignment.assignedAt,
    })),
    task_givers: state.taskGivers.map((giver) => ({
      id: giver.id,
      task_id: giver.taskId,
      user_id: giver.userId,
      assigned_at: giver.assignedAt,
    })),
    task_history: state.history.map((item) => ({
      id: item.id,
      task_id: item.taskId,
      changed_by: item.changedBy,
      old_status: item.oldStatus || null,
      new_status: item.newStatus,
      note: item.note,
      changed_at: item.changedAt,
    })),
  };
}

async function syncStateToSupabase() {
  const client = getSupabaseClient();
  if (!client) return;

  const rows = toSupabaseRows();

  try {
    await client.from("users").upsert(rows.users);
    await client.from("projects").upsert(rows.projects);
    await client.from("categories").upsert(rows.categories);
    await client.from("tasks").upsert(rows.tasks);
    await client.from("task_assignments").upsert(rows.task_assignments);
    await client.from("task_givers").upsert(rows.task_givers);
    await client.from("task_history").upsert(rows.task_history);
  } catch (error) {
    console.error("Supabase senkronizasyon hatası:", error);
  }
}

async function deleteSupabaseRow(tableName, rowId) {
  const client = getSupabaseClient();
  if (!client || !rowId) return;

  try {
    await client.from(tableName).delete().eq("id", rowId);
  } catch (error) {
    console.error(`${tableName} silme hatası:`, error);
  }
}

async function loadSupabaseData(userId) {
  const client = getSupabaseClient();
  if (!client) return;

  isLoadingRemoteData = true;

  try {
    const [
      usersResult,
      projectsResult,
      categoriesResult,
      tasksResult,
      assignmentsResult,
      giversResult,
      historyResult,
    ] = await Promise.all([
      client.from("users").select("*"),
      client.from("projects").select("*"),
      client.from("categories").select("*"),
      client.from("tasks").select("*"),
      client.from("task_assignments").select("*"),
      client.from("task_givers").select("*"),
      client.from("task_history").select("*"),
    ]);

    if (usersResult.data?.length) {
      state.users = usersResult.data.map((user) => ({
        id: user.id,
        fullName: user.full_name,
        email: user.email,
      }));
    }

    if (projectsResult.data) {
      state.projects = projectsResult.data.map((project) => ({
        id: project.id,
        userId: project.user_id,
        name: project.name,
        description: project.description || "",
        createdAt: project.created_at?.slice(0, 10) || today(),
        updatedAt: project.updated_at?.slice(0, 10) || today(),
      }));
    }

    if (categoriesResult.data) {
      state.categories = categoriesResult.data.map((category) => ({
        id: category.id,
        userId: category.user_id,
        name: category.name,
        color: category.color,
        createdAt: category.created_at?.slice(0, 10) || today(),
      }));
    }

    if (tasksResult.data) {
      state.tasks = tasksResult.data.map((task) => ({
        id: task.id,
        projectId: task.project_id,
        categoryId: task.category_id || "",
        createdBy: task.created_by,
        title: task.title,
        description: task.description || "",
        priority: task.priority,
        status: task.status,
        estimatedMinutes: task.estimated_minutes,
        dueDate: task.due_date || "",
        createdAt: task.created_at?.slice(0, 10) || today(),
        updatedAt: task.updated_at?.slice(0, 10) || today(),
      }));
    }

    if (assignmentsResult.data) {
      state.assignments = assignmentsResult.data.map((assignment) => ({
        id: assignment.id,
        taskId: assignment.task_id,
        userId: assignment.user_id,
        isCompleted: assignment.is_completed,
        completedAt: assignment.completed_at?.slice(0, 10) || "",
        earnedScore: assignment.earned_score,
        assignedAt: assignment.assigned_at?.slice(0, 10) || today(),
      }));
    }

    if (giversResult.data) {
      state.taskGivers = giversResult.data.map((giver) => ({
        id: giver.id,
        taskId: giver.task_id,
        userId: giver.user_id,
        assignedAt: giver.assigned_at?.slice(0, 10) || today(),
      }));
    }

    if (historyResult.data) {
      state.history = historyResult.data.map((item) => ({
        id: item.id,
        taskId: item.task_id,
        changedBy: item.changed_by,
        oldStatus: item.old_status || "",
        newStatus: item.new_status,
        note: item.note || "",
        changedAt: item.changed_at?.slice(0, 10) || today(),
      }));
    }

    state.activeUserId = userId;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.error("Supabase veri yükleme hatası:", error);
  } finally {
    isLoadingRemoteData = false;
  }
}

function loadAuthAccounts() {
  const storedAccounts = localStorage.getItem(AUTH_STORAGE_KEY);

  if (!storedAccounts) {
    return structuredClone(defaultAuthAccounts);
  }

  try {
    const parsed = JSON.parse(storedAccounts);
    return Array.isArray(parsed) ? parsed : structuredClone(defaultAuthAccounts);
  } catch {
    return structuredClone(defaultAuthAccounts);
  }
}

function saveAuthAccounts() {
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authAccounts));
}

function loadSession() {
  const storedSession = localStorage.getItem(SESSION_STORAGE_KEY);

  if (!storedSession) {
    return null;
  }

  try {
    return JSON.parse(storedSession);
  } catch {
    return null;
  }
}

function saveSession(userId) {
  currentSession = {
    userId,
    loggedInAt: new Date().toISOString(),
  };
  localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(currentSession));
}

function clearSession() {
  currentSession = null;
  localStorage.removeItem(SESSION_STORAGE_KEY);
}

function resetDemoData() {
  const freshState = structuredClone(defaultState);

  Object.keys(state).forEach((key) => {
    delete state[key];
  });

  Object.assign(state, freshState);
  authAccounts = structuredClone(defaultAuthAccounts);
  currentSession = {
    userId: state.activeUserId,
    loggedInAt: new Date().toISOString(),
  };

  saveAuthAccounts();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(currentSession));
  resetProjectForm();
  resetCategoryForm();
  resetTaskForm();
  renderAll();
}

function createId(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

function formatDate(value) {
  if (!value) return "Tarih yok";
  return new Intl.DateTimeFormat("tr-TR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date(`${value}T12:00:00`));
}

function getDueDateMeta(task) {
  if (!task.dueDate) {
    return { label: "Tarih yok", className: "" };
  }

  if (task.status === "tamamlandi") {
    return { label: formatDate(task.dueDate), className: "due-complete" };
  }

  const current = new Date(`${today()}T12:00:00`);
  const dueDate = new Date(`${task.dueDate}T12:00:00`);
  const remainingDays = Math.ceil((dueDate - current) / 86400000);

  if (remainingDays < 0) {
    return { label: `${formatDate(task.dueDate)} - gecikti`, className: "due-overdue" };
  }

  if (remainingDays <= 2) {
    return { label: `${formatDate(task.dueDate)} - yaklaşıyor`, className: "due-soon" };
  }

  return { label: formatDate(task.dueDate), className: "" };
}

function getActiveUser() {
  return state.users.find((user) => user.id === state.activeUserId) || state.users[0];
}

function findUserByEmail(email) {
  return state.users.find((user) => user.email.toLocaleLowerCase("tr-TR") === email);
}

function getUserName(userId) {
  return state.users.find((user) => user.id === userId)?.fullName || "Bilinmeyen kullanıcı";
}

function getProjectName(projectId) {
  return state.projects.find((project) => project.id === projectId)?.name || "Proje yok";
}

function getCategory(categoryId) {
  return state.categories.find((category) => category.id === categoryId);
}

function getTaskAssignment(taskId) {
  return state.assignments.find((assignment) => assignment.taskId === taskId);
}

function getTaskGivers(taskId) {
  return state.taskGivers.filter((giver) => giver.taskId === taskId);
}

function getTaskTitle(taskId) {
  return state.tasks.find((task) => task.id === taskId)?.title || "Silinmiş görev";
}

function getTaskScore(task) {
  return priorityScores[task.priority] || 1;
}

function calculateUserStats(userId) {
  const assignments = state.assignments.filter((assignment) => assignment.userId === userId);
  const assignedTasks = assignments
    .map((assignment) => state.tasks.find((task) => task.id === assignment.taskId))
    .filter(Boolean);

  const totalScore = assignedTasks.reduce((sum, task) => sum + getTaskScore(task), 0);
  const completedScore = assignments.reduce((sum, assignment) => {
    const task = state.tasks.find((item) => item.id === assignment.taskId);
    return assignment.isCompleted && task ? sum + getTaskScore(task) : sum;
  }, 0);

  const rate = totalScore === 0 ? 0 : Math.round((completedScore / totalScore) * 100);

  return {
    assignedCount: assignments.length,
    completedCount: assignments.filter((assignment) => assignment.isCompleted).length,
    totalScore,
    completedScore,
    rate,
  };
}

function setView(viewName) {
  const titles = {
    dashboard: "İstatistik",
    projects: "Projeler",
    tasks: "Görevler",
  };

  elements.pageTitle.textContent = titles[viewName];

  document.querySelectorAll(".view").forEach((view) => {
    view.classList.remove("active-view");
  });

  document.querySelector(`#${viewName}View`).classList.add("active-view");

  elements.navItems.forEach((item) => {
    item.classList.toggle("active", item.dataset.view === viewName);
  });
}

function renderUsers() {
  elements.activeUser.innerHTML = state.users
    .map((user) => `<option value="${user.id}">${escapeHtml(user.fullName)}</option>`)
    .join("");
  elements.activeUser.value = state.activeUserId;

  elements.taskAssignee.innerHTML = state.users
    .map((user) => `<option value="${user.id}">${escapeHtml(user.fullName)}</option>`)
    .join("");

  elements.taskGivers.innerHTML = state.users
    .map((user) => `<option value="${user.id}">${escapeHtml(user.fullName)}</option>`)
    .join("");

  [...elements.taskGivers.options].forEach((option) => {
    option.selected = option.value === state.activeUserId;
  });
}

function renderProjectOptions() {
  if (state.projects.length === 0) {
    elements.taskProject.innerHTML = `<option value="">Önce proje ekleyin</option>`;
    return;
  }

  elements.taskProject.innerHTML = state.projects
    .map((project) => `<option value="${project.id}">${escapeHtml(project.name)}</option>`)
    .join("");
}

function renderCategoryOptions() {
  if (state.categories.length === 0) {
    elements.taskCategory.innerHTML = `<option value="">Kategori yok</option>`;
    return;
  }

  elements.taskCategory.innerHTML = state.categories
    .map((category) => `<option value="${category.id}">${escapeHtml(category.name)}</option>`)
    .join("");
}

function renderProjects() {
  elements.projectCount.textContent = `${state.projects.length} proje`;

  if (state.projects.length === 0) {
    elements.projectList.innerHTML = `<div class="empty-state">Henüz proje eklenmedi.</div>`;
    return;
  }

  elements.projectList.innerHTML = state.projects
    .map((project) => {
      const taskCount = state.tasks.filter((task) => task.projectId === project.id).length;
      return `
        <article class="project-card">
          <h4>${escapeHtml(project.name)}</h4>
          <p>${escapeHtml(project.description || "Açıklama girilmedi.")}</p>
          <div class="task-meta">
            <span class="badge">${taskCount} görev</span>
            <span class="badge">${formatDate(project.createdAt)}</span>
          </div>
          <div class="card-actions">
            <button class="small-button" type="button" data-edit-project="${project.id}">Düzenle</button>
            <button class="danger-button" type="button" data-delete-project="${project.id}">Sil</button>
          </div>
        </article>
      `;
    })
    .join("");
}

function renderCategories() {
  elements.categoryCount.textContent = `${state.categories.length} kategori`;

  if (state.categories.length === 0) {
    elements.categoryList.innerHTML = `<div class="empty-state">Henüz kategori eklenmedi.</div>`;
    return;
  }

  elements.categoryList.innerHTML = state.categories
    .map((category) => {
      const taskCount = state.tasks.filter((task) => task.categoryId === category.id).length;

      return `
        <article class="category-card">
          <div>
            <h4>${escapeHtml(category.name)}</h4>
            <p>${taskCount} görev</p>
          </div>
          <div class="category-actions">
            <span class="color-dot" style="background: ${category.color}"></span>
            <button class="small-button" type="button" data-edit-category="${category.id}">Düzenle</button>
            <button class="danger-button" type="button" data-delete-category="${category.id}">Sil</button>
          </div>
        </article>
      `;
    })
    .join("");
}

function getFilteredTasks() {
  const query = elements.searchInput.value.trim().toLocaleLowerCase("tr-TR");
  const status = elements.statusFilter.value;
  const priority = elements.priorityFilter.value;

  return state.tasks.filter((task) => {
    const matchesText =
      !query ||
      task.title.toLocaleLowerCase("tr-TR").includes(query) ||
      task.description.toLocaleLowerCase("tr-TR").includes(query) ||
      getProjectName(task.projectId).toLocaleLowerCase("tr-TR").includes(query);
    const matchesStatus = status === "all" || task.status === status;
    const matchesPriority = priority === "all" || task.priority === priority;

    return matchesText && matchesStatus && matchesPriority;
  });
}

function renderTaskCard(task, options = {}) {
  const assignment = getTaskAssignment(task.id);
  const assigneeName = assignment ? getUserName(assignment.userId) : "Atanmamış";
  const giverNames = getTaskGivers(task.id)
    .map((giver) => getUserName(giver.userId))
    .join(", ");
  const category = getCategory(task.categoryId);
  const nextStatus = task.status === "tamamlandi" ? "devam_ediyor" : "tamamlandi";
  const actionText = task.status === "tamamlandi" ? "Tekrar aç" : "Tamamla";
  const dueDate = getDueDateMeta(task);
  const compactClass = options.compact ? " task-card-compact" : "";
  const draggableAttribute = options.compact ? ' draggable="true"' : "";

  return `
    <article class="task-card${compactClass}"${draggableAttribute} data-task-card data-task-id="${task.id}">
      <h4>${escapeHtml(task.title)}</h4>
      <p>${escapeHtml(task.description || "Açıklama girilmedi.")}</p>
      <div class="task-meta">
        <span class="badge">${escapeHtml(getProjectName(task.projectId))}</span>
        <span class="badge">${escapeHtml(category ? category.name : "Kategori yok")}</span>
        <span class="badge">Veren: ${escapeHtml(giverNames || getUserName(task.createdBy))}</span>
        <span class="badge">Atanan: ${escapeHtml(assigneeName)}</span>
        <span class="badge priority-${task.priority}">${priorityLabels[task.priority]} öncelik</span>
        <span class="badge status-${task.status}">${statusLabels[task.status]}</span>
        <span class="badge">${getTaskScore(task)} puan</span>
        <span class="badge ${dueDate.className}">${escapeHtml(dueDate.label)}</span>
      </div>
      <div class="card-actions">
        <button class="small-button" type="button" data-detail-task="${task.id}">Detay</button>
        <button class="small-button" type="button" data-edit-task="${task.id}">Düzenle</button>
        <button class="small-button" type="button" data-status-task="${task.id}" data-next-status="${nextStatus}">${actionText}</button>
        <button class="danger-button" type="button" data-delete-task="${task.id}">Sil</button>
      </div>
    </article>
  `;
}

function renderTasks() {
  const tasks = getFilteredTasks();
  elements.taskCount.textContent = `${tasks.length} görev`;

  if (tasks.length === 0) {
    elements.taskList.innerHTML = `<div class="empty-state">Filtreye uygun görev bulunamadı.</div>`;
    return;
  }

  elements.taskList.innerHTML = tasks
    .map((task) => renderTaskCard(task))
    .join("");
}

function renderKanbanBoard() {
  const tasks = getFilteredTasks();
  const columns = ["bekliyor", "devam_ediyor", "tamamlandi"];

  elements.kanbanBoard.innerHTML = columns
    .map((status) => {
      const columnTasks = tasks.filter((task) => task.status === status);

      return `
        <section class="kanban-column">
          <div class="kanban-column-header">
            <h4>${statusLabels[status]}</h4>
            <span>${columnTasks.length}</span>
          </div>
          <div class="kanban-column-body" data-kanban-status="${status}">
            ${
              columnTasks.length === 0
                ? `<div class="empty-state kanban-empty">Görev yok.</div>`
                : columnTasks.map((task) => renderTaskCard(task, { compact: true })).join("")
            }
          </div>
        </section>
      `;
    })
    .join("");
}

function renderTaskViews() {
  renderTasks();
  renderKanbanBoard();
}

function getTaskComments(taskId) {
  return state.taskComments
    .filter((comment) => comment.taskId === taskId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

function getTaskHistoryItems(taskId) {
  return state.history
    .filter((item) => item.taskId === taskId)
    .slice()
    .reverse();
}

function renderTaskDetail() {
  if (!activeDetailTaskId) return;

  const task = state.tasks.find((item) => item.id === activeDetailTaskId);
  if (!task) {
    closeTaskDetail();
    return;
  }

  const assignment = getTaskAssignment(task.id);
  const category = getCategory(task.categoryId);
  const giverNames = getTaskGivers(task.id)
    .map((giver) => getUserName(giver.userId))
    .join(", ");
  const dueDate = getDueDateMeta(task);
  const comments = getTaskComments(task.id);
  const historyItems = getTaskHistoryItems(task.id);

  elements.taskDetailTitle.textContent = task.title;
  elements.taskDetailBody.innerHTML = `
    <div class="task-detail-grid">
      <section class="detail-block">
        <h3>Bilgiler</h3>
        <div class="detail-meta">
          <span class="badge">${escapeHtml(getProjectName(task.projectId))}</span>
          <span class="badge">${escapeHtml(category ? category.name : "Kategori yok")}</span>
          <span class="badge status-${task.status}">${statusLabels[task.status]}</span>
          <span class="badge priority-${task.priority}">${priorityLabels[task.priority]} öncelik</span>
          <span class="badge ${dueDate.className}">${escapeHtml(dueDate.label)}</span>
          <span class="badge">${task.estimatedMinutes} dakika</span>
        </div>
        <p>${escapeHtml(task.description || "Açıklama girilmedi.")}</p>
        <dl class="detail-list">
          <div>
            <dt>Atanan</dt>
            <dd>${escapeHtml(assignment ? getUserName(assignment.userId) : "Atanmamış")}</dd>
          </div>
          <div>
            <dt>Veren</dt>
            <dd>${escapeHtml(giverNames || getUserName(task.createdBy))}</dd>
          </div>
          <div>
            <dt>Puan</dt>
            <dd>${getTaskScore(task)}</dd>
          </div>
        </dl>
      </section>

      <section class="detail-block">
        <h3>Yorumlar</h3>
        <div class="comment-list">
          ${
            comments.length === 0
              ? `<div class="empty-state">Henüz yorum yok.</div>`
              : comments
                  .map(
                    (comment) => `
                      <article class="comment-item">
                        <strong>${escapeHtml(getUserName(comment.userId))}</strong>
                        <p>${escapeHtml(comment.body)}</p>
                        <span>${formatDate(comment.createdAt)}</span>
                      </article>
                    `,
                  )
                  .join("")
          }
        </div>
      </section>
    </div>

    <section class="detail-block">
      <h3>Geçmiş</h3>
      <div class="history-list">
        ${
          historyItems.length === 0
            ? `<div class="empty-state">Henüz hareket yok.</div>`
            : historyItems
                .map((item) => {
                  const statusText = item.oldStatus
                    ? `${statusLabels[item.oldStatus]} → ${statusLabels[item.newStatus]}`
                    : statusLabels[item.newStatus];

                  return `
                    <article class="history-item">
                      <div>
                        <strong>${escapeHtml(item.note)}</strong>
                        <p>${escapeHtml(getUserName(item.changedBy))}</p>
                      </div>
                      <div class="history-meta">
                        <span class="badge">${statusText}</span>
                        <span>${formatDate(item.changedAt)}</span>
                      </div>
                    </article>
                  `;
                })
                .join("")
        }
      </div>
    </section>
  `;
}

function openTaskDetail(taskId) {
  activeDetailTaskId = taskId;
  elements.taskDetailModal.classList.remove("hidden");
  renderTaskDetail();
  elements.taskCommentText.value = "";
  elements.taskCommentText.focus();
}

function closeTaskDetail() {
  activeDetailTaskId = null;
  elements.taskDetailModal.classList.add("hidden");
  elements.taskCommentText.value = "";
}

function renderDashboard() {
  const totalTasks = state.tasks.length;
  const completedTasks = state.tasks.filter((task) => task.status === "tamamlandi").length;
  const inProgressTasks = state.tasks.filter((task) => task.status === "devam_ediyor").length;
  const activeStats = calculateUserStats(state.activeUserId);

  elements.totalTasks.textContent = totalTasks;
  elements.completedTasks.textContent = completedTasks;
  elements.inProgressTasks.textContent = inProgressTasks;
  elements.successRate.textContent = `${activeStats.rate}%`;

  elements.userScores.innerHTML = state.users
    .map((user) => {
      const stats = calculateUserStats(user.id);
      return `
        <article class="score-card">
          <strong>
            <span>${escapeHtml(user.fullName)}</span>
            <span>${stats.rate}%</span>
          </strong>
          <div class="score-bar" aria-label="${user.fullName} başarı oranı">
            <div class="score-fill" style="width: ${stats.rate}%"></div>
          </div>
          <p>${stats.completedScore}/${stats.totalScore} puan - ${stats.completedCount}/${stats.assignedCount} görev</p>
        </article>
      `;
    })
    .join("");

  const upcomingTasks = [...state.tasks]
    .filter((task) => task.dueDate && task.status !== "tamamlandi")
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
    .slice(0, 5);

  elements.upcomingTasks.innerHTML =
    upcomingTasks.length === 0
      ? `<div class="empty-state">Yaklaşan teslim bulunmuyor.</div>`
      : upcomingTasks
          .map(
            (task) => `
              <article class="mini-card">
                <h4>${escapeHtml(task.title)}</h4>
                <p>${escapeHtml(getProjectName(task.projectId))} - ${formatDate(task.dueDate)}</p>
              </article>
            `,
          )
          .join("");

  const historyItems = [...state.history].reverse().slice(0, 6);

  elements.historyList.innerHTML =
    historyItems.length === 0
      ? `<div class="empty-state">Henüz görev hareketi yok.</div>`
      : historyItems
          .map((item) => {
            const statusText = item.oldStatus
              ? `${statusLabels[item.oldStatus]} → ${statusLabels[item.newStatus]}`
              : statusLabels[item.newStatus];

            return `
              <article class="history-item">
                <div>
                  <strong>${escapeHtml(getTaskTitle(item.taskId))}</strong>
                  <p>${escapeHtml(item.note)}</p>
                </div>
                <div class="history-meta">
                  <span class="badge">${statusText}</span>
                  <span>${escapeHtml(getUserName(item.changedBy))}</span>
                  <span>${formatDate(item.changedAt)}</span>
                </div>
              </article>
            `;
          })
          .join("");
}

function renderAll() {
  renderUsers();
  renderProjectOptions();
  renderCategoryOptions();
  renderProjects();
  renderCategories();
  renderTaskViews();
  renderDashboard();
  renderTaskDetail();
}

function showAuthMessage(message, type = "error") {
  elements.authMessage.textContent = message;
  elements.authMessage.classList.toggle("success", type === "success");
}

function setAuthMode(mode) {
  const isLogin = mode === "login";

  elements.loginForm.classList.toggle("hidden", !isLogin);
  elements.registerForm.classList.toggle("hidden", isLogin);
  elements.showLoginBtn.classList.toggle("active", isLogin);
  elements.showRegisterBtn.classList.toggle("active", !isLogin);
  showAuthMessage("");
}

async function showApp() {
  elements.authScreen.classList.add("hidden");
  elements.appShell.classList.remove("hidden");
  if (supabaseReady && currentSession?.userId) {
    await loadSupabaseData(currentSession.userId);
  }
  renderAll();
}

function showAuth() {
  elements.appShell.classList.add("hidden");
  elements.authScreen.classList.remove("hidden");
  setAuthMode("login");
}

function ensureUserExists(account) {
  const email = account.email.toLocaleLowerCase("tr-TR");
  const existingUser = findUserByEmail(email);

  if (existingUser) {
    return existingUser.id;
  }

  state.users.push({
    id: account.id,
    fullName: account.fullName,
    email,
  });

  saveState();
  return account.id;
}

async function login(email, password) {
  const normalizedEmail = email.trim().toLocaleLowerCase("tr-TR");

  if (supabaseReady) {
    const client = getSupabaseClient();
    const { data, error } = await client.auth.signInWithPassword({
      email: normalizedEmail,
      password,
    });

    if (error || !data.user) {
      showAuthMessage("Supabase giriş hatası. E-posta veya şifre kontrol edilmelidir.");
      return;
    }

    const account = {
      id: data.user.id,
      fullName: data.user.user_metadata?.full_name || normalizedEmail,
      email: normalizedEmail,
      password: "",
    };

    ensureUserExists(account);
    state.activeUserId = data.user.id;
    saveState();
    saveSession(data.user.id);
    await showApp();
    return;
  }

  const account = authAccounts.find((item) => item.email === normalizedEmail);

  if (!account || account.password !== password) {
    showAuthMessage("E-posta veya şifre hatalı.");
    return;
  }

  const userId = ensureUserExists(account);
  state.activeUserId = userId;
  saveState();
  saveSession(userId);
  await showApp();
}

async function register(fullName, email, password) {
  const normalizedName = fullName.trim();
  const normalizedEmail = email.trim().toLocaleLowerCase("tr-TR");

  if (password.length < 6) {
    showAuthMessage("Şifre en az 6 karakter olmalıdır.");
    return;
  }

  if (supabaseReady) {
    const client = getSupabaseClient();
    const { data, error } = await client.auth.signUp({
      email: normalizedEmail,
      password,
      options: {
        data: {
          full_name: normalizedName,
        },
      },
    });

    if (error || !data.user) {
      showAuthMessage("Supabase kayıt hatası. Bilgiler kontrol edilmelidir.");
      return;
    }

    const account = {
      id: data.user.id,
      fullName: normalizedName,
      email: normalizedEmail,
      password: "",
    };

    ensureUserExists(account);
    state.activeUserId = data.user.id;
    saveState();

    if (data.session) {
      saveSession(data.user.id);
      await showApp();
    } else {
      showAuthMessage("Kayıt oluşturuldu. Supabase e-posta doğrulaması istiyor olabilir.", "success");
      setAuthMode("login");
    }
    return;
  }

  const accountExists = authAccounts.some((account) => account.email === normalizedEmail);
  if (accountExists) {
    showAuthMessage("Bu e-posta ile kayıtlı kullanıcı var.");
    return;
  }

  const account = {
    id: createId("user"),
    fullName: normalizedName,
    email: normalizedEmail,
    password,
  };

  authAccounts.push(account);
  saveAuthAccounts();

  state.users.push({
    id: account.id,
    fullName: account.fullName,
    email: account.email,
  });
  state.activeUserId = account.id;
  saveState();
  saveSession(account.id);
  await showApp();
}

async function initializeAuth() {
  supabaseReady = isSupabaseConfigured();
  saveAuthAccounts();

  if (supabaseReady) {
    const client = getSupabaseClient();
    const { data } = await client.auth.getSession();

    if (data.session?.user) {
      currentSession = {
        userId: data.session.user.id,
        loggedInAt: new Date().toISOString(),
      };
      state.activeUserId = data.session.user.id;
      await showApp();
      return;
    }
  }

  if (currentSession?.userId && state.users.some((user) => user.id === currentSession.userId)) {
    state.activeUserId = currentSession.userId;
    await showApp();
    return;
  }

  showAuth();
}

function resetTaskForm() {
  editingTaskId = null;
  elements.taskForm.reset();
  elements.taskFormTitle.textContent = "Görev oluştur";
  elements.taskSubmitBtn.textContent = "Görevi kaydet";
  elements.cancelTaskEditBtn.classList.add("hidden");
  elements.taskPriority.value = "orta";
  elements.taskStatus.value = "bekliyor";
  elements.taskMinutes.value = "60";
  [...elements.taskGivers.options].forEach((option) => {
    option.selected = option.value === getActiveUser().id;
  });
}

function resetProjectForm() {
  editingProjectId = null;
  elements.projectForm.reset();
  elements.projectFormTitle.textContent = "Proje oluştur";
  elements.projectSubmitBtn.textContent = "Projeyi kaydet";
  elements.cancelProjectEditBtn.classList.add("hidden");
}

function resetCategoryForm() {
  editingCategoryId = null;
  elements.categoryForm.reset();
  elements.categoryColor.value = "#2563eb";
  elements.categoryFormTitle.textContent = "Kategori oluştur";
  elements.categorySubmitBtn.textContent = "Kategoriyi kaydet";
  elements.cancelCategoryEditBtn.classList.add("hidden");
}

function addProject(event) {
  event.preventDefault();

  if (editingProjectId) {
    updateProjectFromForm(editingProjectId);
    return;
  }

  const activeUser = getActiveUser();

  state.projects.push({
    id: createId("project"),
    userId: activeUser.id,
    name: elements.projectName.value.trim(),
    description: elements.projectDescription.value.trim(),
    createdAt: today(),
    updatedAt: today(),
  });

  resetProjectForm();
  saveState();
  renderAll();
}

function updateProjectFromForm(projectId) {
  const project = state.projects.find((item) => item.id === projectId);
  if (!project) return;

  project.name = elements.projectName.value.trim();
  project.description = elements.projectDescription.value.trim();
  project.updatedAt = today();

  resetProjectForm();
  saveState();
  renderAll();
}

function editProject(projectId) {
  const project = state.projects.find((item) => item.id === projectId);
  if (!project) return;

  editingProjectId = projectId;
  setView("projects");
  elements.projectFormTitle.textContent = "Proje düzenle";
  elements.projectSubmitBtn.textContent = "Değişiklikleri kaydet";
  elements.cancelProjectEditBtn.classList.remove("hidden");
  elements.projectName.value = project.name;
  elements.projectDescription.value = project.description || "";
  elements.projectName.focus();
}

function addCategory(event) {
  event.preventDefault();

  if (editingCategoryId) {
    updateCategoryFromForm(editingCategoryId);
    return;
  }

  state.categories.push({
    id: createId("category"),
    userId: getActiveUser().id,
    name: elements.categoryName.value.trim(),
    color: elements.categoryColor.value || "#2563eb",
    createdAt: today(),
  });

  resetCategoryForm();
  saveState();
  renderAll();
}

function updateCategoryFromForm(categoryId) {
  const category = state.categories.find((item) => item.id === categoryId);
  if (!category) return;

  category.name = elements.categoryName.value.trim();
  category.color = elements.categoryColor.value || "#2563eb";

  resetCategoryForm();
  saveState();
  renderAll();
}

function editCategory(categoryId) {
  const category = state.categories.find((item) => item.id === categoryId);
  if (!category) return;

  editingCategoryId = categoryId;
  setView("projects");
  elements.categoryFormTitle.textContent = "Kategori düzenle";
  elements.categorySubmitBtn.textContent = "Değişiklikleri kaydet";
  elements.cancelCategoryEditBtn.classList.remove("hidden");
  elements.categoryName.value = category.name;
  elements.categoryColor.value = category.color || "#2563eb";
  elements.categoryName.focus();
}

function addTask(event) {
  event.preventDefault();

  if (!elements.taskProject.value) {
    alert("Görev eklemek için önce proje oluşturun.");
    return;
  }

  const taskId = createId("task");
  const priority = elements.taskPriority.value;
  const status = elements.taskStatus.value;
  const assigneeId = elements.taskAssignee.value;
  const giverIds = [...elements.taskGivers.selectedOptions].map((option) => option.value);
  const selectedGiverIds = giverIds.length > 0 ? giverIds : [getActiveUser().id];

  if (editingTaskId) {
    updateTaskFromForm(editingTaskId, {
      projectId: elements.taskProject.value,
      categoryId: elements.taskCategory.value || "",
      title: elements.taskTitle.value.trim(),
      description: elements.taskDescription.value.trim(),
      priority,
      status,
      estimatedMinutes: Number(elements.taskMinutes.value) || 60,
      dueDate: elements.taskDueDate.value,
      assigneeId,
      giverIds: selectedGiverIds,
    });
    return;
  }

  const task = {
    id: taskId,
    projectId: elements.taskProject.value,
    categoryId: elements.taskCategory.value || "",
    createdBy: getActiveUser().id,
    title: elements.taskTitle.value.trim(),
    description: elements.taskDescription.value.trim(),
    priority,
    status,
    estimatedMinutes: Number(elements.taskMinutes.value) || 60,
    dueDate: elements.taskDueDate.value,
    createdAt: today(),
    updatedAt: today(),
  };

  state.tasks.push(task);
  state.assignments.push({
    id: createId("assignment"),
    taskId,
    userId: assigneeId,
    isCompleted: status === "tamamlandi",
    completedAt: status === "tamamlandi" ? today() : "",
    earnedScore: status === "tamamlandi" ? priorityScores[priority] : 0,
    assignedAt: today(),
  });

  selectedGiverIds.forEach((userId) => {
    state.taskGivers.push({
      id: createId("giver"),
      taskId,
      userId,
      assignedAt: today(),
    });
  });

  state.history.push({
    id: createId("history"),
    taskId,
    changedBy: getActiveUser().id,
    oldStatus: "",
    newStatus: status,
    note: "Görev oluşturuldu.",
    changedAt: today(),
  });

  resetTaskForm();
  saveState();
  renderAll();
}

function updateTaskFromForm(taskId, formData) {
  const task = state.tasks.find((item) => item.id === taskId);
  if (!task) return;

  const oldStatus = task.status;

  task.projectId = formData.projectId;
  task.categoryId = formData.categoryId;
  task.title = formData.title;
  task.description = formData.description;
  task.priority = formData.priority;
  task.status = formData.status;
  task.estimatedMinutes = formData.estimatedMinutes;
  task.dueDate = formData.dueDate;
  task.updatedAt = today();

  let assignment = getTaskAssignment(taskId);
  if (!assignment) {
    assignment = {
      id: createId("assignment"),
      taskId,
      userId: formData.assigneeId,
      isCompleted: false,
      completedAt: "",
      earnedScore: 0,
      assignedAt: today(),
    };
    state.assignments.push(assignment);
  }

  assignment.userId = formData.assigneeId;
  assignment.isCompleted = formData.status === "tamamlandi";
  assignment.completedAt = formData.status === "tamamlandi" ? today() : "";
  assignment.earnedScore = formData.status === "tamamlandi" ? getTaskScore(task) : 0;

  state.taskGivers = state.taskGivers.filter((giver) => giver.taskId !== taskId);
  formData.giverIds.forEach((userId) => {
    state.taskGivers.push({
      id: createId("giver"),
      taskId,
      userId,
      assignedAt: today(),
    });
  });

  state.history.push({
    id: createId("history"),
    taskId,
    changedBy: getActiveUser().id,
    oldStatus,
    newStatus: formData.status,
    note: "Görev bilgileri güncellendi.",
    changedAt: today(),
  });

  resetTaskForm();
  saveState();
  renderAll();
}

function editTask(taskId) {
  const task = state.tasks.find((item) => item.id === taskId);
  if (!task) return;

  editingTaskId = taskId;
  const assignment = getTaskAssignment(taskId);
  const giverIds = getTaskGivers(taskId).map((giver) => giver.userId);

  setView("tasks");
  elements.taskFormTitle.textContent = "Görev düzenle";
  elements.taskSubmitBtn.textContent = "Değişiklikleri kaydet";
  elements.cancelTaskEditBtn.classList.remove("hidden");
  elements.taskTitle.value = task.title;
  elements.taskDescription.value = task.description;
  elements.taskProject.value = task.projectId;
  elements.taskCategory.value = task.categoryId || "";
  elements.taskAssignee.value = assignment?.userId || getActiveUser().id;
  elements.taskPriority.value = task.priority;
  elements.taskStatus.value = task.status;
  elements.taskMinutes.value = task.estimatedMinutes;
  elements.taskDueDate.value = task.dueDate || "";
  [...elements.taskGivers.options].forEach((option) => {
    option.selected = giverIds.length > 0 ? giverIds.includes(option.value) : option.value === task.createdBy;
  });
  elements.taskTitle.focus();
}

function updateTaskStatus(taskId, nextStatus) {
  const task = state.tasks.find((item) => item.id === taskId);
  if (!task) return;
  if (task.status === nextStatus) return;

  const oldStatus = task.status;
  task.status = nextStatus;
  task.updatedAt = today();

  const assignment = getTaskAssignment(taskId);
  if (assignment) {
    assignment.isCompleted = nextStatus === "tamamlandi";
    assignment.completedAt = nextStatus === "tamamlandi" ? today() : "";
    assignment.earnedScore = nextStatus === "tamamlandi" ? getTaskScore(task) : 0;
  }

  state.history.push({
    id: createId("history"),
    taskId,
    changedBy: getActiveUser().id,
    oldStatus,
    newStatus: nextStatus,
    note: "Görev durumu güncellendi.",
    changedAt: today(),
  });

  saveState();
  renderAll();
}

function deleteTask(taskId) {
  const task = state.tasks.find((item) => item.id === taskId);
  if (!task || !confirm(`"${task.title}" görevi silinsin mi?`)) return;

  deleteSupabaseRow("tasks", taskId);
  state.tasks = state.tasks.filter((task) => task.id !== taskId);
  state.assignments = state.assignments.filter((assignment) => assignment.taskId !== taskId);
  state.taskGivers = state.taskGivers.filter((giver) => giver.taskId !== taskId);
  state.history = state.history.filter((historyItem) => historyItem.taskId !== taskId);
  state.taskComments = state.taskComments.filter((comment) => comment.taskId !== taskId);
  if (activeDetailTaskId === taskId) {
    closeTaskDetail();
  }
  saveState();
  renderAll();
}

function deleteProject(projectId) {
  const project = state.projects.find((item) => item.id === projectId);
  if (!project || !confirm(`"${project.name}" projesi ve bağlı görevleri silinsin mi?`)) return;

  deleteSupabaseRow("projects", projectId);
  const projectTaskIds = state.tasks
    .filter((task) => task.projectId === projectId)
    .map((task) => task.id);

  state.projects = state.projects.filter((project) => project.id !== projectId);
  state.tasks = state.tasks.filter((task) => task.projectId !== projectId);
  state.assignments = state.assignments.filter(
    (assignment) => !projectTaskIds.includes(assignment.taskId),
  );
  state.taskGivers = state.taskGivers.filter((giver) => !projectTaskIds.includes(giver.taskId));
  state.history = state.history.filter((historyItem) => !projectTaskIds.includes(historyItem.taskId));
  state.taskComments = state.taskComments.filter((comment) => !projectTaskIds.includes(comment.taskId));
  if (projectTaskIds.includes(activeDetailTaskId)) {
    closeTaskDetail();
  }
  saveState();
  renderAll();
}

function deleteCategory(categoryId) {
  const category = state.categories.find((item) => item.id === categoryId);
  if (!category || !confirm(`"${category.name}" kategorisi silinsin mi? Görevler kategorisiz kalacak.`)) return;

  deleteSupabaseRow("categories", categoryId);
  state.categories = state.categories.filter((category) => category.id !== categoryId);
  state.tasks = state.tasks.map((task) =>
    task.categoryId === categoryId ? { ...task, categoryId: "" } : task,
  );
  saveState();
  renderAll();
}

function addUser() {
  const fullName = prompt("Kullanıcı adı soyadı:");
  if (!fullName || !fullName.trim()) return;

  const userId = createId("user");
  const normalizedName = fullName.trim();
  const email = `${normalizedName.toLocaleLowerCase("tr-TR").replaceAll(" ", ".")}@example.com`;

  state.users.push({
    id: userId,
    fullName: normalizedName,
    email,
  });

  authAccounts.push({
    id: userId,
    fullName: normalizedName,
    email,
    password: "123456",
  });

  state.activeUserId = userId;
  saveAuthAccounts();
  saveState();
  renderAll();
}

function addTaskComment(event) {
  event.preventDefault();

  const body = elements.taskCommentText.value.trim();
  if (!activeDetailTaskId || !body) return;

  state.taskComments.push({
    id: createId("comment"),
    taskId: activeDetailTaskId,
    userId: getActiveUser().id,
    body,
    createdAt: today(),
  });

  elements.taskCommentText.value = "";
  saveState();
  renderTaskDetail();
}

function handleTaskActionClick(event) {
  const detailButton = event.target.closest("[data-detail-task]");
  const editButton = event.target.closest("[data-edit-task]");
  const statusButton = event.target.closest("[data-status-task]");
  const deleteButton = event.target.closest("[data-delete-task]");

  if (detailButton) {
    openTaskDetail(detailButton.dataset.detailTask);
  }

  if (editButton) {
    editTask(editButton.dataset.editTask);
  }

  if (statusButton) {
    updateTaskStatus(statusButton.dataset.statusTask, statusButton.dataset.nextStatus);
  }

  if (deleteButton) {
    deleteTask(deleteButton.dataset.deleteTask);
  }
}

function handleKanbanDragStart(event) {
  const card = event.target.closest("[data-task-card]");
  if (!card) return;

  draggedTaskId = card.dataset.taskId;
  event.dataTransfer.effectAllowed = "move";
  event.dataTransfer.setData("text/plain", draggedTaskId);
  card.classList.add("dragging");
}

function handleKanbanDragEnd() {
  draggedTaskId = null;
  document.querySelectorAll(".task-card.dragging").forEach((card) => {
    card.classList.remove("dragging");
  });
  document.querySelectorAll(".kanban-column-body.drop-target").forEach((column) => {
    column.classList.remove("drop-target");
  });
}

function handleKanbanDragOver(event) {
  const dropTarget = event.target.closest("[data-kanban-status]");
  if (!dropTarget) return;

  event.preventDefault();
  event.dataTransfer.dropEffect = "move";
  dropTarget.classList.add("drop-target");
}

function handleKanbanDragLeave(event) {
  const dropTarget = event.target.closest("[data-kanban-status]");
  if (!dropTarget || dropTarget.contains(event.relatedTarget)) return;

  dropTarget.classList.remove("drop-target");
}

function handleKanbanDrop(event) {
  const dropTarget = event.target.closest("[data-kanban-status]");
  if (!dropTarget) return;

  event.preventDefault();
  const taskId = event.dataTransfer.getData("text/plain") || draggedTaskId;
  const nextStatus = dropTarget.dataset.kanbanStatus;
  dropTarget.classList.remove("drop-target");

  if (taskId && nextStatus) {
    updateTaskStatus(taskId, nextStatus);
  }
}

function bindEvents() {
  elements.showLoginBtn.addEventListener("click", () => setAuthMode("login"));
  elements.showRegisterBtn.addEventListener("click", () => setAuthMode("register"));

  elements.loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    await login(elements.loginEmail.value, elements.loginPassword.value);
  });

  elements.registerForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    await register(elements.registerName.value, elements.registerEmail.value, elements.registerPassword.value);
  });

  elements.logoutBtn.addEventListener("click", async () => {
    if (supabaseReady) {
      await getSupabaseClient()?.auth.signOut();
    }
    clearSession();
    showAuth();
  });

  elements.navItems.forEach((item) => {
    item.addEventListener("click", () => setView(item.dataset.view));
  });

  elements.newTaskBtn.addEventListener("click", () => {
    setView("tasks");
    elements.taskTitle.focus();
  });

  elements.activeUser.addEventListener("change", (event) => {
    state.activeUserId = event.target.value;
    saveState();
    renderAll();
  });

  elements.addUserBtn.addEventListener("click", addUser);
  elements.resetDemoBtn.addEventListener("click", resetDemoData);
  elements.projectForm.addEventListener("submit", addProject);
  elements.cancelProjectEditBtn.addEventListener("click", resetProjectForm);
  elements.categoryForm.addEventListener("submit", addCategory);
  elements.cancelCategoryEditBtn.addEventListener("click", resetCategoryForm);
  elements.taskForm.addEventListener("submit", addTask);
  elements.cancelTaskEditBtn.addEventListener("click", resetTaskForm);

  elements.searchInput.addEventListener("input", renderTaskViews);
  elements.statusFilter.addEventListener("change", renderTaskViews);
  elements.priorityFilter.addEventListener("change", renderTaskViews);

  elements.taskList.addEventListener("click", handleTaskActionClick);
  elements.kanbanBoard.addEventListener("click", handleTaskActionClick);
  elements.kanbanBoard.addEventListener("dragstart", handleKanbanDragStart);
  elements.kanbanBoard.addEventListener("dragend", handleKanbanDragEnd);
  elements.kanbanBoard.addEventListener("dragover", handleKanbanDragOver);
  elements.kanbanBoard.addEventListener("dragleave", handleKanbanDragLeave);
  elements.kanbanBoard.addEventListener("drop", handleKanbanDrop);
  elements.taskCommentForm.addEventListener("submit", addTaskComment);
  elements.closeTaskDetailBtn.addEventListener("click", closeTaskDetail);
  elements.taskDetailModal.addEventListener("click", (event) => {
    if (event.target.closest("[data-close-task-detail]")) {
      closeTaskDetail();
    }
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && activeDetailTaskId) {
      closeTaskDetail();
    }
  });

  elements.projectList.addEventListener("click", (event) => {
    const editButton = event.target.closest("[data-edit-project]");
    const deleteButton = event.target.closest("[data-delete-project]");

    if (editButton) {
      editProject(editButton.dataset.editProject);
    }

    if (deleteButton) {
      deleteProject(deleteButton.dataset.deleteProject);
    }
  });

  elements.categoryList.addEventListener("click", (event) => {
    const editButton = event.target.closest("[data-edit-category]");
    const deleteButton = event.target.closest("[data-delete-category]");

    if (editButton) {
      editCategory(editButton.dataset.editCategory);
    }

    if (deleteButton) {
      deleteCategory(deleteButton.dataset.deleteCategory);
    }
  });
}

bindEvents();
initializeAuth();
