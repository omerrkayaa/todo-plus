import test from "node:test";
import assert from "node:assert/strict";

// Modül tarayıcı dışı ortamda kendini globalThis.TODO_PLUS_SYNC_MERGE olarak kaydeder.
await import("../app-sync-merge.js");
const { mergeCollections, applyConflictResolution } = globalThis.TODO_PLUS_SYNC_MERGE;

const makeTask = (overrides = {}) => ({
  id: "t1",
  projectId: "p1",
  categoryId: "",
  createdBy: "u1",
  title: "Rapor",
  description: "",
  priority: "orta",
  status: "bekliyor",
  estimatedMinutes: 30,
  dueDate: "2026-07-20",
  startDate: "",
  repeatInterval: "none",
  subtasks: [],
  tags: [],
  attachments: [],
  createdAt: "2026-07-18",
  updatedAt: "2026-07-18",
  ...overrides,
});

const emptyCollections = () => ({
  users: [], projects: [], categories: [], tasks: [], assignments: [],
  taskGivers: [], history: [], taskComments: [], projectMembers: [], projectInvitations: [],
});

const withTasks = (...tasks) => ({ ...emptyCollections(), tasks });

test("iki taraf ayrı alanları değiştirdi → kendiliğinden birleşir, çakışma yok", () => {
  const base = withTasks(makeTask());
  const local = withTasks(makeTask({ title: "Rapor (yerel)" }));
  const remote = withTasks(makeTask({ dueDate: "2026-07-25" }));
  const { merged, conflicts } = mergeCollections({ base, local, remote, pendingDeletions: [] });
  assert.equal(conflicts.length, 0);
  assert.equal(merged.tasks[0].title, "Rapor (yerel)");
  assert.equal(merged.tasks[0].dueDate, "2026-07-25");
});

test("aynı alanı farklı değiştirdiler → çakışma listelenir, birleşikte bulut kalır", () => {
  const base = withTasks(makeTask());
  const local = withTasks(makeTask({ title: "Yerel başlık" }));
  const remote = withTasks(makeTask({ title: "Bulut başlık" }));
  const { merged, conflicts } = mergeCollections({ base, local, remote, pendingDeletions: [] });
  assert.equal(conflicts.length, 1);
  assert.equal(conflicts[0].kind, "field");
  assert.equal(conflicts[0].fields[0].field, "title");
  assert.equal(conflicts[0].fields[0].localValue, "Yerel başlık");
  assert.equal(conflicts[0].fields[0].remoteValue, "Bulut başlık");
  assert.equal(merged.tasks[0].title, "Bulut başlık");
});

test("aynı alanı aynı değere getirdiler → çakışma yok", () => {
  const base = withTasks(makeTask());
  const local = withTasks(makeTask({ status: "tamamlandi" }));
  const remote = withTasks(makeTask({ status: "tamamlandi" }));
  const { merged, conflicts } = mergeCollections({ base, local, remote, pendingDeletions: [] });
  assert.equal(conflicts.length, 0);
  assert.equal(merged.tasks[0].status, "tamamlandi");
});

test("çevrimdışı oluşturulan görev korunur", () => {
  const base = withTasks(makeTask());
  const offlineTask = makeTask({ id: "t2", title: "Uçakta eklendi" });
  const local = withTasks(makeTask(), offlineTask);
  const remote = withTasks(makeTask());
  const { merged, conflicts } = mergeCollections({ base, local, remote, pendingDeletions: [] });
  assert.equal(conflicts.length, 0);
  assert.deepEqual(merged.tasks.map((t) => t.id).sort(), ["t1", "t2"]);
});

test("bulutta oluşturulan görev alınır", () => {
  const base = withTasks(makeTask());
  const local = withTasks(makeTask());
  const remote = withTasks(makeTask(), makeTask({ id: "t3", title: "Diğer cihazdan" }));
  const { merged } = mergeCollections({ base, local, remote, pendingDeletions: [] });
  assert.deepEqual(merged.tasks.map((t) => t.id).sort(), ["t1", "t3"]);
});

test("bulutta silinen, yerelde dokunulmamış görev silinmiş kalır", () => {
  const base = withTasks(makeTask());
  const local = withTasks(makeTask());
  const remote = withTasks();
  const { merged, conflicts } = mergeCollections({ base, local, remote, pendingDeletions: [] });
  assert.equal(conflicts.length, 0);
  assert.equal(merged.tasks.length, 0);
});

test("bulutta silinen ama yerelde düzenlenen görev → edit-delete çakışması, varsayılan silinmiş", () => {
  const base = withTasks(makeTask());
  const local = withTasks(makeTask({ title: "Tam üstünde çalışıyordum" }));
  const remote = withTasks();
  const { merged, conflicts } = mergeCollections({ base, local, remote, pendingDeletions: [] });
  assert.equal(conflicts.length, 1);
  assert.equal(conflicts[0].kind, "edit-delete");
  assert.equal(merged.tasks.length, 0);
  applyConflictResolution(merged, conflicts[0], "local");
  assert.equal(merged.tasks.length, 1);
  assert.equal(merged.tasks[0].title, "Tam üstünde çalışıyordum");
});

test("silme kuyruğundaki görev buluttan gelse bile geri dirilmez", () => {
  const base = withTasks(makeTask());
  const local = withTasks();
  const remote = withTasks(makeTask());
  const { merged } = mergeCollections({
    base, local, remote,
    pendingDeletions: [{ tableName: "tasks", rowId: "t1" }],
  });
  assert.equal(merged.tasks.length, 0);
});

