import {
  Button,
  Card,
  Col,
  Divider,
  Form,
  Input,
  InputNumber,
  Row,
  Select,
  Space,
  Tag,
  Typography
} from "antd";
import { createDefaultTask } from "../lib/defaults";
import type { ComparisonOperator, TaskItem, TaskType } from "../types/config";

const { Paragraph, Text } = Typography;

const taskTypeOptions: { label: string; value: TaskType }[] = [
  { label: "访问页面", value: "navigate" },
  { label: "点击元素", value: "click" },
  { label: "输入文本", value: "input" },
  { label: "选择下拉框", value: "select" },
  { label: "等待", value: "wait" },
  { label: "执行 JS", value: "execute_script" },
  { label: "提取变量", value: "extract" },
  { label: "条件分支", value: "condition" },
  { label: "循环", value: "loop" },
  { label: "API 请求", value: "api_request" }
];

const comparisonOptions: { label: string; value: ComparisonOperator }[] = [
  { label: "存在", value: "exists" },
  { label: "等于", value: "equals" },
  { label: "包含", value: "contains" },
  { label: "不等于", value: "not_equals" }
];

interface TaskListEditorProps {
  tasks: TaskItem[];
  onChange: (tasks: TaskItem[]) => void;
  depth?: number;
  title?: string;
}

function cloneTasks(tasks: TaskItem[]) {
  return structuredClone(tasks);
}

function swap<T>(items: T[], fromIndex: number, toIndex: number) {
  const next = [...items];
  [next[fromIndex], next[toIndex]] = [next[toIndex], next[fromIndex]];
  return next;
}

