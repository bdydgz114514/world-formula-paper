# -*- coding: utf-8 -*-
"""《大一统理论纲要》(第 48 号) 插图：figU01 ~ figU14

字体 / 配色 / dpi 沿用 figs_batch*.py 的配置 (Microsoft YaHei, dpi=190)。
全部图形只用 matplotlib 几何图元 + 文字绘制，不使用任何外部图片素材。
只画论文里已经写了的结论，不引入新的数字或断言。
"""
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
from matplotlib.patches import FancyArrowPatch, FancyBboxPatch, Rectangle, Circle
import numpy as np
import os

plt.rcParams["font.sans-serif"] = ["Microsoft YaHei"]
plt.rcParams["axes.unicode_minus"] = False
plt.rcParams["mathtext.fontset"] = "dejavusans"

OUT = os.path.dirname(os.path.abspath(__file__))
NAVY, TEAL, GOLD, RED, BLUE, GREY, PURPLE, ORANGE = (
    "#16324F", "#2A9D8F", "#C9A227", "#A63A50", "#3D7EA6", "#5C6B73", "#8E7DBE", "#E76F51")


def save(fig, n):
    fig.savefig(os.path.join(OUT, "figures", n), dpi=190, bbox_inches="tight", facecolor="white")
    plt.close(fig)
    print("wrote", n)


def rbox(ax, x, y, w, h, fc, ec="none", lw=1.6, rs=0.16, alpha=1.0, z=2):
    ax.add_patch(FancyBboxPatch((x, y), w, h,
                 boxstyle="round,pad=0,rounding_size=%g" % rs,
                 fc=fc, ec=ec, lw=lw, alpha=alpha, zorder=z))


def arr(ax, p, q, col=NAVY, lw=2.2, style="-|>", ms=17, z=3, ls="-", rad=0.0):
    ax.add_patch(FancyArrowPatch(p, q, arrowstyle=style, lw=lw, color=col,
                 mutation_scale=ms, zorder=z, linestyle=ls,
                 connectionstyle="arc3,rad=%g" % rad, shrinkA=0, shrinkB=0))


def cross(ax, x, y, s=0.20, col=RED, lw=3.2, z=7):
    ax.plot([x - s, x + s], [y - s, y + s], color=col, lw=lw, zorder=z, solid_capstyle="round")
    ax.plot([x - s, x + s], [y + s, y - s], color=col, lw=lw, zorder=z, solid_capstyle="round")


def canvas(w, h, xmax=None, ymax=None):
    fig, ax = plt.subplots(figsize=(w, h))
    ax.set_xlim(0, xmax if xmax else w)
    ax.set_ylim(0, ymax if ymax else h)
    ax.axis("off")
    return fig, ax


def strip(fig, rect, text_lines, fc="#FFF8E6", ec=GOLD):
    """底部通栏说明条；text_lines = [(y, s, fontsize, color, weight), ...]"""
    axb = fig.add_axes(rect)
    axb.set_xlim(0, 1); axb.set_ylim(0, 1); axb.axis("off")
    rbox(axb, 0.002, 0.03, 0.996, 0.94, fc, ec=ec, lw=1.6, rs=0.10)
    for y, s, fs, col, wt in text_lines:
        axb.text(0.5, y, s, ha="center", va="center", fontsize=fs, color=col, fontweight=wt)
    return axb


# =====================================================================
# 图 U-1  第 48 号研究总览（对应世界式的 fig01-mindmap）
# =====================================================================
fig, ax = canvas(14.6, 8.6)
ax.text(0.35, 8.28, "大一统理论纲要（第 48 号）研究总览", fontsize=15, color=NAVY,
        fontweight="bold", va="center")

ax.add_patch(Circle((2.10, 4.30), 1.72, color=NAVY, zorder=3))
ax.text(2.10, 4.62, "第 48 号", ha="center", va="center", color="white",
        fontsize=19, fontweight="bold", zorder=4)
ax.text(2.10, 4.02, "大一统理论纲要", ha="center", va="center", color="#BBD5E8",
        fontsize=11, zorder=4)
ax.text(2.10, 3.42, "引力的问题，是它在\n重正化群的递推里\n缺了一项", ha="center", va="center",
        color="#DCEAF2", fontsize=8.8, zorder=4, linespacing=1.6)

rows = [
    ("第零~一章　递推的阶", TEAL, [
        "两个式子并排：一阶 vs 二阶，差的是一阶",
        "一阶没有记忆，没有「另一族解」",
        "二阶：特征方程二次，两个根，两族解"]),
    ("第二章　标准模型", BLUE, [
        "标准模型是一台一阶递推机的胜利",
        r"三线在 $10^{15}$～$10^{16}$ GeV「几乎」交汇",
        "加上超对称是回溯，不是预测"]),
    ("第三章　引力的麻烦", RED, [
        "G 是带负量纲的耦合常数",
        "像一笔每期只还利息的贷款",
        "β 函数的符号是「错」的，递推没有地方停"]),
    ("第四章　四条路线", PURPLE, [
        "弦论 / 圈量子引力 / 渐近安全 / 因果三角剖分",
        "一条改对象，一条改几何，一条改判敛性，一条改离散性",
        "都在给那个只有一阶的递推，补上它原本没有的项"]),
    ("第五~六章　主张与对应", GOLD, [
        "记忆项假说：升为二阶，得到第二族解（丙级）",
        "引力所需的那个不动点，可能出现在第二族解里",
        "可重正化程度 ≈ 差别度（丙级，没有计算支持）"]),
    ("第七~九章　检验场与边界", ORANGE, [
        "提瓦特：规格、死之诅咒、天钉，三组对应",
        "互相解释不等于互相证明（本院设了三道防线）",
        "本院没有做计算；待证清单五条"]),
]

ys = [7.55 - i * 1.30 for i in range(6)]
ax.plot([4.30, 4.30], [ys[-1], ys[0]], color="#C9D3DA", lw=2.0, zorder=1)
ax.plot([3.84, 4.30], [4.30, 4.30], color=NAVY, lw=2.4, zorder=1)

for (name, col, leaves), y in zip(rows, ys):
    ax.plot([4.30, 4.45], [y, y], color=col, lw=2.0, zorder=1)
    rbox(ax, 4.45, y - 0.34, 3.60, 0.68, col, z=3, rs=0.14)
    ax.text(6.25, y, name, ha="center", va="center", color="white",
            fontsize=12.5, fontweight="bold", zorder=4)
    offs = [0.38, 0.0, -0.38]
    ax.plot([8.05, 8.20], [y, y], color=col, lw=1.4, zorder=1)
    ax.plot([8.20, 8.20], [y + offs[0], y + offs[-1]], color=col, lw=1.4, zorder=1)
    for off, s in zip(offs, leaves):
        yl = y + off
        ax.plot([8.20, 8.36], [yl, yl], color=col, lw=1.0, alpha=0.75, zorder=1)
        rbox(ax, 8.36, yl - 0.155, 5.90, 0.31, "white", ec=col, lw=1.1, z=3, rs=0.10)
        ax.text(11.31, yl, s, ha="center", va="center", fontsize=9.0, color=NAVY, zorder=4)

