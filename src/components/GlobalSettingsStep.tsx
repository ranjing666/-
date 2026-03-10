import { Alert, Button, Card, Col, Form, Input, InputNumber, Row, Space, Switch, Typography } from "antd";
import type { ScriptConfig } from "../types/config";

const { Paragraph, Text } = Typography;

interface GlobalSettingsStepProps {
  config: ScriptConfig;
  onMetaChange: (patch: Partial<ScriptConfig["meta"]>) => void;
  onGlobalChange: (patch: Partial<ScriptConfig["global"]>) => void;
  onChooseOutputDirectory: () => void;
}

export function GlobalSettingsStep(props: GlobalSettingsStepProps) {
  const { config, onMetaChange, onGlobalChange, onChooseOutputDirectory } = props;

  return (
    <Space
      direction="vertical"
      size={20}
      style={{ width: "100%" }}
    >
      <Alert
        type="info"
        showIcon
        message="这一步只做两件事就够了"
        description={
          <Space direction="vertical">
            <Text>1. 给这份配置起个名字，方便后面保存和区分。</Text>
            <Text>2. 确认脚本输出目录。不会选也没关系，系统已经给你准备了默认输出位置。</Text>
          </Space>
        }
      />

      <Card title="基础信息">
        <Form layout="vertical">
          <Row gutter={16}>
            <Col
              xs={24}
              md={12}
            >
              <Form.Item label="配置名称">
                <Input
                  value={config.meta.name}
                  onChange={(event) => onMetaChange({ name: event.target.value })}
                  placeholder="例如：每日签到脚本"
                />
              </Form.Item>
            </Col>
            <Col
              xs={24}
              md={12}
            >
              <Form.Item label="导出目录">
                <Input
                  value={config.global.outputDirectory}
                  readOnly
                  placeholder="请选择生成脚本输出目录"
                  addonAfter={<Button onClick={onChooseOutputDirectory}>选择目录</Button>}
                />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item label="说明">
            <Input.TextArea
              rows={3}
              value={config.meta.description}
              onChange={(event) =>
                onMetaChange({
                  description: event.target.value
                })
              }
              placeholder="记录脚本目标、站点信息和注意事项"
            />
          </Form.Item>
        </Form>
      </Card>

      <Card title="执行策略">
        <Form layout="vertical">
          <Row gutter={16}>
            <Col
              xs={24}
              md={8}
            >
              <Form.Item label="默认超时（秒）">
                <InputNumber
                  min={1}
                  max={600}
                  value={config.global.timeout}
                  onChange={(value) =>
                    onGlobalChange({
                      timeout: value || 30
                    })
                  }
                  style={{ width: "100%" }}
                />
              </Form.Item>
            </Col>
            <Col
              xs={24}
              md={8}
            >
              <Form.Item label="重试次数">
                <InputNumber
                  min={0}
                  max={20}
                  value={config.global.retryTimes}
                  onChange={(value) =>
                    onGlobalChange({
                      retryTimes: value || 0
                    })
                  }
                  style={{ width: "100%" }}
                />
              </Form.Item>
            </Col>
            <Col
              xs={24}
              md={8}
            >
              <Form.Item label="随机延迟">
                <Switch
                  checked={config.global.randomDelay}
                  onChange={(checked) => onGlobalChange({ randomDelay: checked })}
                />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item label="浏览器无头模式">
            <Switch
              checked={config.global.headless}
              onChange={(checked) => onGlobalChange({ headless: checked })}
            />
          </Form.Item>
        </Form>
        <Paragraph className="muted-copy">
          小白第一次使用建议保持默认。只有在你已经确认脚本能跑通后，再调整重试、延迟和无头模式。
        </Paragraph>
      </Card>

      <Alert
        type="warning"
        showIcon
        message="安全提示"
        description={
          <Space direction="vertical">
            <Text>私钥会转换为环境变量引用写入脚本，不会直接明文输出到生成代码。</Text>
            <Text>账号密码、Cookie 和代理认证信息默认仍保存在本地模板中，导出模板前请自行确认。</Text>
          </Space>
        }
      />
    </Space>
  );
}
