# -*- coding: utf-8 -*-
"""目录 vs 实际章节结构；重复行定位；体例约定抽查。"""
import io, re
P = r"D:\ai\gongzuoqu\tools\world-formula-paper\世界式与大一统-合订本.md"
t = io.open(P, encoding="utf-8").read()
lines = t.split("\n")

# 目录区间
i0 = next(i for i, l in enumerate(lines) if l.startswith("## 目录"))
i1 = next(i for i, l in enumerate(lines) if i > i0 and l.startswith("## "))
toc = lines[i0:i1]
print(f"目录 {len(toc)} 行，示例：")
for l in toc[:14]: print("   " + l)
toc_items = [re.sub(r"^[-*|\s]+", "", l).strip() for l in toc if l.strip() and not l.startswith("#")]
toc_items = [x for x in toc_items if x]
print(f"目录条目 {len(toc_items)} 条")

# 实际结构：卷 + 章
struct = []
for l in lines:
    if l.startswith("## "):
        struct.append(l[3:].strip())
print(f"\n实际二级标题 {len(struct)} 个")
miss = []
for it in toc_items:
    key = re.sub(r"[（(].*?[)）]", "", it).strip()
    key = re.split(r"[….\s]{2,}", key)[0][:8]
    if key and not any(key in s for s in struct):
        miss.append(it[:40])
print(f"目录里找不到对应二级标题的条目 {len(miss)} 条：")
for m in miss[:20]: print("   " + m)

# 重复行定位
for key in ("本院把这张表放出来，是为了说明第四章的「四条」是一个选择，不是一个完整清单。",):
    print(f"\n=== 「{key[:24]}…」出现位置 ===")
    for m in re.finditer(re.escape(key), t):
        ln = t[:m.start()].count("\n") + 1
        head = [x for x in t[:m.start()].split("\n") if x.startswith(("## ", "### "))][-1]
        print(f"   行 {ln}  所属：{head}")