ax.text(7.30, 0.35, "统一理论的困难，可能不在于我们少了一个公式，而在于我们少了一阶。",
        ha="center", va="center", fontsize=12.5, color="#7A5C00", fontweight="bold")
save(fig, "figU01-mindmap.png")


# =====================================================================
# 图 U-2  两个式子并排：一阶 vs 二阶
# =====================================================================
fig, ax = canvas(13.2, 6.4)

for x0, col in ((0.25, TEAL), (6.80, BLUE)):
    rbox(ax, x0, 1.15, 6.15, 4.70, col, ec=col, lw=1.9, alpha=0.08, rs=0.20)

rbox(ax, 0.55, 5.15, 5.55, 0.60, TEAL, rs=0.16)
ax.text(3.325, 5.45, "一阶递推：量子场论的重正化群", ha="center", va="center",
        color="white", fontsize=12.5, fontweight="bold")
ax.text(3.325, 4.72, r"$d\,g\,/\,d\ln\mu=\beta(g)$", ha="center", va="center",
        fontsize=16, color=NAVY)
ax.text(3.325, 4.20, r"$g(n+1)=g(n)+\varepsilon\cdot\beta(g(n))$", ha="center", va="center",
        fontsize=13, color=GREY)

rbox(ax, 7.10, 5.15, 5.55, 0.60, BLUE, rs=0.16)
ax.text(9.875, 5.45, "二阶递推：第 47 号的算式", ha="center", va="center",
        color="white", fontsize=12.5, fontweight="bold")
ax.text(9.875, 4.72, r"$W(n+1)=W(n)\oplus W(n-1)$", ha="center", va="center",
        fontsize=16, color=NAVY)
ax.text(9.875, 4.20, "（下一步依赖当前步和前一步）", ha="center", va="center",
        fontsize=11, color=GREY)

# 左：一阶，只有当前步
lx = [1.35, 3.325, 5.30]
for x, lab in zip(lx, [r"$n-1$", r"$n$", r"$n+1$"]):
    ax.add_patch(Circle((x, 3.30), 0.46, fc="white", ec=NAVY, lw=2.0, zorder=5))
    ax.text(x, 3.30, lab, ha="center", va="center", fontsize=11.5, color=NAVY, zorder=6)
arr(ax, (3.325 + 0.46, 3.30), (5.30 - 0.46, 3.30), col=NAVY, lw=2.6, z=2)
ax.text(4.31, 3.66, "只依赖当前步", ha="center", fontsize=9.8, color=GREY, zorder=6)
arr(ax, (1.35 + 0.46, 2.42), (5.30 - 0.46, 2.42), col="#B9C2C9", lw=1.8, ls=(0, (5, 4)), z=2)
ax.plot([1.35, 1.35], [2.88, 2.42], color="#B9C2C9", lw=1.4, ls=(0, (4, 3)), zorder=2)
ax.plot([5.30, 5.30], [2.42, 2.88], color="#B9C2C9", lw=1.4, ls=(0, (4, 3)), zorder=2)
cross(ax, 3.325, 2.42, s=0.17)
ax.text(3.325, 2.00, "没有前一项", ha="center", va="center", fontsize=11, color=RED,
        fontweight="bold", zorder=6)
ax.text(3.325, 1.72, "一阶递推没有「另一族解」。", ha="center", va="center",
        fontsize=11.5, color=NAVY, fontweight="bold", zorder=6)
ax.text(3.325, 1.40, "特征方程是一次方程，只有一个根。", ha="center", va="center",
        fontsize=10.2, color=GREY, zorder=6)

# 右：二阶，当前步 + 前一项
rx = [7.90, 9.875, 11.85]
for x, lab in zip(rx, [r"$n-1$", r"$n$", r"$n+1$"]):
    ax.add_patch(Circle((x, 3.30), 0.46, fc="white", ec=NAVY, lw=2.0, zorder=5))
    ax.text(x, 3.30, lab, ha="center", va="center", fontsize=11.5, color=NAVY, zorder=6)
arr(ax, (9.875 + 0.46, 3.30), (11.85 - 0.46, 3.30), col=NAVY, lw=2.6, z=2)
ax.text(10.86, 3.66, "当前步", ha="center", fontsize=9.8, color=GREY, zorder=6)
arr(ax, (7.90 + 0.46, 2.42), (11.85 - 0.46, 2.42), col=TEAL, lw=2.6, z=2)
ax.plot([7.90, 7.90], [2.88, 2.42], color=TEAL, lw=2.0, zorder=2)
ax.plot([11.85, 11.85], [2.42, 2.88], color=TEAL, lw=2.0, zorder=2)
ax.text(9.875, 2.00, "记忆项（多出来的那一项）", ha="center", va="center", fontsize=11,
        color=TEAL, fontweight="bold", zorder=6)
ax.text(9.875, 1.72, "二阶递推有「另一族解」。", ha="center", va="center",
        fontsize=11.5, color=NAVY, fontweight="bold", zorder=6)
ax.text(9.875, 1.40, "特征方程是二次方程，有两个根。", ha="center", va="center",
        fontsize=10.2, color=GREY, zorder=6)

strip(fig, [0.02, 0.005, 0.96, 0.155], [
    (0.55, "本院做的只是：把两个式子并排放在一起，然后指出它们差了一阶。", 12.5, NAVY, "bold")])
save(fig, "figU02-two-recursions.png")


# =====================================================================
# 图 U-3  一个根 / 两个根；一族解 / 两族解
# =====================================================================
fig = plt.figure(figsize=(13.0, 7.8))
gs = fig.add_gridspec(2, 2, height_ratios=[1.0, 0.92], hspace=0.30, wspace=0.13,
                      left=0.055, right=0.975, top=0.90, bottom=0.06)
fig.text(0.5, 0.955, "递推的阶：一个根与两个根", ha="center", fontsize=15.5,
         color=NAVY, fontweight="bold")

axA = fig.add_subplot(gs[0, 0]); axA.set_xlim(0, 10); axA.set_ylim(0, 10); axA.axis("off")
axB = fig.add_subplot(gs[0, 1]); axB.set_xlim(0, 10); axB.set_ylim(0, 10); axB.axis("off")

