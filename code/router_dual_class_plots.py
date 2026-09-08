import json, matplotlib; matplotlib.use("Agg")
import matplotlib.pyplot as plt, numpy as np
r=json.load(open("dual_results.json"))
FG,GRID,TXT="#ffffff","#dde3ea","#1b2430"
C={"premium":"#005EB8","regular":"#e07b39","fcfs":"#8892a0","wspt":"#005EB8"}
def style(ax,xl,yl,t):
    ax.set_facecolor(FG); ax.grid(True,color=GRID,lw=.8,zorder=0)
    for s in ax.spines.values(): s.set_color(GRID)
    ax.set_xlabel(xl,color=TXT,fontsize=10); ax.set_ylabel(yl,color=TXT,fontsize=10)
    ax.set_title(t,color=TXT,fontsize=12,pad=10,weight="bold"); ax.tick_params(colors=TXT,labelsize=9)
def save(fig, name):
    fig.tight_layout()
    fig.savefig(name, dpi=170, facecolor=FG)
    plt.close(fig)
    # These are line plots: a handful of colours plus antialiasing ramps. An
    # adaptive 64-colour palette is visually lossless here and cuts the file by
    # about 70%, which matters because eight of them load on one page.
    from PIL import Image
    im = Image.open(name)
    if im.mode in ("RGBA", "LA"):
        bg = Image.new("RGB", im.size, (255, 255, 255))
        bg.paste(im, mask=im.split()[-1])
        im = bg
    else:
        im = im.convert("RGB")
    im.convert("P", palette=Image.ADAPTIVE, colors=64).save(name, optimize=True)
    print("wrote", name)

R=r["ratios"]
fig,ax=plt.subplots(figsize=(7,4.2))
for c in ["premium","regular"]:
    ax.plot(R,[r["quantum_sweep"][str(q)][c]["mean"] for q in R],"o-",color=C[c],label=c,lw=2,ms=6,zorder=3)
style(ax,"DRR quantum ratio (premium : regular)","Mean time to first token (s)",
      "What the DRR quantum knob actually buys (rho = 0.85)")
ax.legend(frameon=False,labelcolor=TXT,fontsize=9); save(fig,"fig6_quantum.png")

pc=r["policy_compare"]; labels=["premium mean","premium p99","regular mean","regular p99"]
x=np.arange(4); w=0.35
fig,ax=plt.subplots(figsize=(7,4.2))
for k,pol in enumerate(["fcfs","wspt"]):
    v=[pc[pol]["premium"]["mean"],pc[pol]["premium"]["p99"],pc[pol]["regular"]["mean"],pc[pol]["regular"]["p99"]]
    ax.bar(x+(k-0.5)*w,v,w,color=C[pol],label=pol.upper(),zorder=3)
ax.set_xticks(x); ax.set_xticklabels(labels,fontsize=9); ax.set_yscale("log")
style(ax,"","Time to first token (s)","Within-class policy: WSPT versus FCFS")
ax.legend(frameon=False,labelcolor=TXT,fontsize=9); save(fig,"fig7_policy.png")

fig,ax=plt.subplots(figsize=(7,4.2))
d=np.arange(1,11)
for pol in ["fcfs","wspt"]:
    ax.plot(d,r["decile"][pol],"o-",color=C[pol],label=f"{pol.upper()} (worst case {r['worst'][pol]:.0f}s)",lw=2,ms=6,zorder=3)
ax.set_xticks(d)
style(ax,"Request length decile (1 = shortest, 10 = longest)","Mean wait (s)",
      "Who pays for WSPT: wait against request size")
ax.legend(frameon=False,labelcolor=TXT,fontsize=9); save(fig,"fig8_decile.png")
