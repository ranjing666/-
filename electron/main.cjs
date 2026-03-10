const { app, BrowserWindow, dialog, ipcMain, shell } = require("electron");
const fs = require("node:fs");
const path = require("node:path");
const { spawn } = require("node:child_process");

const isDev = !app.isPackaged;

function getBasePath() {
  return isDev ? app.getAppPath() : process.resourcesPath;
}

function getBuiltinTemplatesDir() {
  return path.join(getBasePath(), "builtin_templates");
}

function getPythonEngineDir() {
  return path.join(getBasePath(), "python_engine");
}

function getConfigsDir() {
  const dir = path.join(app.getPath("userData"), "configs");
  fs.mkdirSync(dir, { recursive: true });
  return dir;
}

function getLogsDir() {
  const dir = path.join(app.getPath("userData"), "logs");
  fs.mkdirSync(dir, { recursive: true });
  return dir;
}

function findGeneratorExecutable() {
  const engineDir = getPythonEngineDir();
  const packagedExe = path.join(engineDir, "dist", "generator.exe");
  if (fs.existsSync(packagedExe)) {
    return {
      command: packagedExe,
      args: []
    };
  }

  return {
    command: "python",
    args: [path.join(engineDir, "generator_cli.py")]
  };
}

function runPythonCommand(mode, payload) {
  return new Promise((resolve, reject) => {
    const tempDir = path.join(app.getPath("temp"), "script-generator");
    fs.mkdirSync(tempDir, { recursive: true });

    const stamp = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    const inputPath = path.join(tempDir, `${mode}-${stamp}.json`);
    const outputPath = path.join(tempDir, `${mode}-${stamp}-result.json`);
    fs.writeFileSync(inputPath, JSON.stringify(payload, null, 2), "utf8");

    const executable = findGeneratorExecutable();
    const args = [...executable.args, mode, "--input", inputPath, "--output", outputPath];
    const child = spawn(executable.command, args, {
      cwd: getPythonEngineDir(),
      windowsHide: true
    });

    let stderr = "";
    child.stderr.on("data", (chunk) => {
      stderr += chunk.toString();
    });

    child.on("error", (error) => {
      reject(error);
    });

    child.on("close", (code) => {
      try {
        if (!fs.existsSync(outputPath)) {
          throw new Error(stderr || `Python engine exited with code ${code}`);
        }

        const result = JSON.parse(fs.readFileSync(outputPath, "utf8"));
        if (code !== 0 || result.success === false) {
          throw new Error(result.error || stderr || `Python engine exited with code ${code}`);
        }

        resolve(result);
      } catch (error) {
        const logPath = path.join(getLogsDir(), "engine-error.log");
        fs.appendFileSync(
          logPath,
          `[${new Date().toISOString()}]\n${stderr}\n${error.stack || error.message}\n\n`,
          "utf8"
        );
        reject(error);
      } finally {
        [inputPath, outputPath].forEach((file) => {
          if (fs.existsSync(file)) {
            fs.unlinkSync(file);
          }
        });
      }
    });
  });
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function writeJson(filePath, data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf8");
}

function listTemplateSummaries(dirPath) {
  if (!fs.existsSync(dirPath)) {
    return [];
  }

  return fs
    .readdirSync(dirPath)
    .filter((name) => name.endsWith(".json"))
    .map((name) => {
      const fullPath = path.join(dirPath, name);
      const data = readJson(fullPath);
      return {
        id: data.id || path.basename(name, ".json"),
        name: data.name || path.basename(name, ".json"),
        description: data.description || "",
        filePath: fullPath
      };
    });
}

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1440,
    height: 920,
    minWidth: 1180,
    minHeight: 760,
    show: false,
    backgroundColor: "#f4efe5",
    webPreferences: {
      preload: path.join(__dirname, "preload.cjs"),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  mainWindow.once("ready-to-show", () => {
    mainWindow.show();
  });

  if (isDev) {
    mainWindow.loadURL("http://127.0.0.1:5173");
  } else {
    mainWindow.loadFile(path.join(app.getAppPath(), "dist", "index.html"));
  }
}

app.whenReady().then(() => {
  ipcMain.handle("app:get-info", () => ({
    isDev,
    userDataPath: app.getPath("userData"),
    defaultOutputPath: path.join(app.getPath("documents"), "Script Generator Output"),
    appVersion: app.getVersion()
  }));

  ipcMain.handle("config:list", () => {
    return listTemplateSummaries(getConfigsDir());
  });

  ipcMain.handle("config:load", (_event, id) => {
    const filePath = path.join(getConfigsDir(), `${id}.json`);
    return readJson(filePath);
  });

  ipcMain.handle("config:save", (_event, payload) => {
    const safeId =
      payload.id ||
      payload.name
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9\u4e00-\u9fa5]+/g, "-")
        .replace(/^-+|-+$/g, "");
    const filePath = path.join(getConfigsDir(), `${safeId}.json`);
    writeJson(filePath, {
      id: safeId,
      name: payload.name,
      description: payload.description || "",
      config: payload.config
    });
    return { id: safeId, filePath };
  });

  ipcMain.handle("config:delete", (_event, id) => {
    const filePath = path.join(getConfigsDir(), `${id}.json`);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    return { success: true };
  });

  ipcMain.handle("config:import", async () => {
    const result = await dialog.showOpenDialog({
      filters: [{ name: "JSON", extensions: ["json"] }],
      properties: ["openFile"]
    });
    if (result.canceled || result.filePaths.length === 0) {
      return null;
    }
    return readJson(result.filePaths[0]);
  });

  ipcMain.handle("config:export", async (_event, config) => {
    const result = await dialog.showSaveDialog({
      defaultPath: "script-generator-config.json",
      filters: [{ name: "JSON", extensions: ["json"] }]
    });
    if (result.canceled || !result.filePath) {
      return null;
    }
    writeJson(result.filePath, config);
    return { filePath: result.filePath };
  });

  ipcMain.handle("template:list", () => {
    return listTemplateSummaries(getBuiltinTemplatesDir());
  });

  ipcMain.handle("template:load", (_event, id) => {
    const filePath = path.join(getBuiltinTemplatesDir(), `${id}.json`);
    return readJson(filePath);
  });

  ipcMain.handle("dialog:choose-output", async () => {
    const result = await dialog.showOpenDialog({
      properties: ["openDirectory", "createDirectory"]
    });
    if (result.canceled || result.filePaths.length === 0) {
      return null;
    }
    return result.filePaths[0];
  });

  ipcMain.handle("shell:open-path", (_event, targetPath) => {
    return shell.openPath(targetPath);
  });

  ipcMain.handle("engine:generate-script", (_event, payload) => {
    return runPythonCommand("generate-script", payload);
  });

  ipcMain.handle("engine:validate-proxy", (_event, payload) => {
    return runPythonCommand("validate-proxy", payload);
  });

  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
