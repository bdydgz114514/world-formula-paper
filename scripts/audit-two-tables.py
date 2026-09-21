# -*- coding: utf-8 -*-
"""比对两张 30 条表：第三卷 6.2 与附录 F。"""
import io, re
P = r"D:\ai\gongzuoqu\tools\world-formula-paper\世界式与大一统-合订本.md"
lines = io.open(P, encoding="utf-8").read().split("\n")

def table(start_marker, n=32):
    i = next(k for k, l in enumerate(lines) if l.startswith(start_marker))
    rows = {}
    for l in lines[i:i+200]:
        m = re.match(r"^\|\s*(C\d\d)\s*\|(.*)$", l)
        if m:
            cells = [c.strip() for c in l.strip().strip("|").split("|")]
            rows[m.group(1)] = cells
        if len(rows) >= n: break
    return rows

t62 = table("### 6.2 全部三十条")
tf = table("## 附录 F")
print(f"6.2 表 {len(t62)} 行；附录 F {len(tf)} 行")
diff = 0
for k in sorted(set(t62) | set(tf)):
    a, b = t62.get(k), tf.get(k)
    if not a or not b:
        print(f"  {k}: 只在 {'6.2' if a else '附录F'} 里"); diff += 1; continue
    # 比较 方向(2) 等级(3) 锚点(4)
    da = [a[2], a[3]]; db = [b[2], b[3]]
    fa = "有" if not (a[5].startswith("未列") or a[5].startswith("（未给出）")) else "无"
    # 口径统一后的判定：只有「未列（原文直证）」与「（未给出）」算作没有推翻条件
    fb = "有" if not (b[5].startswith("未列") or b[5].startswith("（未给出）")) else "无"
    if da != db or fa != fb:
        print(f"  {k}: 6.2 {da}/{fa}  附录F {db}/{fb}")
        diff += 1
print(f"差异 {diff} 处")
