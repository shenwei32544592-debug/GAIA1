下面我按 **Postgres** 给你一套可直接落地的三件套（SQL 草案 + API JSON 规范 + 最小 UI 字段清单）。你把它发给 CTO/前后端就能对齐开干。

---

## A) Sprint 1 数据库建表 SQL（Postgres 版本）
约定：使用 `pgcrypto` 生成 UUID；金额用 `BIGINT`（分为单位）；JSON 用 `JSONB`  
如果你不用 `pgcrypto`，也可以改成应用层生成 UUID。

```sql
-- =========
-- Extensions
-- =========
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =========
-- Enums (可用 CHECK 代替，这里用 ENUM 方便一致性)
-- =========
DO $$ BEGIN
  CREATE TYPE user_status AS ENUM ('active','suspended');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE artist_status AS ENUM ('active','pending','suspended');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE template_status AS ENUM ('draft','published','hidden');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE order_status AS ENUM ('created','paid','completed','canceled');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE payment_status AS ENUM ('initiated','succeeded','failed','refunded');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE input_type AS ENUM ('text','image');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE actor_type AS ENUM ('system','user','artist','admin');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- =========
-- Table: users
-- =========
CREATE TABLE IF NOT EXISTS users (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email           CITEXT UNIQUE,
  password_hash   TEXT NOT NULL,
  display_name    TEXT NOT NULL,
  status          user_status NOT NULL DEFAULT 'active',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 如果你没有 citext 扩展，则改成 TEXT 并加 lower(email) 唯一索引
CREATE EXTENSION IF NOT EXISTS citext;

-- =========
-- Table: artists
-- =========
CREATE TABLE IF NOT EXISTS artists (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email           CITEXT UNIQUE,
  password_hash   TEXT NOT NULL,
  artist_name     TEXT NOT NULL,
  bio             TEXT,
  status          artist_status NOT NULL DEFAULT 'pending',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =========
-- Table: templates
-- =========
CREATE TABLE IF NOT EXISTS templates (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  artist_id       UUID NOT NULL REFERENCES artists(id),
  name            TEXT NOT NULL,
  preview_url     TEXT,
  asset_url       TEXT,
  price_cny       BIGINT NOT NULL DEFAULT 0, -- 单次版费/调用费，分
  status          template_status NOT NULL DEFAULT 'draft',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_templates_artist_id ON templates(artist_id);
CREATE INDEX IF NOT EXISTS idx_templates_status ON templates(status);

-- =========
-- Table: orders
-- =========
CREATE TABLE IF NOT EXISTS orders (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_no        TEXT NOT NULL UNIQUE,
  user_id         UUID NOT NULL REFERENCES users(id),
  artist_id       UUID NOT NULL REFERENCES artists(id),
  template_id     UUID NOT NULL REFERENCES templates(id),
  status          order_status NOT NULL DEFAULT 'created',
  currency        TEXT NOT NULL DEFAULT 'CNY',
  amount_total    BIGINT NOT NULL, -- 分
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_artist_id ON orders(artist_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);

-- =========
-- Table: order_inputs
-- =========
CREATE TABLE IF NOT EXISTS order_inputs (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id        UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  input_type      input_type NOT NULL,
  input_text      TEXT,
  input_file_url  TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT chk_order_inputs_one_of
    CHECK (
      (input_type='text' AND input_text IS NOT NULL)
      OR
      (input_type='image' AND input_file_url IS NOT NULL)
    )
);

CREATE INDEX IF NOT EXISTS idx_order_inputs_order_id ON order_inputs(order_id);

-- =========
-- Table: payments
-- =========
CREATE TABLE IF NOT EXISTS payments (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id        UUID NOT NULL REFERENCES orders(id),
  provider        TEXT NOT NULL, -- stripe/alipay/wechat
  provider_txn_id TEXT NOT NULL UNIQUE,
  status          payment_status NOT NULL DEFAULT 'initiated',
  amount          BIGINT NOT NULL,
  currency        TEXT NOT NULL DEFAULT 'CNY',
  raw_payload     JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_payments_order_id ON payments(order_id);

-- =========
-- Table: order_events (append-only)
-- =========
CREATE TABLE IF NOT EXISTS order_events (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id        UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  event_type      TEXT NOT NULL, -- created/paid/completed/canceled/...
  actor_type      actor_type NOT NULL,
  actor_id        UUID,
  note            TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_order_events_order_id_created_at
  ON order_events(order_id, created_at);

-- =========
-- Trigger: updated_at auto update
-- =========
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END; $$ LANGUAGE plpgsql;

DO $$ BEGIN
  CREATE TRIGGER trg_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TRIGGER trg_artists_updated_at
    BEFORE UPDATE ON artists
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TRIGGER trg_templates_updated_at
    BEFORE UPDATE ON templates
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TRIGGER trg_orders_updated_at
    BEFORE UPDATE ON orders
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TRIGGER trg_payments_updated_at
    BEFORE UPDATE ON payments
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
```

