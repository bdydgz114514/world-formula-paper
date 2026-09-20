# -*- coding: utf-8 -*-
"""补论插图：烹饪的 D(t) 轨迹 + 四象限填充"""
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

# ---------- 图17：烹饪的 D(t) 轨迹 ----------
fig, ax = plt.subplots(figsize=(11.2, 5.8))
t = np.linspace(0, 10, 500)
# 上升段（火注入差别）→ 峰值（火候）→ 下降段（水分流失、结构塌缩）
D = 22 + 58*(1-np.exp(-1.35*t))*np.exp(-0.30*t)
ax.plot(t, D, color=NAVY, lw=3.0, zorder=4)
ax.fill_between(t, 0, D, color=TEAL, alpha=0.10, zorder=1)
tp = t[np.argmax(D)]; Dp = D.max()
ax.plot([tp], [Dp], "o", color=GOLD, ms=13, zorder=6, markeredgecolor="white", markeredgewidth=2)
ax.axvline(tp, color=GOLD, ls=":", lw=2.0, zorder=2)
ax.annotate("火候\n（D 的极大值点）", xy=(tp, Dp), xytext=(tp+0.55, Dp+7),
            fontsize=11.5, color="#7A5C00", fontweight="bold",
            arrowprops=dict(arrowstyle="->", color=GOLD, lw=1.8))
ax.annotate("夹生\n外源不足，密合未完成\nD 没走到该到的高度", xy=(1.05, 41), xytext=(0.35, 12),
            fontsize=9.8, color=BLUE, arrowprops=dict(arrowstyle="->", color=BLUE, lw=1.4))
ax.annotate("糊了\n继续合并没有新差别注入\nD 一路归零 → 终末态", xy=(9.3, D[-1]), xytext=(5.55, 12),
            fontsize=9.8, color=RED, arrowprops=dict(arrowstyle="->", color=RED, lw=1.4))
ax.axhspan(0, 8, color=RED, alpha=0.07)
ax.text(0.15, 3.2, "D ≈ 0：一团无法再分辨的东西（原始胎海在锅里的形态）", fontsize=9.2, color=RED)
ax.set_xlabel("加热时间 t", fontsize=11); ax.set_ylabel("可分辨的感官要素数 D", fontsize=11)
ax.set_title("图 17　甜甜花酿鸡的 D(t) 轨迹：火候就是曲线最高那一点", fontsize=12.8, color=NAVY, pad=12)
ax.set_ylim(-3, 82); ax.set_xlim(-0.2, 10)
ax.grid(alpha=0.22); ax.set_axisbelow(True)
save(fig, "fig16-cooking-curve.png")

# ---------- 图18：四象限填充 ----------
fig, ax = plt.subplots(figsize=(9.6, 7.8)); ax.set_xlim(-5.6, 5.6); ax.set_ylim(-5.4, 5.6); ax.axis("off")
# 四格
Q = [(-2.5, 2.5, "记忆", "禽肉", "熟悉的做法\n——它一直都是这样做的", BLUE),
     ( 2.5, 2.5, "灵魂", "禽肉", "本质\n——提供这道菜的实体", PURPLE),
     (-2.5,-2.5, "愿望", "甜甜花", "许诺\n——入口后的那点回甘", GOLD),
     ( 2.5,-2.5, "表象", "甜甜花", "外观\n——颜色、香气、甜", ORANGE)]
for x, y, q, who, why, col in Q:
    ax.add_patch(FancyBboxPatch((x-2.28, y-2.28), 4.56, 4.56, boxstyle="round,pad=0.08,rounding_size=0.22",
                 fc=col, ec="white", lw=3, alpha=0.90))
    ax.text(x, y+1.32, q, ha="center", fontsize=19, color="white", fontweight="bold")
    ax.add_patch(FancyBboxPatch((x-1.12, y+0.10), 2.24, 0.62, boxstyle="round,pad=0.05,rounding_size=0.14", fc="white", ec="none"))
    ax.text(x, y+0.41, who, ha="center", va="center", fontsize=13.5, color=col, fontweight="bold")
    ax.text(x, y-0.72, why, ha="center", va="center", fontsize=9.4, color="white")
ax.annotate("", xy=(5.15, 0), xytext=(-5.15, 0), arrowprops=dict(arrowstyle="-|>", color=NAVY, lw=1.8))
ax.annotate("", xy=(0, 5.15), xytext=(0, -5.15), arrowprops=dict(arrowstyle="-|>", color=NAVY, lw=1.8))
ax.text(4.75, 0.30, "本质", fontsize=10, color=NAVY); ax.text(-4.75, 0.30, "表象", fontsize=10, color=NAVY)
ax.text(0.18, 4.75, "过去", fontsize=10, color=NAVY, rotation=90, va="top")
ax.text(0.18, -4.75, "未来", fontsize=10, color=NAVY, rotation=90, va="bottom")
ax.text(0, -5.28, "图 18　两味原料填满四个象限：禽肉占灵魂与记忆，甜甜花占表象与愿望", ha="center", fontsize=11, color=GREY)
save(fig, "fig17-recipe-quadrants.png")
print("补论插图完成")
