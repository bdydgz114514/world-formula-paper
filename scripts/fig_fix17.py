# -*- coding: utf-8 -*-
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import numpy as np, os
plt.rcParams["font.sans-serif"] = ["Microsoft YaHei"]
plt.rcParams["axes.unicode_minus"] = False
OUT = os.path.dirname(os.path.abspath(__file__))
NAVY, TEAL, GOLD, RED, BLUE, GREY = "#16324F", "#2A9D8F", "#C9A227", "#A63A50", "#3D7EA6", "#5C6B73"
fig, ax = plt.subplots(figsize=(11.4, 5.9))
t = np.linspace(0, 18, 800)
D = (16 + 64*(1 - np.exp(-1.6*t))) * np.exp(-0.20*t)
ax.plot(t, D, color=NAVY, lw=3.0, zorder=4)
ax.fill_between(t, 0, D, color=TEAL, alpha=0.10, zorder=1)
tp = t[np.argmax(D)]; Dp = D.max()
ax.plot([tp], [Dp], "o", color=GOLD, ms=13, zorder=6, markeredgecolor="white", markeredgewidth=2)
ax.axvline(tp, color=GOLD, ls=":", lw=2.0, zorder=2)
ax.annotate("火候\n（D 的极大值点）", xy=(tp, Dp), xytext=(tp+0.7, Dp+7), fontsize=12,
            color="#7A5C00", fontweight="bold", arrowprops=dict(arrowstyle="->", color=GOLD, lw=1.9))
ax.annotate("夹生\n外源不足，密合未完成\nD 没走到该到的高度", xy=(0.85, 44), xytext=(0.9, 12),
            fontsize=9.9, color=BLUE, arrowprops=dict(arrowstyle="->", color=BLUE, lw=1.5))
ax.annotate("糊了\n只剩合并、没有新差别注入\nD 一路归零 → 终末态", xy=(17.2, D[-1]), xytext=(10.4, 26),
            fontsize=9.9, color=RED, arrowprops=dict(arrowstyle="->", color=RED, lw=1.5))
ax.axhspan(0, 6, color=RED, alpha=0.08)
ax.text(0.2, 2.0, "D ≈ 0：一团无法再分辨的东西——原始胎海在锅里的形态", fontsize=9.4, color=RED)
ax.set_xlabel("加热时间 t", fontsize=11.5); ax.set_ylabel("可分辨的感官要素数 D", fontsize=11.5)
ax.set_title("图 17　甜甜花酿鸡的 D(t) 轨迹：火候就是曲线最高那一点", fontsize=13, color=NAVY, pad=12)
ax.set_ylim(-2.5, 82); ax.set_xlim(-0.3, 18.2)
ax.grid(alpha=0.22); ax.set_axisbelow(True)
fig.savefig(os.path.join(OUT, "figures", "fig16-cooking-curve.png"), dpi=190, bbox_inches="tight", facecolor="white")
plt.close(fig)
print("redone fig17, D(end)=", round(D[-1], 2), " peak=", round(Dp, 1))