rbox(axA, 0.15, 0.30, 9.70, 9.40, TEAL, ec=TEAL, lw=1.9, alpha=0.09, rs=0.30)
axA.text(5.0, 8.75, r"一阶：$x(n+1)=a\cdot x(n)$", ha="center", va="center",
         fontsize=15, color=NAVY, fontweight="bold")
rowsA = [("特征方程", r"$r=a$（一次）"),
         ("根的个数", "1"),
         ("通解", r"$x(n)=A\cdot a^{\,n}$　—— 一族"),
         ("初值个数", "1"),
         ("行为", r"若 $a>0$ 永不变号；没有「振荡」这一档")]
for k, (lab, val) in enumerate(rowsA):
    y = 7.10 - k * 1.10
    axA.text(0.70, y, lab, ha="left", va="center", fontsize=12.5, color=TEAL, fontweight="bold")
    axA.text(3.60, y, val, ha="left", va="center", fontsize=12.5, color=NAVY)
axA.text(5.0, 1.10, "一阶递推：未来只由现在决定，与过去无关 —— 它没有记忆。",
         ha="center", va="center", fontsize=10.6, color=GREY)

rbox(axB, 0.15, 0.30, 9.70, 9.40, BLUE, ec=BLUE, lw=1.9, alpha=0.09, rs=0.30)
axB.text(5.0, 8.75, r"二阶：$x(n+1)=a\cdot x(n)+b\cdot x(n-1)$", ha="center", va="center",
         fontsize=15, color=NAVY, fontweight="bold")
rowsB = [("特征方程", r"$r^{2}=a\cdot r+b$（二次）"),
         ("根的个数", r"2（$r_1$ 与 $r_2$）"),
         ("通解", r"$x(n)=A\cdot r_1^{\,n}+B\cdot r_2^{\,n}$　—— 两族之和"),
         ("初值个数", "2"),
         ("行为", "判别式为负时两根共轭，解变成阻尼振荡")]
for k, (lab, val) in enumerate(rowsB):
    y = 7.10 - k * 1.10
    axB.text(0.70, y, lab, ha="left", va="center", fontsize=12.5, color=BLUE, fontweight="bold")
    axB.text(3.60, y, val, ha="left", va="center", fontsize=12.5, color=NAVY)
axB.text(5.0, 1.42, r"第 47 号的两个根：$r_1=\phi\approx 1.618$，$r_2=-1/\phi\approx -0.618$；",
         ha="center", va="center", fontsize=10.6, color=GREY)
axB.text(5.0, 0.82, "负根带来的交替行为，正是一阶系统不可能有的。",
         ha="center", va="center", fontsize=10.6, color=GREY)

axP1 = fig.add_subplot(gs[1, 0])
n1 = np.arange(0, 11)
y1 = 5.0 * (0.72 ** n1)
axP1.plot(n1, y1, color=TEAL, lw=2.6, marker="o", ms=7, mfc="white", mec=TEAL, mew=2.0)
axP1.axhline(0, color="#C9D3DA", lw=1.2)
axP1.set_ylim(0, 5.9); axP1.set_xlim(-0.5, 10.5)
axP1.set_title(r"一阶：$a>0$ 时永不变号 —— 没有「振荡」这一档", fontsize=12, color=NAVY, pad=9)
axP1.set_xlabel("n（步）", fontsize=11); axP1.set_ylabel("x(n)", fontsize=11)
axP1.grid(alpha=0.22); axP1.set_axisbelow(True)
axP1.text(0.96, 0.80, "每一步都同号，只是变小", transform=axP1.transAxes, ha="right",
          fontsize=10.4, color=GREY)

axP2 = fig.add_subplot(gs[1, 1])
n2 = np.arange(0, 13)
y2 = 5.4 * (0.86 ** n2) * np.cos(n2 * 1.05)
axP2.plot(n2, y2, color=BLUE, lw=2.6, marker="o", ms=7, mfc="white", mec=BLUE, mew=2.0)
axP2.axhline(0, color="#C9D3DA", lw=1.2)
axP2.set_ylim(-6.2, 6.2); axP2.set_xlim(-0.5, 12.5)
axP2.set_title("二阶：判别式为负时，通解变成阻尼振荡", fontsize=12, color=NAVY, pad=9)
axP2.set_xlabel("n（步）", fontsize=11); axP2.set_ylabel("x(n)", fontsize=11)
axP2.grid(alpha=0.22); axP2.set_axisbelow(True)
axP2.annotate("既衰减，又振荡", xy=(7.0, 1.75), xytext=(6.4, 4.6), fontsize=11,
              color=RED, fontweight="bold",
              arrowprops=dict(arrowstyle="->", color=RED, lw=1.8))
save(fig, "figU03-one-vs-two-roots.png")


# =====================================================================
# 图 U-4  三条耦合线：几乎交汇，但不交于一点
# =====================================================================
fig = plt.figure(figsize=(12.8, 6.8))
ax = fig.add_axes([0.075, 0.095, 0.895, 0.80])
u = np.linspace(0, 14, 500)
base = 7.2 - 0.28 * u
g = 0.14 + 0.86 * np.exp(-u / 3.2)
A = base + 4.6 * g
B = base + 0.8 * g
C = base - 2.4 * g
ax.plot(u, A, color=BLUE, lw=3.0, label="电磁耦合")
ax.plot(u, B, color=TEAL, lw=3.0, label="弱耦合")
ax.plot(u, C, color=ORANGE, lw=3.0, label="强耦合")
ax.axvspan(8.6, 9.9, color=GOLD, alpha=0.20, zorder=0)
for xv in (8.6, 9.9):
    ax.axvline(xv, color=GOLD, ls=":", lw=1.8, zorder=1)
ax.set_xlim(0, 14); ax.set_ylim(0, 12)
ax.set_xticks([]); ax.set_yticks([])
ax.set_xlabel("能标 μ（对数尺度，示意）　→　越来越高", fontsize=11.5)
ax.set_ylabel("耦合的对数倒数（示意）", fontsize=11.5)
ax.set_title("把三种耦合沿能标往上跑：它们会靠近", fontsize=14, color=NAVY, pad=12)
ax.legend(fontsize=10, loc="lower right", framealpha=0.95)
ax.grid(alpha=0.20); ax.set_axisbelow(True)
ax.text(0.45, 2.30, "把三种耦合的对数倒数沿能标往上跑，它们会靠近。",
        fontsize=11.5, color=NAVY)
ax.text(0.45, 1.45, "「几乎交汇」这四个字，是本章的核心。", fontsize=11.8,
        color="#7A5C00", fontweight="bold")
arr(ax, (8.6, 10.55), (9.9, 10.55), col=NAVY, lw=2.0, style="<->", ms=14)
ax.text(9.25, 11.20, r"$10^{15}$～$10^{16}$ GeV", ha="center", va="center",
        fontsize=11.5, color=NAVY, fontweight="bold",
        bbox=dict(boxstyle="round,pad=0.30", fc="white", ec=GOLD, lw=1.5))
