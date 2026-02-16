# ✅ signa.ink Phase 1 工程 Checklist（可执行版）

**版本**：v1.1  
**用途**：签名定制平台 MVP 的技术需求书；IT 工程师执行清单；表结构为联盟整合预留留门  
**目标**：快速上线一个**能接单、能收钱、能结算、能扩展**的签名定制平台。

**配套**：《实例层架构原则》《WhoAmI.Art 分润与财务逻辑补充》《基础设施与数据规划》

---

## 🧱 A. 项目基础（必须最先完成）
+ 建立代码仓库（Backend / Frontend 分离或单体均可）
+ 建立基础环境（Dev / Prod 至少区分）
+ 确认数据库类型（MySQL / PostgreSQL / MongoDB 均可）
+ 全局使用 **UUID 或 Snowflake** 作为主键（禁止自增 ID）
+ **联盟留门**：表结构预留 `entity_id` 或 `site_id`（多站点共享库时标识数据归属）；Phase 1 可单站点，该字段可暂空或默认 `signa.ink`

---

## 👤 B. 用户系统（Customer）
### 功能
+ 用户注册
+ 用户登录
+ 基础个人信息页
+ 提交签名内容（文字 / 图片）

### 数据结构要求
+ `user_id`（全局唯一）
+ `created_at`（不可修改）
+ `status`（正常 / 停用）

### ⚠️ 工程提醒
+ 用户表结构允许未来扩展（不要只存 email + password）
+ 不要假设用户永远只是“消费者”

---

## 🎨 C. 艺术家系统（Artist）
### 功能
+ 艺术家注册 / 认证
+ 上传签名模板
+ 设置模板价格
+ 设置定制服务价格
+ 接收订单
+ 查看收入记录

### 数据结构要求
+ `artist_id` 独立于 `user_id`（可以关联，但不是同一个概念）
+ `created_at`
+ `artist_status`
+ **联盟留门**：预留 `batch`（Batch 0 创世公民 / Batch 1+）；Phase 1 可全填 Batch 0；建国回补、代际分润依赖此字段

### ⚠️ 工程提醒（重要）
+ 不要把艺术家当成“用户 + is_artist = true”
+ 艺术家应是**独立业务主体**

---

## 🖋️ D. 签名模板系统（Template）
### 功能
+ 艺术家上传模板
+ 模板定价
+ 模板展示
+ 模板被下单

### 数据结构
+ `template_id`
+ `artist_id`
+ `price`
+ `created_at`
+ `status`（上架 / 下架）

### ⚠️ 工程提醒
+ 模板不要与订单强绑定（一个模板可多次使用）
+ 不要删除模板历史

---

## 📦 E. 订单系统（核心）
### 功能
+ 创建订单
+ 订单状态流转（创建 → 已支付 → 进行中 → 完成）
+ 用户查看订单
+ 艺术家查看订单

### 订单结构（最低要求）
+ `order_id`
+ `user_id`
+ `artist_id`
+ `order_type`（模板 / 定制）
+ `amount_total`
+ `created_at`
+ **联盟留门**：预留 `entity_id`（站点/品类标识）；多站点共享库时订单可追溯归属

### ⚠️ 工程提醒（极重要）
+ **订单状态不要覆盖，只追加记录**
+ 保留以下字段（哪怕暂时不用）：
    - `artist_amount`（65% 艺术家部分）
    - `platform_amount`（5%+20%+10% 平台侧，未来可拆为创世池/运营池/储备金）

---

## 💰 F. 支付系统
### 功能
+ 支付接口接入
+ 支付成功回调
+ 支付失败处理

### 数据结构
+ `payment_id`
+ `order_id`
+ `amount`
+ `paid_at`
+ `payment_status`

### ⚠️ 工程提醒
+ 支付记录与订单分表
+ 不要在支付成功后“直接改订单表核心字段”

---

## 📊 G. 收入与结算（简化版）
### 功能
+ 艺术家查看收入明细
+ 平台查看收入汇总
+ 提现逻辑（可以后置）

### 数据结构
+ `revenue_id`
+ `order_id`
+ `party_type`（artist / platform；**联盟留门**：可扩展为 artist / founder / cto / public_pool / risk_reserve / fcr_holder 等，Phase 1 仅用 artist + platform）
+ `amount`
+ `created_at`

### ⚠️ 工程提醒
+ **收入 = 账本，不是统计**
+ 每一笔钱都有独立记录
+ 联盟 65/5/20/10 分润需多池分流；Phase 1 可简化为 artist + platform 二类，但 `party_type` 设计须可扩展

---

## 🛠️ H. 后台管理（最简）
+ 用户列表
+ 艺术家列表
+ 订单列表
+ 支付记录
+ 简单人工干预入口（仅限必要情况）

---

## 🔐 I. 系统级约束（请务必遵守）
+ 核心数据 **不 hard delete**
+ 核心表字段 **不随意 UPDATE**
+ 所有重要操作有时间戳
+ 关键状态变化有记录表

---

## 🚫 J. 明确现在不做的事（避免过度工程）
+ ❌ 多艺术品类
+ ❌ 共治 / 投票
+ ❌ 慈善分润
+ ❌ 多级权限系统
+ ❌ 跨平台联盟接口（**只留结构**：entity_id、party_type 可扩展、batch 等；不实现逻辑）

👉 **只留结构，不写逻辑**——功能 Phase 1 不做，但表结构为联盟整合预留字段

---

## 🧭 K. 创始人给工程的最终指引（一句话）
**现在我们做的是“能赚钱的最小系统”，  
****但所有数据结构都要为“未来升级”留门。  
****功能可以简单，数据不能粗暴。**

---

## ✅ L. Phase 1 完成判定标准（Definition of Done）
+ 用户能下单
+ 艺术家能接单
+ 钱能进来
+ 收入能对账
+ 数据未来可迁移
+ **联盟整合留门**：entity_id、artist.batch、revenue.party_type 可扩展等已预留，未来迁入共享库或对接联盟分润时无需重构核心表

---

## 🔗 联盟整合留门总览（设计时须考虑）

| 扩展点 | 用途 | Phase 1 实现 |
|--------|------|--------------|
| `entity_id` / `site_id` | 多站点共享库时标识数据归属；订单可追溯至站点 | 可默认 `signa.ink` 或暂空 |
| `artist.batch` | 创世公民 / Batch 1+ 代际；建国回补、分润阶梯依赖 | 全填 Batch 0 |
| `order.entity_id` | 多站点订单溯源 | 同上 |
| `revenue.party_type` 可扩展 | 65/5/20/10 多池分流（artist / founder / cto / public_pool / risk_reserve / fcr_holder） | 仅 artist + platform |
| UUID 主键、不 hard delete、时间戳 | 数据可迁移、可审计、可追溯 | 已要求 |

*配套：《实例层架构原则》《WhoAmI.Art 分润与财务逻辑补充》*
