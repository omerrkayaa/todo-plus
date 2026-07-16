(function registerSupabaseMapper(global) {
  const date = (value, fallback) => value?.slice(0, 10) || fallback();

  function applyRemoteRows(state, rows, today) {
    if (rows.users) state.users = rows.users.map((x) => ({ id: x.id, fullName: x.full_name, email: x.email, role: x.role || "user" }));
    if (rows.projects) state.projects = rows.projects.map((x) => ({ id: x.id, userId: x.user_id, categoryId: x.category_id || "", name: x.name, description: x.description || "", archived: Boolean(x.archived), dueDate: x.due_date || "", createdAt: date(x.created_at, today), updatedAt: date(x.updated_at, today) }));
    if (rows.categories) state.categories = rows.categories.map((x) => ({ id: x.id, userId: x.user_id, name: x.name, color: x.color, createdAt: date(x.created_at, today) }));
    if (rows.tasks) state.tasks = rows.tasks.map((x) => ({ id: x.id, projectId: x.project_id || "", categoryId: x.category_id || "", createdBy: x.created_by, title: x.title, description: x.description || "", priority: x.priority, status: x.status, estimatedMinutes: x.estimated_minutes, dueDate: x.due_date || "", startDate: x.start_date || "", repeatInterval: x.repeat_interval || "none", subtasks: Array.isArray(x.subtasks) ? x.subtasks : [], tags: Array.isArray(x.tags) ? x.tags : [], createdAt: date(x.created_at, today), updatedAt: date(x.updated_at, today) }));
    if (rows.task_attachments) {
      const attachmentsByTask = rows.task_attachments.reduce((groups, x) => {
        (groups[x.task_id] ||= []).push({
          id: x.id,
          name: x.file_name,
          type: x.mime_type,
          size: x.file_size,
          storagePath: x.storage_path,
          uploadedBy: x.uploaded_by,
          uploadedAt: date(x.created_at, today),
        });
        return groups;
      }, {});
      state.tasks.forEach((task) => { task.attachments = attachmentsByTask[task.id] || []; });
    }
    if (rows.task_assignments) state.assignments = rows.task_assignments.map((x) => ({ id: x.id, taskId: x.task_id, userId: x.user_id, isCompleted: x.is_completed, completedAt: x.completed_at?.slice(0, 10) || "", earnedScore: x.earned_score, assignedAt: date(x.assigned_at, today) }));
    if (rows.task_givers) state.taskGivers = rows.task_givers.map((x) => ({ id: x.id, taskId: x.task_id, userId: x.user_id, assignedAt: date(x.assigned_at, today) }));
    if (rows.task_history) state.history = rows.task_history.map((x) => ({ id: x.id, taskId: x.task_id, changedBy: x.changed_by, oldStatus: x.old_status || "", newStatus: x.new_status, note: x.note || "", changedAt: date(x.changed_at, today) }));
    if (rows.task_comments) state.taskComments = rows.task_comments.map((x) => ({ id: x.id, taskId: x.task_id, userId: x.user_id, body: x.body || "", createdAt: date(x.created_at, today) }));
    if (rows.project_members) state.projectMembers = rows.project_members.map((x) => ({ id: x.id, projectId: x.project_id, userId: x.user_id, memberRole: x.member_role, joinedAt: date(x.joined_at, today) }));
    if (rows.project_invitations) state.projectInvitations = rows.project_invitations.map((x) => ({ id: x.id, projectId: x.project_id, email: x.email, memberRole: x.member_role, invitedBy: x.invited_by, status: x.status, createdAt: date(x.created_at, today) }));
    return state;
  }

  function toRemoteRows(state, isUuid) {
    const users = state.users.filter((x) => isUuid(x.id));
    const userIds = new Set(users.map((x) => x.id));
    const categories = state.categories.filter((x) => isUuid(x.id) && userIds.has(x.userId));
    const categoryIds = new Set(categories.map((x) => x.id));
    const projects = state.projects.filter((x) => isUuid(x.id) && userIds.has(x.userId) && (!x.categoryId || categoryIds.has(x.categoryId)));
    const projectIds = new Set(projects.map((x) => x.id));
    const tasks = state.tasks.filter((x) => isUuid(x.id) && (!x.projectId || projectIds.has(x.projectId)) && (!x.categoryId || categoryIds.has(x.categoryId)) && userIds.has(x.createdBy));
    const taskIds = new Set(tasks.map((x) => x.id));
    return {
      users: users.map((x) => ({ id: x.id, full_name: x.fullName, email: x.email, role: x.role || "user" })),
      projects: projects.map((x) => ({ id: x.id, user_id: x.userId, category_id: x.categoryId || null, name: x.name, description: x.description, archived: Boolean(x.archived), due_date: x.dueDate || null, created_at: x.createdAt, updated_at: x.updatedAt || x.createdAt })),
      categories: categories.map((x) => ({ id: x.id, user_id: x.userId, name: x.name, color: x.color, created_at: x.createdAt })),
      tasks: tasks.map((x) => ({ id: x.id, project_id: x.projectId || null, category_id: x.categoryId || null, created_by: x.createdBy, title: x.title, description: x.description, priority: x.priority, status: x.status, estimated_minutes: x.estimatedMinutes, due_date: x.dueDate || null, start_date: x.startDate || null, repeat_interval: x.repeatInterval || "none", subtasks: Array.isArray(x.subtasks) ? x.subtasks : [], tags: Array.isArray(x.tags) ? x.tags : [], created_at: x.createdAt, updated_at: x.updatedAt || x.createdAt })),
      task_attachments: tasks.flatMap((task) =>
        (task.attachments || [])
          .filter((x) => isUuid(x.id) && x.storagePath && userIds.has(x.uploadedBy))
          .map((x) => ({ id: x.id, task_id: task.id, uploaded_by: x.uploadedBy, file_name: x.name, storage_path: x.storagePath, mime_type: x.type, file_size: x.size, created_at: x.uploadedAt })),
      ),
      task_assignments: state.assignments.filter((x) => isUuid(x.id) && taskIds.has(x.taskId) && userIds.has(x.userId)).map((x) => ({ id: x.id, task_id: x.taskId, user_id: x.userId, is_completed: x.isCompleted, completed_at: x.completedAt || null, earned_score: x.earnedScore, assigned_at: x.assignedAt })),
      task_givers: state.taskGivers.filter((x) => isUuid(x.id) && taskIds.has(x.taskId) && userIds.has(x.userId)).map((x) => ({ id: x.id, task_id: x.taskId, user_id: x.userId, assigned_at: x.assignedAt })),
      task_history: state.history.filter((x) => isUuid(x.id) && taskIds.has(x.taskId) && userIds.has(x.changedBy)).map((x) => ({ id: x.id, task_id: x.taskId, changed_by: x.changedBy, old_status: x.oldStatus || null, new_status: x.newStatus, note: x.note, changed_at: x.changedAt })),
      task_comments: state.taskComments.filter((x) => isUuid(x.id) && taskIds.has(x.taskId) && userIds.has(x.userId)).map((x) => ({ id: x.id, task_id: x.taskId, user_id: x.userId, body: x.body, created_at: x.createdAt })),
    };
  }

  global.TODO_PLUS_SUPABASE_MAPPER = Object.freeze({ applyRemoteRows, toRemoteRows });
})(window);
