# GAIA 说明书网站 — 部署到 GitHub Pages

**目标**：部署到 GitHub，你可推送更新，他人通过链接访问。

---

## 一、前置条件

1. **本仓库已在 GitHub**（GAIA_System_OS 或你指定的 repo）
2. **启用 GitHub Pages**  
   - 仓库 Settings → Pages  
   - Source：**GitHub Actions**

---

## 二、部署流程（自动）

1. 本地修改内容后执行：
   ```bash
   git add .
   git commit -m "更新说明书"
   git push origin main
   ```

2. GitHub Actions 自动触发 `.github/workflows/deploy-gaia-manual.yml`  
   - 构建 `gaia-manual-website`  
   - 发布到 GitHub Pages

3. 数分钟后访问：
   ```
   https://<你的用户名>.github.io/<仓库名>/
   ```
   例如：`https://shenyanjun.github.io/GAIA_System_OS/`

---

## 三、手动触发部署

在 GitHub 仓库页：**Actions → Deploy GAIA Manual to GitHub Pages → Run workflow**

---

## 四、首次配置（若尚未启用 Pages）

1. 打开仓库 **Settings** → **Pages**
2. **Build and deployment** 下，Source 选择 **GitHub Actions**
3. 完成后执行一次 `git push`，或手动 Run workflow

---

## 五、本地预览（推送前）

```bash
cd gaia-manual-website
npm run build
npm run preview
```

浏览器打开 `http://localhost:3322`

---

*构建依赖上层目录（00_、01_、02_ 等）的 Markdown 源文件，请勿单独复制 gaia-manual-website 目录部署。*
