/**
 * GAIA 说明书网站构建脚本
 * 将 Markdown 转换为带导航的 HTML 单页，并注入源文档引用
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { marked } from 'marked';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.join(__dirname, '..');
const mappingPath = path.join(__dirname, 'doc-forum-mapping.json');
let DOC_TO_FORUM = {};
if (fs.existsSync(mappingPath)) {
  try {
    const raw = JSON.parse(fs.readFileSync(mappingPath, 'utf-8'));
    Object.entries(raw).forEach(([k, v]) => {
      if (k !== '_comment' && typeof v === 'string' && v.trim()) DOC_TO_FORUM[k] = v.trim();
    });
  } catch (_) {}
}
const manualPath = path.join(rootDir, '00_索引与导航', 'GAIA 完整说明书（网站浏览试用版）.md');
const outputPath = path.join(__dirname, 'index.html');
const docsDir = path.join(__dirname, 'docs');

// 部署排除：以下文档不对外公开，不复制到 docs/，链接替换为「内部文档」
const DEPLOY_EXCLUDED = new Set([
  '00_索引与导航/Founder-AI 协作约定.md',
  '00_索引与导航/输入与解释映射表.md',
  '00_索引与导航/节点角色说服与加入路径分析（决策参考）.md',
  '00_索引与导航/Founder-沈炎君 协作与治理要点.md',
  '00_索引与导航/有效路径与时间节点安排.md',
  '00_索引与导航/敏感信息防护要点.md',
]);

// 源文档映射：章节 id => [{ title, path }]
const DOC_REFS = {
  'sec-1': [
    { title: 'GAIA 对外官网版', path: '06_解释与叙事/GAIA 对外官网版.md' },
    { title: 'WhoAmI.Art 对外官网版', path: '06_解释与叙事/WhoAmI.Art 对外官网版.md' },
  ],
  'sec-2': [
    { title: 'GAIA 联盟宪章·序言', path: '01_宪法与治理/GAIA 宪法·序言.md' },
    { title: '第一编｜基本权利', path: '01_宪法与治理/第一编｜基本权利.md' },
    { title: '第四编｜收益与反哺', path: '01_宪法与治理/第四编｜收益与反哺.md' },
    { title: '第二编｜资产与真理', path: '01_宪法与治理/第二编｜资产与真理.md' },
    { title: '第三编｜共识与裁定', path: '01_宪法与治理/第三编｜共识与裁定.md' },
    { title: '第五编｜平台义务与权力边界', path: '01_宪法与治理/第五编｜平台义务与权力边界.md' },
    { title: '第六编｜修正、演进与文明延续', path: '01_宪法与治理/第六编｜修正、演进与文明延续.md' },
    { title: 'GAIA 联盟宪章 → 系统模块映射表', path: '01_宪法与治理/GAIA 宪法 → 系统模块映射表.md' },
  ],
  'sec-3': [
    { title: 'GAIA 成立理由书（艺术家为何联合）', path: '06_解释与叙事/GAIA 成立理由书（艺术家为何联合）.md' },
    { title: 'GAIA 全球战略蓝皮书', path: '06_解释与叙事/GAIA 全球战略蓝皮书.md' },
    { title: 'GAIA 全球战略路演 PPT 纲要', path: '06_解释与叙事/GAIA 全球战略路演 PPT 纲要.md' },
    { title: 'GAIA 一页制度杀伤页', path: '06_解释与叙事/GAIA 一页制度杀伤页.md' },
  ],
  'sec-4': [
    { title: 'GAIA 建国路线图：从思想启蒙到首届治理', path: '06_解释与叙事/GAIA 建国路线图：从思想启蒙到首届治理.md' },
    { title: '联盟创世档案（制宪会议）', path: '00_索引与导航/联盟创世档案（制宪会议）.md' },
    // Founder-AI 协作约定、输入与解释映射表：内部文档，不对外部署
  ],
  'sec-5': [
    { title: 'GAIA 常见问题（FAQ）·联邦党人文集溯源', path: '06_解释与叙事/GAIA 常见问题（FAQ）·联邦党人文集溯源.md' },
    { title: 'GAIA 技术可行性说明（公众版）', path: '06_解释与叙事/GAIA 技术可行性说明（公众版）.md' },
  ],
  'sec-6': [
    { title: '创意载体规范（核心逻辑摘要）', path: '02_协议与规范/创意载体规范（核心逻辑摘要）.md' },
    { title: '递归反哺与源头确权细则', path: '02_协议与规范/递归反哺与源头确权细则.md' },
    { title: '公益金池细则', path: '02_协议与规范/公益金池细则.md' },
    { title: 'CTO 技术共识协议', path: '02_协议与规范/CTO技术共识协议.md' },
    { title: 'FCR 1.1 创始贡献者权利协议', path: '02_协议与规范/FCR 1.1 创始贡献者权利协议.md' },
    { title: 'FCR 附录：90日窗口与价值量化说明', path: '02_协议与规范/FCR 附录：90日窗口与价值量化说明.md' },
    { title: '创世贡献记录与确认机制（论坛版）', path: '02_协议与规范/创世贡献记录与确认机制（论坛版）.md' },
    { title: '文档与论坛一体化方案：制宪档案库设计', path: '02_协议与规范/文档与论坛一体化方案：制宪档案库设计.md' },
    { title: '建国期人事网：自发协作结构设计（草案）', path: '02_协议与规范/建国期人事网：自发协作结构设计（草案）.md' },
    { title: '建国者共建金：小额投入与紧急采购机制（草案）', path: '02_协议与规范/建国者共建金：小额投入与紧急采购机制（草案）.md' },
    { title: 'CTO 多协作者协作与精确接入指南（草案）', path: '04_工程与落地/CTO 多协作者协作与精确接入指南（草案）.md' },
    { title: 'IT 基础设施甘特图与成本估算（战略预参）', path: '04_工程与落地/IT 基础设施甘特图与成本估算（战略预参）.md' },
    { title: '联盟胚胎发展：成长时间轴与资源映射（战略预参）', path: '04_工程与落地/联盟胚胎发展：成长时间轴与资源映射（战略预参）.md' },
    { title: '公民参与与贡献记账', path: '02_协议与规范/公民参与与贡献记账（Public Participation & Credits）.md' },
    { title: '艺术家与系统需求直连机制（草案）', path: '02_协议与规范/艺术家与系统需求直连机制（草案）.md' },
    { title: '建国回补与确定性溢价机制（草案）', path: '02_协议与规范/建国回补与确定性溢价机制（草案）.md' },
    { title: '基建期艺术家共投机制（草案）', path: '02_协议与规范/基建期艺术家共投机制（草案）.md' },
    { title: '论坛身份体系与贡献记账规则-MVP', path: '02_协议与规范/论坛身份体系与贡献记账规则-MVP.md' },
    { title: 'GAIA 社区早期权重（Reputation Score）计算逻辑', path: '02_协议与规范/GAIA 社区早期权重（Reputation Score）计算逻辑.md' },
    { title: '建国务实进度看板：设计说明', path: '02_协议与规范/建国务实进度看板：设计说明.md' },
    { title: '广发英雄贴：设计与操作说明', path: '02_协议与规范/广发英雄贴：设计与操作说明.md' },
    { title: '建国债券发行与认购机制', path: '02_协议与规范/建国债券发行与认购机制.md' },
    { title: '建国成功判定与窗口操作速查表', path: '02_协议与规范/建国成功判定与窗口操作速查表.md' },
    { title: '多期 FCR 制度设计（分池制与操作细则）', path: '02_协议与规范/多期 FCR 制度设计：分池制与操作细则（草案）.md' },
    { title: '分配方案（公式化定档与供应商定价）', path: '02_协议与规范/分配方案：公式化定档与供应商定价（草案）.md' },
    { title: '三项不可谈判权力声明', path: '02_协议与规范/三项不可谈判权力声明.md' },
    { title: '签字权与法人地位承继规则（草案）', path: '02_协议与规范/签字权与法人地位承继规则（草案）.md' },
    { title: '裁定者身份、遴选与退出细则', path: '02_协议与规范/裁定者身份、遴选与退出细则.md' },
    { title: '账户应急指令规则（草案）', path: '02_协议与规范/账户应急指令规则（草案）.md' },
    { title: 'WhoAmI.Art 核心技术节点（创世技术官）合作备忘录', path: '实例/WhoAmI.Art/docs/WhoAmI.Art 核心技术节点（创世技术官）合作备忘录（摘要版）.md' },
  ],
  'sec-7': [
    { title: 'GAIA 节点角色与 IT 平台映射', path: '04_工程与落地/GAIA 节点角色与 IT 平台映射.md' },
    { title: 'GAIA 联盟宪章 → 系统模块映射表', path: '01_宪法与治理/GAIA 宪法 → 系统模块映射表.md' },
  ],
  'sec-8': [
    { title: '分润与财务逻辑补充（财务工程 v1.0）', path: '实例/WhoAmI.Art/docs/WhoAmI.Art 分润与财务逻辑补充（财务工程 v1.0）.md' },
    { title: '财务分配参数设计依据（待细化）', path: '实例/WhoAmI.Art/docs/WhoAmI.Art 财务分配参数设计依据（待细化）.md' },
  ],
  'sec-9': [
    { title: '自然人宪章说明', path: '实例/WhoAmI.Art/docs/WhoAmI.Art 自然人宪章说明.md' },
    { title: '创世公民与准入分层（自然人宪章配套）', path: '实例/WhoAmI.Art/docs/WhoAmI.Art 创世公民与准入分层（自然人宪章配套）.md' },
    { title: '宪章型协作协议（自然人专用版）结构草案', path: '实例/WhoAmI.Art/docs/WhoAmI.Art 宪章型协作协议（自然人专用版）结构草案.md' },
    { title: '执行节点（壳公司）专项授权书', path: '实例/WhoAmI.Art/docs/WhoAmI.Art 执行节点（壳公司）专项授权书（摘要版）.md' },
    { title: '签字权与法人地位承继规则（草案）', path: '02_协议与规范/签字权与法人地位承继规则（草案）.md' },
    { title: '衍生业务优先权与最惠国条款', path: '实例/WhoAmI.Art/docs/WhoAmI.Art 衍生业务优先权与最惠国条款（摘要版）.md' },
  ],
  'sec-10': [
    // 有效路径、节点角色说服：内部文档，不对外部署
  ],
  'sec-11': [
    { title: '给艺术家的公开信', path: '05_对外与外交/给艺术家的公开信.md' },
    { title: 'WhoAmI.Art 对外官网版', path: '06_解释与叙事/WhoAmI.Art 对外官网版.md' },
    { title: '写给已成名艺术家的邀请函', path: '05_对外与外交/写给已成名艺术家的邀请函.md' },
    { title: '给年轻艺术家的短版信', path: '05_对外与外交/给年轻艺术家的短版信.md' },
  ],
  'sec-12': [
    { title: 'GAIA 标准术语与概念表', path: '00_索引与导航/GAIA 标准术语与概念表.md' },
  ],
  'appendix': [
    { title: 'GAIA Master Index', path: '00_索引与导航/GAIA Master Index.md' },
    { title: 'GAIA 分角色导读', path: '00_索引与导航/GAIA 分角色导读.md' },
    { title: '创世者誓', path: '03_创世与权益/创世者誓.md' },
    { title: '创世者在GAIA体系中的定位', path: '03_创世与权益/创世者在GAIA体系中的定位.md' },
    { title: '创世者权利与约束附录', path: '03_创世与权益/《创世者权利与约束附录》.md' },
    { title: '创世者行动纲要', path: '03_创世与权益/创世者行动纲要（Founders\u2019 Action Charter · v1.0）.md' },
    { title: '创世者随身文本', path: '03_创世与权益/创世者随身文本 · Founders\u2019 Pocket Charter.md' },
    { title: 'GAIA 宪法 · 创世者随身文本', path: '03_创世与权益/GAIA 宪法 · 创世者随身文本.md' },
    { title: '文档分层与项目结构说明', path: '00_索引与导航/文档分层与项目结构说明.md' },
    { title: '快速查找表', path: '00_索引与导航/快速查找表.md' },  // 建时过滤敏感行
    { title: '新节点入门包', path: '00_索引与导航/新节点入门包.md' },
    { title: '更新日志', path: '00_索引与导航/更新日志.md' },
    { title: '06_解释与叙事 索引', path: '06_解释与叙事/06_索引.md' },
    { title: 'GAIA 完整思想包（单文件参考版）', path: '06_解释与叙事/GAIA 完整思想包（单文件参考版）.md' },
    { title: 'GAIA 1.0 全系统集成规范（Master Spec）', path: '02_协议与规范/GAIA 1.0 全系统集成规范（Master Spec）.md' },
    { title: 'GAIA 1.0 创世发布声明', path: '06_解释与叙事/GAIA 1.0 创世发布声明.md' },
    { title: 'GAIA Video PPT Script (Simple EN)', path: '06_解释与叙事/GAIA Video PPT Script (Simple EN).md' },
    { title: 'GAIA Implementation Roadmap (Simple EN)', path: '06_解释与叙事/GAIA Implementation Roadmap (Simple EN).md' },
  ]
};

// 《文档名》→ 可点击链接的映射；含简称以便匹配
const DOC_ALIASES = buildDocAliases();

function buildDocAliases() {
  const map = new Map();
  const entries = Object.values(DOC_REFS).flat();
  const seen = new Set();
  entries.forEach(({ title, path: p }) => {
    const htmlPath = p.replace(/\.md$/, '.html');
    if (!seen.has(p)) {
      seen.add(p);
      map.set(title, htmlPath);
      map.set(title.replace(/[：:].*$/, ''), htmlPath); // 建国务实进度看板：设计说明 → 建国务实进度看板
      map.set(title.replace(/（[^）]+）$/, ''), htmlPath); // 创世贡献记录与确认机制（论坛版）→ 创世贡献记录与确认机制
      map.set(title.replace(/：.*$/, ''), htmlPath);
    }
  });
  // 补充常见简称
  const extras = [
    ['创世贡献记录与确认机制', '02_协议与规范/创世贡献记录与确认机制（论坛版）.html'],
    ['公民参与与贡献记账', '02_协议与规范/公民参与与贡献记账（Public Participation & Credits）.html'],
    ['艺术家与系统需求直连机制', '02_协议与规范/艺术家与系统需求直连机制（草案）.html'],
    ['建国回补与确定性溢价机制', '02_协议与规范/建国回补与确定性溢价机制（草案）.html'],
    ['基建期艺术家共投机制', '02_协议与规范/基建期艺术家共投机制（草案）.html'],
    ['论坛身份体系与贡献记账规则-MVP', '02_协议与规范/论坛身份体系与贡献记账规则-MVP.html'],
    ['GAIA 社区早期权重计算逻辑', '02_协议与规范/GAIA 社区早期权重（Reputation Score）计算逻辑.html'],
    ['GAIA 社区早期权重', '02_协议与规范/GAIA 社区早期权重（Reputation Score）计算逻辑.html'],
    ['建国务实进度看板', '02_协议与规范/建国务实进度看板：设计说明.html'],
    ['广发英雄贴', '02_协议与规范/广发英雄贴：设计与操作说明.html'],
    ['FCR 附录', '02_协议与规范/FCR 附录：90日窗口与价值量化说明.html'],
    ['分润与财务逻辑补充', '实例/WhoAmI.Art/docs/WhoAmI.Art 分润与财务逻辑补充（财务工程 v1.0）.html'],
    ['递归反哺与源头确权细则', '02_协议与规范/递归反哺与源头确权细则.html'],
    ['公益金池细则', '02_协议与规范/公益金池细则.html'],
    ['有效路径与时间节点安排', '00_索引与导航/有效路径与时间节点安排.html'],
    ['节点角色说服与加入路径分析', '00_索引与导航/节点角色说服与加入路径分析（决策参考）.html'],
    ['签字权与法人地位承继规则', '02_协议与规范/签字权与法人地位承继规则（草案）.html'],
    ['裁定者身份、遴选与退出细则', '02_协议与规范/裁定者身份、遴选与退出细则.html'],
    ['文档与论坛一体化方案', '02_协议与规范/文档与论坛一体化方案：制宪档案库设计.html'],
    ['制宪档案库设计', '02_协议与规范/文档与论坛一体化方案：制宪档案库设计.html'],
    ['建国期人事网', '02_协议与规范/建国期人事网：自发协作结构设计（草案）.html'],
    ['建国者共建金', '02_协议与规范/建国者共建金：小额投入与紧急采购机制（草案）.html'],
    ['守护者身份、遴选与退出细则', '02_协议与规范/裁定者身份、遴选与退出细则.html'], // 旧称，重定向至裁定者
    ['建国债券发行与认购机制', '02_协议与规范/建国债券发行与认购机制.html'],
    ['建国成功判定与窗口操作速查表', '02_协议与规范/建国成功判定与窗口操作速查表.html'],
    ['多期 FCR 制度设计', '02_协议与规范/多期 FCR 制度设计：分池制与操作细则（草案）.html'],
    ['分配方案', '02_协议与规范/分配方案：公式化定档与供应商定价（草案）.html'],
    ['衍生业务优先权与最惠国条款', '实例/WhoAmI.Art/docs/WhoAmI.Art 衍生业务优先权与最惠国条款（摘要版）.html'],
    ['GAIA 标准术语与概念表', '00_索引与导航/GAIA 标准术语与概念表.html'],
    ['快速查找表', '00_索引与导航/快速查找表.html'],
    ['Founder-AI 协作约定', '00_索引与导航/Founder-AI 协作约定.html'],
    ['输入与解释映射表', '00_索引与导航/输入与解释映射表.html'],
    ['联盟创世档案', '00_索引与导航/联盟创世档案（制宪会议）.html'],
    ['GAIA 成立理由书', '06_解释与叙事/GAIA 成立理由书（艺术家为何联合）.html'],
    ['GAIA 全球战略路演 PPT 纲要', '06_解释与叙事/GAIA 全球战略路演 PPT 纲要.html'],
    ['GAIA 常见问题', '06_解释与叙事/GAIA 常见问题（FAQ）·联邦党人文集溯源.html'],
    ['CTO 合作备忘录', '实例/WhoAmI.Art/docs/WhoAmI.Art 核心技术节点（创世技术官）合作备忘录（摘要版）.html'],
    ['自然人宪章', '实例/WhoAmI.Art/docs/WhoAmI.Art 自然人宪章说明.html'],
    ['自然人宪章说明', '实例/WhoAmI.Art/docs/WhoAmI.Art 自然人宪章说明.html'],
    ['创世艺术家', '00_索引与导航/GAIA 标准术语与概念表.html'],
    ['Anchor Artist 专用 2 页版', '05_对外与外交/Anchor Artist 专用 2 页版（谈判底稿）.html'],
    ['更新日志', '00_索引与导航/更新日志.html'],
    ['创意载体规范', '02_协议与规范/创意载体规范（核心逻辑摘要）.html'],
    ['载体协议', '02_协议与规范/创意载体规范（核心逻辑摘要）.html'], // 旧称→创意载体规范
  ];
  extras.forEach(([name, hp]) => {
    if (hp.endsWith('.md')) hp = hp.replace(/\.md$/, '.html');
    if (!map.has(name)) map.set(name, hp.replace(/\.md$/, '.html'));
  });
  return map;
}

/** 将指向已排除文档的链接替换为纯文本，避免 404 且不暴露内部文档 */
function stripExcludedLinks(html) {
  const patterns = [
    /Founder-AI\s*协作约定|输入与解释映射表|节点角色说服与加入路径分析|Founder-沈炎君\s*协作与治理要点|有效路径与时间节点安排/,
  ];
  return html.replace(/<a\s+([^>]*href=["']([^"']*?)["'][^>]*)>([\s\S]*?)<\/a>/gi, (full, attrs, href, text) => {
    const hrefDecoded = decodeURIComponent(href);
    if (patterns.some(p => p.test(hrefDecoded))) return `<span class="internal-doc">${text.replace(/^《|》$/g, '')}（内部文档）</span>`;
    return full;
  });
}

