# -*- coding: utf-8 -*-
"""第2批：自指怪圈 / 三层结构 / 四象限 / 哥德尔 / 降临者 / 卢卡斯数列"""
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
from matplotlib.patches import FancyArrowPatch, FancyBboxPatch, Circle, Rectangle, Wedge
import numpy as np, os
plt.rcParams["font.sans-serif"] = ["Microsoft YaHei"]
plt.rcParams["axes.unicode_minus"] = False
OUT = os.path.dirname(os.path.abspath(__file__))
NAVY, TEAL, GOLD, RED, BLUE, GREY, PURPLE = "#16324F", "#2A9D8F", "#C9A227", "#A63A50", "#3D7EA6", "#5C6B73", "#8E7DBE"
def save(fig, n):
    fig.savefig(os.path.join(OUT, "figures", n), dpi=190, bbox_inches="tight", facecolor="white"); plt.close(fig); print("wrote", n)

# ---------- 图6 自指怪圈 ----------
fig, ax = plt.subplots(figsize=(9.5, 7.6)); ax.set_xlim(-5.4, 5.4); ax.set_ylim(-5.0, 5.0); ax.axis("off")
th = np.linspace(0, 2*np.pi, 300); R = 3.4
ax.plot(R*np.cos(th), R*np.sin(th), color="#DCE6EC", lw=11, solid_capstyle="round", zorder=1)
for k, (ang, lab, col) in enumerate([(90, "世界状态 W(n)", TEAL), (0, "密合 ⊕", GOLD), (270, "世界状态 W(n+1)", BLUE), (180, "回落为新的「当下」", RED)]):
    a = np.radians(ang); x, y = R*np.cos(a), R*np.sin(a)
    ax.add_patch(FancyBboxPatch((x-1.42, y-0.42), 2.84, 0.84, boxstyle="round,pad=0.06,rounding_size=0.2", fc=col, ec="none", zorder=4))
    ax.text(x, y, lab, ha="center", va="center", color="white", fontsize=10.5, fontweight="bold", zorder=5)
for s, e in [(66, 24), (-24, -66), (204, 246), (114, 156)]:
    ax.add_patch(FancyArrowPatch((R*np.cos(np.radians(s)), R*np.sin(np.radians(s))),
                                 (R*np.cos(np.radians(e)), R*np.sin(np.radians(e))),
                                 connectionstyle="arc3,rad=-0.30", arrowstyle="-|>", lw=2.4, color=NAVY, mutation_scale=18, zorder=3))
ax.text(0, 0, "怪\n圈", ha="center", va="center", fontsize=27, color=NAVY, fontweight="bold", alpha=0.82)
ax.text(0, -1.05, "strange loop", ha="center", fontsize=9.5, color=GREY, style="italic")
ax.text(0, -4.62, "图 6　世界式是一个自指递归：下一个世界由世界自身（及其前态）生成", ha="center", fontsize=10.5, color=GREY)
save(fig, "fig06-selfloop.png")

# ---------- 图7 三层结构 ----------
fig, ax = plt.subplots(figsize=(12, 7.2)); ax.set_xlim(0, 12); ax.set_ylim(0, 7.6); ax.axis("off")
layers = [
    (5.55, 2.30, "元层｜降临者层", "#8E7DBE", "唯一能改写不动点的操作：从系统外注入差别（改的是初始项，不是算子）"),
    (3.00, 2.30, "逻辑层｜哥德尔层", BLUE, "系统封闭 + 自指 ⇒ 必存在系统内不可判定命题 ⇒ 内部可「卡 bug」，但改不了不动点"),
    (0.45, 2.30, "动力层｜雷内算的那层", TEAL, "差别度 D 在封闭系统中单调衰减，唯一吸引子 D* = 0，可一路推演到终末"),
]
for y, h, title, col, desc in layers:
    ax.add_patch(FancyBboxPatch((0.7, y), 10.6, h, boxstyle="round,pad=0.10,rounding_size=0.22", fc=col, ec="none", alpha=0.13))
    ax.add_patch(FancyBboxPatch((0.7, y+h-0.78), 10.6, 0.78, boxstyle="round,pad=0.06,rounding_size=0.18", fc=col, ec="none"))
    ax.text(0.98, y+h-0.39, title, ha="left", va="center", color="white", fontsize=12.5, fontweight="bold")
    ax.text(1.0, y+0.72, desc, ha="left", va="center", fontsize=10.2, color=NAVY)