---

## B) Sprint 1 API 请求/响应 JSON 规范（前后端对齐版）
统一返回格式建议：

```json
{
  "ok": true,
  "data": {},
  "error": null
}
```

错误：

```json
{
  "ok": false,
  "data": null,
  "error": { "code": "INVALID_INPUT", "message": "..." }
}
```

### B1) Auth - User
#### 1) `POST /api/auth/user/register`
Request:

```json
{
  "email": "user@example.com",
  "password": "Passw0rd!",
  "display_name": "Ava"
}
```

Response:

```json
{
  "ok": true,
  "data": {
    "token": "jwt_or_session_token",
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "display_name": "Ava",
      "status": "active",
      "created_at": "2026-02-08T00:00:00Z"
    }
  },
  "error": null
}
```

#### 2) `POST /api/auth/user/login`
Request:

```json
{ "email": "user@example.com", "password": "Passw0rd!" }
```

Response 同上（token + user）。

---

### B2) Auth - Artist
#### 3) `POST /api/auth/artist/register`
Request:

```json
{
  "email": "artist@example.com",
  "password": "Passw0rd!",
  "artist_name": "Studio K",
  "bio": "Signature designer."
}
```

Response:

```json
{
  "ok": true,
  "data": {
    "token": "token",
    "artist": {
      "id": "uuid",
      "email": "artist@example.com",
      "artist_name": "Studio K",
      "bio": "Signature designer.",
      "status": "pending",
      "created_at": "2026-02-08T00:00:00Z"
    }
  },
  "error": null
}
```

#### 4) `POST /api/auth/artist/login`
Request:

```json
{ "email": "artist@example.com", "password": "Passw0rd!" }
```

Response 同上（token + artist）。

---

### B3) Me（前端判断身份用）
#### 5) `GET /api/me`
Response（用户）：

```json
{
  "ok": true,
  "data": {
    "actor_type": "user",
    "user": { "id": "uuid", "email": "u@x.com", "display_name": "Ava" }
  },
  "error": null
}
```

Response（艺术家）：

```json
{
  "ok": true,
  "data": {
    "actor_type": "artist",
    "artist": { "id": "uuid", "email": "a@x.com", "artist_name": "Studio K" }
  },
  "error": null
}
```

---

### B4) Uploads（通用上传）
#### 6) `POST /api/uploads`
Request（multipart/form-data）：

+ file: binary
+ kind: `template_preview` | `template_asset` | `order_input`

Response:

```json
{
  "ok": true,
  "data": {
    "url": "https://cdn.xxx.com/path/file.png",
    "mime": "image/png",
    "size": 123456
  },
  "error": null
}
```

---

### B5) Templates
#### 7) `GET /api/templates?page=1&page_size=20`
Response:

```json
{
  "ok": true,
  "data": {
    "items": [
      {
        "id": "uuid",
        "artist_id": "uuid",
        "name": "Bold Script 01",
        "preview_url": "https://...",
        "price_cny": 500,
        "status": "published"
      }
    ],
    "page": 1,
    "page_size": 20,
    "total": 123
  },
  "error": null
}
```

#### 8) `GET /api/templates/:id`
Response:

```json
{
  "ok": true,
  "data": {
    "id": "uuid",
    "artist_id": "uuid",
    "name": "Bold Script 01",
    "preview_url": "https://...",
    "asset_url": "https://...",
    "price_cny": 500,
    "status": "published",
    "created_at": "2026-02-08T00:00:00Z"
  },
  "error": null
}
```

#### 9) `POST /api/artist/templates`
Request:

```json
{
  "name": "Bold Script 01",
  "preview_url": "https://cdn/...png",
  "asset_url": "https://cdn/...svg",
  "price_cny": 500
}
```

Response:

```json
{
  "ok": true,
  "data": { "template_id": "uuid" },
  "error": null
}
```

#### 10) `PATCH /api/artist/templates/:id`
Request（示例：发布）：

```json
{ "status": "published" }
```

或改价：

```json
{ "price_cny": 500 }
```

Response:

```json
{
  "ok": true,
  "data": { "updated": true },
  "error": null
}
```

---

### B6) Orders
#### 11) `POST /api/orders`
Request（输入文本）：

```json
{
  "template_id": "uuid",
  "input_type": "text",
  "input_text": "William"
}
```

Request（上传图片）：

```json
{
  "template_id": "uuid",
  "input_type": "image",
  "input_file_url": "https://cdn/...jpg"
}
```

Response:

```json
{
  "ok": true,
  "data": {
    "order": {
      "id": "uuid",
      "order_no": "SIG-2026-000001",
      "status": "created",
      "amount_total": 500,
      "currency": "CNY",
      "template_id": "uuid",
      "artist_id": "uuid",
      "created_at": "2026-02-08T00:00:00Z"
    }
  },
  "error": null
}
```

