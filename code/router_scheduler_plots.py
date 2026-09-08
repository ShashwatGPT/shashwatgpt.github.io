import json, matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import numpy as np

r = json.load(open("results.json"))
RHOS = r["rhos"]
FG, GRID, TXT = "#ffffff", "#dde3ea", "#1b2430"
C = {"fcfs": "#8892a0", "cmu": "#e07b39", "wspt": "#005EB8", "srpt": "#2e9e6b",
     "random": "#c9455c", "po2": "#e07b39", "jsq": "#005EB8"}
L = {"fcfs": "FCFS", "cmu": "c-mu rule", "wspt": "WSPT", "srpt": "SRPT",
     "random": "Random", "po2": "Power of two", "jsq": "Join shortest queue"}

def style(ax, xl, yl, title):
    ax.set_facecolor(FG); ax.grid(True, color=GRID, lw=0.8, zorder=0)
    for s in ax.spines.values(): s.set_color(GRID)
    ax.set_xlabel(xl, color=TXT, fontsize=10)
    ax.set_ylabel(yl, color=TXT, fontsize=10)
    ax.set_title(title, color=TXT, fontsize=12, pad=10, weight="bold")
    ax.tick_params(colors=TXT, labelsize=9)

def save(fig, name):
    fig.tight_layout()
    fig.savefig(name, dpi=170, facecolor=FG)
    plt.close(fig)
    print("wrote", name)

# 1. weighted objective vs load
fig, ax = plt.subplots(figsize=(7, 4.2))
for p in ["fcfs", "cmu", "wspt", "srpt"]:
    ax.plot(RHOS, [d["weighted_mean"] for d in r["policy"][p]], "o-",
            color=C[p], label=L[p], lw=2, ms=5, zorder=3)
ax.set_yscale("log")
style(ax, "Utilisation rho", "Weighted mean sojourn (weight x time)",
      "Weighted objective vs load")
ax.legend(frameon=False, labelcolor=TXT, fontsize=9)
save(fig, "fig1_objective_vs_load.png")

# 2. per-class tradeoff at rho = 0.85
i = RHOS.index(0.85)
names = ["interactive", "standard", "batch"]
x = np.arange(len(names)); w = 0.2
fig, ax = plt.subplots(figsize=(7, 4.2))
for k, p in enumerate(["fcfs", "cmu", "wspt", "srpt"]):
    v = [r["policy"][p][i][n]["mean_sojourn"] for n in names]
    ax.bar(x + (k - 1.5) * w, v, w, color=C[p], label=L[p], zorder=3)
ax.set_xticks(x); ax.set_xticklabels(["interactive\n(w=8)", "standard\n(w=2)", "batch\n(w=0.5)"])
ax.set_yscale("log")
style(ax, "", "Mean sojourn time", "Where the priority is paid for (rho = 0.85)")
ax.legend(frameon=False, labelcolor=TXT, fontsize=9)
save(fig, "fig2_per_class_tradeoff.png")

# 3. tail latency of the high-weight class
fig, ax = plt.subplots(figsize=(7, 4.2))
for p in ["fcfs", "cmu", "wspt", "srpt"]:
    ax.plot(RHOS, [d["interactive"]["p99"] for d in r["policy"][p]], "o-",
            color=C[p], label=L[p], lw=2, ms=5, zorder=3)
ax.set_yscale("log")
style(ax, "Utilisation rho", "p99 sojourn, interactive class",
      "Tail latency for the latency-critical class")
ax.legend(frameon=False, labelcolor=TXT, fontsize=9)
save(fig, "fig3_tail_latency.png")

# 4. robustness to size-estimate error
sig = sorted(float(s) for s in r["noise"])
val = [r["noise"][str(s) if str(s) in r["noise"] else f"{s}"]["weighted_mean"] for s in sig]
base = r["policy"]["cmu"][i]["weighted_mean"]
fig, ax = plt.subplots(figsize=(7, 4.2))
ax.plot(sig, val, "o-", color=C["wspt"], lw=2, ms=6, label="WSPT with noisy size estimates", zorder=3)
ax.axhline(base, color=C["cmu"], ls="--", lw=2, label="c-mu rule (class means only)", zorder=2)
style(ax, "Log-normal error sigma on the size estimate", "Weighted mean sojourn",
      "How much does a bad size predictor cost? (rho = 0.85)")
ax.legend(frameon=False, labelcolor=TXT, fontsize=9)
save(fig, "fig4_prediction_error.png")

# 5. distributed routing
fig, ax = plt.subplots(figsize=(7, 4.2))
for p in ["random", "po2", "jsq"]:
    ax.plot(RHOS, [d["mean"] for d in r["routing"][p]], "o-",
            color=C[p], label=L[p], lw=2, ms=5, zorder=3)
ax.set_yscale("log")
style(ax, "Utilisation rho", "Mean sojourn time",
      "Routing across 8 heterogeneous endpoints")
ax.annotate("Random is unstable here: the slowest\nendpoint is offered more work than it\ncan serve, so its queue grows without bound",
            xy=(0.72, 300), fontsize=8, color=C["random"])
ax.legend(frameon=False, labelcolor=TXT, fontsize=9)
save(fig, "fig5_routing.png")
