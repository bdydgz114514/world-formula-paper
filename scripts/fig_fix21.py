# -*- coding: utf-8 -*-
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import numpy as np, os
plt.rcParams["font.sans-serif"] = ["Microsoft YaHei"]
plt.rcParams["axes.unicode_minus"] = False
OUT = os.path.dirname(os.path.abspath(__file__))
NAVY, TEAL, GOLD, RED, BLUE, GREY = "#16324F", "#2A9D8F", "#C9A227", "#A63A50", "#3D7EA6", "#5C6B73"
fig, ax = plt.subplots(figsize=(12.4, 6.0))
names = ["水（环海 + 水道）", "能量（律偿混能）", "粮食（全靠进口）", "秩序（行政吞吐）", "空间（建成区面积）"]
mid  = [500000, 300000, 86000, 38000, 18000]
lo   = [200000, 120000, 29000, 10000,  5000]
hi   = [900000, 600000, 230000, 130000, 62000]
cols = [TEAL, GOLD, BLUE, RED, NAVY]
y = np.arange(len(names))[::-1]
for i in range(len(names)):
    ax.barh(y[i], mid[i]/1000, color=cols[i], alpha=0.88, height=0.56, zorder=3)
    ax.plot([lo[i]/1000, hi[i]/1000], [y[i], y[i]], color="white", lw=2.8, solid_capstyle="round", zorder=5)
    ax.plot([lo[i]/1000], [y[i]], "|", color="white", ms=15, mew=2.5, zorder=6)
    ax.plot([hi[i]/1000], [y[i]], "|", color="white", ms=15, mew=2.5, zorder=6)
    ax.text(660, y[i], "上限约 %.4g 万" % (mid[i]/10000), va="center", fontsize=10.3, color=cols[i], fontweight="bold")
ax.axvspan(10, 50, color=RED, alpha=0.11, zorder=1)
ax.text(30, 4.58, "空间与秩序两条约束\n重叠于此\n本次推算的答案：1 万 ~ 5 万", ha="center", fontsize=10.4, color=RED, fontweight="bold")
ax.annotate("", xy=(50, -0.52), xytext=(10, -0.52), arrowprops=dict(arrowstyle="<->", color=RED, lw=1.6))
ax.set_yticks(y); ax.set_yticklabels(names, fontsize=11)
ax.set_xlabel("该约束允许的最大人口（千人）", fontsize=11.5)
ax.set_xlim(0, 880); ax.set_ylim(-0.72, 5.05)
ax.set_xticks([0,100,200,300,400,500,600,700,800])
ax.set_title("图 20　枫丹廷的五条人口约束：白线是估算区间，柱体是中心估计", fontsize=12.8, color=NAVY, pad=12)
ax.grid(axis="x", alpha=0.2); ax.set_axisbelow(True)
fig.savefig(os.path.join(OUT, "figures", "fig20-population-limits.png"), dpi=190, bbox_inches="tight", facecolor="white")
plt.close(fig); print("wrote fig21 (修正版)")
