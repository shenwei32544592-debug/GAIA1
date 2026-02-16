# WhoAmI.Art v0.4 PRD（技术实现版）

> **对象**：CTO / 全栈 / 合约工程师 / 系统架构  
> **目标**：把制度写进代码，而不是写在 PPT

---

## 1. 系统模块总览

### 1.1 核心模块

| 模块 | 说明 |
|------|------|
| Identity Module | 用户 / 艺术家 / 议会身份体系 |
| Order Engine | DIL 订单生成与履约 |
| Distribution Engine | 参数化分配 |
| Governance Log | 不可篡改治理日志 |
| Council Module | Domain Council 运作 |
| Arbitration Module | 去中心化仲裁 |
| Finance Module | Escrow / FCR / FX Buffer |

---

## 2. 核心数据结构（必须硬编码）

### 2.1 RuleID（全系统锚点）

```
RuleID
- Version
- RuleType (Distribution / Governance / Arbitration)
- Parameters (JSON)
- EffectiveDate
- ImmutableFlag
```

> 所有分钱、投票、裁决 **必须引用 RuleID**

---

### 2.2 Wallet（非钱包、记账账户）

```
LedgerAccount
- OwnerID
- AvailableBalance
- PendingBalance (14 days)
- FCRContribution
- FXBufferContribution
```

⚠️ 不是存储用户资金，只是 **平台应付账款账面记录**

---

## 3. 新人准入流程（系统化）

### 3.1 工单状态机

```
APPLIED
→ FORMAL_CHECK
→ COUNCIL_REVIEW
→ FOUNDER_COMPLIANCE
→ CERTIFIED
→ FIRST_TRIAL_ORDER
```

---

### 3.2 评分系统

```
ScoreCard
- ArtisticMaturity (40%)
- LicenseAwareness (20%)
- DeliveryReliability (20%)
- EcosystemDiversity (20%)
```

- ≥75：通过
- 60–74：观察期
- <60：拒绝（6 个月冷却）

---

### 3.3 背书绑定逻辑

```
EndorsementLink
- SponsorRuleID
- NewArtistID
- LiabilityWindow: 180 days
```

违约 → 自动扣 Sponsor 风险额度

---

## 4. 分配引擎（必须自动）

### 4.1 订单分配公式

```
NetPool = GMV - Fees - TaxReserve - RefundReserve
```

分配比例固定写死：

- Artist: 65%
- Anchor Pool: 5%
- Platform: 20%
- FCR: 10%（含 FX）

---

### 4.2 Time / Volume Decay

```
Weight = BaseWeight × TimeDecay × VolumeDecay
```

- TimeDecay：18 个月 → 50%
- VolumeDecay：1k / 10k 触发

---

## 5. 仲裁模块（Arbitration Engine）

### 5.1 仲裁级别选择逻辑

```
if amount < X → Level 1
if repeat dispute → Level 2
if governance impact → Level 3
```

---

### 5.2 Juror 激励系统

```
JurorScore
- AccuracyRate
- ParticipationCount
- SelectionWeight
```

- **不惩罚错误**
- 只奖励判断力稳定者

---

## 6. Governance Log（Append-only）

```
GovernanceLog
- EventType
- ActorID
- RuleID
- VoteSummary
- Outcome
- Timestamp
```
