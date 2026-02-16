#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
名字 → AI 绘图 Prompt 生成工具
输入：名字
输出：JSON 格式的 prompt 列表
"""

import json
import random
import sys
from pathlib import Path
from datetime import datetime

# 脚本所在目录
SCRIPT_DIR = Path(__file__).parent
CORPUS_PATH = SCRIPT_DIR / "名字语料库.json"

# 中文元素 → 英文（用于 prompt_en）
ELEMENT_EN_MAP = {
    "皇冠": "crown", "羽毛笔": "quill", "书本": "book", "盾牌": "shield",
    "橡树叶片": "oak leaf", "月桂枝": "laurel", "橄榄枝": "olive branch",
    "星标": "star symbol", "守护环": "guardian ring", "复古怀表轮廓": "vintage pocket watch",
    "雄狮": "lion", "雄鹰": "eagle", "骏马": "horse",
    "十字架": "cross", "圣杯": "chalice", "圣经": "Bible", "钥匙与锁": "key and lock",
    "百合": "lily", "白玫瑰": "white rose", "新月": "crescent moon", "星光": "stardust",
    "守护光环": "halo", "白鸽": "dove", "羔羊": "lamb", "星尘": "stardust",
}

# 新名字兜底：通用祝福
FALLBACK_BLESSINGS = [
    "Still Becoming", "Own Your Path", "Rooted & Free", "True to Self",
    "Calm Is Power", "Quiet Confidence", "Here, On Purpose", "Whole, Not Perfect"
]

# 新名字兜底：通用元素（中文 → 英文在 element_map 中）
FALLBACK_ELEMENTS_CN = [
    "星标", "星尘", "羽毛笔", "书本", "月桂", "橄榄枝",
    "雄狮", "雄鹰", "骏马", "白鸽", "皇冠", "盾牌"
]

# 风格
STYLES = ["商务", "复古", "简约"]


def load_json(path):
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)


def get_elements_en(elements, elem_map):
    """中文元素 → 英文"""
    return [elem_map.get(e, e) for e in elements]


def build_prompt(name: str, style: str, blessing: str, elements: list, elem_map: dict) -> dict:
    """构建单条 prompt"""
    elem_en = get_elements_en(elements, elem_map)

    # 英文 prompt
    if len(elem_en) == 1:
        elem_str = elem_en[0]
    else:
        elem_str = ", ".join(elem_en[:-1]) + f", {elem_en[-1]}"

    style_map = {"商务": "business formal", "复古": "vintage", "简约": "minimal"}
    style_en = style_map.get(style, style)

    prompt_en = f"{name}, {style_en} style, '{blessing}', {elem_str}, clean composition, signable, fine line"

    # 中文 prompt
    elem_cn = "、".join(elements)
    prompt_cn = f"{name}，{style}风格，{blessing}，{elem_cn}，干净构图，可签名，细线"

    return {
        "prompt_en": prompt_en,
        "prompt_cn": prompt_cn,
        "style": style,
        "blessing": blessing,
        "elements": elements,
    }


def generate_prompts(name: str, count: int = 10) -> dict:
    """
    输入名字，生成 count 条 prompt
    """
    corpus = load_json(CORPUS_PATH)
    elem_map = ELEMENT_EN_MAP

    names_data = corpus.get("names", {})
    styles = corpus.get("styles", STYLES)

    if name in names_data:
        data = names_data[name]
        blessings = data.get("blessings", FALLBACK_BLESSINGS)
        all_elements = (
            data.get("objects", []) +
            data.get("flowers", []) +
            data.get("fantasy", []) +
            data.get("animals", [])
        )
    else:
        blessings = FALLBACK_BLESSINGS
        all_elements = FALLBACK_ELEMENTS_CN

    prompts = []
    seen = set()

    for i in range(count * 2):  # 多试几次，去重
        if len(prompts) >= count:
            break

        style = random.choice(styles)
        blessing = random.choice(blessings)
        n_elem = random.randint(2, 3)
        elements = random.sample(all_elements, min(n_elem, len(all_elements)))

        key = (style, blessing, tuple(sorted(elements)))
        if key in seen:
            continue
        seen.add(key)

        p = build_prompt(name, style, blessing, elements, elem_map)
        p["id"] = len(prompts) + 1
        prompts.append(p)

    return {
        "input": name,
        "generated_at": datetime.now().strftime("%Y-%m-%d %H:%M"),
        "in_corpus": name in names_data,
        "prompts": prompts,
    }


def main():
    name = sys.argv[1] if len(sys.argv) > 1 else "James"
    count = int(sys.argv[2]) if len(sys.argv) > 2 else 10

    result = generate_prompts(name, count)

    output_path = SCRIPT_DIR / f"output_{name}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(result, f, ensure_ascii=False, indent=2)

    print(json.dumps(result, ensure_ascii=False, indent=2))
    print(f"\n已保存至: {output_path}")


if __name__ == "__main__":
    main()
