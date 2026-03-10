import { Alert, Button, Card, Form, Input, Radio, Select, Space, Switch, Tag, Typography } from "antd";
import type { ProxyConfig, ProxyValidationResult } from "../types/config";

const { Paragraph, Text } = Typography;

interface ProxySettingsStepProps {
  proxy: ProxyConfig;
  validationResult: ProxyValidationResult | null;
  simpleMode: boolean;
  onSwitchToAdvanced: () => void;
  onChange: (patch: Partial<ProxyConfig>) => void;
  onValidate: () => void;
}

export function ProxySettingsStep(props: ProxySettingsStepProps) {
  const { proxy, validationResult, simpleMode, onSwitchToAdvanced, onChange, onValidate } = props;

  return (
    <Space
      direction="vertical"
      size={20}
      style={{ width: "100%" }}
    >
      <Alert
        type="info"
        showIcon
        message="没有代理就保持关闭"
        description="大部分新手第一次用这个工具时，不需要开代理。只有目标网站限制 IP、或者你明确知道自己需要换出口时，再来配置这里。"
      />

      <Card title="代理总开关">
        <Space
          direction="vertical"
          size={16}
          style={{ width: "100%" }}
        >
          <Switch
            checked={proxy.enabled}
            onChange={(checked) => onChange({ enabled: checked })}
          />
          <Paragraph className="muted-copy">
            可用于站点风控绕过、多账号隔离或 API 请求出口切换。HTTP、HTTPS 与 SOCKS5 都支持。
          </Paragraph>
        </Space>
      </Card>

      {simpleMode ? (
        <Card title="代理设置">
          <Form layout="vertical">
            <Form.Item label="代理协议">
              <Select
                value={proxy.type}
                disabled={!proxy.enabled}
                onChange={(value) => onChange({ type: value })}
                options={[
                  { label: "HTTP", value: "http" },
                  { label: "HTTPS", value: "https" },
                  { label: "SOCKS5", value: "socks5" }
                ]}
              />
            </Form.Item>

            {proxy.mode === "list" ? (
              <Alert
                type="warning"
                showIcon
                message="当前配置正在使用代理池"
                description={
                  <Space direction="vertical">
                    <Text>超简模式只编辑单个代理地址。代理轮换和代理池管理已折叠到专业模式。</Text>
                    <Space wrap>
                      <Tag color="blue">当前代理池 {proxy.list.length} 条</Tag>
                      <Button onClick={onSwitchToAdvanced}>切到专业模式</Button>
                    </Space>
                  </Space>
                }
              />
            ) : (
              <Form.Item label="代理地址">
                <Input
                  value={proxy.single}
                  disabled={!proxy.enabled}
                  onChange={(event) => onChange({ single: event.target.value })}
                  placeholder="http://user:pass@127.0.0.1:7890"
                />
              </Form.Item>
            )}

            <Space wrap>
              <Button
                type="primary"
                disabled={!proxy.enabled}
                onClick={onValidate}
              >
                测试代理
              </Button>
            </Space>
          </Form>
        </Card>
      ) : (
        <Card title="代理模式">
          <Form layout="vertical">
            <Form.Item label="代理协议">
              <Select
                value={proxy.type}
                disabled={!proxy.enabled}
                onChange={(value) => onChange({ type: value })}
                options={[
                  { label: "HTTP", value: "http" },
                  { label: "HTTPS", value: "https" },
                  { label: "SOCKS5", value: "socks5" }
                ]}
              />
            </Form.Item>
            <Form.Item label="代理来源">
              <Radio.Group
                value={proxy.mode}
                disabled={!proxy.enabled}
                onChange={(event) =>
                  onChange({
                    mode: event.target.value
                  })
                }
              >
                <Radio.Button value="single">单个代理</Radio.Button>
                <Radio.Button value="list">代理池</Radio.Button>
              </Radio.Group>
            </Form.Item>

            {proxy.mode === "single" ? (
              <Form.Item label="代理地址">
                <Input
                  value={proxy.single}
                  disabled={!proxy.enabled}
                  onChange={(event) => onChange({ single: event.target.value })}
                  placeholder="http://user:pass@127.0.0.1:7890"
                />
              </Form.Item>
            ) : (
              <Form.Item label="代理列表">
                <Input.TextArea
                  rows={6}
                  disabled={!proxy.enabled}
                  value={proxy.list.join("\n")}
                  onChange={(event) =>
                    onChange({
                      list: event.target.value
                        .split(/\r?\n/)
                        .map((line) => line.trim())
                        .filter(Boolean)
                    })
                  }
                  placeholder={"http://user:pass@1.1.1.1:8000\nhttp://2.2.2.2:9000"}
                />
              </Form.Item>
            )}

            <Form.Item label="轮换策略">
              <Select
                value={proxy.rotation}
                disabled={!proxy.enabled || proxy.mode !== "list"}
                onChange={(value) => onChange({ rotation: value })}
                options={[
                  { label: "顺序轮询", value: "sequential" },
                  { label: "随机选择", value: "random" },
                  { label: "每次请求切换", value: "per_request" }
                ]}
              />
            </Form.Item>

            <Space wrap>
              <Button
                type="primary"
                disabled={!proxy.enabled}
                onClick={onValidate}
              >
                测试代理
              </Button>
              {proxy.mode === "list" && proxy.enabled ? (
                <Tag color="blue">当前代理池 {proxy.list.length} 条</Tag>
              ) : null}
            </Space>
          </Form>
        </Card>
      )}

      {validationResult ? (
        <Alert
          type={validationResult.ok ? "success" : "error"}
          showIcon
          message={validationResult.ok ? "代理连通性正常" : "代理测试失败"}
          description={
            <>
              <div>{validationResult.message}</div>
              {validationResult.elapsedMs ? <Text>耗时：{validationResult.elapsedMs} ms</Text> : null}
            </>
          }
        />
      ) : null}

      <Card title="使用建议">
        <Space
          direction="vertical"
          size={8}
        >
          <Text>第一次跑通脚本前，建议不要加代理，先把流程走通。</Text>
          <Text>代理池模式更适合批量账号或请求频繁的任务。</Text>
          <Text>如果网站同时需要浏览器与接口请求，生成脚本会把同一代理同时配置给 Playwright 与 requests。</Text>
        </Space>
      </Card>
    </Space>
  );
}
