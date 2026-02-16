# GAIA 说明书网站 · 部署说明

## 访问地址

部署成功后：`https://shenwei32544592-debug.github.io/GAIA1/`

---

## 首次部署前必做：GitHub Pages 配置

**若 Actions 工作流显示红 X 失败，请先完成以下配置：**

1. 打开仓库：https://github.com/shenwei32544592-debug/GAIA1  
2. 进入 **Settings** → **Pages**  
3. 在 **Build and deployment** → **Source** 中，选择 **GitHub Actions**（不要选 "Deploy from a branch"）  
4. 保存后，前往 **Actions** 标签，对失败的运行点击 **Re-run all jobs**

---

## 如何触发部署

- **自动**：push 到 `main` 分支且改动涉及 `gaia-manual-website`、索引、协议、叙事等目录  
- **手动**：Actions → 选择 "Deploy GAIA Manual to GitHub Pages" → **Run workflow**

---

## 本地构建与预览

```bash
cd gaia-manual-website
npm install
node build.js
npm run preview   # 启动 http://localhost:3322
```

---

## 部署排除（敏感信息保护）

以下文档**不对外部署**，仅存于本地/仓库，部署时链接显示为「（内部文档）」：

- Founder-AI 协作约定
- 输入与解释映射表
- 节点角色说服与加入路径分析
- Founder-沈炎君 协作与治理要点
- 有效路径与时间节点安排
- 敏感信息防护要点

部署输出中对「创世技术官（沈炎君）」等人名会做脱敏处理。排除列表见 `build.js` 中的 `DEPLOY_EXCLUDED`。

---

## 常见失败原因

| 现象 | 处理 |
|------|------|
| deploy 步骤报错 | 确认 Settings → Pages → Source = **GitHub Actions** |
| build 步骤报错 | 查看日志中 Node/npm 报错；本地运行 `node build.js` 验证 |
| "No artifacts" | 检查 `upload-pages-artifact` 与 `deploy-pages` 版本兼容；本工作流使用 v3/v4 |
