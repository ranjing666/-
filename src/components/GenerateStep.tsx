import { Alert, Button, Card, Descriptions, Empty, List, Space, Tag, Typography } from "antd";
import { useDeferredValue } from "react";
import type { GenerationResult, ValidationIssue } from "../types/config";

const { Text } = Typography;

interface GenerateStepProps {
  validationIssues: ValidationIssue[];
  generationResult: GenerationResult | null;
  onGenerate: () => void;
  onOpenOutputDirectory: () => void;
  onGoToStep: (step: number) => void;
}

function getIssueTarget(path: string) {
  const normalized = path.toLowerCase();

  if (
    normalized.startsWith("/global") ||
    normalized.startsWith("/meta") ||
    normalized === "name" ||
    normalized === "description" ||
    normalized === "outputdirectory"
  ) {
    return { step: 1, label: "基础设置", actionLabel: "去基础设置" };
  }

  if (
    normalized.startsWith("/login") ||
    normalized === "url" ||
    normalized === "usernameselector" ||
    normalized === "passwordselector" ||
    normalized === "submitselector" ||
    normalized === "username" ||
    normalized === "password" ||
    normalized === "privatekeyenvvar"
  ) {
    return { step: 2, label: "登录设置", actionLabel: "去登录设置" };
  }

  if (normalized.startsWith("/proxy")) {
    return { step: 3, label: "代理设置", actionLabel: "去代理设置" };
  }

  return { step: 4, label: "任务编辑", actionLabel: "去任务编辑" };
}

function formatIssuePath(path: string) {
  if (path === "/tasks") {
    return "任务步骤";
  }

  if (path === "/global/outputDirectory") {
    return "导出目录";
  }

  if (path.startsWith("/tasks/")) {
    const parts = path.split("/").filter(Boolean);
    const taskIndex = Number(parts[1]);
    const field = parts[2];
    const fieldMap: Record<string, string> = {
      url: "网址",
      selector: "选择器",
      value: "输入值",
      attribute: "提取属性",
      variable: "变量名"
    };

    if (!Number.isNaN(taskIndex)) {
      return `第 ${taskIndex + 1} 步的${fieldMap[field] ?? "配置"}`;
    }
  }

  if (path.startsWith("/login/")) {
    const field = path.split("/").filter(Boolean)[1];
    const fieldMap: Record<string, string> = {
      url: "登录网址",
      usernameSelector: "用户名选择器",
      passwordSelector: "密码选择器",
      submitSelector: "提交按钮选择器",
      username: "用户名",
      password: "密码",
      cookieString: "Cookie",
      token: "Token"
    };

    return fieldMap[field] ?? "登录配置";
  }

  return path === "/" ? "当前配置" : path.replaceAll("/", " / ");
}

export function GenerateStep(props: GenerateStepProps) {
  const { validationIssues, generationResult, onGenerate, onOpenOutputDirectory, onGoToStep } = props;
  const deferredScript = useDeferredValue(generationResult?.scriptContent ?? "");

  return (
    <Space
      direction="vertical"
      size={20}
      style={{ width: "100%" }}
    >
      <Alert
        type="info"
        showIcon
        message="最后一步你只需要看一件事"
        description="如果上面的校验提示变成绿色，就直接点“生成脚本”。生成完成后打开输出目录，先看有没有 script.py、requirements.txt 和 .env.example。"
      />

      <Card title="生成前检查">
        {validationIssues.length > 0 ? (
          <Alert
            type="error"
            showIcon
            message={`当前还有 ${validationIssues.length} 个配置问题`}
            description={
              <List
                size="small"
                dataSource={validationIssues}
                renderItem={(item) => (
                  <List.Item>
                    <Space
                      style={{ width: "100%", justifyContent: "space-between" }}
                      wrap
                    >
                      <Space wrap>
                        <Tag>{getIssueTarget(item.path).label}</Tag>
                        <Text strong>{formatIssuePath(item.path)}</Text>
                        <Text>{item.message}</Text>
                      </Space>
                      <Button type="link" onClick={() => onGoToStep(getIssueTarget(item.path).step)}>
                        {getIssueTarget(item.path).actionLabel}
                      </Button>
                    </Space>
                  </List.Item>
                )}
              />
            }
          />
        ) : (
          <Alert
            type="success"
            showIcon
            message="配置已通过前端校验"
            description="可以直接生成脚本，输出目录下会写入 script.py、requirements.txt 和 .env.example。"
          />
        )}

        <Space style={{ marginTop: 16 }}>
          <Button
            type="primary"
            size="large"
            disabled={validationIssues.length > 0}
            onClick={onGenerate}
          >
            生成脚本
          </Button>
          <Button
            size="large"
            disabled={!generationResult}
            onClick={onOpenOutputDirectory}
          >
            打开输出目录
          </Button>
        </Space>
      </Card>

      {generationResult ? (
        <>
          <Card title="生成结果">
            <Descriptions
              bordered
              column={1}
              size="small"
            >
              <Descriptions.Item label="脚本路径">{generationResult.scriptPath}</Descriptions.Item>
              <Descriptions.Item label="依赖文件">{generationResult.requirementsPath}</Descriptions.Item>
              <Descriptions.Item label="环境变量示例">{generationResult.envExamplePath}</Descriptions.Item>
              <Descriptions.Item label="输出目录">{generationResult.outputDirectory}</Descriptions.Item>
            </Descriptions>
            <div style={{ marginTop: 16 }}>
              <Text>预计安装依赖：</Text>
              <Space
                wrap
                style={{ marginLeft: 8 }}
              >
                {generationResult.dependencyList.map((dependency) => (
                  <Tag key={dependency}>{dependency}</Tag>
                ))}
              </Space>
            </div>
          </Card>

          <Card title="脚本预览">
            <pre className="code-preview">{deferredScript}</pre>
          </Card>

          <Card title="requirements.txt 预览">
            <pre className="code-preview">{generationResult.requirementsContent}</pre>
          </Card>
        </>
      ) : (
        <Card title="脚本预览">
          <Empty description="还没有生成脚本" />
        </Card>
      )}
    </Space>
  );
}
