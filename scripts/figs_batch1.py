# -*- coding: utf-8 -*-
"""世界式论文插图 第1批：总览思维导图 / 差别度 / 两种力 / D(t)曲线 / 密合算子"""
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import matplotlib.patches as mp
from matplotlib.patches import FancyArrowPatch, FancyBboxPatch, Circle, Wedge
import numpy as np
import os

plt.rcParams["font.sans-serif"] = ["Microsoft YaHei"]
plt.rcParams["axes.unicode_minus"] = False
OUT = os.path.dirname(os.path.abspath(__file__))

NAVY, TEAL, GOLD, RED, GREY = "#16324F", "#2A9D8F", "#C9A227", "#A63A50", "#5C6B73"

def save(fig, name):
    p = os.path.join(OUT, "figures", name)
    fig.savefig(p, dpi=190, bbox_inches="tight", facecolor="white")
    plt.close(fig)
    print("wrote", name)

# ---------- 图1 思维导图 ----------
fig, ax = plt.subplots(figsize=(13, 9))
ax.set_xlim(-10, 10); ax.set_ylim(-7.2, 7.2); ax.axis("off")
ax.add_patch(Circle((0, 0), 1.55, color=NAVY, zorder=3))
ax.text(0, 0, "世界式", ha="center", va="center", color="white", fontsize=19, fontweight="bold", zorder=4)
ax.text(0, -0.62, "W(n+1)=W(n)⊕W(n−1)", ha="center", va="center", color="#BBD5E8", fontsize=8.5, zorder=4)

branches = [
    ("原理", TEAL, 118, [("被算的量：差别度 D", 1), ("算子：密合 ⊕", 1), ("递推：自指生成", 1), ("初始项锁定未来", 0)]),
    ("推理", "#3D7EA6", 58, [("开放解 = 法图纳（循环）", 1), ("封闭解 = 世界式（坍缩）", 1), ("唯一吸引子 D*=0", 1), ("终末＝被合并，非被毁灭", 1)]),
    ("应用", GOLD, -18, [("判别方案是否在加速终末", 1), ("定位真正的变量", 1), ("推演历史分期", 1), ("三项案例复盘", 1)]),
    ("边界", RED, -95, [("哥德尔：系统内不可判定", 1), ("降临者＝方程外参数", 1), ("不可计算的部分", 1), ("反例与待证清单", 0)]),
]
for title, col, ang, subs in branches:
    a = np.radians(ang)
    bx, by = 5.3*np.cos(a), 4.3*np.sin(a)
    ax.add_patch(FancyArrowPatch((1.5*np.cos(a), 1.5*np.sin(a)), (bx-1.15*np.cos(a), by-0.42*np.sin(a)),
                 connectionstyle="arc3,rad=0.12", arrowstyle="-", lw=2.2, color=col, zorder=1))
    ax.add_patch(FancyBboxPatch((bx-1.15, by-0.42), 2.3, 0.84, boxstyle="round,pad=0.06,rounding_size=0.18",
                 fc=col, ec="none", zorder=3))
    ax.text(bx, by, title, ha="center", va="center", color="white", fontsize=14, fontweight="bold", zorder=4)
    for k, (s, _) in enumerate(subs):
        sa = a + (k - (len(subs)-1)/2) * 0.30
        sx, sy = 8.4*np.cos(sa), 6.2*np.sin(sa)
        ax.add_patch(FancyArrowPatch((bx+1.0*np.cos(a), by+0.32*np.sin(a)), (sx-0.95*np.cos(sa), sy-0.22*np.sin(sa)),
                     connectionstyle="arc3,rad=0.1", arrowstyle="-", lw=1.1, color=col, alpha=0.7, zorder=1))
        ax.add_patch(FancyBboxPatch((sx-1.5, sy-0.30), 3.0, 0.60, boxstyle="round,pad=0.05,rounding_size=0.12",
                     fc="#FFFFFF", ec=col, lw=1.1, zorder=3))
        ax.text(sx, sy, s, ha="center", va="center", fontsize=8.6, color=NAVY, zorder=4)
ax.text(0, -6.7, "图 1　世界式研究总览", ha="center", fontsize=11, color=GREY)
save(fig, "fig01-mindmap.png")

# ---------- 图2 差别度 ----------
fig, axes = plt.subplots(1, 3, figsize=(13, 4.2))
np.random.seed(7)
titles = ["高差别度 D\n（可区分的事物多）", "中差别度 D\n（部分合并）", "D = 0\n（完全同化）"]
for i, ax in enumerate(axes):
    ax.set_xlim(0, 10); ax.set_ylim(0, 10); ax.axis("off")
    n = [46, 22, 1][i]
    if i < 2:
        xs = np.random.uniform(1, 9, n); ys = np.random.uniform(1, 9, n)
        cs = np.random.choice([TEAL, GOLD, "#3D7EA6", "#E76F51", "#8E7DBE"], n)
        ax.scatter(xs, ys, s=[60, 130, 900][i], c=cs, alpha=0.9, edgecolors="white", linewidths=0.8)
    else:
        ax.add_patch(Circle((5, 5), 2.6, color="#7FB3D5", alpha=0.85))
        ax.text(5, 5, "唯\n一", ha="center", va="center", fontsize=20, color="white", fontweight="bold")
    ax.set_title(titles[i], fontsize=11, color=NAVY, pad=8)
fig.suptitle("图 2　差别度 D：世界里「可区分事物的总量」", fontsize=12.5, color=NAVY, y=1.02)
save(fig, "fig02-distinction.png")

