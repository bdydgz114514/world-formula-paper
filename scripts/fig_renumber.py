# -*- coding: utf-8 -*-
"""插图维护脚本：把 figs_*.py / fig_fix*.py 里内嵌的图号对齐到输出文件名，并统一四象限命名。
用法（在本目录下）：  python fig_renumber.py
背景：插图最初按旧编号绘制；论文重排后正文图注改了号，插图内部那份编号没跟着改，
      于是出现「正文图 13，图里却印着图 8」这种不一致。
本脚本以**输出文件名**为唯一编号来源：fig13-*.png → 图 13，figU09-*.png → 图 U-9。
脚本是幂等的：已经对齐的文件不会被再改一次。
"""
import os, re, sys

D = os.path.dirname(os.path.abspath(__file__))
SAVE = re.compile(r'save\(fig,\s*"([^"]+)"\)|"figures"\s*,\s*"([^"]+)"')
NAME_FIX = {
    "figs_batch2.py": [('ax.text(4.55, 0.28, "本质"', 'ax.text(4.55, 0.28, "本征"')],
    "figs_batch4.py": [('( 2.5,-2.5, "表象", "甜甜花"', '( 2.5,-2.5, "人格", "甜甜花"'),
                       ('ax.text(4.75, 0.30, "本质"', 'ax.text(4.75, 0.30, "本征"'),
                       ("甜甜花占表象与愿望", "甜甜花占人格与愿望")],
    "figs_batch8.py": [("本质从未改变", "本征从未改变")],
}

changed = 0
for name in sorted(os.listdir(D)):
    if not name.endswith(".py") or name == os.path.basename(__file__):
        continue
    p = os.path.join(D, name)
    s = open(p, encoding="utf-8").read()
    orig = s
    for old, new in NAME_FIX.get(name, []):
        if old in s:
            s = s.replace(old, new)
            print("%-16s 命名  %s → %s" % (name, old[:38], new[:38]))
    saves = [(m.start(), m.group(1) or m.group(2)) for m in SAVE.finditer(s)]
    edits = []
    for i, (pos, fname) in enumerate(saves):
        mfile = re.match(r"fig(U?)(\d+)", fname)
        if not fname.endswith(".png") or not mfile:
            continue
        lo = saves[i - 1][0] if i > 0 else 0
        seg = s[lo:pos]
        want = ("U-" if mfile.group(1) else "") + str(int(mfile.group(2)))
        ms = list(re.finditer(r"图\s*(U-)?(\d+)", seg))
        if not ms:
            continue
        m = ms[-1]
        got = ("U-" if m.group(1) else "") + str(int(m.group(2)))
        if got == want:
            continue
        edits.append((lo + m.start(), lo + m.end(), "图 " + want, fname, got, want))
    for a, b, new, fname, got, want in reversed(edits):
        s = s[:a] + new + s[b:]
        print("%-16s 图号  %-34s 图 %s → 图 %s" % (name, fname, got, want))
    if s != orig:
        open(p, "w", encoding="utf-8").write(s)
        changed += 1
print("改动文件数：%d" % changed)
