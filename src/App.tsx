import {
  App as AntApp,
  Button,
  Layout,
  Menu,
  Modal,
  Space,
  Typography,
  theme
} from "antd";
import { useEffect, useMemo, useState, startTransition } from "react";
import { GenerateStep } from "./components/GenerateStep";
import { GlobalSettingsStep } from "./components/GlobalSettingsStep";
import { LoginSettingsStep } from "./components/LoginSettingsStep";
import { ProxySettingsStep } from "./components/ProxySettingsStep";
import { TaskListEditor } from "./components/TaskListEditor";
import { TemplateHub } from "./components/TemplateHub";
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
  const [saveName, setSaveName] = useState("");
  const { token } = theme.useToken();

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

  const loadDocument = async (loader: () => Promise<ScriptConfig | SavedTemplateDocument | null>) => {
    const result = await loader();
    if (!result) {
      return;
    }
    startTransition(() => {
      dispatch(replaceConfig(normalizeConfig(result)));
      dispatch(setGenerationResult(null));
    });
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

  const currentStepTitle = steps[selectedStep]?.title ?? "";

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
          <Space wrap>
            <Button onClick={() => dispatch(resetConfig())}>重置配置</Button>
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
              onMetaChange={(patch) => dispatch(updateMeta(patch))}
              onGlobalChange={(patch) => dispatch(updateGlobal(patch))}
              onChooseOutputDirectory={handleChooseOutputDirectory}
            />
          ) : null}

          {selectedStep === 2 ? (
            <LoginSettingsStep
              login={config.login}
              onChange={(login) => dispatch(updateLogin(login))}
            />
          ) : null}

          {selectedStep === 3 ? (
            <ProxySettingsStep
              proxy={config.proxy}
              validationResult={proxyValidation}
              onChange={(patch) => dispatch(updateProxy(patch))}
              onValidate={handleValidateProxy}
            />
          ) : null}

          {selectedStep === 4 ? (
            <TaskListEditor
              tasks={config.tasks}
              onChange={(tasks) => dispatch(setTasks(tasks))}
            />
          ) : null}

          {selectedStep === 5 ? (
            <GenerateStep
              validationIssues={validationIssues}
              generationResult={generationResult}
              onGenerate={handleGenerateScript}
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
