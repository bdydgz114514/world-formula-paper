# -*- coding: utf-8 -*-
"""补论三插图：五条约束上限对比 + 律偿混能反馈环"""
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
from matplotlib.patches import FancyArrowPatch, FancyBboxPatch, Circle, Polygon
import numpy as np, os
plt.rcParams["font.sans-serif"] = ["Microsoft YaHei"]
plt.rcParams["axes.unicode_minus"] = False
OUT = os.path.dirname(os.path.abspath(__file__))
NAVY, TEAL, GOLD, RED, BLUE, GREY, PURPLE, ORANGE = "#16324F", "#2A9D8F", "#C9A227", "#A63A50", "#3D7EA6", "#5C6B73", "#8E7DBE", "#E76F51"
def save(fig, n):
    fig.savefig(os.path.join(OUT, "figures", n), dpi=190, bbox_inches="tight", facecolor="white"); plt.close(fig); print("wrote", n)

# ---------- 图21：五条约束的上限 ----------
fig, ax = plt.subplots(figsize=(11.8, 6.2))
names = ["水（环海 + 水道）", "能量（律偿混能）", "粮食（全靠进口）", "秩序（行政吞吐）", "空间（建成区面积）"]
mid  = [500000, 300000, 86000, 36000, 18000]
lo   = [200000, 120000, 29000, 14000,  5000]
hi   = [900000, 600000, 230000, 72000, 62000]
cols = [TEAL, GOLD, BLUE, RED, NAVY]
y = np.arange(len(names))[::-1]
for i in range(len(names)):
    ax.barh(y[i], mid[i]/1000, color=cols[i], alpha=0.85, height=0.56, zorder=3)
    ax.plot([lo[i]/1000, hi[i]/1000], [y[i], y[i]], color="white", lw=2.6, solid_capstyle="round", zorder=5)
    ax.plot([lo[i]/1000], [y[i]], "|", color="white", ms=14, mew=2.4, zorder=6)
    ax.plot([hi[i]/1000], [y[i]], "|", color="white", ms=14, mew=2.4, zorder=6)
    ax.text(hi[i]/1000 + 6, y[i], ("上限约 %.1f 万" % (mid[i]/10000)), va="center", fontsize=9.6, color=cols[i])
ax.axvspan(14, 40, color=RED, alpha=0.10, zorder=1)
ax.text(27, 4.72, "三条约束同时逼近的区间\n（本次推算的答案：2 万 ~ 4 万）", ha="center", fontsize=10.4, color=RED, fontweight="bold")
ax.set_yticks(y); ax.set_yticklabels(names, fontsize=11)
ax.set_xlabel("该约束允许的最大人口（千人）", fontsize=11.5)
ax.set_xlim(0, 640); ax.set_ylim(-0.7, 5.15)
ax.set_title("图 21　枫丹廷的五条人口约束：白线是估算区间，柱体是中心估计", fontsize=12.8, color=NAVY, pad=12)
ax.grid(axis="x", alpha=0.2); ax.set_axisbelow(True)
save(fig, "fig20-population-limits.png")

# ---------- 图22：律偿混能反馈环 ----------
fig, ax = plt.subplots(figsize=(11.6, 7.4)); ax.set_xlim(-6.4, 6.4); ax.set_ylim(-5.4, 5.4); ax.axis("off")
nodes = [
    (0.0,  4.30, "人口 N", NAVY, 1.5, 0.82),
    (4.55, 1.95, "司法需求", BLUE, 1.8, 0.82),
    (4.15,-1.95, "行政负荷", ORANGE, 1.8, 0.82),
    (0.0, -4.05, "判决延迟 τ", RED, 1.9, 0.82),
    (-4.15,-1.95,"信仰存量", PURPLE, 1.8, 0.82),
    (-4.55, 1.95, "律偿混能", GOLD, 1.8, 0.82),
]
for x, y, t, c, w, h in nodes:
    ax.add_patch(FancyBboxPatch((x-w/2, y-h/2), w, h, boxstyle="round,pad=0.07,rounding_size=0.2", fc=c, ec="none", zorder=4))
    ax.text(x, y, t, ha="center", va="center", color="white", fontsize=11.6, fontweight="bold", zorder=5)
order = [(0,1),(1,2),(2,3),(3,4),(4,5),(5,0)]
for a, b in order:
    x1, y1 = nodes[a][0], nodes[a][1]; x2, y2 = nodes[b][0], nodes[b][1]
    ax.add_patch(FancyArrowPatch((x1, y1), (x2, y2), connectionstyle="arc3,rad=-0.16",
                 arrowstyle="-|>", lw=2.4, color=GREY, mutation_scale=18, zorder=2,
                 shrinkA=42, shrinkB=42))
ax.text(2.55, 3.55, "人越多\n案件越多", fontsize=9.2, color=GREY, ha="center")
ax.text(5.10, 0.0, "系统吃力", fontsize=9.2, color=GREY, ha="center")
ax.text(2.45,-3.40, "延迟变长", fontsize=9.2, color=GREY, ha="center")
ax.text(-2.55,-3.40,"信仰衰减", fontsize=9.2, color=GREY, ha="center")
ax.text(-5.10, 0.0, "能量减少", fontsize=9.2, color=GREY, ha="center")
ax.text(-2.55, 3.55, "城市得以运转", fontsize=9.2, color=GREY, ha="center")
ax.add_patch(Circle((0, 0), 1.45, fc="#FFF6F6", ec=RED, lw=2.2, zorder=3))
ax.text(0, 0.22, "断点", ha="center", va="center", fontsize=15, color=RED, fontweight="bold", zorder=4)
ax.text(0, -0.55, "τ > 市民容忍度\n→ 正反馈转为负反馈", ha="center", va="center", fontsize=8.6, color=RED, zorder=4)
ax.text(0, -5.18, "图 22　律偿混能的反馈环：人口养信仰，信仰供能量；但延迟一旦超过容忍度，环就反转", ha="center", fontsize=10.6, color=GREY)
save(fig, "fig21-feedback-loop.png")
print("补论三插图完成")