/** 部署时脱敏：移除以括号标注的创世技术官本名，避免协作方身份外泄 */
function stripSensitiveNames(html) {
  return html
    .replace(/（沈炎君）/g, '')
    .replace(/沈炎君/g, '创世技术官');
}

/** 从快速查找表 HTML 中移除涉及排除文档的行 */
function filterSensitiveRowsFromQuickTable(html) {
  const sensitive = /Founder-沈炎君|Founder-创世技术官\s*协作|Founder-AI\s*协作约定|输入与解释映射表|节点角色说服|有效路径与时间节点|敏感信息防护要点|沈炎君\s*handoff|创世技术官\s*handoff|人物\/沈炎君|沈武档案|范桦档案|人物\/沈武|人物\/范桦/;
  return html.replace(/<tr>[\s\S]*?<\/tr>/g, (row) => (sensitive.test(row) ? '' : row));
}

/** 将 HTML 中的《文档名》替换为可跳转链接；basePath 为当前文档路径（doc 页如 02_协议与规范/xx.html；主页面传空则生成 docs/xx 链接）；跳过已存在链接内的《》 */
function linkifyDocRefs(html, basePath) {
  const fromRoot = !basePath || !basePath.includes('/');
  return html.replace(/(?<!>)《([^》]+)》/g, (match, name) => {
    const targetPath = DOC_ALIASES.get(name) || DOC_ALIASES.get(name.trim());
    if (!targetPath) return match;
    let href;
    if (fromRoot) {
      href = 'docs/' + targetPath.replace(/\\/g, '/');
    } else {
      const baseDir = path.dirname(basePath);
      href = path.relative(baseDir, targetPath).replace(/\\/g, '/');
      if (!href.startsWith('.') && !href.startsWith('/')) href = './' + href;
    }
    return `<a href="${href}" class="doc-link">${match}</a>`;
  });
}

