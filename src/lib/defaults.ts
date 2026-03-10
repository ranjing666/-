import type {
  ApiRequestTask,
  ClickTask,
  ConditionTask,
  ExecuteScriptTask,
  ExtractTask,
  InputTask,
  LoginConfig,
  LoopTask,
  NavigateTask,
  NoLoginConfig,
  ProxyConfig,
  ScriptConfig,
  SelectTask,
  TaskItem,
  TaskType,
  WaitTask
} from "../types/config";

function createId(prefix: string) {
  return `${prefix}-${crypto.randomUUID().slice(0, 8)}`;
}

export const defaultLoginConfig: NoLoginConfig = {
  method: "none"
};

export const defaultProxyConfig: ProxyConfig = {
  enabled: false,
  type: "http",
  mode: "single",
  single: "",
  list: [],
  rotation: "sequential"
};

export function createDefaultTask(type: TaskType): TaskItem {
  switch (type) {
    case "navigate":
      return {
        id: createId("navigate"),
        type,
        label: "访问页面",
        url: "",
        waitUntil: "load"
      } satisfies NavigateTask;
    case "click":
      return {
        id: createId("click"),
        type,
        label: "点击元素",
        selector: "",
        timeout: 30,
        index: 0
      } satisfies ClickTask;
    case "input":
      return {
        id: createId("input"),
        type,
        label: "填写输入框",
        selector: "",
        value: "",
        clearFirst: true
      } satisfies InputTask;
    case "select":
      return {
        id: createId("select"),
        type,
        label: "选择下拉项",
        selector: "",
        optionValue: "",
        optionIndex: null
      } satisfies SelectTask;
    case "wait":
      return {
        id: createId("wait"),
        type,
        label: "等待",
        mode: "duration",
        durationSeconds: 3,
        selector: "",
        timeout: 30
      } satisfies WaitTask;
    case "execute_script":
      return {
        id: createId("script"),
        type,
        label: "执行 JavaScript",
        script: "return document.title;"
      } satisfies ExecuteScriptTask;
    case "extract":
      return {
        id: createId("extract"),
        type,
        label: "提取变量",
        selector: "",
        attribute: "text",
        variable: "extracted_value"
      } satisfies ExtractTask;
    case "condition":
      return {
        id: createId("condition"),
        type,
        label: "条件分支",
        mode: "selector",
        variable: "",
        operator: "exists",
        compareValue: "",
        selector: "",
        thenTasks: [],
        elseTasks: []
      } satisfies ConditionTask;
    case "loop":
      return {
        id: createId("loop"),
        type,
        label: "循环",
        mode: "count",
        count: 3,
        variable: "",
        operator: "equals",
        compareValue: "",
        tasks: []
      } satisfies LoopTask;
    case "api_request":
      return {
        id: createId("api"),
        type,
        label: "发送 API 请求",
        method: "GET",
        url: "",
        headersText: "{\n  \"Accept\": \"application/json\"\n}",
        bodyText: "{}",
        saveResponseAs: ""
      } satisfies ApiRequestTask;
  }
}

export function createLoginConfig(method: LoginConfig["method"]): LoginConfig {
  switch (method) {
    case "password":
      return {
        method,
        url: "",
        usernameSelector: "#username",
        passwordSelector: "#password",
        submitSelector: "button[type='submit']",
        successSelector: "",
        username: "",
        password: "",
        captchaEnabled: false,
        captchaSelector: "",
        captchaMode: "manual"
      };
    case "wallet":
      return {
        method,
        loginUrl: "",
        rpcUrl: "",
        chainId: 1,
        contractAddress: "",
        signatureType: "sign_message",
        message: "Please sign to continue",
        toAddress: "",
        value: "0",
        data: "",
        privateKeyEnvVar: "PRIVATE_KEY"
      };
    case "cookie":
      return {
        method,
        url: "",
        injectionMode: "cookie",
        cookieString: "",
        token: "",
        headerName: "Authorization"
      };
    case "none":
    default:
      return { method: "none" };
  }
}

export function createDefaultConfig(): ScriptConfig {
  return {
    meta: {
      name: "未命名配置",
      description: "新的自动化脚本方案"
    },
    global: {
      timeout: 30,
      retryTimes: 3,
      randomDelay: true,
      headless: false,
      outputDirectory: ""
    },
    login: defaultLoginConfig,
    proxy: defaultProxyConfig,
    tasks: [createDefaultTask("navigate")]
  };
}