axin = ax.inset_axes([0.58, 0.50, 0.40, 0.32])
uz = np.linspace(8.4, 10.2, 200)
gz = 0.14 + 0.86 * np.exp(-uz / 3.2)
bz = 7.2 - 0.28 * uz
axin.plot(uz, bz + 4.6 * gz, color=BLUE, lw=2.4)
axin.plot(uz, bz + 0.8 * gz, color=TEAL, lw=2.4)
axin.plot(uz, bz - 2.4 * gz, color=ORANGE, lw=2.4)
axin.set_xlim(8.4, 10.2); axin.set_ylim(3.6, 6.2)
axin.set_xticks([]); axin.set_yticks([])
axin.set_title("放大这一段：三条线仍然分开", fontsize=10.2, color=RED, pad=6,
               bbox=dict(boxstyle="round,pad=0.28", fc="white", ec="none"))
for sp in axin.spines.values():
    sp.set_edgecolor(RED); sp.set_linewidth(1.6)
save(fig, "figU04-three-couplings.png")


# =====================================================================
# 图 U-5  回溯 vs 预测
# =====================================================================
fig, ax = canvas(13.0, 6.0)
ax.text(0.35, 5.62, "同一件事的两种时间顺序", fontsize=15, color=NAVY, fontweight="bold",
        va="center")

rbox(ax, 0.35, 4.18, 1.45, 0.78, GREY, alpha=0.18, rs=0.16)
ax.text(1.075, 4.57, "回溯", ha="center", va="center", fontsize=13, color=GREY, fontweight="bold")
rbox(ax, 2.20, 4.18, 3.00, 0.78, "#EAF4F4", ec=TEAL, lw=1.6, rs=0.16)
ax.text(3.70, 4.57, "① 观测到：三线不交汇", ha="center", va="center", fontsize=12, color=NAVY)
arr(ax, (5.35, 4.57), (5.75, 4.57), col=GREY, lw=2.2)
rbox(ax, 5.75, 4.18, 3.00, 0.78, "#FFF8E6", ec=GOLD, lw=1.6, rs=0.16)
ax.text(7.25, 4.57, "② 引入超对称来修它", ha="center", va="center", fontsize=12, color=NAVY)
arr(ax, (8.90, 4.57), (9.30, 4.57), col=GREY, lw=2.2)
rbox(ax, 9.30, 4.18, 3.35, 0.78, "#F3EDF7", ec=PURPLE, lw=1.6, rs=0.16)
ax.text(10.975, 4.57, "③ 解释了一个已有的事实", ha="center", va="center", fontsize=12, color=NAVY)
ax.text(12.72, 4.57, "", fontsize=10)

rbox(ax, 0.35, 2.38, 1.45, 0.78, GREY, alpha=0.18, rs=0.16)
ax.text(1.075, 2.77, "预测", ha="center", va="center", fontsize=13, color=GREY, fontweight="bold")
rbox(ax, 2.20, 2.38, 4.30, 0.78, "#FBEEF1", ec=RED, lw=1.6, rs=0.16)
ax.text(4.35, 2.77, "① 超对称自己的预测：超对称粒子的质量", ha="center", va="center",
        fontsize=12, color=NAVY)
arr(ax, (6.65, 2.77), (7.05, 2.77), col=GREY, lw=2.2)
rbox(ax, 7.05, 2.38, 3.35, 0.78, "#FBEEF1", ec=RED, lw=1.6, rs=0.16)
ax.text(8.725, 2.77, "② 至今没有被找到", ha="center", va="center", fontsize=12,
        color=RED, fontweight="bold")
cross(ax, 10.90, 2.77, s=0.26, lw=3.6)

strip(fig, [0.02, 0.01, 0.96, 0.30], [
    (0.72, "「加上超对称就交汇了」这句话，是一个回溯，不是一个预测。", 13.5, NAVY, "bold"),
    (0.26, "它解释了一个已有的事实，而没有事先说中它。", 11.5, GREY, "normal")])
save(fig, "figU05-supersymmetry-retro.png")


# =====================================================================
# 图 U-6  两笔债：还本金 vs 只还利息
# =====================================================================
fig = plt.figure(figsize=(12.8, 6.4))
gs = fig.add_gridspec(1, 2, wspace=0.20, left=0.065, right=0.975, top=0.85, bottom=0.37)
fig.text(0.5, 0.945, "一个类比：把「不可重正化」想成一笔贷款", ha="center",
         fontsize=15.5, color=NAVY, fontweight="bold")

p = np.arange(1, 8)
ax1 = fig.add_subplot(gs[0, 0])
ax1.bar(p, [10.0, 8.2, 6.4, 4.6, 2.8, 1.2, 0.0], color=TEAL, width=0.62, zorder=3)
ax1.set_ylim(0, 14.5); ax1.set_xticks(p)
ax1.set_xlabel("期数", fontsize=11.5); ax1.set_ylabel("剩余本金", fontsize=11.5)
ax1.set_title("第一笔：每一期还掉一部分本金", fontsize=13, color=NAVY, pad=10)
ax1.grid(axis="y", alpha=0.22); ax1.set_axisbelow(True)
ax1.text(1.10, 11.9, "越还越少，最终还清", fontsize=11.8, color=TEAL, fontweight="bold")
ax1.text(0.975, 0.965, "对应：可重正化的耦合", transform=ax1.transAxes, fontsize=11.2,
         color=NAVY, ha="right", va="top",
         bbox=dict(boxstyle="round,pad=0.45", fc="white", ec=TEAL, lw=1.5))

ax2 = fig.add_subplot(gs[0, 1])
lixi = np.array([0.7, 1.6, 2.6, 3.7, 4.9, 6.2, 7.6])
ax2.bar(p, np.full(7, 6.0), color=NAVY, width=0.62, label="本金（永远在）", zorder=3)
ax2.bar(p, lixi, bottom=6.0, color=RED, width=0.62, alpha=0.88,
        label="利息（还在涨）", zorder=3)
ax2.set_ylim(0, 19.0); ax2.set_xticks(p)
ax2.set_xlabel("期数", fontsize=11.5); ax2.set_ylabel("欠账", fontsize=11.5)
ax2.set_title("第二笔：每一期只还利息", fontsize=13, color=NAVY, pad=10)
ax2.grid(axis="y", alpha=0.22); ax2.set_axisbelow(True)
ax2.legend(fontsize=10.2, loc="upper left", framealpha=0.95)
ax2.text(0.975, 0.965, "对应：不可重正化的耦合（牛顿常数）", transform=ax2.transAxes,
         fontsize=11.2, color=NAVY, ha="right", va="top",
         bbox=dict(boxstyle="round,pad=0.45", fc="white", ec=RED, lw=1.5))