// 将源文档转为 HTML（解决乱码），供网站内链接
function copyDocs() {
  if (!fs.existsSync(docsDir)) fs.mkdirSync(docsDir, { recursive: true });
  // 删除 docs 下所有 .md（对外仅提供 .html，避免原始内容外泄）
  const walkDelMd = (dir) => {
    if (!fs.existsSync(dir)) return;
    fs.readdirSync(dir).forEach(name => {
      const full = path.join(dir, name);
      if (fs.statSync(full).isDirectory()) walkDelMd(full);
      else if (name.endsWith('.md')) fs.unlinkSync(full);
    });
  };
  walkDelMd(docsDir);
  // 删除此前可能存在的排除文档输出，避免旧构建残留
  DEPLOY_EXCLUDED.forEach(p => {
    const htmlDest = path.join(docsDir, p.replace(/\.md$/, '.html'));
    const mdDest = path.join(docsDir, p);
    if (fs.existsSync(htmlDest)) fs.unlinkSync(htmlDest);
    if (fs.existsSync(mdDest)) fs.unlinkSync(mdDest);
  });
  const allPaths = new Set();
  Object.values(DOC_REFS).flat().forEach(({ path: p }) => p && !DEPLOY_EXCLUDED.has(p) && allPaths.add(p));
  allPaths.forEach(relPath => {
    const src = path.join(rootDir, relPath);
    const htmlPath = relPath.replace(/\.md$/, '.html');
    const dest = path.join(docsDir, htmlPath);
    if (fs.existsSync(src)) {
      const destDir = path.dirname(dest);
      if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true });
      // 不复制 .md 至 docs（仅生成 .html），避免原始敏感内容外泄
      const md = fs.readFileSync(src, 'utf-8');
      let body = marked.parse(md);
      body = linkifyDocRefs(body, htmlPath);
      // 将内部文档 .md 链接替换为 .html，确保点击可打开
      body = body.replace(/href="([^"#:]*?)\.md"/g, 'href="$1.html"');
      body = stripExcludedLinks(body);
      if (relPath.includes('快速查找表')) body = filterSensitiveRowsFromQuickTable(body);  // 先过滤，再脱敏
      body = stripSensitiveNames(body);
      // 为表格添加响应式包装器，确保复杂表格正确排版并可横向滚动
      body = body.replace(/<table>([\s\S]*?)<\/table>/g, '<div class="table-scroll-wrapper"><table class="manual-table">$1</table></div>');
      const relPathNorm = relPath.replace(/\\/g, '/');
      const forumUrl = DOC_TO_FORUM[relPathNorm];
      const discussionBlock = forumUrl
        ? `\n<div class="doc-forum-link"><a href="${forumUrl}" target="_blank" rel="noopener">在 GitHub 讨论此文 →</a></div>`
        : '';
      const title = path.basename(relPath, '.md');
      const depth = (htmlPath.match(/\//g) || []).length + 1; // +1 因为 docs/ 本身多一层
      const backPath = '../'.repeat(depth) + 'index.html';
      const browserPathBack = '../'.repeat(depth) + 'browser.html';
      const stylePath = '../'.repeat(depth) + 'styles.css';
      const faviconPath = '../'.repeat(depth) + 'favicon.ico';
      const html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} · GAIA</title>
  <link rel="icon" href="${faviconPath}" type="image/x-icon">
  <link rel="stylesheet" href="${stylePath}">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Crimson+Pro:ital,wght@0,400;0,600;1,400&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
</head>
<body class="doc-page">
  <div class="doc-back"><a href="${backPath}" id="doc-back-link">← 返回说明书</a></div>
  <article class="manual doc-content">${body}${discussionBlock}</article>
  <script>
    (function(){ var a=document.getElementById('doc-back-link'); if(a&&window!==window.parent){ a.href='${browserPathBack}'; a.setAttribute('target','_top'); a.textContent='← 返回文档浏览器'; }
    })();
  </script>
  <script src="${'../'.repeat(depth)}glossary-data.js"></script>
  <script src="${'../'.repeat(depth)}glossary.js"></script>
</body>
</html>`;
      fs.writeFileSync(dest, html, 'utf-8');
    }
  });
}

// 生成相关文档 HTML 块（链接指向 .html 避免乱码）
function docRefBlock(secId) {
  const refs = (DOC_REFS[secId] || []).filter(({ path: p }) => p && !DEPLOY_EXCLUDED.has(p));
  if (refs.length === 0) return '';
  const links = refs.map(({ title, path: p }) => {
    const href = 'docs/' + p.replace(/\\/g, '/').replace(/\.md$/, '.html');
    return `<li><a href="${href}" class="doc-link">${title}</a></li>`;
  }).join('');
  return `<div class="doc-ref"><strong>相关文档</strong><ul>${links}</ul></div>`;
}

const md = fs.readFileSync(manualPath, 'utf-8');
let contentHtml = marked.parse(md);
contentHtml = linkifyDocRefs(contentHtml, '');
contentHtml = stripExcludedLinks(contentHtml);
contentHtml = stripSensitiveNames(contentHtml);
// 为表格添加响应式包装器（主页面与文档页一致）
contentHtml = contentHtml.replace(/<table>([\s\S]*?)<\/table>/g, '<div class="table-scroll-wrapper"><table class="manual-table">$1</table></div>');

// 为 h1/h2/h3 添加 id
contentHtml = contentHtml.replace(/<h1>(§[0-9]+[^<]*)<\/h1>/g, (_, text) => {
  const m = text.match(/§([0-9]+)/);
  const id = m ? 'sec-' + m[1] : 'section';
  return `<h1 id="${id}">${text}</h1>`;
});
contentHtml = contentHtml.replace(/<h([23])>(§[\d.]+[^<]*)<\/h\1>/g, (_, depth, text) => {
  const m = text.match(/§([\d.]+)/);
  const id = m ? 'sec-' + m[1].replace(/\./g, '-') : 'section';
  return `<h${depth} id="${id}">${text}</h${depth}>`;
});
contentHtml = contentHtml.replace(/<h([12])>([^<]*附录[^<]*)<\/h\1>/g, '<h$1 id="appendix">$2</h$1>');

// 在主章节 h1 后注入相关文档块
Object.keys(DOC_REFS).forEach(secId => {
  const block = docRefBlock(secId);
  if (block) {
    contentHtml = contentHtml.replace(
      new RegExp(`(<h1 id="${secId}"[^>]*>[^<]+</h1>)\\n`),
      `$1\n${block}\n`
    );
  }
});

// 替换附录中的「按文档来源索引」为带链接的完整表
const docIndexHtml = `
<div class="doc-index">
<h3>源文档索引（可点击打开）</h3>
<div class="table-scroll-wrapper"><table class="manual-table">
<thead><tr><th>源文档</th><th>路径</th><th>对应章节</th></tr></thead>
<tbody>
<tr><td><a href="docs/01_宪法与治理/GAIA 宪法·序言.html" class="doc-link">GAIA 联盟宪章·序言</a></td><td>01_宪法与治理/</td><td>§2.1</td></tr>
<tr><td><a href="docs/01_宪法与治理/第一编｜基本权利.html" class="doc-link">第一编｜基本权利</a></td><td>01_宪法与治理/</td><td>§2.2</td></tr>
<tr><td><a href="docs/01_宪法与治理/第四编｜收益与反哺.html" class="doc-link">第四编｜收益与反哺</a></td><td>01_宪法与治理/</td><td>§2.3</td></tr>
<tr><td><a href="docs/06_解释与叙事/GAIA 成立理由书（艺术家为何联合）.html" class="doc-link">GAIA 成立理由书</a></td><td>06_解释与叙事/</td><td>§3</td></tr>
<tr><td><a href="docs/06_解释与叙事/GAIA 建国路线图：从思想启蒙到首届治理.html" class="doc-link">GAIA 建国路线图</a></td><td>06_解释与叙事/</td><td>§4</td></tr>
<tr><td><a href="docs/06_解释与叙事/GAIA 常见问题（FAQ）·联邦党人文集溯源.html" class="doc-link">GAIA 常见问题（FAQ）</a></td><td>06_解释与叙事/</td><td>§5</td></tr>
<tr><td><a href="docs/06_解释与叙事/GAIA 技术可行性说明（公众版）.html" class="doc-link">GAIA 技术可行性说明（公众版）</a></td><td>06_解释与叙事/</td><td>§5</td></tr>
<tr><td><a href="docs/02_协议与规范/创意载体规范（核心逻辑摘要）.html" class="doc-link">创意载体规范（核心逻辑摘要）</a></td><td>02_协议与规范/</td><td>§6.1</td></tr>
<tr><td><a href="docs/02_协议与规范/递归反哺与源头确权细则.html" class="doc-link">递归反哺与源头确权细则</a></td><td>02_协议与规范/</td><td>§6.2</td></tr>
<tr><td><a href="docs/02_协议与规范/公益金池细则.html" class="doc-link">公益金池细则</a></td><td>02_协议与规范/</td><td>§6 / §8</td></tr>
<tr><td><a href="docs/04_工程与落地/GAIA 节点角色与 IT 平台映射.html" class="doc-link">GAIA 节点角色与 IT 平台映射</a></td><td>04_工程与落地/</td><td>§7</td></tr>
<tr><td><a href="docs/实例/WhoAmI.Art/docs/WhoAmI.Art 分润与财务逻辑补充（财务工程 v1.0）.html" class="doc-link">分润与财务逻辑补充</a></td><td>实例/WhoAmI.Art/docs/</td><td>§8</td></tr>
<tr><td><a href="docs/实例/WhoAmI.Art/docs/WhoAmI.Art 创世公民与准入分层（自然人宪章配套）.html" class="doc-link">创世公民与准入分层</a></td><td>实例/WhoAmI.Art/docs/</td><td>§9</td></tr>
<tr><td><a href="docs/05_对外与外交/给艺术家的公开信.html" class="doc-link">给艺术家的公开信</a></td><td>05_对外与外交/</td><td>§11.1</td></tr>
<tr><td><a href="docs/06_解释与叙事/WhoAmI.Art 对外官网版.html" class="doc-link">WhoAmI.Art 对外官网版</a></td><td>06_解释与叙事/</td><td>§11.2</td></tr>
<tr><td><a href="docs/00_索引与导航/GAIA 标准术语与概念表.html" class="doc-link">GAIA 标准术语与概念表</a></td><td>00_索引与导航/</td><td>§12</td></tr>
<tr><td><a href="docs/00_索引与导航/联盟创世档案（制宪会议）.html" class="doc-link">联盟创世档案（制宪会议）</a></td><td>00_索引与导航/</td><td>§4</td></tr>
<tr><td><a href="docs/00_索引与导航/GAIA Master Index.html" class="doc-link">GAIA Master Index</a></td><td>00_索引与导航/</td><td>总索引</td></tr>
<tr><td><a href="docs/00_索引与导航/GAIA 分角色导读.html" class="doc-link">GAIA 分角色导读</a></td><td>00_索引与导航/</td><td>入门首选</td></tr>
<tr><td><a href="docs/00_索引与导航/快速查找表.html" class="doc-link">快速查找表</a></td><td>00_索引与导航/</td><td>总索引</td></tr>
<tr><td><a href="docs/00_索引与导航/新节点入门包.html" class="doc-link">新节点入门包</a></td><td>00_索引与导航/</td><td>总索引</td></tr>
<tr><td><a href="docs/02_协议与规范/GAIA 1.0 全系统集成规范（Master Spec）.html" class="doc-link">GAIA 1.0 全系统集成规范（Master Spec）</a></td><td>02_协议与规范/</td><td>协议标准</td></tr>
<tr><td><a href="docs/06_解释与叙事/GAIA 1.0 创世发布声明.html" class="doc-link">GAIA 1.0 创世发布声明</a></td><td>06_解释与叙事/</td><td>创世宣告</td></tr>
<tr><td><a href="docs/01_宪法与治理/GAIA 宪法 → 系统模块映射表.html" class="doc-link">GAIA 联盟宪章 → 系统模块映射表</a></td><td>01_宪法与治理/</td><td>§7</td></tr>
<tr><td><a href="docs/02_协议与规范/CTO技术共识协议.html" class="doc-link">CTO 技术共识协议</a></td><td>02_协议与规范/</td><td>§6</td></tr>
<tr><td><a href="docs/02_协议与规范/FCR 1.1 创始贡献者权利协议.html" class="doc-link">FCR 1.1 创始贡献者权利协议</a></td><td>02_协议与规范/</td><td>§6</td></tr>
<tr><td><a href="docs/02_协议与规范/FCR 附录：90日窗口与价值量化说明.html" class="doc-link">FCR 附录：90日窗口与价值量化说明</a></td><td>02_协议与规范/</td><td>§6</td></tr>
<tr><td><a href="docs/02_协议与规范/创世贡献记录与确认机制（论坛版）.html" class="doc-link">创世贡献记录与确认机制（论坛版）</a></td><td>02_协议与规范/</td><td>§6</td></tr>
<tr><td><a href="docs/02_协议与规范/建国务实进度看板：设计说明.html" class="doc-link">建国务实进度看板：设计说明</a></td><td>02_协议与规范/</td><td>§6</td></tr>
<tr><td><a href="docs/02_协议与规范/广发英雄贴：设计与操作说明.html" class="doc-link">广发英雄贴：设计与操作说明</a></td><td>02_协议与规范/</td><td>§6</td></tr>
<tr><td><a href="docs/02_协议与规范/建国债券发行与认购机制.html" class="doc-link">建国债券发行与认购机制</a></td><td>02_协议与规范/</td><td>§6</td></tr>
<tr><td><a href="docs/02_协议与规范/建国成功判定与窗口操作速查表.html" class="doc-link">建国成功判定与窗口操作速查表</a></td><td>02_协议与规范/</td><td>§6</td></tr>
<tr><td><a href="docs/02_协议与规范/多期 FCR 制度设计：分池制与操作细则（草案）.html" class="doc-link">多期 FCR 制度设计</a></td><td>02_协议与规范/</td><td>§6</td></tr>
<tr><td><a href="docs/02_协议与规范/分配方案：公式化定档与供应商定价（草案）.html" class="doc-link">分配方案（公式化定档与供应商定价）</a></td><td>02_协议与规范/</td><td>§6 / §8</td></tr>
<tr><td><a href="docs/02_协议与规范/三项不可谈判权力声明.html" class="doc-link">三项不可谈判权力声明</a></td><td>02_协议与规范/</td><td>§6</td></tr>
<tr><td><a href="docs/02_协议与规范/签字权与法人地位承继规则（草案）.html" class="doc-link">签字权与法人地位承继规则（草案）</a></td><td>02_协议与规范/</td><td>§6 / §9</td></tr>
<tr><td><a href="docs/02_协议与规范/裁定者身份、遴选与退出细则.html" class="doc-link">裁定者身份、遴选与退出细则</a></td><td>02_协议与规范/</td><td>§5.7 / §6</td></tr>
</tbody>
</table></div>
</div>
`;

// 替换附录中的「按文档来源索引」表格为带链接的完整表（匹配包装后的表格）
contentHtml = contentHtml.replace(
  /<h2>按文档来源索引<\/h2>\s*(?:<div class="table-scroll-wrapper">)?<table[^>]*>[\s\S]*?<\/table>(?:<\/div>)?/,
  `<h2>按文档来源索引</h2>\n${docIndexHtml}`
);
contentHtml = stripExcludedLinks(contentHtml);  // 再次处理，覆盖 docIndexHtml 插入后可能残留的链接

copyDocs();

const navSections = [
  { id: 'sec-1', title: '§1 总览' },
  { id: 'sec-2', title: '§2 联盟宪章与基本权利' },
  { id: 'sec-3', title: '§3 成立理由与愿景' },
  { id: 'sec-4', title: '§4 建国路线图' },
  { id: 'sec-5', title: '§5 常见问题' },
  { id: 'sec-6', title: '§6 协议与规范' },
  { id: 'sec-7', title: '§7 节点角色与架构' },
  { id: 'sec-8', title: '§8 财务与分配' },
  { id: 'sec-9', title: '§9 创世公民与准入' },
  { id: 'sec-10', title: '§10 有效路径与时间节点' },
  { id: 'sec-11', title: '§11 公开信与对外叙事' },
  { id: 'sec-12', title: '§12 标准术语与概念' },
  { id: 'appendix', title: '附录：快速索引' }
];

const navHtml = navSections.map(s =>
  `<a href="#${s.id}" class="nav-link">${s.title}</a>`
).join('\n        ');

const template = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>GAIA 完整说明书 · Global Art & Identity Alliance</title>
  <link rel="stylesheet" href="styles.css">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Crimson+Pro:ital,wght@0,400;0,600;1,400&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
</head>
<body>
  <div class="layout">
    <aside class="sidebar">
      <header class="sidebar-header">
        <h1 class="logo">GAIA</h1>
        <p class="logo-sub">完整说明书 · v1.0</p>
      </header>
      <nav class="nav">
        ${navHtml}
      </nav>
      <div class="browser-entry" style="padding: 0.5rem 1.25rem; border-top: 1px solid rgba(255,255,255,0.08);"><a href="browser.html" style="color: rgba(255,255,255,0.7); text-decoration: none; font-size: 0.9rem;">按目录浏览文档 →</a></div>
      <footer class="sidebar-footer">
        <p>Global Art & Identity Alliance</p>
      </footer>
    </aside>
    <main class="content">
      <article class="manual">
        ${contentHtml}
      </article>
    </main>
  </div>
  <script src="glossary-data.js"></script>
  <script src="glossary.js"></script>
  <script src="script.js"></script>
</body>
</html>`;

fs.writeFileSync(outputPath, template, 'utf-8');
console.log('✅ 已生成 index.html，已复制源文档至 docs/');

// 生成文档浏览器 browser.html
const FOLDER_ORDER = ['00_索引与导航', '01_宪法与治理', '02_协议与规范', '03_创世与权益', '04_工程与落地', '05_对外与外交', '06_解释与叙事', '实例'];
const seenPaths = new Set();
const byFolder = new Map();
Object.values(DOC_REFS).flat().forEach(({ title, path: p }) => {
  if (seenPaths.has(p)) return;
  seenPaths.add(p);
  const folder = p.split('/')[0];
  if (!byFolder.has(folder)) byFolder.set(folder, []);
  byFolder.get(folder).push({ title, htmlPath: p.replace(/\.md$/, '.html') });
});
const orderedFolders = [...new Set([...FOLDER_ORDER.filter(f => byFolder.has(f)), ...byFolder.keys()].filter((v, i, a) => a.indexOf(v) === i))];
function treeItem(folder, items) {
  const label = folder.replace(/^\d+_/, '');
  const entries = items.map(({ title, htmlPath }) =>
    `<a href="docs/${htmlPath.replace(/\\/g, '/')}" class="tree-doc" data-src="docs/${htmlPath.replace(/\\/g, '/')}">${title}</a>`
  ).join('');
  return `<div class="tree-folder" data-folder="${folder}">
    <button type="button" class="tree-folder-btn" aria-expanded="true">${label}</button>
    <div class="tree-folder-content">${entries}</div>
  </div>`;
}
const treeHtml = orderedFolders
  .filter(f => byFolder.has(f))
  .map(f => treeItem(f, byFolder.get(f)))
  .join('\n');

const browserHtml = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>GAIA 文档浏览器 · 按目录浏览</title>
  <link rel="stylesheet" href="styles.css">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Crimson+Pro:ital,wght@0,400;0,600;1,400&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
  <style>
    .browser-layout { display: flex; min-height: 100vh; }
    .browser-sidebar { width: 280px; min-width: 280px; background: var(--bg-sidebar); color: #e5e5e5; display: flex; flex-direction: column; position: sticky; top: 0; height: 100vh; overflow: hidden; }
    .browser-sidebar-header { padding: 1rem 1.25rem; border-bottom: 1px solid rgba(255,255,255,0.08); }
    .browser-sidebar-header h1 { font-family: 'JetBrains Mono', monospace; font-size: 1.25rem; margin: 0; }
    .browser-sidebar-header p { font-size: 0.75rem; color: rgba(255,255,255,0.5); margin: 0.25rem 0 0; }
    .browser-back { padding: 0.5rem 1.25rem; }
    .browser-back a { color: rgba(255,255,255,0.7); text-decoration: none; font-size: 0.9rem; }
    .browser-back a:hover { color: #fff; }
    .tree-nav { flex: 1; overflow-y: auto; padding: 0.5rem 0; }
    .tree-folder { margin-bottom: 0.25rem; }
    .tree-folder-btn { width: 100%; text-align: left; padding: 0.5rem 1.25rem; background: none; border: none; color: rgba(255,255,255,0.9); font-size: 0.9rem; cursor: pointer; display: flex; align-items: center; gap: 0.5rem; }
    .tree-folder-btn:hover { background: rgba(255,255,255,0.05); }
    .tree-folder-btn::before { content: '▼'; font-size: 0.6rem; transition: transform 0.2s; }
    .tree-folder.collapsed .tree-folder-btn::before { transform: rotate(-90deg); }
    .tree-folder-content { display: block; }
    .tree-folder.collapsed .tree-folder-content { display: none; }
    .tree-doc { display: block; padding: 0.35rem 1.25rem 0.35rem 2rem; color: rgba(255,255,255,0.75); text-decoration: none; font-size: 0.85rem; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .tree-doc:hover, .tree-doc.active { color: #fff; background: rgba(255,255,255,0.05); }
    .browser-main { flex: 1; display: flex; flex-direction: column; background: var(--bg); overflow: hidden; }
    .browser-frame-wrap { min-height: 0; }
    .browser-iframe { border: none; }
    .browser-placeholder { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; color: var(--text-muted); font-size: 1rem; background: var(--bg); z-index: 1; }
  </style>
</head>
<body>
  <div class="browser-layout">
    <aside class="browser-sidebar">
      <header class="browser-sidebar-header">
        <h1>GAIA</h1>
        <p>文档浏览器 · 按目录</p>
      </header>
      <div class="browser-back"><a href="index.html">← 返回主说明书</a></div>
      <nav class="tree-nav">${treeHtml}</nav>
    </aside>
    <main class="browser-main">
      <div class="browser-frame-wrap" style="flex:1;position:relative;">
        <div class="browser-placeholder" id="placeholder">从左侧目录选择文档</div>
        <iframe name="doc-frame" class="browser-iframe" title="文档内容" style="position:absolute;inset:0;width:100%;height:100%;"></iframe>
      </div>
    </main>
  </div>
  <script>
    (function(){
      const iframe = document.querySelector('.browser-iframe');
      const placeholder = document.getElementById('placeholder');
      document.querySelectorAll('.tree-doc').forEach(function(a){
        a.addEventListener('click', function(e){
          e.preventDefault();
          var src = a.getAttribute('data-src');
          iframe.src = src;
          placeholder.style.display = 'none';
          document.querySelectorAll('.tree-doc').forEach(function(x){ x.classList.remove('active'); });
          a.classList.add('active');
        });
      });
      document.querySelectorAll('.tree-folder-btn').forEach(function(btn){
        btn.addEventListener('click', function(){ btn.closest('.tree-folder').classList.toggle('collapsed'); });
      });
    })();
  </script>
</body>
</html>`;

const browserPath = path.join(__dirname, 'browser.html');
fs.writeFileSync(browserPath, browserHtml, 'utf-8');
console.log('✅ 已生成 browser.html（文档浏览器）');
console.log('   用浏览器直接打开 index.html，或运行 npm run preview 启动本地预览');
