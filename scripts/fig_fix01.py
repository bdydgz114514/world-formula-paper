# -*- coding: utf-8 -*-
"""重做图1：改用左右分区布局，避免极坐标扇形造成的重叠"""
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
from matplotlib.patches import FancyArrowPatch, FancyBboxPatch, Circle
import os
plt.rcParams["font.sans-serif"] = ["Microsoft YaHei"]
plt.rcParams["axes.unicode_minus"] = False
OUT = os.path.dirname(os.path.abspath(__file__))
NAVY, TEAL, GOLD, RED, BLUE, GREY = "#16324F", "#2A9D8F", "#C9A227", "#A63A50", "#3D7EA6", "#5C6B73"

fig, ax = plt.subplots(figsize=(13.5, 9.2))
ax.set_xlim(-12.4, 12.4); ax.set_ylim(-7.0, 7.0); ax.axis("off")
ax.add_patch(Circle((0, 0), 1.62, color=NAVY, zorder=5))
ax.text(0, 0.16, "世界式", ha="center", va="center", color="white", fontsize=20, fontweight="bold", zorder=6)
ax.text(0, -0.66, "W(n+1)=W(n)⊕W(n−1)", ha="center", va="center", color="#BBD5E8", fontsize=8.2, zorder=6)

groups = [
    ("原理", TEAL,  (-4.7,  3.3), [(-9.0, 5.9), (-9.0, 4.9), (-9.0, 3.9), (-9.0, 2.9)],
     ["被算的量：差别度 D", "算子：密合 ⊕（3⊕4=7）", "递推：自指生成", "初始项一旦填入即锁定未来"]),
    ("边界", RED,   (-4.7, -3.3), [(-9.0, -3.0), (-9.0, -4.0), (-9.0, -5.0), (-9.0, -6.0)],
     ["哥德尔：系统内不可判定", "降临者＝方程外的参数", "不可计算的部分", "反例与待证清单"]),
    ("推理", BLUE,  ( 4.7,  3.3), [( 9.0, 5.9), ( 9.0, 4.9), ( 9.0, 3.9), ( 9.0, 2.9)],
     ["开放解＝法图纳（循环）", "封闭解＝世界式（坍缩）", "唯一吸引子 D* = 0", "终末＝被合并，非被毁灭"]),
    ("应用", GOLD,  ( 4.7, -3.3), [( 9.0, -3.0), ( 9.0, -4.0), ( 9.0, -5.0), ( 9.0, -6.0)],
     ["判别方案是否加速终末", "定位真正的变量", "推演历史分期", "三项案例复盘"]),
]
for title, col, (bx, by), subs, labels in groups:
    sign_x = 1 if bx > 0 else -1
    ax.add_patch(FancyArrowPatch((sign_x*1.30, by*0.42), (bx - sign_x*1.30, by - 0.10),
                 connectionstyle="arc3,rad=%.2f" % (0.16 if by > 0 else -0.16),
                 arrowstyle="-", lw=2.6, color=col, zorder=2))
    ax.add_patch(FancyBboxPatch((bx-1.32, by-0.46), 2.64, 0.92, boxstyle="round,pad=0.06,rounding_size=0.2",
                 fc=col, ec="none", zorder=4))
    ax.text(bx, by, title, ha="center", va="center", color="white", fontsize=14.5, fontweight="bold", zorder=5)
    for (sx, sy), lab in zip(subs, labels):
        ax.add_patch(FancyArrowPatch((bx + sign_x*1.24, by + (sy-by)*0.12), (sx - sign_x*1.95, sy),
                     connectionstyle="arc3,rad=%.2f" % (-0.10*sign_x),
                     arrowstyle="-", lw=1.0, color=col, alpha=0.55, zorder=1))
        ax.add_patch(FancyBboxPatch((sx-1.95, sy-0.36), 3.90, 0.72, boxstyle="round,pad=0.05,rounding_size=0.14",
                     fc="#FFFFFF", ec=col, lw=1.2, zorder=3))
        ax.text(sx, sy, lab, ha="center", va="center", fontsize=9.2, color=NAVY, zorder=4)
ax.text(0, -6.75, "图 1　世界式研究总览（原理 / 推理 / 应用 / 边界）", ha="center", fontsize=11, color=GREY)
fig.savefig(os.path.join(OUT, "figures", "fig01-mindmap.png"), dpi=175, bbox_inches="tight", facecolor="white")
plt.close(fig)
print("redone fig01")
