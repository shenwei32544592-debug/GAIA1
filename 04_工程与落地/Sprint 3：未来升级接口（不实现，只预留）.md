## 🟦 Sprint 3：未来升级接口（不实现，只预留）
**周期建议：1–2 周**

### 🎯 Sprint 目标
**不做大系统，但保证以后能升级**

---

### K. 数据结构预留（最重要）
+ user / artist 独立表
+ order 不绑定具体产品形态
+ 收入 ledger 可扩展 party_type

---

### L. 权限与角色预留（不启用）
+ capability_mask 字段（即使不用）
+ role_history 表（空表也行）

---

### M. 扩展字段预留
+ order 表预留：
    - `metadata`
    - `future_use`
+ artist 表预留：
    - `reputation_score`
    - `legacy_anchor`

---

### N. 数据迁移准备
+ 所有表有 created_at
+ 所有核心表有 UUID
+ 禁止业务逻辑写死在前端

---

### ✅ Sprint 3 完成标准
+ 系统可以“原地升级”
+ 没有未来必改的死结构
+ 技术债最小化

---

## 🧭 给创始人的一句真实建议（重要）
**Sprint 1 是活命  
****Sprint 2 是信任  
****Sprint 3 是尊严**

你现在做的不是“搞复杂”，  
而是在**用工程方式避免人性问题**。

---

### 