strip(fig, [0.02, 0.015, 0.96, 0.24], [
    (0.72, "可重正化的耦合，像一个每期都在还本金的贷款；牛顿常数像一个只还利息的贷款。", 13, NAVY, "bold"),
    (0.25, "这类贷款有一个共同点：它不会因为你还得久就变好。（本院在这里用的是类比，不是推导。）", 11.2, GREY, "normal")])
save(fig, "figU06-loan-analogy.png")


# =====================================================================
# 图 U-7  有没有地方停
# =====================================================================
fig = plt.figure(figsize=(12.8, 6.4))
gs = fig.add_gridspec(1, 2, wspace=0.22, left=0.075, right=0.975, top=0.85, bottom=0.32)
fig.text(0.5, 0.945, "β 函数的两种符号：一个有地方停，一个没有", ha="center",
         fontsize=15.5, color=NAVY, fontweight="bold")

axL = fig.add_subplot(gs[0, 0])
gg = np.linspace(0.15, 2.40, 400)
axL.plot(gg, -0.85 * (gg - 1.0), color=TEAL, lw=3.0, zorder=4)
axL.axhline(0, color=GREY, lw=1.3, zorder=2)
axL.axvline(1.0, color=RED, ls=":", lw=1.8, zorder=2)
axL.plot([1.0], [0.0], "o", color=RED, ms=12, zorder=6, markeredgecolor="white", markeredgewidth=1.8)
axL.set_xlim(0, 2.4); axL.set_ylim(-2.4, 2.4)
axL.set_xticks([]); axL.set_yticks([])
axL.set_xlabel("耦合 g", fontsize=11.5); axL.set_ylabel("β(g)", fontsize=11.5)
axL.set_title("可重正化：β 函数穿过零点", fontsize=13, color=NAVY, pad=10)
axL.grid(alpha=0.20); axL.set_axisbelow(True)
axL.annotate("不动点：递推在那里停住", xy=(1.0, 0.0), xytext=(1.18, 1.55),
             fontsize=11.2, color=RED, fontweight="bold",
             arrowprops=dict(arrowstyle="->", color=RED, lw=1.8))
axL.text(0.10, 1.95, "β 函数的零点就是系统的「去处」", fontsize=10.6, color=GREY)
arr(axL, (0.30, -1.60), (0.85, -1.60), col=TEAL, lw=2.2, ms=15)
arr(axL, (1.75, -1.60), (1.15, -1.60), col=TEAL, lw=2.2, ms=15)
axL.text(1.02, -2.05, "一族解意味着：系统只有一个「去处」", ha="center",
         fontsize=10.6, color=TEAL, fontweight="bold")

axR = fig.add_subplot(gs[0, 1])
uu = np.linspace(0, 1, 400)
axR.plot(uu, 0.6 * np.exp(2.6 * uu) + 0.1, color=RED, lw=3.0, zorder=4)
axR.set_xlim(0, 1); axR.set_ylim(0, 10.8)
axR.set_xticks([]); axR.set_yticks([])
axR.set_xlabel("能标 ln μ　→", fontsize=11.5); axR.set_ylabel("G 的有效值", fontsize=11.5)
axR.set_title("引力：β 函数的符号是「错」的", fontsize=13, color=NAVY, pad=10)
axR.grid(alpha=0.20); axR.set_axisbelow(True)
axR.text(0.97, 0.055, "G 的有效值随能标上升而增大", transform=axR.transAxes,
         fontsize=10.8, color=GREY, ha="right", va="bottom")
axR.annotate("递推没有地方停", xy=(0.99, 8.95), xytext=(0.26, 6.30), fontsize=12,
             color=RED, fontweight="bold",
             arrowprops=dict(arrowstyle="->", color=RED, lw=1.9))

strip(fig, [0.02, 0.015, 0.96, 0.225], [
    (0.72, "引力之所以没有地方停，是因为它的递推里没有前一项。", 13, NAVY, "bold"),
    (0.25, "因为缺了前一项，它就没有第二族解；而没有第二族解，它就没有「另一条路」。（本院的核心猜测，丙级）", 11.2, GREY, "normal")])
save(fig, "figU07-where-to-stop.png")


# =====================================================================
# 图 U-8  四条路线，一个形状
# =====================================================================
fig, ax = canvas(13.6, 6.9)
ax.text(0.40, 6.55, "四条路线，一个形状", fontsize=15.5, color=NAVY, fontweight="bold",
        va="center")
for x, h in ((0.72, "路线"), (2.60, "它改了什么"), (5.35, "用递推的语言说，它做了什么"),
             (9.50, "论文里的关键句")):
    ax.text(x, 6.05, h, fontsize=11.5, color=GREY, fontweight="bold", va="center")

routes = [
    ("弦论", TEAL, "换成延展对象", "把无穷多项装进基本对象",
     "一根弦有无穷多个振动模式；\n引力子是闭弦的最低激发 —— 它本来就在那里"),
    ("圈量子引力", BLUE, "几何量子化", "给递推加一个底",
     "面积与体积变成算符，有了离散的谱；\n能标不能无限往下走 —— 它有一个底"),
    ("渐近安全", GOLD, "改判敛性", "承认递推有非零不动点",
     "G 与 Λ 的无量纲版本，\n跑到一个紫外不动点上"),
    ("因果动力学\n三角剖分", PURPLE, "时空离散化", "让递推从离散涌现",
     "在一定的参数范围内，离散的三角剖分\n长出了四维的、近似光滑的时空"),
]
for k, (name, col, what, rec, detail) in enumerate(routes):
    yc = 5.20 - k * 1.15
    rbox(ax, 0.35, yc - 0.52, 12.90, 1.04, col, alpha=0.10, rs=0.16)
    ax.add_patch(Rectangle((0.35, yc - 0.52), 0.14, 1.04, fc=col, ec="none", zorder=3))
    ax.text(0.72, yc, name, fontsize=12.5, color=col, fontweight="bold", va="center")
    ax.text(2.60, yc, what, fontsize=11.5, color=NAVY, va="center")
    ax.text(5.35, yc, rec, fontsize=11.8, color=NAVY, fontweight="bold", va="center")
    ax.text(9.50, yc, detail, fontsize=9.8, color=GREY, va="center", linespacing=1.7)

rbox(ax, 0.35, 0.25, 12.90, 0.95, "#FFF8E6", ec=GOLD, lw=1.7, rs=0.18)
ax.text(6.80, 0.83, "它们做的其实是同一件事：都在给那个「只有一阶」的递推，补上一个它原本没有的项。",
        ha="center", va="center", fontsize=12.5, color=NAVY, fontweight="bold")
