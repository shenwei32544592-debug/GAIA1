

---

# 🟩 Sprint 1（MVP）Task 级清单
## 0) 约定（P0）
+ 全局使用 `UUID`（后端生成）作为主键
+ 所有表必须有：`created_at`, `updated_at`
+ 核心记录禁止硬删除（如要删：`is_deleted` + 记录原因）
+ 时区统一：UTC 存储，前端展示本地

---

# 1) 数据库表（P0）
## 1.1 users（客户/普通用户）
字段建议：

+ `id` (uuid, pk)
+ `email` (unique, nullable if phone login later)
+ `password_hash`
+ `display_name`
+ `status` (active/suspended)
+ `created_at`, `updated_at`

Task：

+ 建表 + 唯一索引（email）
+ 密码策略（bcrypt/argon2）

---

## 1.2 artists（艺术家账户）
字段建议：

+ `id` (uuid, pk)
+ `email` (unique)
+ `password_hash`
+ `artist_name`（对外显示名）
+ `bio`（短简介）
+ `status` (active/pending/suspended)
+ `created_at`, `updated_at`

Task：

+ 建表 + 唯一索引（email）
+ 先不做审核流：默认 `active` 或 `pending`（二选一）

---

## 1.3 templates（公共模板库）
字段建议：

+ `id` (uuid, pk)
+ `artist_id` (fk artists.id)
+ `name`（模板名，如 “Bold Script 01”）
+ `preview_url`（图片/矢量预览）
+ `asset_url`（源文件：svg/pdf/zip）
+ `price_cny`（int：分为单位 or decimal）
+ `status` (draft/published/hidden)
+ `created_at`, `updated_at`

Task：

+ 建表 + 索引（artist_id, status）
+ 文件存储策略（S3/OSS/Cloudflare R2 任选）

---

## 1.4 orders（订单主表）
字段建议：

+ `id` (uuid, pk)
+ `order_no`（可读编号，如 SIG-2026-000001，unique）
+ `user_id` (fk users.id)
+ `artist_id` (fk artists.id) ← 下单时确定（模板作者）
+ `template_id` (fk templates.id)
+ `status` (created/paid/completed/canceled)
+ `currency`（先写死 CNY 也行）
+ `amount_total`（订单总额）
+ `created_at`, `updated_at`

Task：

+ 建表 + unique(order_no)
+ 生成 order_no 的规则（避免并发冲突）

---

## 1.5 order_inputs（用户输入/素材）
字段建议：

+ `id` (uuid, pk)
+ `order_id` (fk orders.id)
+ `input_type` (text/image)
+ `input_text`（nullable）
+ `input_file_url`（nullable）
+ `created_at`

Task：

+ 建表 + 索引（order_id）

---

## 1.6 payments（支付记录）
字段建议：

+ `id` (uuid, pk)
+ `order_id` (fk orders.id)
+ `provider`（stripe/alipay/wechat等）
+ `provider_txn_id`（unique）
+ `status` (initiated/succeeded/failed/refunded)
+ `amount`（支付金额）
+ `currency`
+ `raw_payload`（json，保存回调原文）
+ `created_at`, `updated_at`

Task：

+ 建表 + unique(provider_txn_id)
+ raw_payload 存储（用于对账/争议）

---

## 1.7 order_events（订单事件流，追加式）
字段建议：

+ `id` (uuid, pk)
+ `order_id` (fk orders.id)
+ `event_type`（created/paid/completed/canceled/…）
+ `actor_type`（system/user/artist/admin）
+ `actor_id`（uuid nullable）
+ `note`（text）
+ `created_at`

Task：

+ 建表 + 索引（order_id, created_at）
+ 所有状态变更必须写 event（P0纪律）

---

# 2) API 接口（P0）
下面按“Auth → 模板 → 下单 → 支付 → 艺术家后台”分组  
建议 REST + JSON；返回结构保持稳定

---

