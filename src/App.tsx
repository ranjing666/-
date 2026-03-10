import {
  App as AntApp,
  Button,
  Layout,
  Menu,
  Modal,
  Segmented,
  Space,
  Typography,
  theme
} from "antd";
import { useEffect, useMemo, useState, startTransition } from "react";
import { BeginnerGuidePanel } from "./components/BeginnerGuidePanel";
import { GenerateStep } from "./components/GenerateStep";
import { GlobalSettingsStep } from "./components/GlobalSettingsStep";
import { LoginSettingsStep } from "./components/LoginSettingsStep";
import { ProxySettingsStep } from "./components/ProxySettingsStep";
import { TaskListEditor } from "./components/TaskListEditor";
import { TemplateHub } from "./components/TemplateHub";
import { createStarterConfig, StarterPreset } from "./lib/defaults";
import { UiMode, usesAdvancedLogin, usesAdvancedProxy } from "./lib/uiMode";
import {
  replaceConfig,
  resetConfig,
  setAppInfo,
  setBuiltinTemplates,
  setGenerationResult,
  setSavedConfigs,
  setSelectedStep,
  setTasks,
  updateGlobal,
  updateLogin,
  updateMeta,
  updateProxy
} from "./store/configSlice";
import { useAppDispatch, useAppSelector } from "./store";
import type { ProxyValidationResult, SavedTemplateDocument, ScriptConfig } from "./types/config";

const { Header, Sider, Content } = Layout;
const { Paragraph, Text, Title } = Typography;

function normalizeConfig(document: ScriptConfig | SavedTemplateDocument) {
  return "config" in document ? document.config : document;
}

function withDefaultOutput(config: ScriptConfig, defaultOutputPath?: string) {
  if (!defaultOutputPath || config.global.outputDirectory.trim()) {
    return config;
  }

  return {
    ...config,
    global: {
      ...config.global,
      outputDirectory: defaultOutputPath
    }
  };
}

function isLoginReady(config: ScriptConfig) {
  const login = config.login;
  if (login.method === "none") {
    return true;
  }

  if (login.method === "password") {
    return Boolean(
      login.url.trim() &&
        login.usernameSelector.trim() &&
        login.passwordSelector.trim() &&
        login.submitSelector.trim() &&
        login.username.trim() &&
        login.password.trim()
    );
  }

  if (login.method === "wallet") {
    return Boolean(login.rpcUrl.trim() && login.privateKeyEnvVar.trim());
  }

  if (login.method === "cookie") {
    return Boolean(login.url.trim() && (login.cookieString.trim() || login.token.trim()));
  }

  return false;
}