ax.text(6.80, 0.45, "本院必须说清楚：这是一个事后的归类，不是一条物理结论。",
        ha="center", va="center", fontsize=10.5, color=GREY)
save(fig, "figU08-four-routes.png")


# =====================================================================
# 图 U-9  两族解的相对权重
# =====================================================================
fig = plt.figure(figsize=(13.2, 6.8))
gs = fig.add_gridspec(1, 2, width_ratios=[1.42, 1.0], wspace=0.16,
                      left=0.065, right=0.975, top=0.88, bottom=0.26)
axL = fig.add_subplot(gs[0, 0])
nn = np.linspace(0, 20, 600)
w1 = 0.10 + 0.85 / (1 + np.exp(-(nn - 6.0) / 2.0))
w2 = 0.05 + 0.62 * np.exp(-(((nn - 5.0) / 2.2) ** 2))
axL.axvspan(2.9, 7.1, color=ORANGE, alpha=0.15, zorder=0)
axL.plot(nn, w1, color=TEAL, lw=3.0, label=r"$r_1$ 族（接近一阶解）")
axL.plot(nn, w2, color=ORANGE, lw=3.0, label=r"$r_2$ 族（由记忆项带来）")
axL.set_xlim(0, 20); axL.set_ylim(0, 1.12)
axL.set_xlabel("能标（步 n）　→　越来越高", fontsize=11.5)
axL.set_ylabel("两族解的相对权重", fontsize=11.5)
axL.set_title("两族解不是永远并肩走的", fontsize=13.5, color=NAVY, pad=10)
axL.legend(fontsize=10.2, loc="center right", framealpha=0.95)
axL.grid(alpha=0.22); axL.set_axisbelow(True)
axL.annotate("记忆项带来的那一族\n在这里跑出来", xy=(5.0, 0.66), xytext=(8.3, 0.86),
             fontsize=10.8, color=RED, fontweight="bold",
             arrowprops=dict(arrowstyle="->", color=RED, lw=1.8))
axL.annotate("在大尺度上被压制到看不见", xy=(17.0, 0.06), xytext=(11.2, 0.24),
             fontsize=10.5, color=GREY,
             arrowprops=dict(arrowstyle="->", color=GREY, lw=1.6))

axR = fig.add_subplot(gs[0, 1]); axR.set_xlim(0, 10); axR.set_ylim(0, 10); axR.axis("off")
axR.text(5.0, 9.55, "两个根，两族解", ha="center", va="center", fontsize=13.5,
         color=NAVY, fontweight="bold")
rbox(axR, 0.30, 6.35, 9.40, 2.55, TEAL, ec=TEAL, lw=1.8, alpha=0.10, rs=0.22)
axR.text(5.0, 8.45, r"$r_1$　接近一阶解", ha="center", va="center", fontsize=13,
         color=TEAL, fontweight="bold")
axR.text(5.0, 7.60, "主导大尺度", ha="center", va="center", fontsize=12.5, color=NAVY)
axR.text(5.0, 6.80, "我们熟悉的、可重正化的那一部分", ha="center", va="center",
         fontsize=10.8, color=GREY)
rbox(axR, 0.30, 3.35, 9.40, 2.55, ORANGE, ec=ORANGE, lw=1.8, alpha=0.10, rs=0.22)
axR.text(5.0, 5.45, r"$r_2$　由记忆项带来", ha="center", va="center", fontsize=13,
         color=ORANGE, fontweight="bold")
axR.text(5.0, 4.60, "在特定能标下才显著", ha="center", va="center", fontsize=12.5, color=NAVY)
axR.text(5.0, 3.80, "引力行为可能藏在这里", ha="center", va="center",
         fontsize=10.8, color=GREY)
axR.text(5.0, 2.55, "关键在第二行。", ha="center", va="center", fontsize=11.2,
         color=NAVY, fontweight="bold")
axR.text(5.0, 1.75, "本院必须立刻补一句：", ha="center", va="center", fontsize=10.8, color=GREY)
axR.text(5.0, 1.15, "这句话本院无法验证。", ha="center", va="center", fontsize=11,
         color=RED, fontweight="bold")

strip(fig, [0.02, 0.01, 0.96, 0.185], [
    (0.60, "如果这件事成立，那么它解释了一个现象：为什么标准模型的三条线「几乎」交汇，却不完全交汇 —— 因为「几乎」这个偏差，可能正是记忆项在起作用。",
     12.2, NAVY, "bold")])
save(fig, "figU09-two-families.png")


# =====================================================================
# 图 U-10  三条推翻条件
# =====================================================================
fig, ax = canvas(13.2, 5.6)
ax.text(0.35, 5.22, "本主张在以下情况下被推翻", fontsize=15.5, color=NAVY,
        fontweight="bold", va="center")

cards = [
    ("① 与「阶」无关", TEAL,
     "如果引力的紫外行为被证明\n与「阶」无关 —— 例如渐近\n安全的不动点被证明只能出现\n在一阶框架内，而无法从\n二阶递推得到。"),
    ("② 记忆项在数学上不可实现", GOLD,
     "如果不存在一个自洽的二阶\n重正化群方程，能还原\n已知的低能物理。"),
    ("③ 偏差可由已知效应解释", RED,
     "如果三线不交汇的偏差被证明\n可以由已知效应完全解释\n（例如由更高阶的圈图修正\n解释干净），那么 5.3 节\n那条旁证就不成立。"),
]
for k, (head, col, body) in enumerate(cards):
    x = 0.35 + k * 4.20
    rbox(ax, x, 1.55, 4.10, 3.20, col, alpha=0.10, rs=0.20)
    rbox(ax, x, 4.10, 4.10, 0.65, col, rs=0.16)
    ax.text(x + 2.05, 4.425, head, ha="center", va="center", fontsize=12,
            color="white", fontweight="bold")
    ax.text(x + 0.32, 3.85, body, ha="left", va="top", fontsize=11, color=NAVY,
            linespacing=1.85)

rbox(ax, 0.35, 0.30, 12.50, 1.02, "#FFF8E6", ec=GOLD, lw=1.7, rs=0.18)
ax.text(6.60, 0.98, "本院把这三条写出来，是为了让读者能反驳本院，而不是为了让本院显得严谨。",
        ha="center", va="center", fontsize=12, color=NAVY, fontweight="bold")
ax.text(6.60, 0.60, "一条说不出「什么情况下会错」的主张，与一条正确的主张，在读者眼里长得一模一样。",
        ha="center", va="center", fontsize=10.5, color=GREY)
save(fig, "figU10-refutation-conditions.png")


