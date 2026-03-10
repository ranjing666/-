import { Alert, Button, Card, Descriptions, Empty, List, Space, Tag, Typography } from "antd";
import { useDeferredValue } from "react";
import type { GenerationResult, ValidationIssue } from "../types/config";

const { Text } = Typography;

interface GenerateStepProps {
  validationIssues: ValidationIssue[];
  generationResult: GenerationResult | null;
  onGenerate: () => void;
  onOpenOutputDirectory: () => void;
}

export function GenerateStep(props: GenerateStepProps) {
  const { validationIssues, generationResult, onGenerate, onOpenOutputDirectory } = props;
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
                    <Text code>{item.path}</Text>
                    <Text>{item.message}</Text>
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
