# WhoAmI.Art 机制与算法实施路线图

**用途**：将宪政机制（协商、分配、追溯、签约）映射至 IT 系统，供沈炎君实现参考。  
**版本**：1.0  
**日期**：2025-02-12  
**依赖**：讨论沉淀 §9、IT 实施参考、signa-ink-architecture v1.1

---

## 一、机制到系统的映射总表

| 机制 | 系统表现 | 实现形态 |
|------|----------|----------|
| **协商机制** | 需求表达、贡献主张、分配谈判 | 节点提交需求 → 系统记录 → 匹配/回流输出 |
| **分配机制** | 利益从何而来、如何分配 | 收入入账 → 算法计算 → 分配记录 → 可追溯 |
| **追溯机制** | 无人能赖账 | 每笔分配有来源、有规则、有签名 |
| **签约机制** | 人人承诺宪政 | 节点与公司签署协议 → 系统存证 |
| **小团队决策** | 日常执行权 | 角色权限：Founder 拍板，IT/财务执行 |

---

## 二、分步实现路线

### Step 0：数据基础（在现有架构上扩展）

**当前已有**：leads, requests, artists, marks, access_keys, constraint_rules

**需新增表**：

```
nodes           — 节点（艺术家、供应商、投资人、IT、财务、法务、营销等）
agreements      — 签约记录（节点与公司的宪政承诺）
contributions   — 贡献记录（类型、数量、时间、关联订单/项目）
distribution_rules — 分配规则（贡献类型 → 比例/公式）
distribution_log — 分配流水（每笔收入的拆分记录，可追溯）
```

### Step 1：节点与签约（2–3 周）

| 任务 | 内容 |
|------|------|
| nodes 表 | id, type(artist/supplier/investor/it/finance/legal/marketing), name, email, agreement_signed_at, status |
| agreements 表 | id, node_id, agreement_type(constitution/fcr/supplier), signed_at, document_hash |
| 签约流程 | 节点填写信息 → 下载/签署协议 → 上传或确认 → 系统记录 signed_at |
| 法律产出 | 公司代表与每人签署的协议模板（宪法承诺 + 分配规则摘要） |

**输出**：每个参与节点均有「已签约」状态，可查询。

---

### Step 2：贡献记录（2–3 周）

| 任务 | 内容 |
|------|------|
| contributions 表 | id, node_id, type(economic/time/creative/labor), amount, unit, order_id/request_id, created_at |
| 贡献类型枚举 | economic=资金, time=时间, creative=创意, labor=劳动 |
| 录入方式 | 订单完成时自动记 artist 贡献；投资时记 economic；IT/财务按周期或项目记 labor |
| 可追溯 | 每笔贡献关联 order_id 或 project_id，可回溯至具体交易 |

**输出**：系统内存在结构化贡献记录，可按节点、类型、时间聚合。

---

### Step 3：分配规则引擎（3–4 周）

| 任务 | 内容 |
|------|------|
| distribution_rules 表 | id, rule_name, contribution_type, share_pct, priority, valid_from, valid_until |
| 规则示例 | 艺术家分成 40%、FCR 15%、平台 20%、履约成本 25%… |
| 引擎逻辑 | 收入入账 → 按规则计算各节点应得 → 写入 distribution_log |
| 冲突处理 | 多规则时按 priority；争议时人工复核 + 记录 |

**算法伪代码**：

```
function allocate(revenue_event):
  total = revenue_event.amount
  rules = get_active_rules(revenue_event.type)
  for rule in rules by priority:
    share = total * rule.share_pct
    log(distribution_log, node_id=rule.node_id, amount=share, rule_id=rule.id, trace_id=revenue_event.id)
```

**输出**：每笔收入可自动拆分，每笔分配可追溯到具体规则与来源。

---

### Step 4：分配流水与可追溯（与 Step 3 并行）

