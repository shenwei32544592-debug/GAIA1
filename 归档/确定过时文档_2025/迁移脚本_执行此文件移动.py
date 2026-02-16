# -*- coding: utf-8 -*-
"""
GAIA 文件迁移脚本
执行后将根目录文件按分类移动到对应子目录
在项目根目录运行: python "归档/确定过时文档_2025/迁移脚本_执行此文件移动.py"
"""
import os
import shutil

# 脚本位于 归档/确定过时文档_2025/，需三次 dirname 到达项目根
BASE = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

MAPPING = {
    "00_索引与导航": [
        "GAIA 完整说明书（网站浏览试用版）.md",
    ],
    "01_宪法与治理": [
        "第一编｜基本权利.md",
        "第二编｜资产与真理.md",
        "第三编｜共识与裁定.md",
        "第四编｜收益与反哺.md",
        "第五编｜平台义务与权力边界.md",
        "第六编｜修正、演进与文明延续.md",
        "GAIA 宪法·序言.md",
        "GAIA 宪法目录结构（Global Art & Identity Alliance）.md",
        "GAIA 宪法 → 系统模块映射表.md",
        "《GAIA 宪法·合宪性裁定编（终章）》.md",
        "联盟宪法.md",
    ],
    "02_协议与规范": [
        "创意载体规范（核心逻辑摘要）.md",
        "CTO技术共识协议.md",
        "FCR 1.1 创始贡献者权利协议.md",
        "三项不可谈判权力声明.md",
    ],
    "03_创世与权益": [
        "创世者誓.md",
        "创世者在GAIA体系中的定位.md",
        "《创世者权利与约束附录》.md",
        "创世者行动纲要（Founders' Action Charter · v1.0）.md",
        "创世者随身文本 · Founders' Pocket Charter.md",
        "GAIA 宪法 · 创世者随身文本.md",
    ],
    "04_工程与落地": [
        "signa.ink Phase 1 工程 Checklist（可执行版）.md",
        "《signa.ink 单人启动 · 90 天行动计划书（纲要版）》.md",
        "Sprint 1 数据库建表 SQL（Postgres 版本）.md",
        "Sprint 1： 拆解计划.md",
        "Sprint 1（MVP）Task 级清单.md",
        "Sprint 2：资金安全与责任清晰.md",
        "Sprint 3：未来升级接口（不实现，只预留）.md",
        "GAIA Core 技术总目录（Sprint 级）.md",
        "GAIA · CTO _ PM 架构对齐图.md",
        "GAIA 工程总览理解图.md",
        'ⅠT｜系统自我约束的四条"硬原则".md',
        "signa.ink「LOGO 定锚片」.md",
        "WhoAmI.Art Founder Master Document v1.0.md",
        "WhoAmI.Art Founder 战略总览图（文字蓝图）.md",
        "WhoAmI.Art 制度补充说明（投资·分配·基础设施）.md",
        "WhoAmI.Art 多轮对话精华与执行指南 v1.0.md",
        "WhoAmI.Art 深度思考引擎用 Prompt（供其他 AI 协作）.md",
        "WhoAmI.Art 起步策略.md",
    ],
    "05_对外与外交": [
        "WhoAmI.Art 商业计划书（创世节点宣讲版 v1.0）.md",
        "WhoAmI.Art 完整商业计划书（联邦治理版 v1.1）.md",
        "WhoAmI.Art 完整草案——首批参与者须知 v0.2.md",
        "给艺术家的公开信.md",
        "给年轻艺术家的短版信.md",
        "写给已成名艺术家的邀请函.md",
        "KAA 创始艺术家合作意向书（LOI · 摘要版）.md",
        "创世模板提交指南 v0.1.md",
        "前 100 个「必做级」名字清单 v0.1.md",
        "100个高频 英文名 背景信息.md",
    ],
    "06_解释与叙事": [
        "GAIA 公共释义版.md",
        "GAIA 对外官网版.md",
        "GAIA 最深的一层经济学逻辑.md",
        'GAIA 能成立的根本原因，不是因为它"高尚".md',
        'GAIA 的"多源创世模型".md',
        "GAIA 的治理本体：.md",
        'GAIA 必须设立"合宪性仲裁机制".md',
        '"经济收益 + 人世意义"而是互相校正.md',
        "而取决于它能否在没有英雄时依然正确运行.md",
        '既懂宪政，又懂系统工程"的完成态.md',
        "GAIA 公共智能体.md",
        '哪些部分"非常适合"交给视频 AI？.md',
        "真正的项目专用 Agent.md",
        "品牌核心 DNA 解码.md",
    ],
    "归档": [
        "交流全部对话.md",
    ],
    "归档/重复或过时文件": [
        "创世者在GAIA体系中的定位 (1).md",
        "GAIA Core 技术总目录（Sprint 级） (3).md",
    ],
}

def main():
    for folder, files in MAPPING.items():
        dst_dir = os.path.join(BASE, folder)
        os.makedirs(dst_dir, exist_ok=True)
        for f in files:
            src = os.path.join(BASE, f)
            dst = os.path.join(dst_dir, os.path.basename(f))
            if os.path.exists(src):
                shutil.move(src, dst)
                print(f"OK: {f} -> {folder}/")
            else:
                print(f"SKIP (not found): {f}")
    print("Done.")

if __name__ == "__main__":
    main()
