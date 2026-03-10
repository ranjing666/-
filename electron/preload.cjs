const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("scriptGenerator", {
  getAppInfo: () => ipcRenderer.invoke("app:get-info"),
  listSavedConfigs: () => ipcRenderer.invoke("config:list"),
  loadSavedConfig: (id) => ipcRenderer.invoke("config:load", id),
  saveConfig: (payload) => ipcRenderer.invoke("config:save", payload),
  deleteConfig: (id) => ipcRenderer.invoke("config:delete", id),
  importConfig: () => ipcRenderer.invoke("config:import"),
  exportConfig: (config) => ipcRenderer.invoke("config:export", config),
  getTemplateList: () => ipcRenderer.invoke("template:list"),
  loadTemplate: (id) => ipcRenderer.invoke("template:load", id),
  chooseOutputDirectory: () => ipcRenderer.invoke("dialog:choose-output"),
  generateScript: (payload) => ipcRenderer.invoke("engine:generate-script", payload),
  validateProxy: (payload) => ipcRenderer.invoke("engine:validate-proxy", payload),
  openPath: (targetPath) => ipcRenderer.invoke("shell:open-path", targetPath)
});
