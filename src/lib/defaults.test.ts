import { describe, expect, it } from "vitest";
import { createStarterConfig } from "./defaults";

describe("createStarterConfig", () => {
  it("creates a browse starter with one navigate task", () => {
    const config = createStarterConfig("browse");

    expect(config.meta.name).toBe("打开网页脚本");
    expect(config.tasks).toHaveLength(1);
    expect(config.tasks[0].type).toBe("navigate");
  });

  it("creates a click-flow starter with basic simple tasks", () => {
    const config = createStarterConfig("click-flow");

    expect(config.tasks.map((task) => task.type)).toEqual(["navigate", "click", "wait"]);
  });
});