ax.add_patch(FancyArrowPatch((11.05, 1.4), (11.05, 7.2), arrowstyle="-|>", lw=2.0, color=GREY, mutation_scale=16))
ax.text(11.35, 4.3, "抽象层级升高", rotation=90, va="center", ha="center", fontsize=9.5, color=GREY)
ax.text(6.0, 0.05, "图 7　同一个方程在三个抽象层级上的投影", ha="center", fontsize=10.5, color=GREY)
save(fig, "fig07-threelayers.png")

# ---------- 图8 意志四象限 ----------
fig, ax = plt.subplots(figsize=(8.4, 7.4)); ax.set_xlim(-5.2, 5.2); ax.set_ylim(-5.0, 5.2); ax.axis("off")
quad = [(-1, 1, "记忆", "世界曾经是什么", "#3D7EA6"), (1, 1, "灵魂", "世界本质上是什么", "#8E7DBE"),
        (-1, -1, "愿望", "世界想要成为什么", "#F2C14E"), (1, -1, "人格", "世界表现为谁", "#E76F51")]
for sx, sy, t, d, c in quad:
    x, y = sx*2.4, sy*2.4
    ax.add_patch(FancyBboxPatch((x-1.18, y-1.18), 2.36, 2.36, boxstyle="round,pad=0.05,rounding_size=0.16",
                 fc=c, ec="white", lw=2.0, alpha=0.9))
    ax.text(x, y+0.34, t, ha="center", va="center", fontsize=17, color="white", fontweight="bold")
    ax.text(x, y-0.42, d, ha="center", va="center", fontsize=8.6, color="white")
ax.annotate("", xy=(4.9, 0), xytext=(-4.9, 0), arrowprops=dict(arrowstyle="-|>", color=NAVY, lw=1.8))
ax.annotate("", xy=(0, 4.9), xytext=(0, -4.9), arrowprops=dict(arrowstyle="-|>", color=NAVY, lw=1.8))
ax.text(4.55, 0.28, "本质", fontsize=10, color=NAVY); ax.text(-4.5, 0.28, "表象", fontsize=10, color=NAVY)
ax.text(0.16, 4.55, "过去", fontsize=10, color=NAVY, rotation=90, va="top")
ax.text(0.16, -4.55, "未来", fontsize=10, color=NAVY, rotation=90, va="bottom")
ax.text(0, -4.95, "图 8　意志四象限：格式塔把众生意志按这四个格子归档", ha="center", fontsize=10.5, color=GREY)
save(fig, "fig08-quadrants.png")

# ---------- 图9 哥德尔 ----------
fig, ax = plt.subplots(figsize=(11.5, 6.4)); ax.set_xlim(0, 11.5); ax.set_ylim(0, 6.6); ax.axis("off")
ax.add_patch(FancyBboxPatch((0.7, 1.0), 7.6, 4.6, boxstyle="round,pad=0.12,rounding_size=0.25", fc="#EAF4F4", ec=TEAL, lw=2.2))
ax.text(4.5, 5.18, "提瓦特：一个封闭、自指、足够复杂的形式系统", ha="center", fontsize=12, color=NAVY, fontweight="bold")
items = ["元素法则", "地脉与世界树", "命运与命之座", "天理的四影", "「这句话不可证」"]
for i, it in enumerate(items):
    col = RED if i == 4 else "#FFFFFF"
    tc = "white" if i == 4 else NAVY
    ax.add_patch(FancyBboxPatch((1.2 + i*1.44, 2.5), 1.30, 0.86, boxstyle="round,pad=0.04,rounding_size=0.12", fc=col, ec=TEAL, lw=1.2))
    ax.text(1.85 + i*1.44, 2.93, it, ha="center", va="center", fontsize=8.4, color=tc)
ax.text(4.5, 1.72, "哥德尔不完备定理：这样一个系统里，一定存在它既不能证明、也不能证伪的命题。", ha="center", fontsize=10.6, color=RED)
ax.text(4.5, 1.28, "这些命题就是「缝」——博士、队长们在钻的正是它。", ha="center", fontsize=10.2, color=GREY)
ax.add_patch(FancyBboxPatch((8.9, 3.1), 2.3, 1.5, boxstyle="round,pad=0.10,rounding_size=0.2", fc=PURPLE, ec="none"))
ax.text(10.05, 3.85, "降临者", ha="center", va="center", color="white", fontsize=13, fontweight="bold")
ax.add_patch(FancyArrowPatch((8.85, 3.85), (8.35, 3.85), arrowstyle="-|>", lw=2.4, color=PURPLE, mutation_scale=18))
ax.text(10.05, 2.72, "不在这套公理里", ha="center", fontsize=9, color=PURPLE)
ax.text(5.75, 0.35, "图 9　系统内 vs 系统外：缝可以钻，但改写不动点必须来自外面", ha="center", fontsize=10.5, color=GREY)
save(fig, "fig09-godel.png")

