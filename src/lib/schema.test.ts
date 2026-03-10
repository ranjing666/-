import { describe, expect, it } from "vitest";
import { createDefaultConfig, createDefaultTask, createLoginConfig } from "./defaults";
import { validateConfig } from "./schema";

describe("validateConfig", () => {
  it("accepts a complete default configuration after choosing output directory", () => {
    const config = createDefaultConfig();
    config.global.outputDirectory = "D:/output";
    config.login = createLoginConfig("none");
    config.tasks = [createDefaultTask("navigate")];
    config.tasks[0].url = "https://example.com";

    expect(validateConfig(config)).toEqual([]);
  });

  it("reports missing output directory and empty task list", () => {
    const config = createDefaultConfig();
    config.tasks = [];

    const issues = validateConfig(config);
    const messages = issues.map((issue) => issue.message);

    expect(messages).toContain("至少需要配置一个任务步骤");
    expect(messages).toContain("请选择脚本导出目录");
  });
});
