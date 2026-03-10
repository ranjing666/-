import type {
  AppInfo,
  GenerationResult,
  ProxyValidationResult,
  SavedTemplateDocument,
  ScriptConfig,
  TemplateSummary
} from "./config";

declare global {
  interface Window {
    scriptGenerator: {
      getAppInfo: () => Promise<AppInfo>;
      listSavedConfigs: () => Promise<TemplateSummary[]>;
      loadSavedConfig: (id: string) => Promise<SavedTemplateDocument>;
      saveConfig: (payload: {
        id?: string;
        name: string;
        description?: string;
        config: ScriptConfig;
      }) => Promise<{ id: string; filePath: string }>;
      deleteConfig: (id: string) => Promise<{ success: boolean }>;
      importConfig: () => Promise<ScriptConfig | SavedTemplateDocument | null>;
      exportConfig: (config: ScriptConfig) => Promise<{ filePath: string } | null>;
      getTemplateList: () => Promise<TemplateSummary[]>;
      loadTemplate: (id: string) => Promise<SavedTemplateDocument>;
      chooseOutputDirectory: () => Promise<string | null>;
      generateScript: (payload: {
        config: ScriptConfig;
        outputDirectory: string;
      }) => Promise<GenerationResult>;
      validateProxy: (payload: {
        proxyUrl: string;
        timeoutSeconds: number;
      }) => Promise<ProxyValidationResult>;
      openPath: (targetPath: string) => Promise<string>;
    };
  }
}

export {};