| 任务 | 内容 |
|------|------|
| distribution_log 表 | id, node_id, amount, currency, source_type(order/investment/fund), source_id, rule_id, created_at |
| 查询接口 | 节点可查看「我的贡献」「我的待分配」「我的已分配」 |
| 审计日志 | 所有分配记录不可删改，仅可追加修正记录 |

**输出**：任何人可核查「这笔钱从哪来、按什么规则、分给谁」。

---

### Step 5：协商机制的系统支持（Phase 2）

| 任务 | 内容 |
|------|------|
| 需求提交 | 节点可提交「我需要 X」「我主张我的贡献应为 Y」 |
| 匹配/回流 | 系统汇总需求，计算交集，输出建议分配方案 |
| 逆向投票 | 每人表达真实需求 → 系统聚合 → 小团队决策参考 |
| 实现形态 | 轻量讨论区 + 结构化需求表单 + 分配建议报告 |

**说明**：Phase 1 可先用线下会议 + 表格；系统在 Phase 2 支撑在线协商。

---

## 三、核心算法设计

### 3.1 分配算法输入输出

| 输入 | 来源 |
|------|------|
| 收入事件 | 订单支付、投资款到账、风险基金拨款 |
| 分配规则 | distribution_rules 表 |
| 贡献记录 | contributions 表（可选，用于按贡献动态分配） |

| 输出 | 去向 |
|------|------|
| 分配流水 | distribution_log 表 |
| 节点余额/待结算 | 可聚合为「待打款」列表 |

---

### 3.2 两种分配模式

| 模式 | 适用场景 | 逻辑 |
|------|----------|------|
| **固定比例** | 订单收入、常规分成 | 收入 × 规则比例 → 各节点 |
| **贡献加权** | 风险基金、超额分配、争议调节 | 按 contributions 聚合权重分配 |

Phase 1 以固定比例为主；Phase 2 引入贡献加权。

---

### 3.3 可追溯性要求

| 层级 | 实现 |
|------|------|
| 收入来源 | 每笔 distribution_log 有 source_type + source_id |
| 分配依据 | 每笔有 rule_id，可查规则定义 |
| 规则版本 | 规则有 valid_from/valid_until，历史可查 |
| 修正记录 | 若有调整，写 correction_log 引用原记录 |

---

## 四、IT 部门约束（与宪政一致）

| 约束 | 实现方式 |
|------|----------|
| 算法透明 | 规则在表中可读；引擎逻辑开源或可审计 |
| 可追溯 | 所有分配有日志，不可删 |
| 协议约束 | IT 与公司签协议：系统需达成上述目标；未达成则无收益、退出 |

---

## 五、与现有架构的衔接

| 现有模块 | 扩展点 |
|----------|--------|
| requests | 订单完成后触发分配计算，写入 distribution_log |
| artists | 映射为 nodes(type=artist) |
| Phase 2 支付 | Stripe 等支付回调 → 触发 allocate() |

---

## 六、实施优先级建议

| 顺序 | 内容 | 预估周期 |
|------|------|----------|
| 1 | nodes + agreements 表及签约流程 | 2 周 |
| 2 | contributions 表及基础录入 | 2 周 |
| 3 | distribution_rules + distribution_log + 分配引擎 | 3 周 |
| 4 | 节点端查询「我的贡献/分配」 | 1 周 |
| 5 | 协商机制支持（Phase 2） | 依需求 |

**合计**：约 8 周可完成机制在系统中的骨架落地，后续迭代细化。

---

## 七、相关文档

| 文档 | 路径 |
|------|------|
| 讨论沉淀 | `00_索引与导航/signa.ink 讨论沉淀与点子索引.md` §9 |
| IT 实施参考 | `04_工程与落地/IT 实施参考-分配机制与治理（沈炎君 handoff）.md` |
| 架构设计 | `04_工程与落地/signa-website/signa-ink-architecture-v1.1.md` |

---

**下一步**：与沈炎君对齐 Step 0–1 的数据模型与接口设计，确认后可开工。
