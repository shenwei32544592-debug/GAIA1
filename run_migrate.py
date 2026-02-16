# -*- coding: utf-8 -*-
"""Launcher for migration script - avoids encoding issues with Chinese path in CLI."""
import os
import sys
import shutil

_BASE = os.path.dirname(os.path.abspath(__file__))
_SCRIPT = os.path.join(_BASE, "归档", "确定过时文档_2025", "迁移脚本_执行此文件移动.py")

if os.path.exists(_SCRIPT):
    _ns = {"__name__": "__main__", "__file__": _SCRIPT, "__builtins__": __builtins__}
    with open(_SCRIPT, encoding="utf-8") as f:
        exec(compile(f.read(), _SCRIPT, "exec"), _ns)
else:
    print(f"Not found: {_SCRIPT}")
    sys.exit(1)
