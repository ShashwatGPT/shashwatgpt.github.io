"""Two-class (premium / regular) admission experiment, in the shape NVIDIA
Dynamo's router actually uses.

Dynamo arbitrates between named policy classes with a work-conserving Deficit
Round Robin variant, and orders requests *inside* a class with either FCFS or
WSPT. Its documented scheduling cost is max(1, uncached_tokens), and its WSPT
index is (1 + priority_jump) / isl_tokens. This file reproduces that structure
so the two knobs can be measured separately:

  1. the DRR quantum ratio, which decides how capacity is split between classes
  2. the within-class policy, which decides who inside a class goes first

Nothing here is a model of any internal Microsoft system. It is a clean
reimplementation of the public Dynamo design, used to test its claims.
"""
import heapq, json, math, random

PREMIUM, REGULAR = 0, 1
SHARE = [0.30, 0.70]
# input sequence length in tokens; service time is taken proportional to it
ISL_MEAN = [700.0, 1200.0]
ISL_SIGMA = [0.7, 1.0]
TOKENS_PER_SEC = 3000.0
PRIORITY_JUMP = [3.0, 0.0]      # premium carries a priority jump, regular none


def lognormal(rng, mean, sigma):
    return math.exp(rng.gauss(math.log(mean) - 0.5 * sigma * sigma, sigma))


def run(rho, quantum_ratio=1.0, policy="wspt", n=160_000, warmup=25_000, seed=3):
    rng = random.Random(seed)
    mean_service = sum(SHARE[k] * ISL_MEAN[k] for k in (0, 1)) / TOKENS_PER_SEC
    lam = rho / mean_service
    quantum = [1000.0 * quantum_ratio, 1000.0]
    deficit = [0.0, 0.0]
    queues = [[], []]
    seqno = 0
    clock = 0.0
    free_at = 0.0
    pending = []          # (arrival, cls, isl)
    waits = [[], []]
    turn = 0

    # generate arrivals up front, then serve
    t = 0.0
    for _ in range(n):
        t += rng.expovariate(lam)
        k = 0 if rng.random() < SHARE[0] else 1
        pending.append((t, k, lognormal(rng, ISL_MEAN[k], ISL_SIGMA[k])))

    idx = 0
    served = 0
    while served < n:
        # admit everything that has arrived by now
        while idx < n and pending[idx][0] <= max(clock, free_at):
            a, k, isl = pending[idx]
            if policy == "wspt":
                key = -(1.0 + PRIORITY_JUMP[k]) / max(isl, 1.0)
            else:                                   # fcfs, by adjusted arrival
                key = a - PRIORITY_JUMP[k]
            seqno += 1
            heapq.heappush(queues[k], (key, seqno, a, k, isl))
            idx += 1
        if not queues[0] and not queues[1]:
            if idx >= n: break
            clock = pending[idx][0]
            continue

        # DRR arbitration: give a class a quantum, dispatch if it can afford it
        chosen = None
        for _ in range(4):
            if queues[turn]:
                cost = max(1.0, queues[turn][0][4])
                if deficit[turn] < cost:
                    deficit[turn] += quantum[turn]
                if deficit[turn] >= cost:
                    chosen = turn
                    deficit[turn] -= cost
                    break
            else:
                deficit[turn] = 0.0
            turn = 1 - turn
        if chosen is None:
            turn = 1 - turn
            continue

        _, _, arrival, k, isl = heapq.heappop(queues[chosen])
        start = max(free_at, arrival)
        free_at = start + isl / TOKENS_PER_SEC
        clock = start
        served += 1
        if served > warmup:
            waits[k].append(start - arrival)     # time to first token
        turn = 1 - turn

    out = {}
    for k, name in [(0, "premium"), (1, "regular")]:
        v = sorted(waits[k])
        if not v:
            continue
        out[name] = dict(mean=sum(v) / len(v), p95=v[int(0.95 * len(v))],
                         p99=v[int(0.99 * len(v))], n=len(v))
    return out


if __name__ == "__main__":
    res = {"quantum_sweep": {}, "policy_compare": {}, "load_sweep": {}}
    RATIOS = [1, 2, 3, 4, 6, 8]
    for q in RATIOS:
        res["quantum_sweep"][str(q)] = run(0.85, quantum_ratio=q)
    print("quantum sweep done")
    for pol in ["fcfs", "wspt"]:
        res["policy_compare"][pol] = run(0.85, quantum_ratio=4, policy=pol)
    print("policy compare done")
    RHOS = [0.5, 0.6, 0.7, 0.8, 0.85, 0.9]
    for pol in ["fcfs", "wspt"]:
        res["load_sweep"][pol] = [run(r, quantum_ratio=4, policy=pol) for r in RHOS]
    res["ratios"] = RATIOS
    res["rhos"] = RHOS
    json.dump(res, open("dual_results.json", "w"), indent=1)

    print("\nDRR quantum ratio -> mean TTFT (s)")
    for q in RATIOS:
        d = res["quantum_sweep"][str(q)]
        print(f"  {q}x  premium {d['premium']['mean']:.3f}   regular {d['regular']['mean']:.3f}")
    print("\nwithin-class policy at quantum 4x, rho 0.85")
    for pol in ["fcfs", "wspt"]:
        d = res["policy_compare"][pol]
        print(f"  {pol:5} premium mean {d['premium']['mean']:.3f} p99 {d['premium']['p99']:.3f} | "
              f"regular mean {d['regular']['mean']:.3f} p99 {d['regular']['p99']:.3f}")
