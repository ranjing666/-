import Ajv from "ajv";
import addFormats from "ajv-formats";
import type { ErrorObject } from "ajv";
import type { ScriptConfig, ValidationIssue } from "../types/config";

const schema = {
  $schema: "http://json-schema.org/draft-07/schema#",
  type: "object",
  required: ["meta", "global", "login", "proxy", "tasks"],
  properties: {
    meta: {
      type: "object",
      required: ["name", "description"],
      properties: {
        name: { type: "string", minLength: 1 },
        description: { type: "string" }
      }
    },
    global: {
      type: "object",
      required: ["timeout", "retryTimes", "randomDelay", "headless", "outputDirectory"],
      properties: {
        timeout: { type: "integer", minimum: 1, maximum: 600 },
        retryTimes: { type: "integer", minimum: 0, maximum: 20 },
        randomDelay: { type: "boolean" },
        headless: { type: "boolean" },
        outputDirectory: { type: "string" }
      }
    },
    login: {
      oneOf: [
        {
          type: "object",
          required: ["method"],
          properties: {
            method: { const: "none" }
          }
        },
        {
          type: "object",
          required: [
            "method",
            "url",
            "usernameSelector",
            "passwordSelector",
            "submitSelector",
            "username",
            "password"
          ],
          properties: {
            method: { const: "password" },
            url: { type: "string", format: "uri" },
            usernameSelector: { type: "string", minLength: 1 },
            passwordSelector: { type: "string", minLength: 1 },
            submitSelector: { type: "string", minLength: 1 },
            successSelector: { type: "string" },
            username: { type: "string", minLength: 1 },
            password: { type: "string", minLength: 1 },
            captchaEnabled: { type: "boolean" },
            captchaSelector: { type: "string" },
            captchaMode: { enum: ["manual", "ocr"] }
          }
        },
        {
          type: "object",
          required: [
            "method",
            "rpcUrl",
            "chainId",
            "signatureType",
            "privateKeyEnvVar"
          ],
          properties: {
            method: { const: "wallet" },
            loginUrl: { type: "string" },
            rpcUrl: { type: "string", format: "uri" },
            chainId: { type: "integer", minimum: 1 },
            contractAddress: { type: "string" },
            signatureType: { enum: ["sign_message", "send_transaction"] },
            message: { type: "string" },
            toAddress: { type: "string" },
            value: { type: "string" },
            data: { type: "string" },
            privateKeyEnvVar: { type: "string", minLength: 1 }
          }
        },
        {
          type: "object",
          required: ["method", "url", "injectionMode"],
          properties: {
            method: { const: "cookie" },
            url: { type: "string", format: "uri" },
            injectionMode: { enum: ["header", "cookie"] },
            cookieString: { type: "string" },
            token: { type: "string" },
            headerName: { type: "string" }
          }
        }
      ]
    },
    proxy: {
      type: "object",
      required: ["enabled", "type", "mode", "single", "list", "rotation"],
      properties: {
        enabled: { type: "boolean" },
        type: { enum: ["http", "https", "socks5"] },
        mode: { enum: ["single", "list"] },
        single: { type: "string" },
        list: {
          type: "array",
          items: { type: "string", minLength: 1 }
        },
        rotation: { enum: ["sequential", "random", "per_request"] }
      }
    },
    tasks: {
      type: "array",
      items: { $ref: "#/definitions/taskItem" }
    }
  },
  definitions: {
    taskBase: {
      type: "object",
      required: ["id", "type", "label"],
      properties: {
        id: { type: "string", minLength: 1 },
        type: { type: "string" },
        label: { type: "string", minLength: 1 }
      }
    },
    taskItem: {
      oneOf: [
        {
          allOf: [
            { $ref: "#/definitions/taskBase" },
            {
              type: "object",
              required: ["url", "waitUntil"],
              properties: {
                type: { const: "navigate" },
                url: { type: "string", minLength: 1 },
                waitUntil: { enum: ["load", "domcontentloaded", "networkidle"] }
              }
            }
          ]
        },
        {
          allOf: [
            { $ref: "#/definitions/taskBase" },
            {
              type: "object",
              required: ["selector", "timeout", "index"],
              properties: {
                type: { const: "click" },
                selector: { type: "string", minLength: 1 },
                timeout: { type: "integer", minimum: 1 },
                index: { type: "integer", minimum: 0 }
              }
            }
          ]
        },
        {
          allOf: [
            { $ref: "#/definitions/taskBase" },
            {
              type: "object",
              required: ["selector", "value", "clearFirst"],
              properties: {
                type: { const: "input" },
                selector: { type: "string", minLength: 1 },
                value: { type: "string" },
                clearFirst: { type: "boolean" }
              }
            }
          ]
        },
        {
          allOf: [
            { $ref: "#/definitions/taskBase" },
            {
              type: "object",
              required: ["selector", "optionValue"],
              properties: {
                type: { const: "select" },
                selector: { type: "string", minLength: 1 },
                optionValue: { type: "string" },
                optionIndex: {
                  anyOf: [{ type: "integer", minimum: 0 }, { type: "null" }]
                }
              }
            }
          ]
        },
        {
          allOf: [
            { $ref: "#/definitions/taskBase" },
            {
              type: "object",
              required: ["mode", "durationSeconds", "selector", "timeout"],
              properties: {
                type: { const: "wait" },
                mode: { enum: ["duration", "selector"] },
                durationSeconds: { type: "integer", minimum: 1 },
                selector: { type: "string" },
                timeout: { type: "integer", minimum: 1 }
              }
            }
          ]
        },
        {
          allOf: [
            { $ref: "#/definitions/taskBase" },
            {
              type: "object",
              required: ["script"],
              properties: {
                type: { const: "execute_script" },
                script: { type: "string", minLength: 1 }
              }
            }
          ]
        },
        {
          allOf: [
            { $ref: "#/definitions/taskBase" },
            {
              type: "object",
              required: ["selector", "attribute", "variable"],
              properties: {
                type: { const: "extract" },
                selector: { type: "string", minLength: 1 },
                attribute: { type: "string", minLength: 1 },
                variable: { type: "string", minLength: 1 }
              }
            }
          ]
        },
        {
          allOf: [
            { $ref: "#/definitions/taskBase" },
            {
              type: "object",
              required: ["mode", "operator", "thenTasks", "elseTasks"],
              properties: {
                type: { const: "condition" },
                mode: { enum: ["variable", "selector"] },
                variable: { type: "string" },
                operator: { enum: ["exists", "equals", "contains", "not_equals"] },
                compareValue: { type: "string" },
                selector: { type: "string" },
                thenTasks: {
                  type: "array",
                  items: { $ref: "#/definitions/taskItem" }
                },
                elseTasks: {
                  type: "array",
                  items: { $ref: "#/definitions/taskItem" }
                }
              }
            }
          ]
        },
        {
          allOf: [
            { $ref: "#/definitions/taskBase" },
            {
              type: "object",
              required: ["mode", "count", "operator", "tasks"],
              properties: {
                type: { const: "loop" },
                mode: { enum: ["count", "while"] },
                count: { type: "integer", minimum: 1 },
                variable: { type: "string" },
                operator: { enum: ["exists", "equals", "contains", "not_equals"] },
                compareValue: { type: "string" },
                tasks: {
                  type: "array",
                  items: { $ref: "#/definitions/taskItem" }
                }
              }
            }
          ]
        },
        {
          allOf: [
            { $ref: "#/definitions/taskBase" },
            {
              type: "object",
              required: ["method", "url", "headersText", "bodyText", "saveResponseAs"],
              properties: {
                type: { const: "api_request" },
                method: { enum: ["GET", "POST", "PUT", "PATCH", "DELETE"] },
                url: { type: "string", minLength: 1 },
                headersText: { type: "string" },
                bodyText: { type: "string" },
                saveResponseAs: { type: "string" }
              }
            }
          ]
        }
      ]
    }
  }
} as const;

