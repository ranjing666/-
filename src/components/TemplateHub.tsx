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
              <Title level={1}>把重复网页操作整理成可维护的 Python 脚本</Title>
              <Paragraph className="muted-copy">
                按向导配置登录、代理、任务步骤和输出目录，桌面端会在本地生成脚本、
                requirements 和环境变量示例文件。敏感信息只在本机处理。
              </Paragraph>
              <Space wrap>
                <Button
                  type="primary"
                  size="large"
                  onClick={onSave}
                >
                  保存当前模板
                </Button>
                <Button
                  size="large"
                  onClick={onImport}
                >
                  导入 JSON 配置
                </Button>
                <Button
                  size="large"
                  onClick={onExport}
                >
                  导出当前配置
                </Button>
                <Button
                  size="large"
                  onClick={onReset}
                >
                  新建空白配置
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
