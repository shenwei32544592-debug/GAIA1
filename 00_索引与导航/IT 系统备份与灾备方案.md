# IT 系统备份与灾备方案

**用途**：确保「神经中心」全量代码与网站数据有独立第三方备份；灾备时，只要备份在，即可随时恢复上线。  
**原则**：核心不在本地，在第三方；实时同步；灾后可一键或按步骤恢复。

---

## 一、备份架构概览

```
┌─────────────────────────────────────────────────────────────────┐
│  你的神经中心（本机 / Cursor）                                    │
│  GAIA_System_OS、signa-website、战略文档、人际档案...             │
└───────────────────────────┬─────────────────────────────────────┘
                            │ 实时 push / 同步
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│  第三方备份层（与本地物理隔离）                                    │
├─────────────────────────────────────────────────────────────────┤
│  代码版本    │ GitHub / GitLab  （每次 commit 即 push）           │
│  网站数据    │ Supabase 内置 + 外部 pg_dump → S3/B2               │
│  静态文件    │ 可选：GAIA_System_OS 全量 → Backblaze B2 / OneDrive│
└─────────────────────────────────────────────────────────────────┘
                            │
                            │ 灾后恢复
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│  任意新机器 clone / 还原 → 神经中心重建                           │
└─────────────────────────────────────────────────────────────────┘
```

**核心逻辑**：corn（核心）不在你硬盘上，在第三方。你的机器丢了，第三方备份还在，恢复即可。

---

## 二、分层备份实现

### 2.1 代码版本（全量、实时）

| 资产 | 备份方式 | 第三方 | 实时性 |
|------|----------|--------|--------|
| **signa-website** | Git push | GitHub/GitLab | 每次 commit 后 push |
| **GAIA_System_OS** | Git push | GitHub 私有仓库 | 每次 commit 后 push |

**操作**：
1. 将 GAIA_System_OS 初始化为 Git 仓库（若尚未）
2. 在 GitHub 创建私有仓库 `GAIA_System_OS`，设为 `origin`
3. 约定：每次有实质性修改后 `git add .` → `git commit` → `git push`
4. signa-website 若独立仓库，同样 push 到 GitHub

**可选增强**：添加第二远程（如 GitLab）做冗余：
```bash
git remote add gitlab https://gitlab.com/yourname/GAIA_System_OS.git
git push origin main && git push gitlab main
```

### 2.2 网站数据（Supabase + 外部快照）

| 资产 | 备份方式 | 第三方 | 实时性 |
|------|----------|--------|--------|
| **Supabase Postgres** | 内置 PITR + 外部 pg_dump | Supabase 云 + S3/B2 | Supabase 实时；pg_dump 每日 |
| **Supabase Storage** | 内置复制 + 可选外部同步 | Supabase 云 | 实时 |
| **Edge Functions 代码** | 已在 signa-website Git 中 | GitHub | 随代码 push |

**Supabase 内置**（Pro 计划 $25/月）：
- Point-in-Time Recovery (PITR)：可回溯任意时间点
- 每日自动快照

**外部 pg_dump 实时/定时**（可选，增强独立性）：
- 使用 GitHub Actions 或 cron + 脚本，每日 `pg_dump` 导出
- 上传至 Backblaze B2 / AWS S3 / 其他对象存储
- 保留 7～30 天版本

### 2.3 静态文档（GAIA_System_OS 全量）

若 GAIA_System_OS 已用 Git 推送到 GitHub，代码与 Markdown 已备份。

**可选增强**（非代码文件的额外保护）：
- 用 rclone / Duplicity 将 `GAIA_System_OS` 目录同步到 Backblaze B2、OneDrive、或 iCloud
- 频率：每日或每周
- 适用：希望有一份「整盘快照」、不依赖 Git 的场景

---

## 三、实现清单（按优先级）

### 必须（Phase 1）

| 步骤 | 操作 | 负责 |
|------|------|------|
| 1 | GAIA_System_OS 初始化为 Git，推送到 GitHub 私有仓库 | Founder |
| 2 | signa-website 推送到 GitHub（独立或 submodule） | Founder / 沈炎君 |
| 3 | 约定：每次重要修改后 `git push`，养成习惯 | 所有人 |
| 4 | Supabase 使用 Pro 计划，开启 PITR（上线后） | 沈炎君 |

### 建议（Phase 2）

| 步骤 | 操作 | 负责 |
|------|------|------|
| 5 | 为 GAIA_System_OS 添加第二远程（GitLab） | Founder |
| 6 | 配置 GitHub Actions：每日 pg_dump → 上传 S3/B2 | 沈炎君 |
| 7 | 配置 rclone：每周 GAIA_System_OS → B2/OneDrive | Founder |

### 可选（Phase 3）

| 步骤 | 操作 |
|------|------|
| 8 | 自动化测试：定期从备份还原到临时环境，验证可恢复性 |
| 9 | 书面灾备演练文档：新机器上 clone + 还原的步骤 |

---

## 四、灾后恢复流程

### 4.1 仅代码丢失（本机损坏）

1. 新机器安装 Git、Cursor
2. `git clone https://github.com/yourname/GAIA_System_OS.git`
3. `git clone https://github.com/yourname/signa-website.git`（若独立）
4. 安装依赖，配置环境变量，继续开发

### 4.2 代码 + Supabase 数据需恢复

1. 执行 4.1
2. Supabase：从 Dashboard 恢复 PITR 到指定时间点，或从 pg_dump 导入
3. 重新配置 `.env` 中的 Supabase URL/Key
4. 部署 Edge Functions、前端

### 4.3 完全重建（新机器、从零开始）

1. 从 GitHub clone 所有仓库
2. 从 Supabase 恢复数据库（PITR 或 dump）
3. 从 Backblaze B2 / S3 拉取 pg_dump 等（若有）
4. 按 `signa-ink-architecture-v1.1.md` 部署 Vercel + Supabase

---

## 五、第三方服务选型（成本参考）

| 服务 | 用途 | 免费额度 | 付费 |
|------|------|----------|------|
| **GitHub** | 代码版本 | 私有仓库免费 | — |
| **Supabase** | DB + Storage + Functions | 500MB DB | Pro $25/月（PITR） |
| **Backblaze B2** | 外部备份存储 | 10GB 免费 | $0.005/GB/月 |
| **Vercel** | 前端部署 | 100GB 带宽 | Pro $20/月 |
| **rclone** | 本地→云同步 | 开源 | — |

---

## 六、AI 调用提醒

当 Founder 提及「备份」「灾备」「代码版本」「第三方备份」「恢复上线」时，AI 应调用本文，并可根据当前进度给出下一步操作建议。
