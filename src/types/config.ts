export type WaitUntil = "load" | "domcontentloaded" | "networkidle";
export type ProxyType = "http" | "https" | "socks5";
export type ProxyMode = "single" | "list";
export type ProxyRotation = "sequential" | "random" | "per_request";
export type LoginMethod = "none" | "password" | "wallet" | "cookie";
export type CaptchaMode = "manual" | "ocr";
export type WalletSignatureType = "sign_message" | "send_transaction";
export type CookieInjectionMode = "header" | "cookie";
export type TaskType =
  | "navigate"
  | "click"
  | "input"
  | "select"
  | "wait"
  | "execute_script"
  | "extract"
  | "condition"
  | "loop"
  | "api_request";
export type ConditionMode = "variable" | "selector";
export type ComparisonOperator = "exists" | "equals" | "contains" | "not_equals";
export type LoopMode = "count" | "while";
export type ApiMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export interface GlobalConfig {
  timeout: number;
  retryTimes: number;
  randomDelay: boolean;
  headless: boolean;
  outputDirectory: string;
}

export interface PasswordLoginConfig {
  method: "password";
  url: string;
  usernameSelector: string;
  passwordSelector: string;
  submitSelector: string;
  successSelector: string;
  username: string;
  password: string;
  captchaEnabled: boolean;
  captchaSelector: string;
  captchaMode: CaptchaMode;
}

export interface WalletLoginConfig {
  method: "wallet";
  loginUrl: string;
  rpcUrl: string;
  chainId: number;
  contractAddress: string;
  signatureType: WalletSignatureType;
  message: string;
  toAddress: string;
  value: string;
  data: string;
  privateKeyEnvVar: string;
}

export interface CookieLoginConfig {
  method: "cookie";
  url: string;
  injectionMode: CookieInjectionMode;
  cookieString: string;
  token: string;
  headerName: string;
}

export interface NoLoginConfig {
  method: "none";
}

export type LoginConfig =
  | NoLoginConfig
  | PasswordLoginConfig
  | WalletLoginConfig
  | CookieLoginConfig;

export interface ProxyConfig {
  enabled: boolean;
  type: ProxyType;
  mode: ProxyMode;
  single: string;
  list: string[];
  rotation: ProxyRotation;
}

export interface BaseTask {
  id: string;
  type: TaskType;
  label: string;
}

export interface NavigateTask extends BaseTask {
  type: "navigate";
  url: string;
  waitUntil: WaitUntil;
}

export interface ClickTask extends BaseTask {
  type: "click";
  selector: string;
  timeout: number;
  index: number;
}

export interface InputTask extends BaseTask {
  type: "input";
  selector: string;
  value: string;
  clearFirst: boolean;
}

export interface SelectTask extends BaseTask {
  type: "select";
  selector: string;
  optionValue: string;
  optionIndex: number | null;
}

export interface WaitTask extends BaseTask {
  type: "wait";
  mode: "duration" | "selector";
  durationSeconds: number;
  selector: string;
  timeout: number;
}

export interface ExecuteScriptTask extends BaseTask {
  type: "execute_script";
  script: string;
}

export interface ExtractTask extends BaseTask {
  type: "extract";
  selector: string;
  attribute: string;
  variable: string;
}

export interface ConditionTask extends BaseTask {
  type: "condition";
  mode: ConditionMode;
  variable: string;
  operator: ComparisonOperator;
  compareValue: string;
  selector: string;
  thenTasks: TaskItem[];
  elseTasks: TaskItem[];
}

export interface LoopTask extends BaseTask {
  type: "loop";
  mode: LoopMode;
  count: number;
  variable: string;
  operator: ComparisonOperator;
  compareValue: string;
  tasks: TaskItem[];
}

export interface ApiRequestTask extends BaseTask {
  type: "api_request";
  method: ApiMethod;
  url: string;
  headersText: string;
  bodyText: string;
  saveResponseAs: string;
}

export type TaskItem =
  | NavigateTask
  | ClickTask
  | InputTask
  | SelectTask
  | WaitTask
  | ExecuteScriptTask
  | ExtractTask
  | ConditionTask
  | LoopTask
  | ApiRequestTask;

export interface ScriptConfig {
  meta: {
    name: string;
    description: string;
  };
  global: GlobalConfig;
  login: LoginConfig;
  proxy: ProxyConfig;
  tasks: TaskItem[];
}

export interface ValidationIssue {
  path: string;
  message: string;
}

export interface TemplateSummary {
  id: string;
  name: string;
  description: string;
  filePath?: string;
}

export interface SavedTemplateDocument extends TemplateSummary {
  config: ScriptConfig;
}

export interface GenerationResult {
  scriptPath: string;
  requirementsPath: string;
  envExamplePath: string;
  outputDirectory: string;
  scriptContent: string;
  requirementsContent: string;
  dependencyList: string[];
}

export interface ProxyValidationResult {
  ok: boolean;
  message: string;
  elapsedMs?: number;
}

export interface AppInfo {
  isDev: boolean;
  userDataPath: string;
  appVersion: string;
}
