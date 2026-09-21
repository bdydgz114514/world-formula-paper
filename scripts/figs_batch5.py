# -*- coding: utf-8 -*-
"""补论二插图：原料替换对照 + 弹性与同化的区别"""
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

# ---------- 图 18：现实 vs 提瓦特 的泡泡糖原料来源 ----------
fig, ax = plt.subplots(figsize=(12.6, 6.6)); ax.set_xlim(0, 12.6); ax.set_ylim(0, 6.8); ax.axis("off")
rows = [
    ("胶基（弹性网络）", "石油 → 聚异丁烯", "薄荷叶的果胶（植物多糖）", RED),
    ("软化剂 / 增塑", "石蜡、甘油", "薄荷精油（挥发油）", ORANGE),
    ("甜味", "糖 / 糖醇", "糖", TEAL),
    ("酸（促凝胶）", "柠檬酸", "落落莓的果酸", BLUE),
    ("色素", "合成色素", "薄荷（蓝）+ 落落莓（红）", PURPLE),
    ("抗氧化", "BHT 等合成品", "落落莓多酚", TEAL),
]
ax.text(3.05, 6.42, "现实世界：从哪来", ha="center", fontsize=12.5, color=NAVY, fontweight="bold")
ax.text(9.45, 6.42, "提瓦特：从哪来", ha="center", fontsize=12.5, color=NAVY, fontweight="bold")
ax.text(0.55, 6.42, "需要的东西", ha="left", fontsize=12.5, color=NAVY, fontweight="bold")
for i, (need, real, tey, col) in enumerate(rows):
    y = 5.62 - i * 0.86
    ax.add_patch(FancyBboxPatch((0.35, y-0.33), 2.55, 0.66, boxstyle="round,pad=0.05,rounding_size=0.13", fc="#F0F4F7", ec=GREY, lw=1.1))
    ax.text(1.62, y, need, ha="center", va="center", fontsize=9.9, color=NAVY)
    ax.add_patch(FancyBboxPatch((3.05, y-0.33), 3.30, 0.66, boxstyle="round,pad=0.05,rounding_size=0.13",
                 fc="#FDECEC" if i == 0 else "#FFFFFF", ec=RED if i == 0 else GREY, lw=1.6 if i == 0 else 1.1))
    ax.text(4.70, y, real, ha="center", va="center", fontsize=9.9, color=RED if i == 0 else NAVY,
            fontweight="bold" if i == 0 else "normal")
    ax.add_patch(FancyArrowPatch((6.42, y), (7.52, y), arrowstyle="-|>", lw=1.8, color=col, mutation_scale=15))
    ax.add_patch(FancyBboxPatch((7.60, y-0.33), 3.72, 0.66, boxstyle="round,pad=0.05,rounding_size=0.13",
                 fc=col, ec="none", alpha=0.92 if i == 0 else 0.75))
    ax.text(9.46, y, tey, ha="center", va="center", fontsize=9.9, color="white", fontweight="bold" if i == 0 else "normal")
ax.add_patch(FancyBboxPatch((0.35, 0.30), 11.0, 0.90, boxstyle="round,pad=0.08,rounding_size=0.18", fc="#FFF8E6", ec=GOLD, lw=1.7))
ax.text(5.85, 0.75, "红色那一行就是问题所在：石油在提瓦特存不下来，于是「胶基」必须换一个来源。薄荷的果胶顶上来了。",
        ha="center", va="center", fontsize=10.6, color="#6A4E00")
save(fig, "fig18-gumbase-source.png")

# ---------- 图20：弹性 vs 同化 ----------
fig, axes = plt.subplots(1, 2, figsize=(12.6, 5.4))
s = np.linspace(0, 1, 200)
# 左：弹性——加应变 D 上升，撤应变 D 沿原路回来（闭环）
ax = axes[0]
up = 20 + 60 * s
down = 20 + 60 * s
ax.plot(np.concatenate([s, s[::-1]]), np.concatenate([up, down[::-1]]), color=TEAL, lw=2.8)
ax.annotate("", xy=(0.5, 20+60*0.5), xytext=(0.5, 20+60*0.5), arrowprops=dict(arrowstyle="-"))
ax.add_patch(FancyArrowPatch((0.15, 29), (0.55, 53), arrowstyle="-|>", lw=2.2, color=TEAL, mutation_scale=15, connectionstyle="arc3,rad=0.001"))
ax.add_patch(FancyArrowPatch((0.85, 71), (0.45, 47), arrowstyle="-|>", lw=2.2, color=TEAL, mutation_scale=15, connectionstyle="arc3,rad=0.001"))
ax.text(0.5, 88, "弹性：原路返回\n（差别被借走又还回来）", ha="center", fontsize=11, color=TEAL, fontweight="bold")
ax.text(0.5, 8, "去程与回程重合 → 闭环", ha="center", fontsize=9.8, color=GREY)
# 右：同化——不回来
ax = axes[1]
ax.plot(s, 20 + 60 * s, color=RED, lw=2.8, label="去程（受力）")
ax.plot(s, 20 + 12 * s, color=NAVY, lw=2.8, ls="--", label="回程（撤力）")
ax.fill_between(s, 20 + 12 * s, 20 + 60 * s, color=RED, alpha=0.10)
ax.annotate("回不去了\n差别没有还回来", xy=(0.75, 20+36*0.75), xytext=(0.30, 66),
            fontsize=11, color=RED, fontweight="bold", arrowprops=dict(arrowstyle="->", color=RED, lw=1.6))
ax.text(0.5, 88, "同化：走了就不回来\n（差别被永久抹平）", ha="center", fontsize=11, color=RED, fontweight="bold")
ax.text(0.5, 8, "去程与回程分离 → 迟滞环", ha="center", fontsize=9.8, color=GREY)
for ax in axes:
    ax.set_xlim(-0.05, 1.05); ax.set_ylim(0, 100)
    ax.set_xlabel("形变（受力程度）", fontsize=10.5); ax.set_ylabel("差别度 D", fontsize=10.5)
    ax.grid(alpha=0.2); ax.set_axisbelow(True)
axes[1].legend(fontsize=9.5, loc="lower right")
fig.suptitle("图 19　弹性为什么必须建立在「不顾同化」的力上", fontsize=12.8, color=NAVY, y=1.00)
save(fig, "fig19-elasticity-vs-assimilation.png")
print("补论二插图完成")
