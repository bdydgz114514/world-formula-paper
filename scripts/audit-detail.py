# -*- coding: utf-8 -*-
"""细节扫描：叠字、常见错别字、标点异常、括号不配对、体例标记覆盖。"""
import io, re
P = r"D:\ai\gongzuoqu\tools\world-formula-paper\世界式与大一统-合订本.md"
t = io.open(P, encoding="utf-8").read()
lines = t.split("\n")

print("=== 1. 叠字（同字连用，排除正常词）===")
ok = set("个个 步步 层层 种种 渐渐 慢慢 刚刚 常常 仅仅 人人 天天 年年 分分 一一 万万 面面 头头 多多 少少 好好 细细 高高 低低 远远 近近 深深 浅浅 快快 迟迟 早早".split())
found = {}
for m in re.finditer(r"([\u4e00-\u9fa5])\1", t):
    w = m.group(0)
    if w in ok: continue
    ctx = t[max(0, m.start()-25):m.start()+25].replace("\n", " ")
    found.setdefault(w, []).append(ctx)
print(f"  可疑叠字 {len(found)} 种：")
for w, v in list(found.items())[:12]:
    print(f"   「{w}」×{len(v)}  例：…{v[0]}…")

print("\n=== 2. 括号/引号配平 ===")
for name, a, b in (("「」", "「", "」"), ("（）", "（", "）"), ("**", "**", "**")):
    if name == "**":
        c = t.count("**")
        print(f"  ** 总数 {c}（{'偶数 ✓' if c % 2 == 0 else '奇数 ✘'}）")
    else:
        ca, cb = t.count(a), t.count(b)
        print(f"  {name}: {ca} / {cb} {'✓' if ca == cb else '✘ 不配平'}")

print("\n=== 3. 常见错别字候选 ===")
for w in ("的地得", "其它", "帐", "相象", "反应了", "必须要", "这其中", "成为了", "做为", "即使如此"):
    n = t.count(w)
    if n: print(f"  「{w}」 ×{n}")

print("\n=== 4. 「偷渡客按」覆盖抽查 ===")
terms = ["熵", "哥德尔", "量子场论", "博弈论", "石油", "高分子", "麦克斯韦", "重整化群"]
for term in ("熵", "哥德尔", "博弈论", "石油"):
    idx = [m.start() for m in re.finditer(term, t)][:200]
    far = 0
    for i in idx:
        win = t[max(0, i-400):i+400]
        if "偷渡客" not in win: far += 1
    print(f"  {term}：出现 {len(idx)} 次（前 200 处里），附近 400 字内没有「偷渡客」的 {far} 处")

print("\n=== 5. 空表/空小节 ===")
for i, l in enumerate(lines):
    if l.startswith(("#",)) and i + 2 < len(lines):
        nxt = [x for x in lines[i+1:i+4] if x.strip()]
        if nxt and nxt[0].startswith("#"):
            print(f"  行 {i+1}: {l[:40]} → 紧跟下一个标题 {nxt[0][:30]}")