# =====================================================================
# 图 U-11  差别的收支
# =====================================================================
fig, ax = canvas(13.2, 6.6)
ax.text(0.40, 6.22, "差别的收支：产生的速度 vs 合并的速度", fontsize=15.5, color=NAVY,
        fontweight="bold", va="center")
for x, h in ((0.65, "情形"), (3.00, "收支示意"), (6.40, "说法一（物理）"),
             (9.25, "说法二（第 47 号的语言）")):
    ax.text(x, 5.62, h, fontsize=11.5, color=GREY, fontweight="bold", va="center")

rows = [
    ("可重正化", TEAL, 1.8, 5.4, "吸收 > 产生", TEAL,
     "需要新的反项来吸收发散", "新的差别在不断地产生"),
    ("不可重正化", RED, 5.4, 1.8, "产生 > 吸收", RED,
     "反项不够用，发散无法吸收", "新的差别产生的速度超过了处理能力"),
    ("渐近安全", ORANGE, 3.4, 3.4, "产生 = 合并", ORANGE,
     "有不动点，发散被吸收", "差别产生与差别合并达到平衡"),
]
for k, (name, col, lw_in, lw_out, verdict, vcol, s1, s2) in enumerate(rows):
    yc = 4.80 - k * 1.35
    rbox(ax, 0.35, yc - 0.64, 12.50, 1.28, col, alpha=0.10, rs=0.18)
    ax.text(0.65, yc, name, fontsize=13, color=col, fontweight="bold", va="center")
    # 收支示意：细/粗箭头表示产生与吸收的相对速度
    arr(ax, (3.05, yc), (4.25, yc), col=col, lw=lw_in, ms=15, z=4)
    ax.add_patch(Rectangle((4.35, yc - 0.34), 0.55, 0.68, fc="white", ec=col, lw=1.6, zorder=4))
    arr(ax, (5.00, yc), (6.20, yc), col=col, lw=lw_out, ms=15, z=4)
    ax.text(4.62, yc + 0.46, "产生", ha="center", fontsize=9.2, color=GREY)
    ax.text(5.62, yc + 0.46, "合并", ha="center", fontsize=9.2, color=GREY)
    ax.text(4.62, yc - 0.50, verdict, ha="center", fontsize=9.6, color=vcol, fontweight="bold")
    ax.text(6.40, yc, s1, fontsize=11, color=NAVY, va="center")
    ax.text(9.25, yc, s2, fontsize=10.8, color=NAVY, va="center", fontweight="bold")

rbox(ax, 0.35, 0.28, 12.50, 1.00, "#FBEEF1", ec=RED, lw=1.6, rs=0.18)
ax.text(6.60, 0.96, "重正化就是「把新的差别吸收进旧的定义里」；可重正化，意味着这个吸收过程是收敛的。",
        ha="center", va="center", fontsize=11.8, color=NAVY, fontweight="bold")
ax.text(6.60, 0.58, "物理里没有一个叫「可重正化程度」的量 —— 它是一个二值属性，不是一个连续量。（本院给这一章丙级）",
        ha="center", va="center", fontsize=10.5, color=GREY)
save(fig, "figU11-difference-budget.png")


# =====================================================================
# 图 U-12  三组对应：提瓦特 与 物理
# =====================================================================
fig, ax = canvas(13.2, 6.8)
ax.text(0.40, 6.35, "三组对应：第 47 号的东西，在物理里叫什么", fontsize=15.5,
        color=NAVY, fontweight="bold", va="center")
ax.text(2.25, 5.72, "第 47 号", ha="center", fontsize=12, color=PURPLE,
        fontweight="bold", va="center")
ax.text(8.30, 5.72, "物理里的对应物", ha="center", fontsize=12, color=TEAL,
        fontweight="bold", va="center")
ax.text(11.83, 5.72, "等级", ha="center", fontsize=12, color=GREY,
        fontweight="bold", va="center")

rows = [
    ("规格", "D 的上限", r"紫外截断 $\Lambda$", "两者的功能相同：都给出上限", "乙级", GOLD, 4.85),
    ("死之诅咒", "阻止 D 增加", "反项", "修补截断破坏的对称性", "丙级", ORANGE, 3.45),
    ("天钉", "一次硬截断", "一次截断的重新设定", "形状上的对应，找不到检验方式", "丙级", ORANGE, 2.05),
]
for name, sub, phys, note, grade, gcol, yc in rows:
    rbox(ax, 0.35, yc - 0.58, 3.75, 1.16, PURPLE, ec=PURPLE, lw=1.6, alpha=0.10, rs=0.16)
    ax.text(2.225, yc + 0.22, name, ha="center", va="center", fontsize=13.5,
            color=PURPLE, fontweight="bold")
    ax.text(2.225, yc - 0.26, sub, ha="center", va="center", fontsize=10.5, color=GREY)
    arr(ax, (4.22, yc), (5.72, yc), col=GREY, lw=2.2, style="<|-|>", ms=17)
    rbox(ax, 5.85, yc - 0.58, 4.90, 1.16, "#EAF4F4", ec=TEAL, lw=1.6, rs=0.16)
    ax.text(8.30, yc + 0.22, phys, ha="center", va="center", fontsize=13.5,
            color=NAVY, fontweight="bold")
    ax.text(8.30, yc - 0.26, note, ha="center", va="center", fontsize=10.2, color=GREY)
    rbox(ax, 11.05, yc - 0.30, 1.55, 0.60, gcol, rs=0.14)
    ax.text(11.825, yc, grade, ha="center", va="center", fontsize=12.5,
            color="white", fontweight="bold")

rbox(ax, 0.35, 0.28, 12.50, 1.05, "#FFF8E6", ec=GOLD, lw=1.7, rs=0.18)
ax.text(6.60, 0.99, "把这句话翻译到提瓦特：虚假之天就是那个截断；为了让系统保持封闭，必须持续地投入「维护成本」。",
        ha="center", va="center", fontsize=11.8, color=NAVY, fontweight="bold")
ax.text(6.60, 0.58, "如果对应是对的，提瓦特的维护动作就应该显示出某种周期性 —— 第 47 号的补论四已经独立地给出了一个周期（约 73 年）。",
        ha="center", va="center", fontsize=10.5, color=GREY)
save(fig, "figU12-teyvat-correspondence.png")


# =====================================================================
# 图 U-13  零不动点 与 非零不动点
# =====================================================================
fig = plt.figure(figsize=(13.0, 6.6))
gs = fig.add_gridspec(1, 2, wspace=0.20, left=0.075, right=0.975, top=0.86, bottom=0.28)
fig.text(0.5, 0.945, "两个系统的「去处」：一个在零，一个不在零", ha="center",
         fontsize=15.5, color=NAVY, fontweight="bold")

