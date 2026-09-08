"""Multiclass scheduling simulation for the router-scheduler blog post.

Discrete-event M/G/1 simulator with three request classes, plus a separate
multi-endpoint routing experiment. Everything reported in the post comes from
running this file; nothing is asserted without being measured here.

Classes model LLM serving traffic: a small latency-critical interactive class,
a bulk standard class, and a long batch class. Service times are lognormal,
which matches the long right tail of output-token counts far better than an
exponential does.

Policies compared:
  fcfs   first come first served, the work-conserving reference
  cmu    static class priority by c_k * mu_k, needs only per-class means
  wspt   per-job priority by w / p, needs a per-job size estimate
  wspt_noisy  the same with lognormal multiplicative estimate error
  srpt   preemptive shortest remaining processing time, needs exact sizes
"""
import heapq, json, math, random
from dataclasses import dataclass, field

# weight (holding cost), mean service time, arrival share
CLASSES = [
    dict(name="interactive", w=8.0, mean=0.30, share=0.50, sigma=0.60),
    dict(name="standard",    w=2.0, mean=1.00, share=0.35, sigma=0.90),
    dict(name="batch",       w=0.5, mean=4.00, share=0.15, sigma=1.10),
]
MEAN_SERVICE = sum(c["share"] * c["mean"] for c in CLASSES)


def lognormal(rng, mean, sigma):
    """Lognormal with the given arithmetic mean and log-scale sigma."""
    mu = math.log(mean) - 0.5 * sigma * sigma
    return math.exp(rng.gauss(mu, sigma))


@dataclass(order=True)
class Job:
    prio: float
    seq: int = field(compare=True)
    cls: int = field(compare=False, default=0)
    arrival: float = field(compare=False, default=0.0)
    size: float = field(compare=False, default=0.0)
    remaining: float = field(compare=False, default=0.0)
    est: float = field(compare=False, default=0.0)


def priority(job, policy):
    """Lower value is served first."""
    c = CLASSES[job.cls]
    if policy == "fcfs":
        return job.arrival
    if policy == "cmu":                      # c_k * mu_k, class level
        return -(c["w"] / c["mean"])
    if policy in ("wspt", "wspt_noisy"):     # w / p, job level
        return -(c["w"] / max(job.est, 1e-9))
    if policy == "srpt":
        return job.remaining
    raise ValueError(policy)


def simulate(policy, rho, n_jobs=120_000, warmup=20_000, seed=1, err_sigma=0.0):
    rng = random.Random(seed)
    lam = rho / MEAN_SERVICE
    shares = [c["share"] for c in CLASSES]

    clock = 0.0
    seq = 0
    queue = []                 # heap of Job
    next_arrival = rng.expovariate(lam)
    in_service = None
    service_end = math.inf
    done = 0
    stats = {c["name"]: [] for c in CLASSES}
    preemptive = policy == "srpt"

    while done < n_jobs:
        if next_arrival <= service_end:
            # advance to the arrival
            if in_service is not None:
                in_service.remaining -= (next_arrival - clock)
            clock = next_arrival
            k = rng.choices(range(len(CLASSES)), weights=shares)[0]
            c = CLASSES[k]
            size = lognormal(rng, c["mean"], c["sigma"])
            est = size * math.exp(rng.gauss(0, err_sigma)) if err_sigma > 0 else size
            if policy == "cmu":
                est = c["mean"]
            seq += 1
            job = Job(0.0, seq, k, clock, size, size, est)
            job.prio = priority(job, policy)
            heapq.heappush(queue, job)
            next_arrival = clock + rng.expovariate(lam)

            if preemptive and in_service is not None:
                in_service.prio = priority(in_service, policy)
                heapq.heappush(queue, in_service)
                in_service = None
            if in_service is None:
                if queue:
                    in_service = heapq.heappop(queue)
                    service_end = clock + in_service.remaining
                else:
                    service_end = math.inf
            elif not preemptive:
                pass
        else:
            # advance to the service completion
            clock = service_end
            j = in_service
            done += 1
            if done > warmup:
                stats[CLASSES[j.cls]["name"]].append((clock - j.arrival, j.size))
            in_service = None
            if queue:
                in_service = heapq.heappop(queue)
                service_end = clock + in_service.remaining
            else:
                service_end = math.inf

    out = {}
    total_w = 0.0
    total_n = 0
    for c in CLASSES:
        vals = sorted(t for t, _ in stats[c["name"]])
        if not vals:
            continue
        n = len(vals)
        mean = sum(vals) / n
        out[c["name"]] = dict(
            mean_sojourn=mean,
            p95=vals[int(0.95 * n)],
            p99=vals[int(0.99 * n)],
            n=n,
        )
        total_w += c["w"] * mean * n
        total_n += n
    out["weighted_mean"] = total_w / total_n
    return out


def route_sim(policy, rho, n_endpoints=8, n_jobs=120_000, warmup=20_000, seed=7, d=2):
    """Dispatch to one of n heterogeneous endpoints; each endpoint is FCFS."""
    rng = random.Random(seed)
    speeds = [0.6 + 0.8 * (i / (n_endpoints - 1)) for i in range(n_endpoints)]
    cap = sum(speeds)
    lam = rho * cap / MEAN_SERVICE
    free_at = [0.0] * n_endpoints
    backlog = [0.0] * n_endpoints
    clock = 0.0
    waits = []
    for i in range(n_jobs):
        clock += rng.expovariate(lam)
        k = rng.choices(range(len(CLASSES)), weights=[c["share"] for c in CLASSES])[0]
        c = CLASSES[k]
        size = lognormal(rng, c["mean"], c["sigma"])
        for e in range(n_endpoints):
            backlog[e] = max(0.0, free_at[e] - clock)
        if policy == "random":
            e = rng.randrange(n_endpoints)
        elif policy == "jsq":
            e = min(range(n_endpoints), key=lambda x: backlog[x] / speeds[x])
        elif policy == "po2":
            cand = rng.sample(range(n_endpoints), d)
            e = min(cand, key=lambda x: backlog[x] / speeds[x])
        else:
            raise ValueError(policy)
        start = max(clock, free_at[e])
        dur = size / speeds[e]
        free_at[e] = start + dur
        if i > warmup:
            waits.append(free_at[e] - clock)
    waits.sort()
    n = len(waits)
    return dict(mean=sum(waits) / n, p95=waits[int(0.95 * n)], p99=waits[int(0.99 * n)])


if __name__ == "__main__":
    RHOS = [0.50, 0.60, 0.70, 0.80, 0.85, 0.90, 0.93]
    results = {"classes": CLASSES, "rhos": RHOS, "policy": {}, "routing": {}, "noise": {}}

    for pol in ["fcfs", "cmu", "wspt", "srpt"]:
        results["policy"][pol] = [simulate(pol, r) for r in RHOS]
        print("done", pol)

    for sig in [0.0, 0.25, 0.5, 0.75, 1.0, 1.5]:
        results["noise"][str(sig)] = simulate("wspt_noisy", 0.85, err_sigma=sig)
    print("done noise sweep")

    for pol in ["random", "po2", "jsq"]:
        results["routing"][pol] = [route_sim(pol, r) for r in RHOS]
        print("done routing", pol)

    with open("results.json", "w") as f:
        json.dump(results, f, indent=1)
    print("\nweighted mean sojourn at rho=0.85:")
    i = RHOS.index(0.85)
    for pol in ["fcfs", "cmu", "wspt", "srpt"]:
        print(f"  {pol:6} {results['policy'][pol][i]['weighted_mean']:.3f}")
