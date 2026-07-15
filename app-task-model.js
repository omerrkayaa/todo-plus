(function registerTaskModel(global) {
  function createTaskModel({ priorityScores }) {
    const getAttachments = (task) => Array.isArray(task?.attachments) ? task.attachments : [];
    const getSubtasks = (task) => Array.isArray(task?.subtasks) ? task.subtasks : [];
    const getScore = (task) => priorityScores[task?.priority] || 1;

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

    return Object.freeze({ getAttachments, getSubtasks, getScore, calculateUserStats });
  }

  global.TODO_PLUS_TASK_MODEL = Object.freeze({ createTaskModel });
})(window);
