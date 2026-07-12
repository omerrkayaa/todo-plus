(function registerTaskModel(global) {
  function createTaskModel({ createId, priorityScores, isTaskOverdue }) {
    const getAttachments = (task) => Array.isArray(task?.attachments) ? task.attachments : [];
    const getSubtasks = (task) => Array.isArray(task?.subtasks) ? task.subtasks : [];
    const getScore = (task) => priorityScores[task?.priority] || 1;

    function parseSubtasks(value) {
      return String(value || "").split(/\r?\n/).map((line) => line.trim()).filter(Boolean)
        .map((title) => ({ id: createId("subtask"), title, completed: false }));
    }

    function calculateUserStats(state, userId) {
      const assignments = state.assignments.filter((assignment) => assignment.userId === userId);
      const assignedTasks = assignments.map((assignment) => state.tasks.find((task) => task.id === assignment.taskId)).filter(Boolean);
      const totalScore = assignedTasks.reduce((sum, task) => sum + getScore(task), 0);
      const completedScore = assignments.reduce((sum, assignment) => {
        const task = state.tasks.find((item) => item.id === assignment.taskId);
        return assignment.isCompleted && task ? sum + getScore(task) : sum;
      }, 0);
      return {
        assignedCount: assignments.length,
        completedCount: assignments.filter((assignment) => assignment.isCompleted).length,
        totalScore,
        completedScore,
        rate: totalScore === 0 ? 0 : Math.round((completedScore / totalScore) * 100),
      };
    }

    function calculateWorkload(state, userId) {
      const assignedIds = new Set(state.assignments.filter((assignment) => assignment.userId === userId).map((assignment) => assignment.taskId));
      const activeTasks = state.tasks.filter((task) => assignedIds.has(task.id) && task.status !== "tamamlandi");
      const overdueCount = activeTasks.filter(isTaskOverdue).length;
      const activeMinutes = activeTasks.reduce((sum, task) => sum + (Number(task.estimatedMinutes) || 0), 0);
      const stats = calculateUserStats(state, userId);
      const readinessScore = Math.max(0, Math.round((stats.assignedCount ? stats.rate : 50) - activeTasks.length * 12 - overdueCount * 20));
      return { ...stats, activeCount: activeTasks.length, overdueCount, activeMinutes, readinessScore };
    }

    return Object.freeze({ getAttachments, getSubtasks, getScore, parseSubtasks, calculateUserStats, calculateWorkload });
  }

  global.TODO_PLUS_TASK_MODEL = Object.freeze({ createTaskModel });
})(window);
