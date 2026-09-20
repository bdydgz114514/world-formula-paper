# -*- coding: utf-8 -*-
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
from matplotlib.patches import FancyArrowPatch, FancyBboxPatch
import numpy as np, os
plt.rcParams["font.sans-serif"] = ["Microsoft YaHei"]
plt.rcParams["axes.unicode_minus"] = False
OUT = os.path.dirname(os.path.abspath(__file__))
NAVY, TEAL, GOLD, RED, BLUE, GREY = "#16324F", "#2A9D8F", "#C9A227", "#A63A50", "#3D7EA6", "#5C6B73"
PHI = 1.6180339887
r = 1/PHI**2

# ---------- 图23：灾难级联 ----------
fig, ax = plt.subplots(figsize=(13.4, 6.6))
hist = [-6000, -2000, -500]
fut, t, iv = [], -500.0, 1500.0*r
for i in range(7):
    t += iv; fut.append(round(t, 1)); iv *= r
ax.axhline(0, color=GREY, lw=2.0, zorder=1)
ax.axvspan(-6300, 700, color="#EAF4F4", zorder=0)
ax.axvline(0, color=RED, ls="--", lw=2.0, zorder=2)
ax.text(0, 0.92, "现在", ha="center", fontsize=11.5, color=RED, fontweight="bold")
for x, lb in zip(hist, ["葬火之战\n(6000年前)", "魔神战争\n(2000年前)", "坎瑞亚灾变\n(500年前)"]):
    ax.plot([x], [0], "o", color=NAVY, ms=13, zorder=5, markeredgecolor="white", markeredgewidth=1.8)
    ax.text(x, -0.34, lb, ha="center", va="top", fontsize=9.4, color=NAVY)
for i, x in enumerate(fut):
    ax.plot([x], [0], "o", color=RED, ms=10, mfc="white", mew=2.3, zorder=5)
    lvl = 0.22 + (0.30 if i % 2 else 0.0)
    ax.text(x, lvl, ("+%d" % round(x)), ha="center", va="bottom", fontsize=8.6, color=RED)
ax.text(73, 0.60, "第 1 次\n+73 年", ha="center", va="bottom", fontsize=10, color=RED, fontweight="bold")
for a, b, lab in [(-6000,-2000,"间隔 4000 年"), (-2000,-500,"间隔 1500 年"), (-500,fut[0],"间隔 573 年")]:
    ax.annotate("", xy=(b, -1.15), xytext=(a, -1.15), arrowprops=dict(arrowstyle="<->", color=GOLD, lw=1.9))
    ax.text((a+b)/2, -1.26, lab, ha="center", va="top", fontsize=9.2, color="#7A5C00")
ax.text(-3000, -1.86, "此后间隔依次为 219 / 84 / 32 / 12 / 4.7 …年，全部灾难在 +427 年处汇聚——那就是终末",
        ha="center", fontsize=10, color=RED)
ax.text(340, 1.18, "间隔每次 × 1/φ² ≈ 0.382\n灾难越来越密", ha="center", fontsize=10.2, color=RED)
ax.set_xlim(-6600, 760); ax.set_ylim(-2.05, 1.70); ax.axis("off")
ax.set_title("图 23　世界式给出的灾难级联：实心点为已知，空心点为推算", fontsize=13, color=NAVY, pad=10)
fig.savefig(os.path.join(OUT, "figures", "fig22-cascade.png"), dpi=190, bbox_inches="tight", facecolor="white")
plt.close(fig); print("wrote fig23; 预测点:", fut)

# ---------- 图24：年代假设的裁决 ----------
fig, axes = plt.subplots(1, 2, figsize=(12.6, 5.6))
for (title, ivs, ax, col) in [("假设甲：葬火之战 = 6000 年前", [4000, 1500], axes[0], TEAL),
                              ("假设乙：葬火之战 = 3000 年前", [1000, 1500], axes[1], RED)]:
    ratio = ivs[1]/ivs[0]
    vals = [ivs[0], ivs[1], ivs[1]*r]
    x = np.arange(3)
    ax.bar(x, vals, color=[col, col, GOLD], width=0.6, edgecolor="white", linewidth=1.4, zorder=3)
    for i, v in enumerate(vals):
        ax.text(i, v+80, str(round(v)), ha="center", fontsize=11.5, color=NAVY, fontweight="bold")
    ax.set_xticks(x); ax.set_xticklabels(["第一间隔\n(史料)", "第二间隔\n(史料)", "第三间隔\n(公式推算)"], fontsize=9.6)
    ax.set_ylim(0, 4700); ax.set_ylabel("间隔（年）", fontsize=10.5)
    ax.set_title(title, fontsize=12, color=NAVY, pad=10)
    ok = abs(ratio - r) < 0.08
    ax.text(0.5, 0.90, "实测间隔比 = %.2f" % ratio, transform=ax.transAxes, ha="center", fontsize=11.5, color=col, fontweight="bold")
    ax.text(0.5, 0.79, "公式要求 0.382  →  " + ("吻合" if ok else "差得太远"),
            transform=ax.transAxes, ha="center", fontsize=12, color=("#1B6B62" if ok else RED), fontweight="bold")
    ax.grid(axis="y", alpha=0.2); ax.set_axisbelow(True)
fig.suptitle("图 24　用世界式裁决年代争议：公式只接受「葬火之战在 6000 年前」", fontsize=13, color=NAVY, y=1.02)
fig.savefig(os.path.join(OUT, "figures", "fig23-adjudication.png"), dpi=190, bbox_inches="tight", facecolor="white")
plt.close(fig); print("wrote fig24")