axL = fig.add_subplot(gs[0, 0])
nn = np.arange(0, 13)
Dv = 6.5 * np.exp(-0.42 * nn)
axL.plot(nn, Dv, color=TEAL, lw=2.8, marker="o", ms=6.5, mfc="white", mec=TEAL, mew=1.8)
axL.axhline(0, color=RED, ls="--", lw=2.0)
axL.set_ylim(-0.6, 7.4); axL.set_xlim(-0.6, 12.6)
axL.set_xticks([]); axL.set_yticks([])
axL.set_xlabel("第 47 号的时间轴　→", fontsize=11.5)
axL.set_ylabel("差别度 D", fontsize=11.5)
axL.set_title("提瓦特：终末 D 归零", fontsize=13.5, color=NAVY, pad=10)
axL.grid(alpha=0.20); axL.set_axisbelow(True)
axL.text(0.60, 6.55, "D = 0", fontsize=11, color=RED, fontweight="bold")
axL.annotate("不动点是零", xy=(11.6, 0.15), xytext=(6.6, 2.30), fontsize=12,
             color=RED, fontweight="bold",
             arrowprops=dict(arrowstyle="->", color=RED, lw=1.9))
axL.text(0.97, 0.88, "第 47 号：封闭系统的终末是「D 归零」", transform=axL.transAxes,
         fontsize=10.8, color=GREY, ha="right")

axR = fig.add_subplot(gs[0, 1])
uu = np.linspace(0, 8, 400)
Gv = 4.6 - 3.6 * np.exp(-0.5 * uu)
axR.plot(uu, Gv, color=BLUE, lw=2.8)
axR.axhline(4.6, color=RED, ls="--", lw=2.0)
axR.set_ylim(0, 6.4); axR.set_xlim(0, 8)
axR.set_xticks([]); axR.set_yticks([])
axR.set_xlabel("能标 ln μ　→", fontsize=11.5)
axR.set_ylabel("无量纲引力耦合", fontsize=11.5)
axR.set_title("物理：渐近安全的不动点是一个非零值", fontsize=13.5, color=NAVY, pad=10)
axR.grid(alpha=0.20); axR.set_axisbelow(True)
axR.text(0.06, 4.78, "非零不动点", fontsize=11.5, color=RED, fontweight="bold")
axR.annotate("跑到一个紫外不动点上", xy=(6.4, 4.35), xytext=(1.6, 2.10), fontsize=11.5,
             color=NAVY, arrowprops=dict(arrowstyle="->", color=NAVY, lw=1.8))

strip(fig, [0.02, 0.012, 0.96, 0.205], [
    (0.72, "「终末是零」这件事，在物理的语言里其实是一个特殊情形，而不是通例。", 13, NAVY, "bold"),
    (0.25, "提瓦特的不动点为什么是零？它是被设计成零的，还是本来就是零？", 11.2, GREY, "normal")])
save(fig, "figU13-zero-vs-nonzero.png")


# =====================================================================
# 图 U-14  互相解释，以及三道防线
# =====================================================================
fig, ax = canvas(13.4, 7.2)
ax.text(0.40, 6.88, "两个理论互相解释：比「包含」弱，但比「类比」强", fontsize=15.5,
        color=NAVY, fontweight="bold", va="center")

rbox(ax, 0.35, 3.55, 5.55, 2.95, TEAL, ec=TEAL, lw=1.8, alpha=0.09, rs=0.20)
rbox(ax, 0.35, 5.90, 5.55, 0.60, TEAL, rs=0.16)
ax.text(3.125, 6.20, "世界式（第 47 号）提供", ha="center", va="center", color="white",
        fontsize=12.5, fontweight="bold")
for k, s in enumerate(["一、一个二阶递推的具体例子",
                       "二、一个「D 减少」的具体机制（密合）",
                       "三、一个「封闭系统会归零」的完整推演"]):
    ax.text(0.72, 5.48 - k * 0.58, s, ha="left", va="center", fontsize=11, color=NAVY)
ax.text(3.125, 3.82, "第三样最重要。", ha="center", va="center", fontsize=10.2, color=GREY)

rbox(ax, 7.50, 3.55, 5.55, 2.95, BLUE, ec=BLUE, lw=1.8, alpha=0.09, rs=0.20)
rbox(ax, 7.50, 5.90, 5.55, 0.60, BLUE, rs=0.16)
ax.text(10.275, 6.20, "大一统（第 48 号）提供", ha="center", va="center", color="white",
        fontsize=12.5, fontweight="bold")
for k, s in enumerate(["一、一个「为什么一定会有量纲问题」的框架",
                       "二、一个「不动点」的语言",
                       "三、一个检验的场所（物理有实验）"]):
    ax.text(7.87, 5.48 - k * 0.58, s, ha="left", va="center", fontsize=11, color=NAVY)
ax.text(10.275, 3.82, "第二样值得展开。", ha="center", va="center", fontsize=10.2, color=GREY)

arr(ax, (6.08, 5.55), (7.32, 5.55), col=NAVY, lw=2.8, ms=22)
arr(ax, (7.32, 4.05), (6.08, 4.05), col=NAVY, lw=2.8, ms=22)
ax.text(6.70, 4.80, "互相\n解释", ha="center", va="center", fontsize=10.5, color=NAVY,
        fontweight="bold", linespacing=1.5)

ax.text(0.40, 3.08, "本院设的三道防线", fontsize=12.5, color=NAVY, fontweight="bold",
        va="center")
defs = [
    ("第一道：不是互相证明", TEAL,
     "两个理论能互相解释，\n不构成任何一方为真的证据。"),
    ("第二道：可能是同一套隐喻", GOLD,
     "本院借用了第 47 号的词，\n再用它们去描述物理 ——\n有多少只是用词的连续性？"),
    ("第三道：物理部分更弱", RED,
     "第 47 号有原文支撑；\n本纪要的第五章、第六章没有。"),
]
for k, (head, col, body) in enumerate(defs):
    x = 0.35 + k * 4.25
    rbox(ax, x, 1.15, 4.10, 1.70, col, alpha=0.10, rs=0.18)
    rbox(ax, x, 2.35, 4.10, 0.50, col, rs=0.14)
    ax.text(x + 2.05, 2.60, head, ha="center", va="center", fontsize=11.2,
            color="white", fontweight="bold")
    ax.text(x + 2.05, 1.72, body, ha="center", va="center", fontsize=10.2,
            color=NAVY, linespacing=1.75)

ax.text(6.70, 0.60, "如果记忆项假说成立，两份纪要描述的是同一件事的两种语言；如果不成立，那些问题不再共享一个答案。",
        ha="center", va="center", fontsize=11.2, color=GREY, style="italic")
save(fig, "figU14-mutual-explanation.png")

print("第 48 号插图全部完成")
