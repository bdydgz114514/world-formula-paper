# -*- coding: utf-8 -*-
"""补论七/八插图：三档操作 + 变量位时间表"""
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

# ---------- 图29 三档操作 ----------
fig, ax = plt.subplots(figsize=(12.6, 6.0))
ax.set_xlim(0, 12.6); ax.set_ylim(0, 6.4); ax.axis("off")
rows = [
    ("密合", "两样东西变成一个", "D 归零，不可逆", "终末的成因", RED, 4.9),
    ("归约", "从合并体里取一个原像", "D 回升，但有损（δ′＜δ）", "从废墟里捡回几块砖", ORANGE, 3.3),
    ("人格分离", "只剥离其中一个象限", "D 基本不变，结构可复用", "唯一可持续的一档", TEAL, 1.7),
]
ax.text(0.5, 6.05, "档", fontsize=12, color=NAVY, fontweight="bold")
ax.text(2.0, 6.05, "它做什么", fontsize=12, color=NAVY, fontweight="bold")
ax.text(6.3, 6.05, "对差别度 D 的作用", fontsize=12, color=NAVY, fontweight="bold")
ax.text(12.1, 6.05, "性质", fontsize=12, color=NAVY, fontweight="bold", ha="right")
for name, what, eff, nature, col, y in rows:
    ax.add_patch(FancyBboxPatch((0.35, y), 11.9, 1.34, boxstyle="round,pad=0.08,rounding_size=0.18", fc=col, ec="none", alpha=0.11))
    ax.add_patch(FancyBboxPatch((0.35, y), 0.16, 1.34, boxstyle="square,pad=0", fc=col, ec="none"))
    ax.text(0.85, y+0.88, name, fontsize=17, color=col, fontweight="bold", va="center")
    ax.text(0.85, y+0.34, ["第一档","第二档","第三档"][rows.index((name,what,eff,nature,col,y))], fontsize=9.5, color=GREY, va="center")
    ax.text(2.0, y+0.88, what, fontsize=12.4, color=NAVY, va="center")
    ax.text(2.0, y+0.34, eff, fontsize=10.8, color=GREY, va="center")
    ax.text(12.1, y+0.88, nature, fontsize=11.6, color=col, fontweight="bold", va="center", ha="right")
    ax.text(12.1, y+0.34, "", fontsize=9)
ax.add_patch(FancyBboxPatch((0.35, 0.35), 11.9, 0.98, boxstyle="round,pad=0.08,rounding_size=0.18", fc="#FFF8E6", ec=GOLD, lw=1.7))
ax.text(6.3, 0.84, "四象限里「灵魂」与「人格」可分开处理 —— 剥掉人格、灵魂回仓库、下次配新人格。这就是轮回。",
        ha="center", va="center", fontsize=11.4, color="#6A4E00")
save(fig, "fig29-three-operations.png")

# ---------- 图30 变量位时间表 ----------
fig, ax = plt.subplots(figsize=(13.0, 5.4))
ax.set_xlim(0, 13.0); ax.set_ylim(0, 5.8); ax.axis("off")
data = [
    ("法涅斯降临时", "有人（第一降临者）", "被改过初始项", "—", TEAL),
    ("葬火之战前", "？", "开放", "递增（生成型）", GOLD),
    ("葬火之战", "结构变动", "封闭", "拐点", RED),
    ("葬火之战后 → 现在", "空（已碎／已死）", "封闭且无外源", "坍缩（D → 0）", ORANGE),
    ("第四降临者到场", "有人（旅行者）", "重新有外源", "？", PURPLE),
]
hdr = ["时期", "变量位", "系统状态", "算式性质"]
xs = [0.35, 3.5, 6.3, 9.3]
for x, h in zip(xs, hdr):
    ax.text(x, 5.28, h, fontsize=13, color="white", fontweight="bold", va="center")
ax.add_patch(FancyBboxPatch((0.2, 4.72), 12.6, 0.86, boxstyle="round,pad=0.05,rounding_size=0.14", fc=NAVY, ec="none"))
for i, (t, v, s, f, col) in enumerate(data):
    y = 4.16 - i*0.82
    ax.add_patch(FancyBboxPatch((0.2, y-0.34), 12.6, 0.68, boxstyle="round,pad=0.05,rounding_size=0.14", fc=col, ec="none", alpha=0.10))
    ax.text(xs[0], y, t, fontsize=11.6, color=NAVY, va="center")
    ax.text(xs[1], y, v, fontsize=11.6, color=NAVY, va="center", fontweight="bold")
    ax.text(xs[2], y, s, fontsize=11.2, color=GREY, va="center")
    ax.text(xs[3], y, f, fontsize=11.6, color=col, va="center", fontweight="bold")
ax.add_patch(FancyBboxPatch((0.2, 0.22), 12.6, 0.72, boxstyle="round,pad=0.06,rounding_size=0.16", fc="#EAF4F4", ec=TEAL, lw=1.6))
ax.text(6.5, 0.58, "雷内计算的时间点，落在倒数第二行 —— 变量位是空的。", ha="center", va="center", fontsize=12.4, color=NAVY, fontweight="bold")
save(fig, "fig30-variable-slot.png")
print("补论七/八插图完成")
