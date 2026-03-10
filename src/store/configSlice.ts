import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { createDefaultConfig } from "../lib/defaults";
import { validateConfig } from "../lib/schema";
import type {
  AppInfo,
  GenerationResult,
  ScriptConfig,
  TaskItem,
  TemplateSummary,
  ValidationIssue
} from "../types/config";

export interface ScriptGeneratorState {
  config: ScriptConfig;
  selectedStep: number;
  validationIssues: ValidationIssue[];
  savedConfigs: TemplateSummary[];
  builtinTemplates: TemplateSummary[];
  generationResult: GenerationResult | null;
  appInfo: AppInfo | null;
}

const initialConfig = createDefaultConfig();

const initialState: ScriptGeneratorState = {
  config: initialConfig,
  selectedStep: 0,
  validationIssues: validateConfig(initialConfig),
  savedConfigs: [],
  builtinTemplates: [],
  generationResult: null,
  appInfo: null
};

function refreshValidation(state: ScriptGeneratorState) {
  state.validationIssues = validateConfig(state.config);
}

export const configSlice = createSlice({
  name: "scriptGenerator",
  initialState,
  reducers: {
    replaceConfig(state, action: PayloadAction<ScriptConfig>) {
      state.config = action.payload;
      refreshValidation(state);
    },
    updateMeta(
      state,
      action: PayloadAction<Partial<ScriptConfig["meta"]>>
    ) {
      state.config.meta = {
        ...state.config.meta,
        ...action.payload
      };
      refreshValidation(state);
    },
    updateGlobal(
      state,
      action: PayloadAction<Partial<ScriptConfig["global"]>>
    ) {
      state.config.global = {
        ...state.config.global,
        ...action.payload
      };
      refreshValidation(state);
    },
    updateLogin(state, action: PayloadAction<ScriptConfig["login"]>) {
      state.config.login = action.payload;
      refreshValidation(state);
    },
    updateProxy(
      state,
      action: PayloadAction<Partial<ScriptConfig["proxy"]>>
    ) {
      state.config.proxy = {
        ...state.config.proxy,
        ...action.payload
      };
      refreshValidation(state);
    },
    setTasks(state, action: PayloadAction<TaskItem[]>) {
      state.config.tasks = action.payload;
      refreshValidation(state);
    },
    resetConfig(state) {
      state.config = createDefaultConfig();
      state.generationResult = null;
      state.selectedStep = 0;
      refreshValidation(state);
    },
    setSelectedStep(state, action: PayloadAction<number>) {
      state.selectedStep = action.payload;
    },
    setSavedConfigs(state, action: PayloadAction<TemplateSummary[]>) {
      state.savedConfigs = action.payload;
    },
    setBuiltinTemplates(state, action: PayloadAction<TemplateSummary[]>) {
      state.builtinTemplates = action.payload;
    },
    setGenerationResult(
      state,
      action: PayloadAction<GenerationResult | null>
    ) {
      state.generationResult = action.payload;
    },
    setAppInfo(state, action: PayloadAction<AppInfo>) {
      state.appInfo = action.payload;
    }
  }
});

export const {
  replaceConfig,
  updateMeta,
  updateGlobal,
  updateLogin,
  updateProxy,
  setTasks,
  resetConfig,
  setSelectedStep,
  setSavedConfigs,
  setBuiltinTemplates,
  setGenerationResult,
  setAppInfo
} = configSlice.actions;

export default configSlice.reducer;
