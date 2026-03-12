# 脚本生成器

零代码可视化脚本生成器桌面应用。当前版本基于 Electron + React + Python 生成引擎，支持通过向导配置登录方式、代理、任务步骤，并生成可读的 Python 自动化脚本、`requirements.txt` 与 `.env.example`。

## 已实现内容

- Electron 桌面端骨架与跨平台打包配置
- React + Ant Design 向导式配置界面
- Redux Toolkit 配置状态管理
- JSON Schema 前端实时校验
- 本地模板保存、内置模板加载、导入导出
- 平台起步模板（ARC / Pharos / SoSoValue）
- 代理配置与代理连通性测试
- 递归任务编辑器
- Python 生成引擎（Jinja2 + Black）
- PyInstaller 打包生成器可执行文件
- Windows NSIS 安装包产出

## 目录结构

```text
electron/           Electron 主进程与 preload
src/                React 渲染进程
python_engine/      Python 生成引擎与模板
builtin_templates/  内置任务模板
scripts/            打包辅助脚本
```

## 本地开发

```powershell
npm install
npm run setup:python
npm run dev
```

## 测试与构建

```powershell
npm test
npm run build
npm run package:engine
npm run dist
```

## 上传 GitHub Release

```powershell
npm run publish:release
```

这条命令会先重新打包，再把 `dist` 中的 Windows 安装包、`.blockmap` 和 `latest.yml` 上传到当前 GitHub 仓库的 Release。

## 打包产物

- Windows 安装包：`dist/脚本生成器 Setup <version>.exe`
- Windows 解包目录：`dist/win-unpacked/`

## 当前说明

- Python 生成器已支持账号密码、Cookie/Token、私钥钱包三类登录配置。
- `.env.example` 会自动收集配置中使用到的环境变量占位符。
- 任务编辑支持页面访问、点击、输入、选择、等待、JS 执行、变量提取、条件、循环、API 请求。
- 内置模板除了通用示例外，新增了根据空投工具脚本线索整理的平台起步模板。
- 打包链已验证可生成 Windows 安装包；默认使用 Electron 默认图标，后续可替换品牌资源。
