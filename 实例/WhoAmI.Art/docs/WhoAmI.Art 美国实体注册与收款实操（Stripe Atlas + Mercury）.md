# WhoAmI.Art 美国实体注册与收款实操（Stripe Atlas + Mercury）

**用途**：Founder 人在中国大陆远程注册美国 Delaware LLC、开通收款；First Dollar 落地路径  
**版本**：v1.0  
**性质**：实操指南，可直接照着做

---

## 一、一句话结论

你本人完全可以人在中国大陆，通过「美国注册代理 + Stripe Atlas + Mercury」合法注册并实际控制一家美国公司，**不需要赴美、不需要美国地址、不需要美国合伙人**。

前提：公司是你的，账户是你的，税务路径清晰；而非代持型黑盒。

---

## 二、角色组合（三件事，三类人）

| 角色 | 作用 | 不能做 |
|------|------|--------|
| **Stripe Atlas** | 注册 Delaware LLC、申请 EIN、生成公司文件 | 不控制公司、不控制银行 |
| **Mercury** | 美国银行账户，远程开户，绑定 Stripe | 同上 |
| **美国 CPA** | 年报、税表、合规定性 | 不参与经营 |

---

## 三、Stripe Atlas + Mercury 实操流程

### 3.1 事前准备（人在中国即可）

| 材料 | 说明 |
|------|------|
| 护照 | 有效期 > 6 个月 |
| 中国住址 | 英文，真实可核验 |
| 邮箱 + 手机 | 能收验证码 |
| 公司英文名 | 2–3 个备选 |
| 业务描述 | 见下 3.3 |

### 3.2 业务描述（风控友好版）

```
WhoAmI.Art is a creative services marketplace providing custom digital identity design and copyright licensing services.
```

**严禁使用**：token、investment、profit-sharing、asset、代币、投资、分红。

### 3.3 操作步骤

**Step 1｜Stripe Atlas**
- 选 Delaware LLC、Single-member（你 100%）
- 填创始人信息：护照拼音、国籍中国、中国地址
- 确认你是 Ultimate Beneficial Owner（最终受益人）
- 业务合规问答：创意服务、版权授权、有交付、非金融、非代币
- 支付 $500

**Step 2｜EIN**
- Atlas 代向 IRS 提交 SS-4
- 周期 3–10 天

**Step 3｜Mercury**
- Atlas 完成后跳转 Mercury 开户
- 提供公司文件、护照、公司地址、经营地址（中国）
- 不要求 SSN、不要求赴美
- 1–5 工作日激活

**Step 4｜Stripe 收款**
- Stripe 与 Mercury 自动绑定
- 补充网站 URL、客服邮箱、退款政策
- Stripe Payout Delay 设为 14 天（对齐 Escrow）

### 3.4 时间线

| Day | 状态 |
|-----|------|
| 1 | 提交 Atlas |
| 3 | 公司成立 |
| 7 | EIN 下来 |
| 10 | Mercury 激活 |
| 14 | Stripe 收款 |
| 15 | First Dollar Landed |

---

## 四、合规配置（对齐 v1.1 宪章）

| 配置项 | 设置 |
|--------|------|
| Payout Delay | 14 天 |
| Statement Descriptor | WHOAMI*ART_SERVICE |
| FCR 预留 | 10% 不即时提现 |

---

## 五、银行开户说明（若被问及业务模式）

"Our company acts as a specialized service node facilitating creative service payouts based on a pre-defined algorithmic protocol."

---

## 六、避坑清单

| 避免 | 正确 |
|------|------|
| 中介代持 Stripe/Mercury | 自己 Root 权限 |
| 承诺艺术家分红 | 版权服务费 |
| 网站文案用 Investment | Service / License / Delivery |
| EIN 填中介为老板 | 本人信息 |
| 银行账户代持 | 本人最终控制 |

---

## 七、Founder 判断标准

> 公司是不是我 100% 控制？钱是不是直接进我公司账户？我能不能随时给 Stripe/银行解释每一笔钱？

有一个否定，就不要用。

---

*配合使用：《合规简报》《执行节点授权书》《自然人宪章》*
