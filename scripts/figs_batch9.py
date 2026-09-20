# -*- coding: utf-8 -*-
"""补论六插图：规格曲线 + 规格的三个性质"""
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
from matplotlib.patches import FancyArrowPatch, FancyBboxPatch, Circle
import numpy as np, os
plt.rcParams["font.sans-serif"] = ["Microsoft YaHei"]
plt.rcParams["axes.unicode_minus"] = False
OUT = os.path.dirname(os.path.abspath(__file__))
NAVY, TEAL, GOLD, RED, BLUE, GREY, PURPLE, ORANGE = "#16324F", "#2A9D8F", "#C9A227", "#A63A50", "#3D7EA6", "#5C6B73", "#8E7DBE", "#E76F51"
def save(fig, n):
    fig.savefig(os.path.join(OUT, "figures", n), dpi=190, bbox_inches="tight", facecolor="white"); plt.close(fig); print("wrote", n)

# ---------- 图27：规格曲线 ----------
fig, ax = plt.subplots(figsize=(11.6, 6.0))
x = np.linspace(1, 20, 400)
# 甜甜花：先涨后崩，12-14 倍处死亡
d1 = 6 + 5.4*(x-1)*np.exp(-((x-1)/7.2)**1.9)
d1[x > 13] = np.nan
ax.plot(x, d1, color=TEAL, lw=3.2, zorder=4, label="甜甜花：长到 12~14 倍后枯萎朽败")
# 骗骗花：规格更高
d2 = 6 + 6.2*(x-1)*np.exp(-((x-1)/9.5)**2.1)
ax.plot(x, d2, color=PURPLE, lw=3.2, zorder=4, label="骗骗花：本次达到甚至超过 16 倍")
ax.plot([13], [np.interp(13, x, np.nan_to_num(d1, nan=0))], "X", color=RED, ms=15, zorder=6, markeredgecolor="white", markeredgewidth=1.6)
ax.axvspan(12, 14, color=RED, alpha=0.10, zorder=1)
ax.annotate("「就像是触摸到了\n不可触碰的界限」", xy=(13, 13.0), xytext=(14.6, 9.2),
            fontsize=10.5, color=RED, fontweight="bold", arrowprops=dict(arrowstyle="->", color=RED, lw=1.7))
ax.axvline(12, color=RED, ls=":", lw=1.6, zorder=2); ax.axvline(14, color=RED, ls=":", lw=1.6, zorder=2)
ax.text(13, 3.2, "甜甜花的规格", ha="center", fontsize=10, color=RED)
ax.annotate("", xy=(16.6, 15.2), xytext=(13.4, 15.2), arrowprops=dict(arrowstyle="<->", color=GOLD, lw=2.0))
ax.text(15.0, 15.6, "骗骗花的规格更高", ha="center", fontsize=10, color="#7A5C00", fontweight="bold")
ax.set_xlabel("生长倍率", fontsize=11.5)
ax.set_ylabel("植株能维持的差别度", fontsize=11.5)
ax.set_title("图 27　「规格」：每一株植物都有一条自己的界限", fontsize=13, color=NAVY, pad=12)
ax.set_xlim(1, 20); ax.set_ylim(0, 18)
ax.legend(fontsize=9.8, loc="lower left", framealpha=0.95)
ax.grid(alpha=0.22); ax.set_axisbelow(True)
save(fig, "fig27-spec-limit.png")

# ---------- 图28：规格的三个性质 ----------
fig, ax = plt.subplots(figsize=(12.6, 5.2)); ax.set_xlim(0, 12.6); ax.set_ylim(0, 5.2); ax.axis("off")
cards = [
    ("① 普遍性", "「正如规格是一种\n刻写在万物之中的法则」", "不是某几种东西的偶然上限，\n而是写进一切事物的通则", TEAL),
    ("② 差异性", "甜甜花 12~14 倍即死，\n骗骗花却能超过 16 倍", "规格是分物种、分对象的。\n每一个系统有自己的上限", GOLD),
    ("③ 可变动性", "「也许法则的界限\n因为什么正在发生变动」", "规格不是永恒常数。\n外源到场时，它可以被抬高", RED),
]
for i, (t, q, d, col) in enumerate(cards):
    x = 0.4 + i*4.1
    ax.add_patch(FancyBboxPatch((x, 1.0), 3.8, 3.4, boxstyle="round,pad=0.10,rounding_size=0.22", fc=col, ec="none", alpha=0.11))
    ax.add_patch(FancyBboxPatch((x, 3.62), 3.8, 0.78, boxstyle="round,pad=0.06,rounding_size=0.18", fc=col, ec="none"))
    ax.text(x+1.9, 4.01, t, ha="center", va="center", fontsize=15, color="white", fontweight="bold")
    ax.text(x+1.9, 3.06, q, ha="center", va="center", fontsize=10.2, color=NAVY, linespacing=1.6)
    ax.text(x+1.9, 1.85, d, ha="center", va="center", fontsize=10.6, color=col, linespacing=1.7, fontweight="bold")
ax.text(6.3, 0.42, "图 28　「规格」的三个性质：普遍、分对象、可被抬高", ha="center", fontsize=11.5, color=GREY)
save(fig, "fig28-spec-properties.png")
print("补论六插图完成")