export function TaskListEditor(props: TaskListEditorProps) {
  const { tasks, onChange, depth = 0, title = "任务序列" } = props;

  const addTask = (type: TaskType) => {
    onChange([...cloneTasks(tasks), createDefaultTask(type)]);
  };

  const updateTask = (index: number, updater: (task: TaskItem) => TaskItem) => {
    const next = cloneTasks(tasks);
    next[index] = updater(next[index]);
    onChange(next);
  };

  const removeTask = (index: number) => {
    const next = cloneTasks(tasks);
    next.splice(index, 1);
    onChange(next);
  };

  const changeTaskType = (index: number, type: TaskType) => {
    const next = cloneTasks(tasks);
    const previous = next[index];
    const replacement = createDefaultTask(type);
    replacement.label = previous.label || replacement.label;
    next[index] = replacement;
    onChange(next);
  };

  return (
    <Card
      className={depth > 0 ? "nested-task-card" : undefined}
      title={title}
      extra={
        <Select
          placeholder="添加步骤"
          style={{ width: 180 }}
          options={taskTypeOptions}
          onChange={(value) => addTask(value)}
        />
      }
    >
      {depth === 0 ? (
        <Card className="task-intro-card">
          <Space
            direction="vertical"
            size={8}
          >
            <Text strong>最容易上手的任务顺序：</Text>
            <Text>访问页面、点击元素、等待提示、提取结果。</Text>
            <Text className="muted-copy">
              第一次不要一口气加太多步骤。先做出一个最短流程，确认能生成，再慢慢加条件和循环。
            </Text>
          </Space>
        </Card>
      ) : null}

      {tasks.length === 0 ? (
        <Paragraph className="muted-copy">还没有任务步骤，先从右上角添加一个操作。</Paragraph>
      ) : null}

      <Space
        direction="vertical"
        size={16}
        style={{ width: "100%" }}
      >
        {tasks.map((task, index) => (
          <Card
            key={task.id}
            size="small"
            className="task-card"
            title={
              <Space wrap>
                <Tag color="gold">{index + 1}</Tag>
                <Input
                  value={task.label}
                  onChange={(event) =>
                    updateTask(index, (current) => ({
                      ...current,
                      label: event.target.value
                    }))
                  }
                  placeholder="步骤标题"
                  style={{ width: 200 }}
                />
              </Space>
            }
            extra={
              <Space wrap>
                <Select
                  value={task.type}
                  options={taskTypeOptions}
                  onChange={(value) => changeTaskType(index, value)}
                  style={{ width: 160 }}
                />
                <Button
                  disabled={index === 0}
                  onClick={() => onChange(swap(tasks, index, index - 1))}
                >
                  上移
                </Button>
                <Button
                  disabled={index === tasks.length - 1}
                  onClick={() => onChange(swap(tasks, index, index + 1))}
                >
                  下移
                </Button>
                <Button
                  danger
                  onClick={() => removeTask(index)}
                >
                  删除
                </Button>
              </Space>
            }
          >
            <Form layout="vertical">
              {task.type === "navigate" ? (
                <Row gutter={16}>
                  <Col
                    xs={24}
                    md={18}
                  >
                    <Form.Item label="URL">
                      <Input
                        value={task.url}
                        onChange={(event) =>
                          updateTask(index, (current) => ({
                            ...current,
                            url: event.target.value
                          }))
                        }
                        placeholder="https://example.com"
                      />
                    </Form.Item>
                  </Col>
                  <Col
                    xs={24}
                    md={6}
                  >
                    <Form.Item label="等待策略">
                      <Select
                        value={task.waitUntil}
                        onChange={(value) =>
                          updateTask(index, (current) => ({
                            ...current,
                            waitUntil: value
                          }))
                        }
                        options={[
                          { label: "load", value: "load" },
                          { label: "domcontentloaded", value: "domcontentloaded" },
                          { label: "networkidle", value: "networkidle" }
                        ]}
                      />
                    </Form.Item>
                  </Col>
                </Row>
              ) : null}

              {task.type === "click" ? (
                <Row gutter={16}>
                  <Col
                    xs={24}
                    md={14}
                  >
                    <Form.Item label="元素选择器">
                      <Input
                        value={task.selector}
                        onChange={(event) =>
                          updateTask(index, (current) => ({
                            ...current,
                            selector: event.target.value
                          }))
                        }
                      />
                    </Form.Item>
                  </Col>
                  <Col
                    xs={12}
                    md={5}
                  >
                    <Form.Item label="超时（秒）">
                      <InputNumber
                        min={1}
                        value={task.timeout}
                        onChange={(value) =>
                          updateTask(index, (current) => ({
                            ...current,
                            timeout: value || 1
                          }))
                        }
                        style={{ width: "100%" }}
                      />
                    </Form.Item>
                  </Col>
                  <Col
                    xs={12}
                    md={5}
                  >
                    <Form.Item label="元素索引">
                      <InputNumber
                        min={0}
                        value={task.index}
                        onChange={(value) =>
                          updateTask(index, (current) => ({
                            ...current,
                            index: value || 0
                          }))
                        }
                        style={{ width: "100%" }}
                      />
                    </Form.Item>
                  </Col>
                </Row>
              ) : null}

              {task.type === "input" ? (
                <Row gutter={16}>
                  <Col
                    xs={24}
                    md={10}
                  >
                    <Form.Item label="元素选择器">
                      <Input
                        value={task.selector}
                        onChange={(event) =>
                          updateTask(index, (current) => ({
                            ...current,
                            selector: event.target.value
                          }))
                        }
                      />
                    </Form.Item>
                  </Col>
                  <Col
                    xs={24}
                    md={10}
                  >
                    <Form.Item label="输入值">
                      <Input
                        value={task.value}
                        onChange={(event) =>
                          updateTask(index, (current) => ({
                            ...current,
                            value: event.target.value
                          }))
                        }
                        placeholder="{{env('EMAIL')}} 或 固定文本"
                      />
                    </Form.Item>
                  </Col>
                  <Col
                    xs={24}
                    md={4}
                  >
                    <Form.Item label="清空后再输入">
                      <Select
                        value={task.clearFirst ? "yes" : "no"}
                        onChange={(value) =>
                          updateTask(index, (current) => ({
                            ...current,
                            clearFirst: value === "yes"
                          }))
                        }
                        options={[
                          { label: "是", value: "yes" },
                          { label: "否", value: "no" }
                        ]}
                      />
                    </Form.Item>
                  </Col>
                </Row>
              ) : null}

              {task.type === "select" ? (
                <Row gutter={16}>
                  <Col
                    xs={24}
                    md={10}
                  >
                    <Form.Item label="元素选择器">
                      <Input
                        value={task.selector}
                        onChange={(event) =>
                          updateTask(index, (current) => ({
                            ...current,
                            selector: event.target.value
                          }))
                        }
                      />
                    </Form.Item>
                  </Col>
                  <Col
                    xs={24}
                    md={8}
                  >
                    <Form.Item label="Option 值">
                      <Input
                        value={task.optionValue}
                        onChange={(event) =>
                          updateTask(index, (current) => ({
                            ...current,
                            optionValue: event.target.value
                          }))
                        }
                      />
                    </Form.Item>
                  </Col>
                  <Col
                    xs={24}
                    md={6}
                  >
                    <Form.Item label="Option 索引">
                      <InputNumber
                        min={0}
                        value={task.optionIndex ?? undefined}
                        onChange={(value) =>
                          updateTask(index, (current) => ({
                            ...current,
                            optionIndex: value === null ? null : value ?? null
                          }))
                        }
                        style={{ width: "100%" }}
                      />
                    </Form.Item>
                  </Col>
                </Row>
              ) : null}

              {task.type === "wait" ? (
                <Row gutter={16}>
                  <Col
                    xs={24}
                    md={8}
                  >
                    <Form.Item label="等待类型">
                      <Select
                        value={task.mode}
                        onChange={(value) =>
                          updateTask(index, () => ({
                            ...task,
                            mode: value
                          }))
                        }
                        options={[
                          { label: "固定秒数", value: "duration" },
                          { label: "等待元素出现", value: "selector" }
                        ]}
                      />
                    </Form.Item>
                  </Col>
                  <Col
                    xs={24}
                    md={8}
                  >
                    <Form.Item label="秒数">
                      <InputNumber
                        min={1}
                        disabled={task.mode !== "duration"}
                        value={task.durationSeconds}
                        onChange={(value) =>
                          updateTask(index, (current) => ({
                            ...current,
                            durationSeconds: value || 1
                          }))
                        }
                        style={{ width: "100%" }}
                      />
                    </Form.Item>
                  </Col>
                  <Col
                    xs={24}
                    md={8}
                  >
                    <Form.Item label="等待超时（秒）">
                      <InputNumber
                        min={1}
                        value={task.timeout}
                        onChange={(value) =>
                          updateTask(index, (current) => ({
                            ...current,
                            timeout: value || 1
                          }))
                        }
                        style={{ width: "100%" }}
                      />
                    </Form.Item>
                  </Col>
                  <Col span={24}>
                    <Form.Item label="元素选择器">
                      <Input
                        value={task.selector}
                        disabled={task.mode !== "selector"}
                        onChange={(event) =>
                          updateTask(index, (current) => ({
                            ...current,
                            selector: event.target.value
                          }))
                        }
                      />
                    </Form.Item>
                  </Col>
                </Row>
              ) : null}

              {task.type === "execute_script" ? (
                <Form.Item label="JavaScript 代码">
                  <Input.TextArea
                    rows={5}
                    value={task.script}
                    onChange={(event) =>
                      updateTask(index, (current) => ({
                        ...current,
                        script: event.target.value
                      }))
                    }
                  />
                </Form.Item>
              ) : null}

              {task.type === "extract" ? (
                <Row gutter={16}>
                  <Col
                    xs={24}
                    md={10}
                  >
                    <Form.Item label="元素选择器">
                      <Input
                        value={task.selector}
                        onChange={(event) =>
                          updateTask(index, (current) => ({
                            ...current,
                            selector: event.target.value
                          }))
                        }
                      />
                    </Form.Item>
                  </Col>
                  <Col
                    xs={24}
                    md={7}
                  >
                    <Form.Item label="属性">
                      <Input
                        value={task.attribute}
                        onChange={(event) =>
                          updateTask(index, (current) => ({
                            ...current,
                            attribute: event.target.value
                          }))
                        }
                        placeholder="text / href / data-id"
                      />
                    </Form.Item>
                  </Col>
                  <Col
                    xs={24}
                    md={7}
                  >
                    <Form.Item label="变量名">
                      <Input
                        value={task.variable}
                        onChange={(event) =>
                          updateTask(index, (current) => ({
                            ...current,
                            variable: event.target.value
                          }))
                        }
                      />
                    </Form.Item>
                  </Col>
                </Row>
              ) : null}

              {task.type === "condition" ? (
                <>
                  <Row gutter={16}>
                    <Col
                      xs={24}
                      md={8}
                    >
                      <Form.Item label="条件来源">
                      <Select
                        value={task.mode}
                        onChange={(value) =>
                          updateTask(index, () => ({
                            ...task,
                            mode: value
                          }))
                        }
                          options={[
                            { label: "变量判断", value: "variable" },
                            { label: "元素存在", value: "selector" }
                          ]}
                        />
                      </Form.Item>
                    </Col>
                    <Col
                      xs={24}
                      md={8}
                    >
                      <Form.Item label="比较方式">
                      <Select
                        value={task.operator}
                        onChange={(value) =>
                          updateTask(index, () => ({
                            ...task,
                            operator: value
                          }))
                        }
                          options={comparisonOptions}
                        />
                      </Form.Item>
                    </Col>
                    <Col
                      xs={24}
                      md={8}
                    >
                      <Form.Item label="比较值">
                      <Input
                        value={task.compareValue}
                        disabled={task.operator === "exists"}
                        onChange={(event) =>
                          updateTask(index, () => ({
                            ...task,
                            compareValue: event.target.value
                          }))
                        }
                        />
                      </Form.Item>
                    </Col>
                  </Row>
                  {task.mode === "variable" ? (
                    <Form.Item label="变量名">
                      <Input
                        value={task.variable}
                        onChange={(event) =>
                          updateTask(index, () => ({
                            ...task,
                            variable: event.target.value
                          }))
                        }
                      />
                    </Form.Item>
                  ) : (
                    <Form.Item label="元素选择器">
                      <Input
                        value={task.selector}
                        onChange={(event) =>
                          updateTask(index, () => ({
                            ...task,
                            selector: event.target.value
                          }))
                        }
                      />
                    </Form.Item>
                  )}
                  <Divider>满足条件时</Divider>
                  <TaskListEditor
                    depth={depth + 1}
                    title="Then 子任务"
                    tasks={task.thenTasks}
                    onChange={(nextTasks) =>
                      updateTask(index, () => ({
                        ...task,
                        thenTasks: nextTasks
                      }))
                    }
                  />
                  <Divider>不满足条件时</Divider>
                  <TaskListEditor
                    depth={depth + 1}
                    title="Else 子任务"
                    tasks={task.elseTasks}
                    onChange={(nextTasks) =>
                      updateTask(index, () => ({
                        ...task,
                        elseTasks: nextTasks
                      }))
                    }
                  />
                </>
              ) : null}

              {task.type === "loop" ? (
                <>
                  <Row gutter={16}>
                    <Col
                      xs={24}
                      md={8}
                    >
                      <Form.Item label="循环模式">
                      <Select
                        value={task.mode}
                        onChange={(value) =>
                          updateTask(index, () => ({
                            ...task,
                            mode: value
                          }))
                        }
                          options={[
                            { label: "固定次数", value: "count" },
                            { label: "变量条件", value: "while" }
                          ]}
                        />
                      </Form.Item>
                    </Col>
                    <Col
                      xs={24}
                      md={8}
                    >
                      <Form.Item label="次数">
                      <InputNumber
                        min={1}
                        disabled={task.mode !== "count"}
                        value={task.count}
                        onChange={(value) =>
                          updateTask(index, () => ({
                            ...task,
                            count: value || 1
                          }))
                        }
                          style={{ width: "100%" }}
                        />
                      </Form.Item>
                    </Col>
                    <Col
                      xs={24}
                      md={8}
                    >
                      <Form.Item label="比较方式">
                      <Select
                        disabled={task.mode !== "while"}
                        value={task.operator}
                        onChange={(value) =>
                          updateTask(index, () => ({
                            ...task,
                            operator: value
                          }))
                        }
                          options={comparisonOptions}
                        />
                      </Form.Item>
                    </Col>
                  </Row>
                  {task.mode === "while" ? (
                    <Row gutter={16}>
                      <Col
                        xs={24}
                        md={12}
                      >
                        <Form.Item label="变量名">
                          <Input
                            value={task.variable}
                            onChange={(event) =>
                              updateTask(index, () => ({
                                ...task,
                                variable: event.target.value
                              }))
                            }
                          />
                        </Form.Item>
                      </Col>
                      <Col
                        xs={24}
                        md={12}
                      >
                        <Form.Item label="比较值">
                          <Input
                            value={task.compareValue}
                            disabled={task.operator === "exists"}
                            onChange={(event) =>
                              updateTask(index, () => ({
                                ...task,
                                compareValue: event.target.value
                              }))
                            }
                          />
                        </Form.Item>
                      </Col>
                    </Row>
                  ) : null}
                  <TaskListEditor
                    depth={depth + 1}
                    title="循环体任务"
                    tasks={task.tasks}
                    onChange={(nextTasks) =>
                      updateTask(index, () => ({
                        ...task,
                        tasks: nextTasks
                      }))
                    }
                  />
                </>
              ) : null}

              {task.type === "api_request" ? (
                <>
                  <Row gutter={16}>
                    <Col
                      xs={24}
                      md={6}
                    >
                      <Form.Item label="Method">
                        <Select
                          value={task.method}
                          onChange={(value) =>
                            updateTask(index, (current) => ({
                              ...current,
                              method: value
                            }))
                          }
                          options={[
                            { label: "GET", value: "GET" },
                            { label: "POST", value: "POST" },
                            { label: "PUT", value: "PUT" },
                            { label: "PATCH", value: "PATCH" },
                            { label: "DELETE", value: "DELETE" }
                          ]}
                        />
                      </Form.Item>
                    </Col>
                    <Col
                      xs={24}
                      md={18}
                    >
                      <Form.Item label="URL">
                        <Input
                          value={task.url}
                          onChange={(event) =>
                            updateTask(index, (current) => ({
                              ...current,
                              url: event.target.value
                            }))
                          }
                        />
                      </Form.Item>
                    </Col>
                  </Row>
                  <Row gutter={16}>
                    <Col
                      xs={24}
                      md={12}
                    >
                      <Form.Item label="Headers(JSON)">
                        <Input.TextArea
                          rows={5}
                          value={task.headersText}
                          onChange={(event) =>
                            updateTask(index, (current) => ({
                              ...current,
                              headersText: event.target.value
                            }))
                          }
                        />
                      </Form.Item>
                    </Col>
                    <Col
                      xs={24}
                      md={12}
                    >
                      <Form.Item label="Body(JSON / 文本)">
                        <Input.TextArea
                          rows={5}
                          value={task.bodyText}
                          onChange={(event) =>
                            updateTask(index, (current) => ({
                              ...current,
                              bodyText: event.target.value
                            }))
                          }
                        />
                      </Form.Item>
                    </Col>
                  </Row>
                  <Form.Item label="响应保存变量名">
                    <Input
                      value={task.saveResponseAs}
                      onChange={(event) =>
                        updateTask(index, (current) => ({
                          ...current,
                          saveResponseAs: event.target.value
                        }))
                      }
                      placeholder="例如 api_result"
                    />
                  </Form.Item>
                </>
              ) : null}
            </Form>
          </Card>
        ))}
      </Space>

      {depth === 0 ? (
        <Paragraph className="muted-copy">
          支持变量引用：<Text code>{"{{timestamp}}"}</Text>、
          <Text code>{"{{random_int(1,100)}}"}</Text>、
          <Text code>{"{{env('KEY')}}"}</Text> 和前面提取出的变量名。
        </Paragraph>
      ) : null}
    </Card>
  );
}