test("yorumlar iki taraftan birleşir (union)", () => {
  const comment = (id, body) => ({ id, taskId: "t1", userId: "u1", body, createdAt: "2026-07-19" });
  const base = { ...emptyCollections(), taskComments: [comment("c1", "eski")] };
  const local = { ...emptyCollections(), taskComments: [comment("c1", "eski"), comment("c2", "yereldeki")] };
  const remote = { ...emptyCollections(), taskComments: [comment("c1", "eski"), comment("c3", "buluttaki")] };
  const { merged } = mergeCollections({ base, local, remote, pendingDeletions: [] });
  assert.deepEqual(merged.taskComments.map((c) => c.id).sort(), ["c1", "c2", "c3"]);
});

test("atamalarda çift değişiklik sessizce bulut lehine çözülür (kart yok)", () => {
  const assignment = (overrides = {}) => ({
    id: "a1", taskId: "t1", userId: "u1", isCompleted: false, completedAt: "", earnedScore: 0, assignedAt: "2026-07-18", ...overrides,
  });
  const base = { ...emptyCollections(), assignments: [assignment()] };
  const local = { ...emptyCollections(), assignments: [assignment({ isCompleted: true, earnedScore: 2 })] };
  const remote = { ...emptyCollections(), assignments: [assignment({ isCompleted: true, earnedScore: 3 })] };
  const { merged, conflicts } = mergeCollections({ base, local, remote, pendingDeletions: [] });
  assert.equal(conflicts.length, 0);
  assert.equal(merged.assignments[0].earnedScore, 3);
  assert.equal(merged.assignments[0].isCompleted, true);
});

test("görev ekleri birleşir, silinmiş ek geri gelmez", () => {
  const localAttachment = { id: "att-local", name: "yerel.pdf", storagePath: "x", uploadedBy: "u1" };
  const remoteAttachment = { id: "att-remote", name: "bulut.pdf", storagePath: "y", uploadedBy: "u2" };
  const deletedAttachment = { id: "att-deleted", name: "silindi.pdf", storagePath: "z", uploadedBy: "u1" };
  const base = withTasks(makeTask({ attachments: [deletedAttachment] }));
  const local = withTasks(makeTask({ attachments: [deletedAttachment, localAttachment] }));
  const remote = withTasks(makeTask({ attachments: [remoteAttachment] }));
  const { merged } = mergeCollections({
    base, local, remote,
    pendingDeletions: [{ tableName: "task_attachments", rowId: "att-deleted" }],
  });
  assert.deepEqual(merged.tasks[0].attachments.map((a) => a.id).sort(), ["att-local", "att-remote"]);
});

test("taban yokken bulut kazanır ve çakışma üretilmez (ilk kurulum davranışı)", () => {
  const local = withTasks(makeTask({ title: "Yerel" }), makeTask({ id: "t9", title: "Belirsiz" }));
  const remote = withTasks(makeTask({ title: "Bulut" }));
  const { merged, conflicts } = mergeCollections({ base: null, local, remote, pendingDeletions: [] });
  assert.equal(conflicts.length, 0);
  assert.equal(merged.tasks.length, 1);
  assert.equal(merged.tasks[0].title, "Bulut");
});

test("etiket ve alt görev dizileri alan olarak karşılaştırılır", () => {
  const base = withTasks(makeTask({ tags: ["iş"] }));
  const local = withTasks(makeTask({ tags: ["iş", "acil"] }));
  const remote = withTasks(makeTask({ tags: ["iş"], subtasks: [{ id: "s1", title: "Alt", completed: false }] }));
  const { merged, conflicts } = mergeCollections({ base, local, remote, pendingDeletions: [] });
  assert.equal(conflicts.length, 0);
  assert.deepEqual(merged.tasks[0].tags, ["iş", "acil"]);
  assert.equal(merged.tasks[0].subtasks.length, 1);
});

test("alan çakışması kararı: 'benimki kalsın' seçimi yerel değerleri uygular", () => {
  const base = withTasks(makeTask());
  const local = withTasks(makeTask({ title: "Yerel", priority: "yuksek" }));
  const remote = withTasks(makeTask({ title: "Bulut", priority: "dusuk" }));
  const { merged, conflicts } = mergeCollections({ base, local, remote, pendingDeletions: [] });
  assert.equal(conflicts.length, 1);
  assert.equal(conflicts[0].fields.length, 2);
  applyConflictResolution(merged, conflicts[0], "local");
  assert.equal(merged.tasks[0].title, "Yerel");
  assert.equal(merged.tasks[0].priority, "yuksek");
});

test("proje alanları da birleşir (arşiv + ad)", () => {
  const project = (overrides = {}) => ({
    id: "p1", userId: "u1", categoryId: "c1", name: "Proje", description: "", archived: false,
    dueDate: "", createdAt: "2026-07-18", updatedAt: "2026-07-18", ...overrides,
  });
  const base = { ...emptyCollections(), projects: [project()] };
  const local = { ...emptyCollections(), projects: [project({ archived: true })] };
  const remote = { ...emptyCollections(), projects: [project({ name: "Proje (yeni ad)" })] };
  const { merged, conflicts } = mergeCollections({ base, local, remote, pendingDeletions: [] });
  assert.equal(conflicts.length, 0);
  assert.equal(merged.projects[0].archived, true);
  assert.equal(merged.projects[0].name, "Proje (yeni ad)");
});
