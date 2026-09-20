# -*- coding: utf-8 -*-
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import numpy as np, os
plt.rcParams["font.sans-serif"] = ["Microsoft YaHei"]
plt.rcParams["axes.unicode_minus"] = False
OUT = os.path.dirname(os.path.abspath(__file__))
NAVY, TEAL, GOLD, RED, PURPLE, GREY = "#16324F", "#2A9D8F", "#C9A227", "#A63A50", "#8E7DBE", "#5C6B73"
fig, ax = plt.subplots(figsize=(11.8, 6.0))
# 甜甜花：平缓上升 → 12~14 倍处骤降归零
x1 = np.linspace(1, 13.0, 300)
y1 = 5.0 + 8.2*(1 - np.exp(-(x1-1)/5.0))
x1d = np.array([13.0, 13.5, 14.0]); y1d = np.array([y1[-1], 1.4, 0.0])
# 骗骗花：规格更高，升得更高更远
x2 = np.linspace(1, 17.5, 340)
y2 = 5.0 + 10.6*(1 - np.exp(-(x2-1)/6.2))
x2d = np.array([17.5, 18.0]); y2d = np.array([y2[-1], 0.0])
ax.plot(np.concatenate([x1, x1d]), np.concatenate([y1, y1d]), color=TEAL, lw=3.4, zorder=4,
        label="甜甜花：长到 12~14 倍后无法承受，枯萎朽败")
ax.plot(np.concatenate([x2, x2d]), np.concatenate([y2, y2d]), color=PURPLE, lw=3.4, zorder=4,
        label="骗骗花：本次达到、甚至超过 16 倍")
ax.fill_between(np.concatenate([x1, x1d]), 0, np.concatenate([y1, y1d]), color=TEAL, alpha=0.08, zorder=1)
ax.axvspan(12, 14, color=RED, alpha=0.10, zorder=2)
ax.plot([13.4], [1.4], "X", color=RED, ms=16, zorder=6, markeredgecolor="white", markeredgewidth=1.8)
ax.annotate("「就像是触摸到了\n不可触碰的界限」", xy=(13.6, 1.9), xytext=(14.9, 6.4),
            fontsize=11, color=RED, fontweight="bold", arrowprops=dict(arrowstyle="->", color=RED, lw=1.8))
ax.text(13.0, -1.35, "甜甜花的规格", ha="center", fontsize=10.5, color=RED, fontweight="bold")
ax.annotate("", xy=(17.2, 14.6), xytext=(13.6, 14.6), arrowprops=dict(arrowstyle="<->", color=GOLD, lw=2.2))
ax.text(15.4, 15.1, "骗骗花的规格更高", ha="center", fontsize=10.5, color="#7A5C00", fontweight="bold")
ax.set_xlabel("生长倍率", fontsize=12)
ax.set_ylabel("植株能维持的差别度", fontsize=12)
ax.set_title("图 27　「规格」：每一株植物都有一条自己的界限", fontsize=13.5, color=NAVY, pad=12)
ax.set_xlim(0.5, 19.5); ax.set_ylim(-2.6, 17.5)
ax.set_xticks([1,4,8,12,16,19])
ax.legend(fontsize=10, loc="lower left", framealpha=0.95)
ax.grid(alpha=0.22); ax.set_axisbelow(True)
fig.savefig(os.path.join(OUT, "figures", "fig26-spec-limit.png"), dpi=190, bbox_inches="tight", facecolor="white")
plt.close(fig); print("wrote fig27 (重画)")
