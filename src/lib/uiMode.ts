import type { LoginConfig, LoginMethod, ProxyConfig, TaskItem, TaskType } from "../types/config";

export type UiMode = "simple" | "advanced";

export const SIMPLE_TASK_TYPES: TaskType[] = ["navigate", "click", "input", "wait", "extract"];
export const SIMPLE_LOGIN_METHODS: LoginMethod[] = ["none", "password", "cookie"];

export function isAdvancedTaskType(type: TaskType) {
  return !SIMPLE_TASK_TYPES.includes(type);
}

export function hasAdvancedTasks(tasks: TaskItem[]): boolean {
  return tasks.some((task) => {
    if (isAdvancedTaskType(task.type)) {
      return true;
    }

    if (task.type === "condition") {
      return hasAdvancedTasks(task.thenTasks) || hasAdvancedTasks(task.elseTasks);
    }

    if (task.type === "loop") {
      return hasAdvancedTasks(task.tasks);
    }

    return false;
  });
}

export function usesAdvancedLogin(login: LoginConfig) {
  return login.method === "wallet";
}

export function usesAdvancedProxy(proxy: ProxyConfig) {
  return proxy.mode === "list";
}
