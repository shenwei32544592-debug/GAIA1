# GAIA 完整说明书 · 网站浏览试用版

本目录为 GAIA 说明书的静态网站，用于浏览、样式试用与本地预览。

## 使用方式

### 1. 构建

```bash
npm install   # 首次需安装依赖（marked）
npm run build # 或直接 node build.js
```

### 2. 预览

**方式 A**：用浏览器直接打开 `index.html`

**方式 B**：启动本地服务器
```bash
npm run preview
```
然后在浏览器访问 http://localhost:3322

### 3. 样式调整

编辑 `styles.css` 可修改视觉效果。文档采用 冷峻、精确 的法理风格，支持系统深色/浅色模式自动切换。

## 文件说明

| 文件 | 用途 |
|------|------|
| `build.js` | 构建脚本：将说明书 Markdown 转为 HTML |
| `styles.css` | 网站样式（可自由修改试用） |
| `script.js` | 导航高亮、锚点跳转 |
| `index.html` | 构建产出，包含完整说明书内容 |

## 内容来源

内容来自 `../00_索引与导航/GAIA 完整说明书（网站浏览试用版）.md`。  
修改说明书后需重新运行 `npm run build` 以更新网站。
