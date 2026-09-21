# -*- coding: utf-8 -*-
"""关键数字的自洽检查：补论四的时间线、人口约束、级联表。"""
import io, re
P = r"D:\ai\gongzuoqu\tools\world-formula-paper\世界式与大一统-合订本.md"
t = io.open(P, encoding="utf-8").read()
def show(k, r=260, n=6):
    out = []
    for m in re.finditer(re.escape(k), t):
        out.append(t[max(0, m.start()-r):m.start()+r].replace("\n", " "))
        if len(out) >= n: break
    print(f"\n=== 「{k}」 ===")
    for o in out: print("  …" + o + "…")
for k in ("73 年", "427 年", "292 年", "0.382", "1/φ²"):
    show(k, 200, 4)
print("\n=== 重复行 1 ===")
for m in re.finditer(re.escape("本院把这张表放出来，是为了说明第四章的「四条」是一个选择，不是一个完整清单。"), t):
    ln = t[:m.start()].count("\n") + 1
    # 找所属章节
    head = [l for l in t[:m.start()].split("\n") if l.startswith(("## ", "### "))][-1]
    print(f"  行 {ln}  章节：{head}")