# ---------- 图3 两种力 ----------
fig, ax = plt.subplots(figsize=(11, 5.2))
ax.set_xlim(-6, 6); ax.set_ylim(-3.6, 3.6); ax.axis("off")
ax.add_patch(Circle((-4.1, 1.5), 1.15, color="#F2C14E", alpha=0.9))
ax.text(-4.1, 1.5, "光界力\n(灵光)", ha="center", va="center", fontsize=10.5, color="#4A3600", fontweight="bold")
ax.add_patch(Circle((4.1, 1.5), 1.15, color="#4B3F72", alpha=0.92))
ax.text(4.1, 1.5, "虚界力\n(深渊)", ha="center", va="center", fontsize=10.5, color="white", fontweight="bold")
ax.add_patch(FancyArrowPatch((-2.9, 1.5), (2.9, 1.5), arrowstyle="<->", lw=2.4, color=RED, mutation_scale=22))
ax.text(0, 1.95, "方向相反（互相「对抗」）", ha="center", fontsize=10, color=RED)
ax.add_patch(FancyBboxPatch((-3.3, -2.6), 6.6, 1.5, boxstyle="round,pad=0.12,rounding_size=0.2", fc="#EAF4F4", ec=TEAL, lw=1.6))
ax.text(0, -1.85, "但两者性质相同：都会「同化」接触到的物质与能量\n而且「同样拥有自己的意识」", ha="center", va="center", fontsize=10.5, color=NAVY)
ax.add_patch(FancyArrowPatch((-4.1, 0.35), (-2.0, -1.05), arrowstyle="-|>", lw=1.6, color=GREY, mutation_scale=14))
ax.add_patch(FancyArrowPatch((4.1, 0.35), (2.0, -1.05), arrowstyle="-|>", lw=1.6, color=GREY, mutation_scale=14))
ax.text(0, 0.72, "雷内：「就像水银不会和水融合，但是会互相融合」", ha="center", fontsize=9.5, color="#7A5C00", style="italic")
ax.text(0, -3.25, "图 3　提瓦特仅有的两种底层力，都是「消灭差别」的收缩算子", ha="center", fontsize=10.5, color=GREY)
save(fig, "fig06-two-forces.png")

# ---------- 图4 D(t) 曲线 ----------
fig, ax = plt.subplots(figsize=(10.5, 5.6))
t = np.linspace(0, 10, 400)
ax.plot(t, 100*np.exp(-0.42*t), color=RED, lw=2.8, label="封闭解（世界式）：指数衰减，趋向 0")
ax.plot(t, 62 + 38*np.cos(0.9*t), color=TEAL, lw=2.4, ls="--", label="开放解（法图纳）：有外源补充，循环不灭")
ax.axhline(0, color=GREY, lw=1)
ax.annotate("终末：D = 0\n（连甜甜花和薄荷都长不出来）", xy=(9.4, 100*np.exp(-0.42*9.4)), xytext=(5.6, 22),
            fontsize=10, color=RED, arrowprops=dict(arrowstyle="->", color=RED, lw=1.5))
ax.annotate("外源项归零的瞬间\n（天理以蛋壳封闭系统）", xy=(1.6, 100*np.exp(-0.42*1.6)), xytext=(0.15, 74),
            fontsize=10, color=NAVY, arrowprops=dict(arrowstyle="->", color=NAVY, lw=1.4))
ax.set_xlabel("时间", fontsize=11); ax.set_ylabel("差别度 D", fontsize=11)
ax.set_title("图 4　同一个递推式的两种命运", fontsize=12.5, color=NAVY)
ax.legend(fontsize=10, loc="upper right"); ax.grid(alpha=0.25)
ax.set_ylim(-4, 112)
save(fig, "fig07-curves.png")

# ---------- 图5 密合算子 ----------
fig, ax = plt.subplots(figsize=(11, 5))
ax.set_xlim(0, 11); ax.set_ylim(0, 5); ax.axis("off")
def box(x, y, w, h, txt, fc, ec, tc="white", fs=13):
    ax.add_patch(FancyBboxPatch((x, y), w, h, boxstyle="round,pad=0.08,rounding_size=0.2", fc=fc, ec=ec, lw=1.6))
    ax.text(x+w/2, y+h/2, txt, ha="center", va="center", fontsize=fs, color=tc, fontweight="bold")
box(0.5, 2.6, 2.2, 1.5, "表象\n3", "#F2C14E", "#B8860B", "#4A3600")
box(3.4, 2.6, 2.2, 1.5, "本征\n4", "#8E7DBE", "#5B4B8A")
ax.add_patch(Circle((6.9, 3.35), 0.62, color=TEAL))
ax.text(6.9, 3.35, "⊕", ha="center", va="center", fontsize=24, color="white", fontweight="bold")
ax.text(6.9, 2.25, "密合", ha="center", fontsize=10.5, color=TEAL, fontweight="bold")
box(8.3, 2.6, 2.2, 1.5, "密合\n7", "#2A9D8F", "#1B6B62")
ax.add_patch(FancyArrowPatch((7.6, 3.35), (8.2, 3.35), arrowstyle="-|>", lw=2.2, color=TEAL, mutation_scale=18))
ax.text(5.5, 1.35, "3 + 4 = 7　　4 + 7 = 11　　7 + 11 = 18　　→ 连续的卢卡斯数", ha="center", fontsize=11.5, color=NAVY)
ax.text(5.5, 0.72, "密合（coniunctio）＝炼金术的「化学婚礼」：把两个对立项熔为一体", ha="center", fontsize=10, color=GREY)
ax.text(5.5, 0.15, "图 5　世界式的生成算子", ha="center", fontsize=10.5, color=GREY)
save(fig, "fig03-coniunctio.png")
print("第1批完成")