export default function App() {
  const { message } = AntApp.useApp();
  const dispatch = useAppDispatch();
  const {
    config,
    selectedStep,
    validationIssues,
    savedConfigs,
    builtinTemplates,
    generationResult,
    appInfo
  } = useAppSelector((state) => state.scriptGenerator);
  const [proxyValidation, setProxyValidation] = useState<ProxyValidationResult | null>(null);
  const [saveModalOpen, setSaveModalOpen] = useState(false);
  const [onboardingOpen, setOnboardingOpen] = useState(false);
  const [saveName, setSaveName] = useState("");
  const [uiMode, setUiMode] = useState<UiMode>(() =>
    window.localStorage.getItem("script-generator-ui-mode") === "advanced" ? "advanced" : "simple"
  );
  const { token } = theme.useToken();
  const simpleMode = uiMode === "simple";

  const steps = useMemo(
    () => [
      { key: "welcome", label: "欢迎", title: "模板与项目概览" },
      { key: "global", label: "基础设置", title: "全局执行参数" },
      { key: "login", label: "登录设置", title: "登录方式配置" },
      { key: "proxy", label: "代理设置", title: "代理与连通性" },
      { key: "tasks", label: "任务编辑", title: "操作流设计" },
      { key: "generate", label: "生成脚本", title: "预览与导出" }
    ],
    []
  );

  async function refreshTemplateLists() {
    const [saved, builtin] = await Promise.all([
      window.scriptGenerator.listSavedConfigs(),
      window.scriptGenerator.getTemplateList()
    ]);
    dispatch(setSavedConfigs(saved));
    dispatch(setBuiltinTemplates(builtin));
  }

  useEffect(() => {
    void (async () => {
      const info = await window.scriptGenerator.getAppInfo();
      dispatch(setAppInfo(info));
      await refreshTemplateLists();
    })();
  }, [dispatch]);

  useEffect(() => {
    if (!appInfo || config.global.outputDirectory.trim()) {
      return;
    }

    dispatch(
      updateGlobal({
        outputDirectory: appInfo.defaultOutputPath
      })
    );
  }, [appInfo, config.global.outputDirectory, dispatch]);

  useEffect(() => {
    if (!builtinTemplates.length) {
      return;
    }

    const onboardingSeen = window.localStorage.getItem("script-generator-onboarding-seen");
    if (!onboardingSeen) {
      setOnboardingOpen(true);
    }
  }, [builtinTemplates.length]);

  const loadDocument = async (loader: () => Promise<ScriptConfig | SavedTemplateDocument | null>) => {
    const result = await loader();
    if (!result) {
      return;
    }
    startTransition(() => {
      dispatch(replaceConfig(withDefaultOutput(normalizeConfig(result), appInfo?.defaultOutputPath)));
      dispatch(setGenerationResult(null));
    });
  };

  const closeOnboarding = () => {
    setOnboardingOpen(false);
    window.localStorage.setItem("script-generator-onboarding-seen", "1");
  };

  const switchUiMode = (mode: UiMode) => {
    setUiMode(mode);
    window.localStorage.setItem("script-generator-ui-mode", mode);
  };

  const handleStartFromExample = async () => {
    const recommendedTemplate = builtinTemplates.find((item) => item.id === "daily-checkin") ?? builtinTemplates[0];
    if (!recommendedTemplate) {
      message.warning("当前没有可用的示例模板");
      return;
    }

    await loadDocument(() => window.scriptGenerator.loadTemplate(recommendedTemplate.id));
    dispatch(setSelectedStep(1));
    closeOnboarding();
    message.success(`已载入示例模板：${recommendedTemplate.name}`);
  };

  const handleSaveConfig = async () => {
    if (!saveName.trim()) {
      message.warning("请先填写模板名称");
      return;
    }

    await window.scriptGenerator.saveConfig({
      name: saveName.trim(),
      description: config.meta.description,
      config
    });
    setSaveModalOpen(false);
    setSaveName("");
    await refreshTemplateLists();
    message.success("模板已保存到本地");
  };

  const handleImport = async () => {
    await loadDocument(() => window.scriptGenerator.importConfig());
    message.success("配置已导入");
  };

  const handleExport = async () => {
    const result = await window.scriptGenerator.exportConfig(config);
    if (result?.filePath) {
      message.success(`配置已导出到 ${result.filePath}`);
    }
  };

  const handleChooseOutputDirectory = async () => {
    const folder = await window.scriptGenerator.chooseOutputDirectory();
    if (folder) {
      dispatch(updateGlobal({ outputDirectory: folder }));
    }
  };

  const handleValidateProxy = async () => {
    const proxyUrl =
      config.proxy.mode === "single" ? config.proxy.single : config.proxy.list[0] || "";

    if (!proxyUrl) {
      message.warning("请先填写一条代理地址");
      return;
    }

    try {
      const result = await window.scriptGenerator.validateProxy({
        proxyUrl,
        timeoutSeconds: config.global.timeout
      });
      setProxyValidation(result);
      if (result.ok) {
        message.success("代理测试通过");
      } else {
        message.error(result.message);
      }
    } catch (error) {
      const text = error instanceof Error ? error.message : "代理测试失败";
      message.error(text);
      setProxyValidation({ ok: false, message: text });
    }
  };

  const handleGenerateScript = async () => {
    try {
      const result = await window.scriptGenerator.generateScript({
        config,
        outputDirectory: config.global.outputDirectory
      });
      dispatch(setGenerationResult(result));
      dispatch(setSelectedStep(5));
      message.success("脚本已生成");
    } catch (error) {
      const text = error instanceof Error ? error.message : "脚本生成失败";
      message.error(text);
    }
  };

  const handleStartFromPreset = (preset: StarterPreset) => {
    const nextConfig = withDefaultOutput(createStarterConfig(preset), appInfo?.defaultOutputPath);
    startTransition(() => {
      dispatch(replaceConfig(nextConfig));
      dispatch(setGenerationResult(null));
    });

    const nextStep = preset === "password-login" ? 2 : 4;
    dispatch(setSelectedStep(nextStep));
    message.success("已为你准备好起步模板，直接改成自己的内容就行");
  };

  const currentStepTitle = steps[selectedStep]?.title ?? "";
  const advancedModeHints = [
    simpleMode && usesAdvancedLogin(config.login) ? "当前配置用了私钥钱包登录" : null,
    simpleMode && usesAdvancedProxy(config.proxy) ? "当前配置用了代理池" : null
  ].filter(Boolean);
  const stepStatuses = [
    {
      label: "基础信息",
      done: Boolean(config.meta.name.trim() && config.global.outputDirectory.trim())
    },
    {
      label: "登录方式",
      done: isLoginReady(config)
    },
    {
      label: "任务步骤",
      done: config.tasks.length > 0
    },
    {
      label: "可以生成",
      done: validationIssues.length === 0
    }
  ];

  const beginnerGuide = [
    {
      title: "第一步不要从空白开始，先载入示例模板",
      summary: "小白最容易卡在“这一步要填什么”。示例模板能直接告诉你完整配置长什么样，再改成自己的站点更容易。",
      todo: [
        "点“一键体验示例”载入现成模板",
        "先看系统已经帮你填了哪些字段",
        "再逐步替换成你自己的网址和按钮选择器"
      ],
      tip: "如果你已经从别人那里拿到配置 JSON，就用导入，不用自己从头建。",
      primaryAction: {
        label: "一键体验示例",
        onClick: () => void handleStartFromExample()
      },
      secondaryAction: {
        label: "继续空白配置",
        onClick: () => dispatch(setSelectedStep(1))
      }
    },
    {
      title: "这一步只管名字和输出目录",
      summary: "不用急着改高级参数。先确认这份配置叫什么，脚本生成到哪里。",
      todo: [
        "确认配置名称，方便保存后区分",
        "检查输出目录，不会选也可以先用默认目录",
        "其它开关先保持默认值"
      ],
      tip: `默认输出目录已经帮你准备好了：${appInfo?.defaultOutputPath ?? "加载中..."}`,
      primaryAction: {
        label: "使用默认输出目录",
        onClick: () => {
          if (appInfo?.defaultOutputPath) {
            dispatch(updateGlobal({ outputDirectory: appInfo.defaultOutputPath }));
            message.success("已恢复到默认输出目录");
          }
        }
      },
      secondaryAction: {
        label: "打开目录选择器",
        onClick: () => void handleChooseOutputDirectory()
      }
    },
    {
      title: "登录方式不会选时，先选最简单的",
      summary: "如果你只是想先学会整个流程，可以先选“无需登录”；普通网站最常见的是“账号密码”。",
      todo: [
        "只是练手：先选无需登录",
        "账号密码站点：填登录页、输入框选择器、账号密码",
        "Cookie / 钱包只在你明确知道自己需要时再用"
      ],
      tip: "第一次不要同时研究登录方式和复杂任务，先把一个最短流程生成出来。",
      primaryAction: {
        label: "继续编辑任务",
        onClick: () => dispatch(setSelectedStep(4))
      }
    },
    {
      title: "没有代理就不要开",
      summary: "大多数第一次使用都不需要代理。把开关保持关闭，先验证功能本身能不能跑通。",
      todo: [
        "如果你没有现成代理，保持关闭",
        "只有明确知道目标站点需要换 IP 时再开启",
        "开启后先点“测试代理”看是否联通"
      ],
      tip: "代理是进阶项，不是必填项。",
      primaryAction: {
        label: "保持关闭并继续",
        onClick: () => {
          dispatch(updateProxy({ enabled: false }));
          dispatch(setSelectedStep(4));
        }
      }
    },
    {
      title: "任务编辑先做最短路径",
      summary: "不要一下子加十几个步骤。最简单的任务一般就是：打开页面、点击、等待、提取结果。",
      todo: [
        "先保留 1 到 4 个步骤",
        "优先用访问页面、点击、等待、提取",
        "条件和循环等脚本稳定后再加"
      ],
      tip: "第一次成功的关键不是功能多，而是先把一条最短流程跑通。",
      primaryAction: {
        label: "去生成脚本",
        onClick: () => dispatch(setSelectedStep(5))
      }
    },
    {
      title: "最后只看一个结果：有没有绿色通过提示",
      summary: "只要这里显示通过校验，就直接生成脚本。生成完再打开目录看成品。",
      todo: [
        "看校验问题是不是已经清零",
        "点击生成脚本",
        "打开输出目录，检查 script.py 和 requirements.txt"
      ],
      tip: "如果还有报错，不用慌，先看提示里说的是哪个字段没填。",
      primaryAction: {
        label: "立即生成脚本",
        onClick: () => void handleGenerateScript()
      }
    }
  ][selectedStep];

  return (
    <Layout className="app-shell">
      <Sider
        width={300}
        className="app-sider"
      >
        <div className="brand-block">
          <div className="brand-mark">SG</div>
          <div>
            <Title level={3}>脚本生成器</Title>
            <Paragraph className="muted-copy">
              从站点登录到任务步骤，全部在本地桌面端配置并导出。
            </Paragraph>
          </div>
        </div>

        <Menu
          mode="inline"
          selectedKeys={[steps[selectedStep]?.key]}
          items={steps.map((step, index) => ({
            key: step.key,
            label: (
              <div className="step-label">
                <span>{step.label}</span>
                <Text type="secondary">{index + 1}</Text>
              </div>
            ),
            onClick: () => dispatch(setSelectedStep(index))
          }))}
        />

        <div className="sider-footer">
          <Text type="secondary">本地配置校验</Text>
          <Title level={4}>{validationIssues.length} 个待处理问题</Title>
          <Paragraph className="muted-copy">
            {appInfo ? `用户数据目录：${appInfo.userDataPath}` : "正在加载应用信息..."}
          </Paragraph>
        </div>
      </Sider>

      <Layout>
        <Header className="app-header">
          <div>
            <Text className="eyebrow">当前步骤</Text>
            <Title
              level={2}
              style={{ margin: 0, color: token.colorTextHeading }}
            >
              {currentStepTitle}
            </Title>
          </div>
          <Space wrap align="start">
            <Space
              direction="vertical"
              size={4}
              className="mode-switch-group"
            >
              <Text className="eyebrow">界面模式</Text>
              <Segmented
                value={uiMode}
                onChange={(value) => switchUiMode(value as UiMode)}
                options={[
                  { label: "超简模式", value: "simple" },
                  { label: "专业模式", value: "advanced" }
                ]}
              />
              <Text type="secondary" className="mode-summary">
                {simpleMode ? "只显示最常用入口，适合第一次使用" : "显示全部配置项，适合精细调整"}
              </Text>
            </Space>
            <Button
              onClick={() => {
                dispatch(resetConfig());
                dispatch(setGenerationResult(null));
                setProxyValidation(null);
              }}
            >
              重置配置
            </Button>
            <Button
              onClick={() => {
                setSaveName(config.meta.name);
                setSaveModalOpen(true);
              }}
            >
              保存模板
            </Button>
            <Button onClick={handleImport}>导入</Button>
            <Button onClick={handleExport}>导出</Button>
          </Space>
        </Header>

        <Content className="app-content">
          {advancedModeHints.length > 0 ? (
            <div className="mode-hint-banner">
              <Text strong>当前仍有专业配置：</Text>
              <Text type="secondary">{advancedModeHints.join("，")}。如果要继续编辑这些内容，请切到专业模式。</Text>
            </div>
          ) : null}

          <BeginnerGuidePanel
            title={beginnerGuide.title}
            summary={beginnerGuide.summary}
            todo={beginnerGuide.todo}
            tip={beginnerGuide.tip}
            statuses={stepStatuses}
            primaryAction={beginnerGuide.primaryAction}
            secondaryAction={beginnerGuide.secondaryAction}
          />

          {selectedStep === 0 ? (
            <TemplateHub
              config={config}
              savedConfigs={savedConfigs}
              builtinTemplates={builtinTemplates}
              onReset={() => dispatch(resetConfig())}
              onImport={handleImport}
              onExport={handleExport}
              onSave={() => {
                setSaveName(config.meta.name);
                setSaveModalOpen(true);
              }}
              onStartFromExample={() => void handleStartFromExample()}
              onStartFromPreset={handleStartFromPreset}
              onContinueBlank={() => dispatch(setSelectedStep(1))}
              onLoadSaved={(id) =>
                void loadDocument(() => window.scriptGenerator.loadSavedConfig(id))
              }
              onLoadBuiltin={(id) =>
                void loadDocument(() => window.scriptGenerator.loadTemplate(id))
              }
            />
          ) : null}

          {selectedStep === 1 ? (
            <GlobalSettingsStep
              config={config}
              simpleMode={simpleMode}
              onSwitchToAdvanced={() => switchUiMode("advanced")}
              onMetaChange={(patch) => dispatch(updateMeta(patch))}
              onGlobalChange={(patch) => dispatch(updateGlobal(patch))}
              onChooseOutputDirectory={handleChooseOutputDirectory}
            />
          ) : null}

          {selectedStep === 2 ? (
            <LoginSettingsStep
              login={config.login}
              simpleMode={simpleMode}
              onSwitchToAdvanced={() => switchUiMode("advanced")}
              onChange={(login) => dispatch(updateLogin(login))}
            />
          ) : null}

          {selectedStep === 3 ? (
            <ProxySettingsStep
              proxy={config.proxy}
              validationResult={proxyValidation}
              simpleMode={simpleMode}
              onSwitchToAdvanced={() => switchUiMode("advanced")}
              onChange={(patch) => dispatch(updateProxy(patch))}
              onValidate={handleValidateProxy}
            />
          ) : null}

          {selectedStep === 4 ? (
            <TaskListEditor
              tasks={config.tasks}
              simpleMode={simpleMode}
              onSwitchToAdvanced={() => switchUiMode("advanced")}
              onChange={(tasks) => dispatch(setTasks(tasks))}
            />
          ) : null}

          {selectedStep === 5 ? (
            <GenerateStep
              validationIssues={validationIssues}
              generationResult={generationResult}
              onGenerate={handleGenerateScript}
              onGoToStep={(step) => dispatch(setSelectedStep(step))}
              onOpenOutputDirectory={() => {
                if (generationResult) {
                  void window.scriptGenerator.openPath(generationResult.outputDirectory);
                }
              }}
            />
          ) : null}
        </Content>

        <div className="bottom-bar">
          <Button
            disabled={selectedStep === 0}
            onClick={() => dispatch(setSelectedStep(selectedStep - 1))}
          >
            上一步
          </Button>
          <Space>
            <Text type="secondary">
              {validationIssues.length > 0 ? `仍有 ${validationIssues.length} 个校验问题` : "配置可生成"}
            </Text>
            <Button
              type="primary"
              disabled={selectedStep === steps.length - 1}
              onClick={() => dispatch(setSelectedStep(selectedStep + 1))}
            >
              下一步
            </Button>
          </Space>
        </div>
      </Layout>

      <Modal
        width={720}
        title="第一次使用建议先这样做"
        open={onboardingOpen}
        onCancel={closeOnboarding}
        footer={null}
      >
        <Space
          direction="vertical"
          size={16}
          style={{ width: "100%" }}
        >
          <Paragraph className="muted-copy" style={{ marginBottom: 0 }}>
            你现在不需要理解全部功能。先用一个示例模板走通“载入、看配置、生成脚本”这条路径，
            成功一次之后再改成自己的站点。
          </Paragraph>
          <div className="onboarding-list">
            <div className="onboarding-item">
              <span className="guide-number">1</span>
              <Text>载入示例模板，不要从空白开始。</Text>
            </div>
            <div className="onboarding-item">
              <span className="guide-number">2</span>
              <Text>先保持默认参数，只改网址、登录和任务。</Text>
            </div>
            <div className="onboarding-item">
              <span className="guide-number">3</span>
              <Text>看到绿色通过后，直接生成脚本。</Text>
            </div>
          </div>
          <Space wrap>
            <Button type="primary" onClick={() => void handleStartFromExample()}>
              立即载入示例
            </Button>
            <Button
              onClick={() => {
                closeOnboarding();
                void handleImport();
              }}
            >
              导入现成配置
            </Button>
            <Button
              onClick={() => {
                closeOnboarding();
                dispatch(setSelectedStep(1));
              }}
            >
              我想从空白开始
            </Button>
          </Space>
        </Space>
      </Modal>

      <Modal
        title="保存当前模板"
        open={saveModalOpen}
        onCancel={() => setSaveModalOpen(false)}
        onOk={() => void handleSaveConfig()}
      >
        <Space
          direction="vertical"
          style={{ width: "100%" }}
        >
          <Text>模板名称</Text>
          <input
            className="inline-input"
            value={saveName}
            onChange={(event) => setSaveName(event.target.value)}
            placeholder="例如：交易所每日签到"
          />
        </Space>
      </Modal>
    </Layout>
  );
}
