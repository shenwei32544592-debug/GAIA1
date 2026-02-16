#!/usr/bin/env node
/**
 * 一次性设置：敏感文档仅存本地，push 时永不泄露
 * 执行：node scripts/setup-protection.mjs
 *
 * 1. 从 git 中移除敏感文件跟踪（文件保留在本地）
 * 2. 启用 pre-push 钩子（双保险）
 */
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');

const SENSITIVE = [
  '00_索引与导航/Founder-AI 协作约定.md',
  '00_索引与导航/输入与解释映射表.md',
  '00_索引与导航/节点角色说服与加入路径分析（决策参考）.md',
  '00_索引与导航/Founder-沈炎君 协作与治理要点.md',
  '00_索引与导航/有效路径与时间节点安排.md',
  '00_索引与导航/敏感信息防护要点.md',
  '人际关系/人物/',
];

const gitignoreContent = `# 敏感文档 · 仅存本地，不进入仓库，不推送
00_索引与导航/Founder-AI 协作约定.md
00_索引与导航/输入与解释映射表.md
00_索引与导航/节点角色说服与加入路径分析（决策参考）.md
00_索引与导航/Founder-沈炎君 协作与治理要点.md
00_索引与导航/有效路径与时间节点安排.md
00_索引与导航/敏感信息防护要点.md
人际关系/人物/
`;

// 确保 .gitignore 含敏感路径
const gitignorePath = path.join(root, '.gitignore');
let current = fs.existsSync(gitignorePath) ? fs.readFileSync(gitignorePath, 'utf-8') : '';
if (!current.includes('Founder-AI 协作约定')) {
  fs.writeFileSync(gitignorePath, current ? current + '\n' + gitignoreContent : gitignoreContent.trim());
  console.log('✅ 已更新 .gitignore');
}

// 从 git 跟踪中移除（文件仍在磁盘）
for (const p of SENSITIVE) {
  try {
    execSync('git rm -r --cached ' + p, { cwd: root, stdio: 'ignore', shell: true });
  } catch (_) {
    try {
      execSync('git rm --cached ' + p, { cwd: root, stdio: 'ignore', shell: true });
    } catch (_) {
      continue; // 可能未被跟踪
    }
  }
  console.log('   已移除跟踪: ' + p);
}

// 启用 pre-push 钩子
try {
  execSync('git config core.hooksPath .githooks', { cwd: root });
  console.log('✅ 已启用 pre-push 钩子（双保险）');
} catch (_) {}

console.log('\n完成。请执行：git add . && git commit -m "chore: 敏感文档改为仅存本地"');
console.log('之后 push 时，敏感文档不会离开本机。');
