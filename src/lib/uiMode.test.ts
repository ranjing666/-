import { describe, expect, it } from "vitest";
import { createDefaultTask, createLoginConfig } from "./defaults";
import { hasAdvancedTasks, isAdvancedTaskType, usesAdvancedLogin, usesAdvancedProxy } from "./uiMode";
import type { LoopTask } from "../types/config";

describe("uiMode helpers", () => {
  it("flags advanced task types", () => {
    expect(isAdvancedTaskType("navigate")).toBe(false);
    expect(isAdvancedTaskType("condition")).toBe(true);
  });

  it("detects advanced tasks recursively", () => {
    const loopTask = createDefaultTask("loop") as LoopTask;
    loopTask.tasks = [createDefaultTask("click")];

    expect(hasAdvancedTasks([createDefaultTask("navigate")])).toBe(false);
    expect(hasAdvancedTasks([loopTask])).toBe(true);
  });

  it("detects advanced login and proxy usage", () => {
    expect(usesAdvancedLogin(createLoginConfig("password"))).toBe(false);
    expect(usesAdvancedLogin(createLoginConfig("wallet"))).toBe(true);
    expect(usesAdvancedProxy({ enabled: false, type: "http", mode: "single", single: "", list: [], rotation: "sequential" })).toBe(false);
    expect(
      usesAdvancedProxy({
        enabled: true,
        type: "http",
        mode: "list",
        single: "",
        list: ["http://127.0.0.1:7890"],
        rotation: "sequential"
      })
    ).toBe(true);
  });
});
