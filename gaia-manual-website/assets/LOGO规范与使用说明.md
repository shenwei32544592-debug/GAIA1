# GAIA Logo 规范与使用说明

本文件为 GAIA 网站 Logo 与 Favicon 的规格、数量及使用说明。

---

## 一、需要生成的图片数量

**最少 2 个文件**即可满足网站需求：

| 序号 | 类型 | 文件名 | 用途 |
|------|------|--------|------|
| 1 | Logo | `logo.svg` 或 `logo.png` | 侧边栏品牌标识 |
| 2 | Favicon | `favicon.ico` 或 `favicon.svg` | 浏览器标签页 / 书签图标 |

**可选扩展**：若需更高兼容性，可增加 `favicon.svg`（与 ICO 并存）；若需兼顾非矢量场景，可增加 `logo.png`（与 SVG 并存）。

---

## 二、Logo 规格（侧边栏标识）

**用途**：主说明书、文档浏览器左侧导航栏顶部

| 项目 | 要求 |
|------|------|
| 文件名 | `logo.svg`（首选）或 `logo.png` |
| 放置路径 | `gaia-manual-website/assets/logo.svg` |
| 显示约束 | 最大 120×48 px（主说明书）、100×40 px（文档浏览器），按比例缩小 |
| 宽高比 | 建议 2.5:1 ~ 3:1（横向），适配窄侧边栏 |
| 背景 | 透明，用于深色底 `#1a1a1a` |
| 主色 | 浅色或高对比色，在深灰背景上清晰可见 |
| 格式 | **SVG**：矢量，任意缩放不失真；**PNG**：分辨率 ≥ 512×512 px |

**PNG 使用说明**：若使用 `logo.png`，需在 `index.html` 与 `browser.html` 中将 `logo.svg` 替换为 `logo.png`。

---

## 三、Favicon 规格（标签页图标）

**用途**：浏览器标签页、书签栏、PWA 图标等

| 项目 | 要求 |
|------|------|
| 文件名 | `favicon.ico` 或 `favicon.svg` |
| 放置路径 | `gaia-manual-website/favicon.ico`（与 index.html 同级） |
| 尺寸 | ICO：16×16、32×32、48×48 三档嵌入；SVG：单文件可缩放 |
| 设计 | 建议与 Logo 主图形一致，或做极简版 / 首字母「G」 |
| 背景 | 透明或纯色，适配浅色 / 深色标签页 |
| 可读性 | 16×16 px 下仍可分辨 |

---

## 四、品牌色彩参考

| 用途 | 色值 |
|------|------|
| 侧边栏背景 | `#1a1a1a`（深灰） |
| 强调色 | `#2c5282`（蓝灰） |
| 文字 / 图标 | `#e5e5e5`（浅灰白） |

Logo 需在 `#1a1a1a` 背景上清晰可见；Favicon 在浅色、深色标签页下均应有辨识度。整体视觉宜符合「冷峻、精确、法理感」。

---

## 五、当前文件位置

| 文件 | 路径 | 说明 |
|------|------|------|
| logo.png | `gaia-manual-website/assets/logo.png` | 侧边栏 Logo，透明背景 |
| favicon.ico | `gaia-manual-website/favicon.ico` | 标签页图标，由 logo.png 生成 |
| 原图 | 项目根目录 `GAIA-LOGO原图.png` 等 | 设计原稿，供 process_logo.py 使用 |

**脚本**：`process_logo.py` 从原图生成 logo.png；`gen_favicon.py` 从 logo.png 生成 favicon.ico。
