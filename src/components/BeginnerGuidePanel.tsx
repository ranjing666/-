import { Alert, Button, Card, Col, Progress, Row, Space, Tag, Typography } from "antd";

const { Paragraph, Text, Title } = Typography;

export interface BeginnerGuideStep {
  title: string;
  summary: string;
  todo: string[];
  tip: string;
}

export interface BeginnerGuideStatus {
  label: string;
  done: boolean;
}

interface BeginnerGuidePanelProps {
  title: string;
  summary: string;
  todo: string[];
  tip: string;
  statuses: BeginnerGuideStatus[];
  primaryAction?: {
    label: string;
    onClick: () => void;
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
}

export function BeginnerGuidePanel(props: BeginnerGuidePanelProps) {
  const { title, summary, todo, tip, statuses, primaryAction, secondaryAction } = props;
  const completedCount = statuses.filter((item) => item.done).length;
  const percent = Math.round((completedCount / statuses.length) * 100);

  return (
    <Row gutter={[20, 20]}>
      <Col
        xs={24}
        xl={16}
      >
        <Card className="guide-card">
          <Space
            direction="vertical"
            size={14}
            style={{ width: "100%" }}
          >
            <Tag className="accent-tag">新手引导</Tag>
            <Title level={3} style={{ margin: 0 }}>
              {title}
            </Title>
            <Paragraph className="muted-copy" style={{ marginBottom: 0 }}>
              {summary}
            </Paragraph>
            <Space
              direction="vertical"
              size={8}
            >
              {todo.map((item, index) => (
                <div key={item} className="guide-item">
                  <span className="guide-number">{index + 1}</span>
                  <Text>{item}</Text>
                </div>
              ))}
            </Space>
            <Alert
              showIcon
              type="info"
              message="不会填也没关系"
              description={tip}
            />
            {primaryAction || secondaryAction ? (
              <Space wrap>
                {primaryAction ? (
                  <Button type="primary" onClick={primaryAction.onClick}>
                    {primaryAction.label}
                  </Button>
                ) : null}
                {secondaryAction ? (
                  <Button onClick={secondaryAction.onClick}>{secondaryAction.label}</Button>
                ) : null}
              </Space>
            ) : null}
          </Space>
        </Card>
      </Col>
      <Col
        xs={24}
        xl={8}
      >
        <Card className="guide-progress-card" title="完成进度">
          <Space
            direction="vertical"
            size={14}
            style={{ width: "100%" }}
          >
            <Progress
              percent={percent}
              strokeColor="#a14f34"
            />
            <Space
              direction="vertical"
              size={10}
              style={{ width: "100%" }}
            >
              {statuses.map((item) => (
                <div key={item.label} className="status-row">
                  <Text>{item.label}</Text>
                  <Tag color={item.done ? "green" : "default"}>
                    {item.done ? "已完成" : "未完成"}
                  </Tag>
                </div>
              ))}
            </Space>
          </Space>
        </Card>
      </Col>
    </Row>
  );
}
