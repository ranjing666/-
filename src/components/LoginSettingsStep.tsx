import { Alert, Card, Col, Form, Input, InputNumber, Row, Segmented, Select, Space, Typography } from "antd";
import { createLoginConfig } from "../lib/defaults";
import type { LoginConfig } from "../types/config";

const { Paragraph, Text } = Typography;

interface LoginSettingsStepProps {
  login: LoginConfig;
  onChange: (login: LoginConfig) => void;
}

export function LoginSettingsStep(props: LoginSettingsStepProps) {
  const { login, onChange } = props;

  const setMethod = (method: LoginConfig["method"]) => {
    if (method === login.method) {
      return;
    }
    onChange(createLoginConfig(method));
  };

  return (
    <Space
      direction="vertical"
      size={20}
      style={{ width: "100%" }}
    >
      <Alert
        type="info"
        showIcon
        message="如果你只是第一次体验，先别纠结登录方式"
        description={
          <Space direction="vertical">
            <Text>只想先学会怎么生成脚本：可以先选“无需登录”。</Text>
            <Text>网站是普通账号密码登录：就选“账号密码”。</Text>
            <Text>已经抓到 Cookie / Token：优先选“Cookie / Token”。</Text>
          </Space>
        }
      />

      <Card title="选择登录方式">
        <Segmented
          value={login.method}
          onChange={(value) => setMethod(value as LoginConfig["method"])}
          options={[
            { label: "无需登录", value: "none" },
            { label: "账号密码", value: "password" },
            { label: "私钥钱包", value: "wallet" },
            { label: "Cookie / Token", value: "cookie" }
          ]}
        />
      </Card>

      {login.method === "none" ? (
        <Alert
          type="info"
          showIcon
          message="当前配置不包含登录步骤"
          description="适合公开页面采集、直接 API 请求或已在任务里自行处理鉴权的场景。"
        />
      ) : null}

      {login.method === "password" ? (
        <Card title="账号密码登录">
          <Form layout="vertical">
            <Row gutter={16}>
              <Col
                xs={24}
                md={12}
              >
                <Form.Item label="登录页面 URL">
                  <Input
                    value={login.url}
                    onChange={(event) =>
                      onChange({
                        ...login,
                        url: event.target.value
                      })
                    }
                    placeholder="https://example.com/login"
                  />
                </Form.Item>
              </Col>
              <Col
                xs={24}
                md={12}
              >
                <Form.Item label="成功状态选择器">
                  <Input
                    value={login.successSelector}
                    onChange={(event) =>
                      onChange({
                        ...login,
                        successSelector: event.target.value
                      })
                    }
                    placeholder=".dashboard, [data-testid='user-menu']"
                  />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col
                xs={24}
                md={8}
              >
                <Form.Item label="用户名字段选择器">
                  <Input
                    value={login.usernameSelector}
                    onChange={(event) =>
                      onChange({
                        ...login,
                        usernameSelector: event.target.value
                      })
                    }
                  />
                </Form.Item>
              </Col>
              <Col
                xs={24}
                md={8}
              >
                <Form.Item label="密码字段选择器">
                  <Input
                    value={login.passwordSelector}
                    onChange={(event) =>
                      onChange({
                        ...login,
                        passwordSelector: event.target.value
                      })
                    }
                  />
                </Form.Item>
              </Col>
              <Col
                xs={24}
                md={8}
              >
                <Form.Item label="提交按钮选择器">
                  <Input
                    value={login.submitSelector}
                    onChange={(event) =>
                      onChange({
                        ...login,
                        submitSelector: event.target.value
                      })
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
                <Form.Item label="用户名">
                  <Input
                    value={login.username}
                    onChange={(event) =>
                      onChange({
                        ...login,
                        username: event.target.value
                      })
                    }
                  />
                </Form.Item>
              </Col>
              <Col
                xs={24}
                md={12}
              >
                <Form.Item label="密码">
                  <Input.Password
                    value={login.password}
                    onChange={(event) =>
                      onChange({
                        ...login,
                        password: event.target.value
                      })
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
                <Form.Item label="验证码模式">
                  <Select
                    value={login.captchaMode}
                    onChange={(value) =>
                      onChange({
                        ...login,
                        captchaMode: value
                      })
                    }
                    options={[
                      { label: "手动输入", value: "manual" },
                      { label: "OCR 占位", value: "ocr" }
                    ]}
                  />
                </Form.Item>
              </Col>
              <Col
                xs={24}
                md={12}
              >
                <Form.Item label="验证码选择器">
                  <Input
                    value={login.captchaSelector}
                    onChange={(event) =>
                      onChange({
                        ...login,
                        captchaSelector: event.target.value,
                        captchaEnabled: Boolean(event.target.value.trim())
                      })
                    }
                    placeholder="有验证码时再填写"
                  />
                </Form.Item>
              </Col>
            </Row>
          </Form>
        </Card>
      ) : null}

      {login.method === "wallet" ? (
        <Card title="私钥钱包登录">
          <Form layout="vertical">
            <Row gutter={16}>
              <Col
                xs={24}
                md={12}
              >
                <Form.Item label="目标页面 URL">
                  <Input
                    value={login.loginUrl}
                    onChange={(event) =>
                      onChange({
                        ...login,
                        loginUrl: event.target.value
                      })
                    }
                    placeholder="https://app.example.com"
                  />
                </Form.Item>
              </Col>
              <Col
                xs={24}
                md={12}
              >
                <Form.Item label="RPC URL">
                  <Input
                    value={login.rpcUrl}
                    onChange={(event) =>
                      onChange({
                        ...login,
                        rpcUrl: event.target.value
                      })
                    }
                    placeholder="https://mainnet.infura.io/v3/..."
                  />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col
                xs={24}
                md={8}
              >
                <Form.Item label="链 ID">
                  <InputNumber
                    min={1}
                    value={login.chainId}
                    onChange={(value) =>
                      onChange({
                        ...login,
                        chainId: value || 1
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
                <Form.Item label="签名类型">
                  <Select
                    value={login.signatureType}
                    onChange={(value) =>
                      onChange({
                        ...login,
                        signatureType: value
                      })
                    }
                    options={[
                      { label: "消息签名", value: "sign_message" },
                      { label: "发送交易", value: "send_transaction" }
                    ]}
                  />
                </Form.Item>
              </Col>
              <Col
                xs={24}
                md={8}
              >
                <Form.Item label="私钥环境变量名">
                  <Input
                    value={login.privateKeyEnvVar}
                    onChange={(event) =>
                      onChange({
                        ...login,
                        privateKeyEnvVar: event.target.value
                      })
                    }
                  />
                </Form.Item>
              </Col>
            </Row>
            <Form.Item label="消息签名内容">
              <Input.TextArea
                rows={3}
                value={login.message}
                onChange={(event) =>
                  onChange({
                    ...login,
                    message: event.target.value
                  })
                }
                placeholder="Please sign to continue"
              />
            </Form.Item>
            <Row gutter={16}>
              <Col
                xs={24}
                md={8}
              >
                <Form.Item label="合约地址">
                  <Input
                    value={login.contractAddress}
                    onChange={(event) =>
                      onChange({
                        ...login,
                        contractAddress: event.target.value
                      })
                    }
                  />
                </Form.Item>
              </Col>
              <Col
                xs={24}
                md={8}
              >
                <Form.Item label="交易目标地址">
                  <Input
                    value={login.toAddress}
                    onChange={(event) =>
                      onChange({
                        ...login,
                        toAddress: event.target.value
                      })
                    }
                  />
                </Form.Item>
              </Col>
              <Col
                xs={24}
                md={8}
              >
                <Form.Item label="交易金额（ETH）">
                  <Input
                    value={login.value}
                    onChange={(event) =>
                      onChange({
                        ...login,
                        value: event.target.value
                      })
                    }
                  />
                </Form.Item>
              </Col>
            </Row>
            <Form.Item label="交易 Data">
              <Input.TextArea
                rows={3}
                value={login.data}
                onChange={(event) =>
                  onChange({
                    ...login,
                    data: event.target.value
                  })
                }
              />
            </Form.Item>
          </Form>
          <Alert
            type="warning"
            showIcon
            message="私钥不会写入生成脚本"
            description={`生成代码会使用 os.getenv("${login.privateKeyEnvVar}") 读取私钥，请在运行脚本前手动设置环境变量。`}
          />
        </Card>
      ) : null}

      {login.method === "cookie" ? (
        <Card title="Cookie / Token 注入">
          <Form layout="vertical">
            <Row gutter={16}>
              <Col
                xs={24}
                md={12}
              >
                <Form.Item label="目标页面 URL">
                  <Input
                    value={login.url}
                    onChange={(event) =>
                      onChange({
                        ...login,
                        url: event.target.value
                      })
                    }
                    placeholder="https://example.com/dashboard"
                  />
                </Form.Item>
              </Col>
              <Col
                xs={24}
                md={12}
              >
                <Form.Item label="注入方式">
                  <Select
                    value={login.injectionMode}
                    onChange={(value) =>
                      onChange({
                        ...login,
                        injectionMode: value
                      })
                    }
                    options={[
                      { label: "浏览器 Cookie", value: "cookie" },
                      { label: "HTTP Header", value: "header" }
                    ]}
                  />
                </Form.Item>
              </Col>
            </Row>
            <Form.Item label="Cookie 字符串">
              <Input.TextArea
                rows={4}
                value={login.cookieString}
                onChange={(event) =>
                  onChange({
                    ...login,
                    cookieString: event.target.value
                  })
                }
                placeholder="sessionid=abc; csrftoken=def"
              />
            </Form.Item>
            <Row gutter={16}>
              <Col
                xs={24}
                md={8}
              >
                <Form.Item label="Header 名称">
                  <Input
                    value={login.headerName}
                    onChange={(event) =>
                      onChange({
                        ...login,
                        headerName: event.target.value
                      })
                    }
                  />
                </Form.Item>
              </Col>
              <Col
                xs={24}
                md={16}
              >
                <Form.Item label="Token">
                  <Input.Password
                    value={login.token}
                    onChange={(event) =>
                      onChange({
                        ...login,
                        token: event.target.value
                      })
                    }
                  />
                </Form.Item>
              </Col>
            </Row>
          </Form>
          <Paragraph className="muted-copy">
            如果要同时驱动浏览器和 API 请求，推荐使用 Cookie 注入；如果只打接口，Header 更直接。
          </Paragraph>
        </Card>
      ) : null}

      <Card title="设计建议">
        <Space
          direction="vertical"
          size={8}
        >
          <Text>账号密码方式最适合新手，因为页面行为最好理解，也最容易调试。</Text>
          <Text>钱包场景目前以签名/交易脚手架为主，不建议第一次就拿它练手。</Text>
          <Text>Cookie / Token 适合已有会话或手工抓包后快速复现。</Text>
        </Space>
      </Card>
    </Space>
  );
}
