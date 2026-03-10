import { Button, Card, Col, Empty, List, Row, Space, Statistic, Tag, Typography } from "antd";
import type { ScriptConfig, TemplateSummary } from "../types/config";

const { Paragraph, Text, Title } = Typography;

interface TemplateHubProps {
  config: ScriptConfig;
  savedConfigs: TemplateSummary[];
  builtinTemplates: TemplateSummary[];
  onReset: () => void;
  onImport: () => void;
  onExport: () => void;
  onSave: () => void;
  onStartFromExample: () => void;
  onContinueBlank: () => void;
  onLoadSaved: (id: string) => void;
  onLoadBuiltin: (id: string) => void;
}

export function TemplateHub(props: TemplateHubProps) {
  const {
    config,
    savedConfigs,
    builtinTemplates,
    onReset,
    onImport,
    onExport,
    onSave,
    onStartFromExample,
    onContinueBlank,
    onLoadSaved,
    onLoadBuiltin
  } = props;

  return (
    <Space
      direction="vertical"
      size={20}
      style={{ width: "100%" }}
    >
      <Card className="hero-card">
        <Row gutter={[24, 24]}>
          <Col
            xs={24}
            lg={14}
          >
            <Space
              direction="vertical"
              size={12}
            >
              <Tag className="accent-tag">MVP 工作台</Tag>
              <Title level={1}>第一次用，先从示例模板开始，不要从空白页硬填</Title>
              <Paragraph className="muted-copy">
                这个工具的正确打开方式不是一上来就自己写任务，而是先载入一个示例，
                看一遍每一步怎么填，再改成你的站点。桌面端会在本地生成脚本、requirements
                和环境变量示例文件。
              </Paragraph>
              <Space wrap>
                <Button
                  type="primary"
                  size="large"
                  onClick={onStartFromExample}
                >
                  一键体验示例
                </Button>
                <Button
                  size="large"
                  onClick={onContinueBlank}
                >
                  从空白开始
                </Button>
                <Button
                  size="large"
                  onClick={onImport}
                >
                  导入别人给的配置
                </Button>
                <Button
                  size="large"
                  onClick={onSave}
                >
                  保存当前模板
                </Button>
              </Space>
            </Space>
          </Col>
          <Col
            xs={24}
            lg={10}
          >
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <Card className="metric-card">
                  <Statistic
                    title="当前任务数"
                    value={config.tasks.length}
                  />
                </Card>
              </Col>
              <Col span={12}>
                <Card className="metric-card">
                  <Statistic
                    title="登录方式"
                    value={config.login.method === "none" ? "未启用" : config.login.method}
                  />
                </Card>
              </Col>
              <Col span={24}>
                <Card className="metric-card">
                  <Statistic
                    title="导出目录"
                    value={config.global.outputDirectory || "尚未选择"}
                  />
                </Card>
              </Col>
            </Row>
          </Col>
        </Row>
      </Card>

      <Row gutter={[20, 20]}>
        <Col span={24}>
          <Card title="推荐流程">
            <Row gutter={[16, 16]}>
              <Col
                xs={24}
                md={8}
              >
                <Card className="quickstart-card">
                  <Tag color="volcano">步骤 1</Tag>
                  <Title level={4}>先载入示例</Title>
                  <Paragraph className="muted-copy">
                    适合第一次使用。先看系统给你的成品长什么样，再去改自己的网站信息。
                  </Paragraph>
                  <Button type="primary" onClick={onStartFromExample}>
                    载入推荐示例
                  </Button>
                </Card>
              </Col>
              <Col
                xs={24}
                md={8}
              >
                <Card className="quickstart-card">
                  <Tag color="gold">步骤 2</Tag>
                  <Title level={4}>改 3 个地方</Title>
                  <Paragraph className="muted-copy">
                    登录信息、任务步骤、输出目录。其余设置先保持默认，能跑起来更重要。
                  </Paragraph>
                </Card>
              </Col>
              <Col
                xs={24}
                md={8}
              >
                <Card className="quickstart-card">
                  <Tag color="green">步骤 3</Tag>
                  <Title level={4}>生成脚本</Title>
                  <Paragraph className="muted-copy">
                    看到“0 个问题”后点生成脚本，再去输出目录运行。
                  </Paragraph>
                </Card>
              </Col>
            </Row>
          </Card>
        </Col>
        <Col
          xs={24}
          xl={12}
        >
          <Card
            title="本地保存的模板"
            extra={<Text type="secondary">{savedConfigs.length} 个</Text>}
          >
            {savedConfigs.length === 0 ? (
              <Empty description="还没有保存的模板" />
            ) : (
              <List
                itemLayout="horizontal"
                dataSource={savedConfigs}
                renderItem={(item) => (
                  <List.Item
                    actions={[
                      <Button
                        key="load"
                        type="link"
                        onClick={() => onLoadSaved(item.id)}
                      >
                        加载
                      </Button>
                    ]}
                  >
                    <List.Item.Meta
                      title={item.name}
                      description={item.description || "未填写模板说明"}
                    />
                  </List.Item>
                )}
              />
            )}
          </Card>
        </Col>
        <Col
          xs={24}
          xl={12}
        >
          <Card
            title="内置模板"
            extra={<Text type="secondary">{builtinTemplates.length} 个</Text>}
          >
            {builtinTemplates.length === 0 ? (
              <Empty description="没有内置模板" />
            ) : (
              <List
                itemLayout="horizontal"
                dataSource={builtinTemplates}
                renderItem={(item) => (
                  <List.Item
                    actions={[
                      <Button
                        key="apply"
                        type="link"
                        onClick={() => onLoadBuiltin(item.id)}
                      >
                        一键载入
                      </Button>
                    ]}
                  >
                    <List.Item.Meta
                      title={item.name}
                      description={item.description || "预置任务模板"}
                    />
                  </List.Item>
                )}
              />
            )}
          </Card>
        </Col>
      </Row>
    </Space>
  );
}
