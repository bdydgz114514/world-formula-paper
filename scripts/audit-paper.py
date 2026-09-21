# -*- coding: utf-8 -*-
"""论文体检：交叉引用 / 图号 / 章节结构 / 术语 / 重复段 / 可疑引文。"""
import io, json, re, os, collections

P = r"D:\ai\gongzuoqu\tools\world-formula-paper\世界式与大一统-合订本.md"
t = io.open(P, encoding="utf-8").read()
lines = t.split("\n")
print(f"文件 {len(t)} 字符 / {len(lines)} 行 / 汉字 {len(re.findall('[\u4e00-\u9fa5]', t))}")

# 1) 章节结构
h2 = [(i, l) for i, l in enumerate(lines) if l.startswith("## ")]
h3 = [(i, l) for i, l in enumerate(lines) if l.startswith("### ")]
print(f"\n二级标题 {len(h2)} 个；三级 {len(h3)} 个")
sec_ids = set()
for i, l in h2 + h3:
    m = re.match(r"^#{2,3}\s+(\d+(?:\.\d+)*)", l)
    if m: sec_ids.add(m.group(1))
    m2 = re.match(r"^#{2,3}\s+第([零一二三四五六七八九十]+)章", l)
print("带编号的节：", len(sec_ids), "示例", sorted(list(sec_ids))[:8])

# 2) 交叉引用「见 X.Y 节」是否存在
refs = collections.Counter(re.findall(r"见\s*([0-9]+(?:\.[0-9]+)+)\s*节", t))
missing = {k: v for k, v in refs.items() if k not in sec_ids}
print(f"\n「见 X.Y 节」引用 {sum(refs.values())} 处，涉及 {len(refs)} 个节号；找不到的节号：{missing if missing else '无'}")

# 3) 附录引用
app = collections.Counter(re.findall(r"附录\s*([A-F])", t))
print("附录引用：", dict(app))
have_app = set(re.findall(r"^##\s*附录\s*([A-F])", t, re.M))
print("实际存在的附录：", sorted(have_app), "；引用了但不存在：", sorted(set(app) - have_app))

# 4) 图号与图注
figs = re.findall(r"^\*图\s*([0-9U\-]+)　", t, re.M)
imgs = re.findall(r"!\[[^\]]*\]\(([^)]+)\)", t)
print(f"\n图注 {len(figs)} 条；插图引用 {len(imgs)} 处；图注编号唯一性：", len(figs) == len(set(figs)))
dup = [k for k, v in collections.Counter(figs).items() if v > 1]
print("重复图号：", dup if dup else "无")
missing_img = [p for p in imgs if not os.path.exists(os.path.join(os.path.dirname(P), p))]
print("缺图文件：", missing_img if missing_img else "无")

# 5) 关键术语使用次数
for term in ("本征", "本真", "规格", "死之诅咒", "地脉", "天钉", "差别度", "密合", "归约", "变量位", "记忆项", "重正化群", "偷渡客按"):
    print(f"  {term}: {t.count(term)}", end="；")
print()

# 6) 重复段落（>40 字的整行重复）
seen = collections.Counter()
for l in lines:
    s = l.strip()
    if len(s) > 40 and not s.startswith(("|", "#")):
        seen[s] += 1
dups = [(s, c) for s, c in seen.items() if c > 1]
print(f"\n重复出现（>40 字）的整行 {len(dups)} 条：")
for s, c in dups[:8]:
    print(f"  ×{c}  {s[:70]}…")

# 7) 可疑引文：带「」的长句在全文只出现一次，且前面 60 字里提到「节/章/写道/写的」
sus = []
for m in re.finditer(r"「([^」]{10,})」", t):
    q = m.group(1)
    if t.count(q) == 1:
        ctx = t[max(0, m.start() - 60):m.start()]
        if re.search(r"节|章|写道|写的|写成|那句话", ctx):
            sus.append((q[:40], ctx[-28:].replace("\n", " ")))
print(f"\n可疑自引（只出现一次 + 上下文提到节/章）{len(sus)} 条：")
for q, c in sus[:12]:
    print(f"  …{c} → 「{q}…」")

# 8) 未闭合的加粗 / 表格列数
odd = [i + 1 for i, l in enumerate(lines) if not l.startswith(("#", "|")) and (l.count("**") % 2)]
print(f"\n奇数个 ** 的行：{len(odd)} 行 {odd[:10]}")