#### 12) `GET /api/orders`
Response:

```json
{
  "ok": true,
  "data": {
    "items": [
      { "id": "uuid", "order_no": "SIG-2026-000001", "status": "paid", "amount_total": 500, "created_at": "..." }
    ]
  },
  "error": null
}
```

#### 13) `GET /api/orders/:id`
Response（含 inputs + events）：

```json
{
  "ok": true,
  "data": {
    "order": { "id": "uuid", "order_no": "SIG-2026-000001", "status": "paid", "amount_total": 500 },
    "inputs": [
      { "input_type": "text", "input_text": "William", "created_at": "..." }
    ],
    "events": [
      { "event_type": "created", "actor_type": "user", "note": null, "created_at": "..." },
      { "event_type": "paid", "actor_type": "system", "note": "provider=stripe", "created_at": "..." }
    ]
  },
  "error": null
}
```

---

### B7) Payments
#### 14) `POST /api/payments/initiate`
Request:

```json
{ "order_id": "uuid" }
```

Response（支付链接/二维码参数）：

```json
{
  "ok": true,
  "data": {
    "provider": "stripe",
    "payment_url": "https://pay.xxx.com/checkout/...",
    "provider_txn_id": "txn_123"
  },
  "error": null
}
```

#### 15) `POST /api/payments/webhook`
+ 入参：provider 原样 payload（不做前端调用）
+ 出参：200 OK

Webhook 处理规则（写给后端）：

+ 幂等键：`provider_txn_id`
+ 更新：payments.status = succeeded → orders.status = paid → 写 event(paid)

---

### B8) Artist Orders（接单/完成）
#### 16) `GET /api/artist/orders?status=paid`
Response:

```json
{
  "ok": true,
  "data": {
    "items": [
      { "id": "uuid", "order_no": "SIG-2026-000001", "status": "paid", "input_summary": "William" }
    ]
  },
  "error": null
}
```

#### 17) `POST /api/artist/orders/:id/complete`
Request:

```json
{ "note": "completed by artist" }
```

Response:

```json
{
  "ok": true,
  "data": { "status": "completed" },
  "error": null
}
```

---

## C) 最小 UI 线框（页面字段清单）
不画图，直接给“页面需要哪些字段/组件”，前端可以用任何框架快速做。

### C1) 用户端
#### 页面 1：Templates 列表
组件/字段：

+ 搜索框（可选 Sprint 1 不做）
+ 模板卡片：
    - preview 图
    - name
    - price（¥X）
    - artist_name（可选）
    - CTA：View / Choose

数据来源：

+ `GET /api/templates`

---

#### 页面 2：Template Detail + 下单
展示区：

+ preview 大图
+ name
+ price
+ artist 简介（bio 可选）  
下单区：
+ Input Type 选择：Text / Image
+ Text 输入框（name/签名文本）
+ Upload 按钮（图片上传 → url）
+ CTA：Create Order

交互：

1. 上传（可选）→ `/api/uploads` 拿 url
2. 下单 → `POST /api/orders`
3. 跳转到订单详情页

---

#### 页面 3：My Orders
列表字段：

+ order_no
+ status（created/paid/completed）
+ amount_total
+ created_at
+ CTA：View

数据来源：

+ `GET /api/orders`

---

#### 页面 4：Order Detail（可合并到 My Orders 里弹窗）
字段：

+ order_no, status, amount_total
+ inputs（显示 text 或 图片）
+ events 时间线（created/paid/completed）
+ CTA（当 status=created）：Pay Now

支付交互：

+ 点击 Pay Now → `POST /api/payments/initiate` → 跳转 payment_url

---

### C2) 艺术家端
#### 页面 A：Artist Templates（管理）
列表字段：

+ preview
+ name
+ price_cny
+ status
+ CTA：Edit / Publish / Hide

创建模板表单：

+ name
+ upload preview（→ url）
+ upload asset（→ url）
+ price_cny
+ Save（POST）
+ Publish（PATCH）

---

#### 页面 B：Artist Orders（接单看板）
列表字段：

+ order_no
+ status（重点：paid）
+ input_summary（如果 text 直接显示；image 显示“image”）
+ created_at
+ CTA：View

订单详情：

+ inputs
+ events
+ CTA：Mark Completed（POST complete）
+ note 输入（可选）

---

## 你可以直接转发给 CTO 的一句“执行提醒”
+ Sprint 1 **不要做分润**、不要做治理、不要做复杂角色；只把：**模板库 → 下单 → 支付 → 艺术家完成** 跑通。
+ 但数据库里必须有 `order_events`（以后升级不翻车）。

---

如果你希望我继续补强成“可直接开工的工程包”，我下一条就给：

1. `order_no` 生成方案（避免并发）
2. webhook 幂等处理伪代码（含事务顺序）
3. Postman/Insomnia 测试集合字段清单