## 2.1 Auth（用户端）
+ `POST /api/auth/user/register`
    - 入参：email, password, display_name
    - 出参：user + token
+ `POST /api/auth/user/login`
+ `POST /api/auth/user/logout`（可选）
+ `GET /api/me`（返回当前身份：user/artist）

---

## 2.2 Auth（艺术家端）
+ `POST /api/auth/artist/register`
+ `POST /api/auth/artist/login`

---

## 2.3 Templates（模板库）
+ `GET /api/templates`
    - 支持：分页、按 artist_id、按 status=published
+ `GET /api/templates/:id`
+ `POST /api/artist/templates`（艺术家创建模板）
    - 入参：name, price, files
+ `PATCH /api/artist/templates/:id`（改价/改名/发布）
    - draft → published
+ `POST /api/uploads`（通用上传：返回 url）
    - 也可以用预签名上传

---

## 2.4 Orders（用户下单）
+ `POST /api/orders`
    - 入参：template_id, input_text 或 input_file_url
    - 逻辑：创建 orders + order_inputs + order_events(created)
+ `GET /api/orders`
    - 返回当前 user 的订单列表
+ `GET /api/orders/:id`
    - 返回订单详情 + inputs + events

---

## 2.5 Payments（支付）
+ `POST /api/payments/initiate`
    - 入参：order_id
    - 出参：支付跳转链接/二维码参数
+ `POST /api/payments/webhook`
    - 支付回调：写 payments，更新订单状态为 paid，并写 event(paid)

P0 要求：回调必须**幂等**（同一 provider_txn_id 重放不会重复记账）

---

## 2.6 Artist Dashboard（艺术家接单）
+ `GET /api/artist/orders`
    - 返回该 artist_id 的订单列表（至少包含 paid）
+ `GET /api/artist/orders/:id`
+ `POST /api/artist/orders/:id/complete`
    - 逻辑：订单 status → completed + event(completed)
    - （先不交付文件也行，Sprint 1 完成只要闭环）

---

# 3) 页面/流程（P0）
## 3.1 用户端（最小三页）
+ 模板列表页（Templates）
+ 模板详情页（Template Detail → 下单输入）
+ 订单页（My Orders → 状态）

流程：

1. 选模板
2. 输入名字/上传签名
3. 创建订单
4. 拉起支付
5. 订单显示 paid/completed

---

## 3.2 艺术家端（最小两页）
+ 模板管理（创建/发布/改价）
+ 订单列表（查看订单 → 标记完成）

---

# 4) 业务规则（必须写进 README / PRD 里）（P0）
+ 订单创建后 `status=created`
+ 仅当支付 webhook 成功后才能变 `paid`
+ 完成只能由艺术家触发（或 admin）
+ 订单状态变更必须写入 `order_events`
+ 任何价格变更不影响已创建订单（订单金额写死在 order.amount_total）

---

# 5) 验收标准（Sprint 1 Done Definition）
用 1 个真实账号走通：

+ 艺术家创建模板并发布
+ 用户浏览模板 → 下单 → 支付成功
+ 艺术家后台看到 paid 订单
+ 艺术家点“完成” → 用户看到 completed
+ payments 表可对账：订单金额 = 支付金额

---

# 6) 风险提醒（你提前提醒 CTO 的“坑”）
+ 支付回调幂等（必须做）
+ order_no 并发生成（必须做）
+ 文件存储不要放本地（上云）
+ event 追加式，避免以后查不清纠纷

---

## 如果你愿意，我下一步可以继续给你：
1. **Sprint 1 的“数据库建表 SQL 草案”**（Postgres/MySQL 二选一）
2. **每个 API 的请求/响应 JSON 规范**（给前后端直接对齐）
3. **最小 UI 线框（页面字段清单）**

你们现在技术栈是偏什么？（Node/Next.js、Python、PHP 还是别的）  
就算你不回答，我也可以默认 “Next.js + Postgres” 给你一套标准稿。

