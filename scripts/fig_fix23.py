# -*- coding: utf-8 -*-
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import numpy as np, os
plt.rcParams["font.sans-serif"] = ["Microsoft YaHei"]
plt.rcParams["axes.unicode_minus"] = False
OUT = os.path.dirname(os.path.abspath(__file__))
NAVY, TEAL, GOLD, RED, GREY = "#16324F", "#2A9D8F", "#C9A227", "#A63A50", "#5C6B73"
PHI = 1.6180339887; r = 1/PHI**2

fig, (ax1, ax2) = plt.subplots(2, 1, figsize=(13.2, 7.8), gridspec_kw={"height_ratios": [1.25, 1]})
hist = [-6000, -2000, -500]
fut, t, iv = [], -500.0, 1500.0*r
for i in range(7):
    t += iv; fut.append(round(t, 1)); iv *= r

# ---- 上面板：全时段 ----
ax1.axhline(0, color=GREY, lw=2.0, zorder=1)
ax1.axvspan(-6350, 850, color="#EAF4F4", zorder=0)
ax1.axvline(0, color=RED, ls="--", lw=1.8, zorder=2)
for x, lb in zip(hist, ["葬火之战\n6000 年前", "魔神战争\n2000 年前", "坎瑞亚灾变\n500 年前"]):
    ax1.plot([x], [0], "o", color=NAVY, ms=12, zorder=5, markeredgecolor="white", markeredgewidth=1.6)
    ax1.text(x, -0.30, lb, ha="center", va="top", fontsize=9.4, color=NAVY)
for x in fut:
    ax1.plot([x], [0], "o", color=RED, ms=9, mfc="white", mew=2.2, zorder=5)
ax1.text(60, 0.34, "推算的灾难\n全部挤在这里", ha="left", va="bottom", fontsize=10, color=RED, fontweight="bold")
for a, b, lab in [(-6000,-2000,"4000 年"), (-2000,-500,"1500 年"), (-500,fut[0],"573 年")]:
    ax1.annotate("", xy=(b, -0.95), xytext=(a, -0.95), arrowprops=dict(arrowstyle="<->", color=GOLD, lw=1.8))
    ax1.text((a+b)/2, -1.05, lab, ha="center", va="top", fontsize=9.2, color="#7A5C00")
ax1.text(-6300, 0.86, "间隔每次 × 1/φ² ≈ 0.382　→　灾难越来越密，在 +427 年处汇聚成终末", fontsize=10.6, color="#7A5C00")
ax1.set_xlim(-6600, 900); ax1.set_ylim(-1.62, 1.35); ax1.axis("off")
ax1.set_title("图 23a　全时段：已知三次灾难（实心）与推算的全部后续（空心）", fontsize=11.8, color=NAVY, pad=6, loc="left")

# ---- 下面板：放大未来段 ----
ax2.axhline(0, color=GREY, lw=2.0, zorder=1)
ax2.axvspan(0, 450, color="#FFF6F6", zorder=0)
ax2.axvline(0, color=RED, ls="--", lw=1.8, zorder=2)
ax2.text(0, 0.30, "现在", ha="center", va="bottom", fontsize=10.5, color=RED, fontweight="bold")
for i, x in enumerate(fut):
    ax2.plot([x], [0], "o", color=RED, ms=10, mfc="white", mew=2.3, zorder=5)
    h = 0.52 + (i % 3) * 0.34
    ax2.annotate("+%d 年" % round(x), xy=(x, 0.06), xytext=(x, h), ha="center", fontsize=9.4,
                 color=RED, fontweight="bold", arrowprops=dict(arrowstyle="-", color=RED, lw=0.9, ls=":"))
ax2.annotate("", xy=(427, -0.60), xytext=(0, -0.60), arrowprops=dict(arrowstyle="<->", color=NAVY, lw=1.8))
ax2.text(213, -0.72, "从今往后 427 年 = 剩余全部时间（含终末）", ha="center", va="top", fontsize=10, color=NAVY)
ax2.set_xlim(-30, 470); ax2.set_ylim(-1.15, 1.30); ax2.axis("off")
ax2.set_title("图 23b　放大未来 450 年：灾难的级联与汇聚点", fontsize=11.8, color=NAVY, pad=6, loc="left")
fig.tight_layout()
fig.savefig(os.path.join(OUT, "figures", "fig22-cascade.png"), dpi=190, bbox_inches="tight", facecolor="white")
plt.close(fig); print("wrote fig23 (双面板)", fut)
