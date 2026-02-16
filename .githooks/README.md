# Git Hooks · 敏感信息防护

`pre-push` 在每次 `git push` 时自动运行；若本次 push 含敏感文档，会**拦截**并阻止推送。

由 `node scripts/setup-protection.mjs` 一次性启用，无需额外配置。

敏感文档已加入 `.gitignore`，正常情况下不会进入仓库；本钩子为双保险。