const ajv = new Ajv({
  allErrors: true,
  allowUnionTypes: true
});

addFormats(ajv);

const validate = ajv.compile<ScriptConfig>(schema);

function normalizePath(error: ErrorObject): string {
  if (error.instancePath) {
    return error.instancePath;
  }

  if (typeof error.params === "object" && error.params && "missingProperty" in error.params) {
    return String(error.params.missingProperty);
  }

  return "/";
}

export function validateConfig(config: ScriptConfig): ValidationIssue[] {
  const valid = validate(config);
  const issues: ValidationIssue[] = [];

  if (!valid && validate.errors) {
    validate.errors.forEach((error) => {
      issues.push({
        path: normalizePath(error),
        message: error.message || "配置不合法"
      });
    });
  }

  if (config.proxy.enabled) {
    if (config.proxy.mode === "single" && !config.proxy.single.trim()) {
      issues.push({
        path: "/proxy/single",
        message: "启用单代理时必须填写代理地址"
      });
    }

    if (config.proxy.mode === "list" && config.proxy.list.length === 0) {
      issues.push({
        path: "/proxy/list",
        message: "代理池模式至少需要一条代理"
      });
    }
  }

  if (!config.tasks.length) {
    issues.push({
      path: "/tasks",
      message: "至少需要配置一个任务步骤"
    });
  }

  if (!config.global.outputDirectory.trim()) {
    issues.push({
      path: "/global/outputDirectory",
      message: "请选择脚本导出目录"
    });
  }

  return issues;
}