# ---------- 图10 降临者作为外源项 ----------
fig, ax = plt.subplots(figsize=(11.5, 5.8)); ax.set_xlim(0, 11.5); ax.set_ylim(0, 5.8); ax.axis("off")
ax.add_patch(FancyBboxPatch((3.1, 0.9), 5.3, 3.9, boxstyle="round,pad=0.14,rounding_size=0.26", fc="#F7FAFC", ec=NAVY, lw=2.0, ls="--"))
ax.text(5.75, 4.42, "蛋壳之内（封闭系统）", ha="center", fontsize=11.5, color=NAVY, fontweight="bold")
t = np.linspace(0, 1, 100)
ax.plot(3.6 + 4.3*t, 3.55 - 1.75*t, color=RED, lw=2.8)
ax.text(6.0, 2.05, "D → 0", fontsize=14, color=RED, fontweight="bold")
ax.text(5.75, 1.28, "没有内源能产生新的差别", ha="center", fontsize=9.6, color=GREY)
ax.add_patch(FancyBboxPatch((0.35, 2.2), 2.3, 1.5, boxstyle="round,pad=0.10,rounding_size=0.2", fc=PURPLE, ec="none"))
ax.text(1.5, 2.95, "降临者", ha="center", va="center", color="white", fontsize=12.5, fontweight="bold")
ax.add_patch(FancyArrowPatch((2.7, 2.95), (3.05, 2.95), arrowstyle="-|>", lw=3.0, color=PURPLE, mutation_scale=20))
ax.text(1.5, 1.85, "自身等价一个世界\n＝自带差别预算", ha="center", fontsize=9.2, color=PURPLE)
ax.add_patch(FancyBboxPatch((8.7, 2.2), 2.5, 1.5, boxstyle="round,pad=0.10,rounding_size=0.2", fc=TEAL, ec="none"))
ax.text(9.95, 2.95, "结果改变", ha="center", va="center", color="white", fontsize=12.5, fontweight="bold")
ax.add_patch(FancyArrowPatch((8.45, 2.95), (8.65, 2.95), arrowstyle="-|>", lw=3.0, color=TEAL, mutation_scale=20))
ax.text(9.95, 1.85, "改的是初始项", ha="center", fontsize=9.2, color=TEAL)
ax.text(5.75, 0.3, "图 10　降临者不是方程里的未知数，是方程外的参数", ha="center", fontsize=10.5, color=GREY)
save(fig, "fig10-descender.png")

# ---------- 图11 卢卡斯数列 ----------
fig, ax = plt.subplots(figsize=(12.2, 5.6))
L = [2, 1, 3, 4, 7, 11, 18, 29, 47, 76, 123]
labels = ["双\n(双子/双月)", "一\n(天理)", "三\n(三月)", "四\n(四影)", "七\n(七元素)", "", "", "", "", "", ""]
cols = [BLUE, NAVY, GOLD, PURPLE, TEAL] + [GREY]*6
bars = ax.bar(range(len(L)), L, color=cols, width=0.62, edgecolor="white", linewidth=1.2)
for i, (b, v) in enumerate(zip(bars, L)):
    ax.text(b.get_x()+b.get_width()/2, v+2.2, str(v), ha="center", fontsize=11, color=NAVY, fontweight="bold")
for i, lab in enumerate(labels):
    if lab:
        ax.text(i, -9, lab, ha="center", va="top", fontsize=8.6, color=cols[i])
for i in range(3):
    ax.annotate("", xy=(i+1.72, L[i+1]+1.2), xytext=(i+0.3, L[i]+1.2),
                arrowprops=dict(arrowstyle="->", color=GOLD, lw=1.4, connectionstyle="arc3,rad=-0.35"))
ax.set_xticks(range(len(L))); ax.set_xticklabels(["L0","L1","L2","L3","L4","L5","L6","L7","L8","L9","L10"], fontsize=9)
ax.set_ylabel("数值", fontsize=10.5); ax.set_ylim(-16, 140)
ax.set_title("图 11　卢卡斯数列 2,1,3,4,7,11,18,… 与提瓦特宇宙学阶梯", fontsize=12.5, color=NAVY, pad=14)
ax.text(0.5, 0.055, "3 + 4 = 7　　4 + 7 = 11　　7 + 11 = 18　（每一项等于前两项之和）", transform=ax.transAxes, ha="center", fontsize=10.2, color=GOLD)
ax.grid(axis="y", alpha=0.22); ax.set_axisbelow(True)
save(fig, "fig11-lucas.png")
print("第2批完成")
