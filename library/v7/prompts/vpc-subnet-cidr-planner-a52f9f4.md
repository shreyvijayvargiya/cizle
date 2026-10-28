# VPC Subnet CIDR Planner

By @f · general
Language: en · Domains: education, math, engineering · Source: P01

Source page: https://prompts.chat

```
---
name: vpc-subnet-cidr-planner
description: Plans and checks IPv4 subnet layouts for AWS, Azure, GCP or on-prem networks. Sizes each subnet from host counts plus growth and the provider's reserved addresses, allocates aligned CIDR blocks largest-first, and flags overlapping subnets, VPC ranges that clash with peered VPCs, VPNs or the docker0 bridge, public ranges, size limits, low headroom and single-zone layouts. Includes a stdlib Python planner with --self-test.
---

# VPC Subnet CIDR Planner

You help engineers carve a network into subnets that fit today, leave room to grow, and never collide with anything they will need to route to later. You turn "we need public, app and data subnets in two zones" into exact CIDR blocks, explain the numbers, and catch the overlaps that are painful to fix once workloads are running.

## Files in this skill

- `scripts/cidr_plan.py` - sizes and allocates subnets, lists usable host ranges and free blocks, and reports findings (Python 3 standard library only, uses `ipaddress`)
- `references/cidr-math-and-provider-rules.md` - prefix sizes table, alignment, reserved addresses and limits per provider, private ranges
- `references/subnet-layout-playbook.md` - tiered layouts, zone strategy, sizing Kubernetes pod subnets, avoiding overlaps with VPNs and peers, renumbering options
- `templates/subnet-plan.md` - a plan document for review or a pull request
- `examples/shop-platform-vpc.json` - an AWS /18 with legacy subnets, a peered analytics VPC and six new subnets in two zones

## Workflow

### 1. Gather the network facts
Ask for the provider, the VPC / VNet CIDR (or the range they may use), existing subnets, every network it must talk to (peered VPCs, VPNs, on-prem offices, partner links, other clouds), and the subnets they need: purpose, zone, hosts now, and expected growth. For Kubernetes, ask whether pods get VPC addresses (AWS VPC CNI, Azure CNI) because then pod count, not node count, sizes the subnet.

### 2. Run the planner
'''
python3 scripts/cidr_plan.py examples/shop-platform-vpc.json
python3 scripts/cidr_plan.py plan.json --json
python3 scripts/cidr_plan.py --self-test
'''
Exit code 1 means HIGH findings (overlaps, no space), 2 means bad input (host bits set, IPv6, overlapping VPC ranges).

### 3. Review the result
Fix HIGH findings first: an overlap with a peer or VPN cannot be routed and usually means picking a new VPC range now, while it is cheap. Use `references/subnet-layout-playbook.md` to adjust the layout (equal-sized subnets per zone, a spare block per tier, room for a third zone) and `references/cidr-math-and-provider-rules.md` to explain sizes. Re-run after each change.

### 4. Deliver
Fill `templates/subnet-plan.md` with the table, free blocks, findings and decisions. Offer Terraform or CLI snippets for the final blocks if asked.

## Example result
For `examples/shop-platform-vpc.json` (AWS 10.20.0.0/18): app subnets of 2,500 pods +60% growth get /20s (4,091 usable each) at 10.20.16.0/20 and 10.20.32.0/20; load balancer and data subnets get /25s (123 usable). Findings: HIGH legacy rds-b 10.20.1.128/25 overlaps rds-a 10.20.1.0/24; HIGH the peered analytics VPC 10.20.48.0/20 sits inside this VPC, so routing to it breaks; LOW only 20% of the space is left free.

## Rules

- Never propose a range that overlaps a known peer, VPN or on-prem network; ask for the full list if unsure.
- Plan for growth and a future zone; resizing a subnet in place is usually impossible.
- Keep IPv4 math exact; show usable counts after the provider's reserved addresses.
- Do not change live networks yourself; give a plan and the order of changes for the user to apply.
FILE:references/cidr-math-and-provider-rules.md
# CIDR Math and Provider Rules

## Prefix sizes (IPv4)
| Prefix | Addresses | AWS / Azure usable (-5) | GCP usable (-4) | Classic usable (-2) |
|---|---|---|---|---|
| /16 | 65,536 | 65,531 | 65,532 | 65,534 |
| /18 | 16,384 | 16,379 | 16,380 | 16,382 |
| /19 | 8,192 | 8,187 | 8,188 | 8,190 |
| /20 | 4,096 | 4,091 | 4,092 | 4,094 |
| /21 | 2,048 | 2,043 | 2,044 | 2,046 |
| /22 | 1,024 | 1,019 | 1,020 | 1,022 |
| /23 | 512 | 507 | 508 | 510 |
| /24 | 256 | 251 | 252 | 254 |
| /25 | 128 | 123 | 124 | 126 |
| /26 | 64 | 59 | 60 | 62 |
| /27 | 32 | 27 | 28 | 30 |
| /28 | 16 | 11 | 12 | 14 |
Each step of one in the prefix halves or doubles the block. Addresses = 2^(32 - prefix).

## Alignment
A block must start on a multiple of its own size: a /20 starts at x.x.0.0, x.x.16.0, x.x.32.0, ...; 10.20.8.0/20 is invalid (host bits set). Allocating largest blocks first keeps the space unfragmented; small subnets placed first can block every aligned slot for a big one.

## Reserved addresses per subnet
- **AWS:** first four (network, VPC router, DNS, reserved) and the last (broadcast) -> 5. VPC CIDR /16 to /28, subnets /16 to /28. Up to 5 CIDR blocks per VPC by default (secondary CIDRs can add space later).
- **Azure:** first four (network, gateway, 2 x DNS) and the last -> 5. Subnets up to /29. Some services need dedicated subnets (GatewaySubnet /27 or larger, AzureFirewallSubnet /26, AzureBastionSubnet /26).
- **GCP:** network, gateway, second-to-last and broadcast -> 4. Subnets are regional (not zonal), /29 smallest; secondary ranges for GKE pods and services.
- **Classic / on-prem:** network and broadcast -> 2 (/31 point-to-point links are a special case).

## Private and special ranges
- RFC 1918: 10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16.
- Carrier-grade NAT shared space 100.64.0.0/10 (RFC 6598): usable inside clouds, but check the ISP / VPN does not use it.
- Avoid: 172.17.0.0/16 (default docker0 bridge), 169.254.0.0/16 (link-local, cloud metadata), 192.168.0.0/24 and 192.168.1.0/24 (home routers, so VPN users clash), 10.0.0.0/16 (default VPC in many tools, so peers often clash).
- Public ranges inside a VPC make those internet addresses unreachable from it.

## Quick formulas
- Smallest prefix for N usable hosts with R reserved: 32 - ceil(log2(N + R)).
- Hosts with growth: ceil(hosts x (1 + growth)).
- Free space after a plan = VPC addresses - (existing + new + blocked peer ranges inside the VPC).
FILE:references/subnet-layout-playbook.md
# Subnet Layout Playbook

## Tiered layout per zone
| Tier | Holds | Typical size | Route |
|---|---|---|---|
| Public | load balancers, NAT gateways, bastion | /24 to /26 | internet gateway |
| Private app | VMs, containers, Kubernetes nodes and pods | largest, /20 to /22 | NAT gateway |
| Data | databases, caches, queues | /24 to /26 | no internet route |
| Spare | future tier or a third zone | keep one aligned block | - |
Use the same size per tier in every zone so a failover zone can carry the full load.

## Zone strategy
- At least two zones for anything production; three if the region and budget allow.
- Reserve the third zone's blocks now even if unused; it keeps the layout symmetrical.
- GCP subnets are regional, so plan per region instead of per zone.

## Sizing Kubernetes
- With AWS VPC CNI or Azure CNI every pod takes a VPC address: size app subnets by peak pods (nodes x max pods per node), plus surge during rolling updates (often +25%) and node replacement.
- Prefix delegation (AWS) or overlay networking (Calico, Cilium, kubenet, Azure CNI Overlay) moves pods to a separate range; then size by nodes and keep the pod CIDR clear of every peer.
- Keep the service CIDR (for example 172.20.0.0/16) clear of the VPC and peers too.

## Avoiding overlaps
- Collect every network you will ever route to: other VPCs and accounts, VPN clients, offices, partners, other clouds, and ranges used by acquired companies.
- Keep a central IP plan (spreadsheet or IPAM) and give each environment its own block, for example 10.20.0.0/16 prod, 10.21.0.0/16 staging, 10.22.0.0/16 dev.
- Do not pick 10.0.0.0/16, 172.17.0.0/16 or 192.168.0.0/24 to 192.168.1.0/24 for anything that VPN users reach.

## When something already overlaps
1. Prefer renumbering the smaller or newer side now (new VPC or a secondary CIDR, migrate, delete old).
2. If renumbering is impossible, use NAT (private NAT gateway, NAT on the VPN device) and route only translated ranges.
3. Overlapping subnets inside one VPC cannot be created on AWS / Azure / GCP; in documents they are usually typos, so verify the real values.

## Review checklist
- [ ] VPC range private and unique across all peers and VPNs
- [ ] every subnet aligned, inside the VPC and non-overlapping
- [ ] sizes include reserved addresses and growth
- [ ] same tier sizes in each zone; spare block kept
- [ ] at least 25% of the VPC left free
FILE:templates/subnet-plan.md
# Subnet Plan - <network name>

**Provider / region:** <aws eu-west-1>  **VPC CIDR:** <10.x.0.0/16>  **Owner:** <team>  **Date:** <date>
**Peers / VPNs checked:** <list of ranges>

## Subnets
| Subnet | Tier | Zone | Hosts now | Growth | CIDR | Usable | Route table |
|---|---|---|---|---|---|---|---|
| | | | | | | | |

## Existing subnets kept
| Name | CIDR | Notes |
|---|---|---|
| | | |

## Free space
- Used or blocked: <n> of <total> (<x>% free)
- Spare blocks reserved for: <third zone / future tier>

## Findings and decisions
| Severity | Finding | Decision |
|---|---|---|
| | | |

## Rollout order
1. <create secondary CIDR / new VPC>
2. <create subnets and route tables>
3. <migrate workloads, remove old subnets>
FILE:examples/shop-platform-vpc.json
{
  "name": "shop platform, eu-west-1 production VPC",
  "provider": "aws",
  "vpc_cidrs": ["10.20.0.0/18"],
  "existing": [
    {"name": "legacy bastion", "cidr": "10.20.0.0/26"},
    {"name": "legacy rds-a", "cidr": "10.20.1.0/24"},
    {"name": "legacy rds-b", "cidr": "10.20.1.128/25"}
  ],
  "peers": [
    {"name": "office VPN (Istanbul)", "cidr": "192.168.10.0/24"},
    {"name": "analytics VPC (peered)", "cidr": "10.20.48.0/20"}
  ],
  "requests": [
    {"name": "public-a (load balancers)", "hosts": 40, "zone": "eu-west-1a", "growth": 0.5},
    {"name": "public-b (load balancers)", "hosts": 40, "zone": "eu-west-1b", "growth": 0.5},
    {"name": "app-a (EKS pods)", "hosts": 2500, "zone": "eu-west-1a", "growth": 0.6},
    {"name": "app-b (EKS pods)", "hosts": 2500, "zone": "eu-west-1b", "growth": 0.6},
    {"name": "data-a (databases, cache)", "hosts": 60, "zone": "eu-west-1a"},
    {"name": "data-b (databases, cache)", "hosts": 60, "zone": "eu-west-1b"}
  ]
}
FILE:scripts/cidr_plan.py
#!/usr/bin/env python3
"""VPC subnet CIDR planner and checker (Python 3 standard library only).

Input: a network plan JSON file:
  {"name": "prod-eu", "provider": "aws", "vpc_cidrs": ["10.40.0.0/16"],
   "existing": [{"name": "legacy-db", "cidr": "10.40.8.0/24"}],
   "peers": [{"name": "office vpn", "cidr": "192.168.0.0/22"}],
   "requests": [{"name": "app-a", "hosts": 900, "zone": "eu-west-1a", "growth": 0.5}]}
  provider: aws | azure | gcp | generic. Reserved addresses per subnet: aws 5, azure 5,
  gcp 4, generic 2 (network + broadcast). Subnet size limits: aws /16../28,
  azure /8../29, gcp /8../29, generic /8../30.
  requests: hosts needed now; growth = extra fraction to reserve (default 0.3);
  optional "prefix" forces a size. Allocation is largest-first, aligned, lowest free address,
  never overlapping existing subnets or peer networks that sit inside the VPC.

Checks (severity):
  HIGH   OVERLAP_EXISTING   two existing subnets overlap
  HIGH   OUTSIDE_VPC        existing subnet not inside any VPC CIDR
  HIGH   PEER_OVERLAP       VPC CIDR overlaps a peered / VPN / on-prem network (routing breaks)
  HIGH   NO_SPACE           a request does not fit in the remaining space
  MEDIUM DOCKER_DEFAULT     VPC overlaps 172.17.0.0/16 (default docker0 bridge)
  MEDIUM PUBLIC_RANGE       VPC CIDR is not private (RFC 1918 / 100.64.0.0/10)
  MEDIUM PREFIX_LIMIT       requested or VPC prefix outside the provider limits
  LOW    LOW_HEADROOM       less than 25% of the VPC left free after the plan
  LOW    SINGLE_ZONE        all requests in one zone (no zone redundancy)
Usage:
  python3 cidr_plan.py plan.json
  python3 cidr_plan.py plan.json --json
  python3 cidr_plan.py --self-test
Exit code: 0 no HIGH findings, 1 HIGH findings, 2 bad input.
"""
import argparse
import ipaddress as ip
import json
import math
import sys

RESERVED = {"aws": 5, "azure": 5, "gcp": 4, "generic": 2}
HEAD_RESERVED = {"aws": 4, "azure": 4, "gcp": 2, "generic": 1}  # rest are at the end of the block
LIMITS = {"aws": (16, 28), "azure": (8, 29), "gcp": (8, 29), "generic": (8, 30)}
PRIVATE = [ip.ip_network(c) for c in ("10.0.0.0/8", "172.16.0.0/12", "192.168.0.0/16", "100.64.0.0/10")]
DOCKER = ip.ip_network("172.17.0.0/16")


class PlanError(ValueError):
    pass


def net(cidr, what="cidr"):
    try:
        n = ip.ip_network(str(cidr).strip(), strict=True)
    except ValueError as e:
        raise PlanError(f"bad {what} {cidr!r}: {e}")
    if n.version != 4:
        raise PlanError(f"only IPv4 is supported: {cidr!r}")
    return n


def usable(prefix, provider):
    return max(0, 2 ** (32 - prefix) - RESERVED[provider])


def prefix_for(hosts, provider, growth):
    need = math.ceil(hosts * (1 + growth))
    lo, hi = LIMITS[provider]
    for p in range(hi, lo - 1, -1):
        if usable(p, provider) >= need:
            return p
    return None


def find_slot(vpcs, taken, prefix):
    for v in vpcs:
        if prefix < v.prefixlen:
            continue
        for cand in v.subnets(new_prefix=prefix):
            if not any(cand.overlaps(t) for t in taken):
                return cand
    return None


def plan(cfg):
    provider = str(cfg.get("provider", "generic")).lower()
    if provider not in RESERVED:
        raise PlanError(f"unknown provider {provider!r} (aws, azure, gcp, generic)")
    vpcs = [net(c, "vpc_cidr") for c in cfg.get("vpc_cidrs") or []]
    if not vpcs:
        raise PlanError("vpc_cidrs is empty")
    lo, hi = LIMITS[provider]
    findings = []

    def f(sev, code, where, msg):
        findings.append({"severity": sev, "code": code, "where": where, "message": msg})

    for v in vpcs:
        if not any(v.subnet_of(p) for p in PRIVATE):
            f("MEDIUM", "PUBLIC_RANGE", str(v), "not an RFC 1918 or 100.64.0.0/10 range; it may clash with real internet addresses")
        if v.overlaps(DOCKER):
            f("MEDIUM", "DOCKER_DEFAULT", str(v), "overlaps 172.17.0.0/16, the default docker0 bridge; containers on hosts in this VPC may lose routes")
        if provider == "aws" and not (16 <= v.prefixlen <= 28):
            f("MEDIUM", "PREFIX_LIMIT", str(v), "AWS VPC CIDR blocks must be /16 to /28")
    for i, a in enumerate(vpcs):
        for b in vpcs[i + 1:]:
            if a.overlaps(b):
                raise PlanError(f"vpc_cidrs overlap each other: {a} and {b}")

    existing = []
    for e in cfg.get("existing") or []:
        n = net(e.get("cidr"), "existing cidr")
        name = e.get("name") or str(n)
        if not any(n.subnet_of(v) for v in vpcs):
            f("HIGH", "OUTSIDE_VPC", name, f"{n} is not inside {', '.join(map(str, vpcs))}")
        for other_name, o in existing:
            if n.overlaps(o):
                f("HIGH", "OVERLAP_EXISTING", name, f"{n} overlaps {other_name} {o}")
        existing.append((name, n))

    taken = [n for _, n in existing]
    for p in cfg.get("peers") or []:
        n = net(p.get("cidr"), "peer cidr")
        name = p.get("name") or str(n)
        for v in vpcs:
            if v.overlaps(n):
                f("HIGH", "PEER_OVERLAP", name, f"{n} overlaps VPC {v}; traffic to the overlapping range cannot be routed both ways (renumber one side or use NAT)")
                taken.append(n)

    reqs = []
    for r in cfg.get("requests") or []:
        name = r.get("name") or "subnet"
        hosts = r.get("hosts", 0)
        if not isinstance(hosts, int) or isinstance(hosts, bool) or hosts < 1:
            raise PlanError(f"request {name!r}: hosts must be a positive integer")
        growth = r.get("growth", 0.3)
        if not isinstance(growth, (int, float)) or growth < 0:
            raise PlanError(f"request {name!r}: growth must be >= 0")
        if "prefix" in r:
            pfx = r["prefix"]
            if not isinstance(pfx, int) or not 8 <= pfx <= 30:
                raise PlanError(f"request {name!r}: prefix must be an integer 8..30")
            if not lo <= pfx <= hi:
                f("MEDIUM", "PREFIX_LIMIT", name, f"/{pfx} is outside {provider} subnet limits /{lo}../{hi}")
        else:
            pfx = prefix_for(hosts, provider, growth)
        reqs.append({"name": name, "hosts": hosts, "growth": growth, "zone": r.get("zone", ""), "prefix": pfx})

    allocs = []
    order = sorted(range(len(reqs)), key=lambda i: (reqs[i]["prefix"] if reqs[i]["prefix"] is not None else -1, i))
    for i in order:
        r = reqs[i]
        slot = find_slot(vpcs, taken, r["prefix"]) if r["prefix"] is not None else None
        if slot is None:
            f("HIGH", "NO_SPACE", r["name"], f"needs {r['hosts']} hosts (+{round(r['growth'] * 100)}% growth) and no free aligned block is left")
            allocs.append(dict(r, cidr=None, usable=0))
            continue
        taken.append(slot)
        u = usable(slot.prefixlen, provider)
        tail = RESERVED[provider] - HEAD_RESERVED[provider]
        allocs.append(dict(r, cidr=str(slot), usable=u,
                           first=str(slot[HEAD_RESERVED[provider]]) if u else "-",
                           last=str(slot[-1 - tail]) if u else "-"))
        if u < r["hosts"]:
            f("HIGH", "NO_SPACE", r["name"], f"/{slot.prefixlen} gives only {u} usable addresses for {r['hosts']} hosts")
    allocs.sort(key=lambda a: (a["cidr"] is None, ip.ip_network(a["cidr"]) if a["cidr"] else 0))

    total = sum(v.num_addresses for v in vpcs)
    used = 0
    inside = [t for t in taken if any(t.subnet_of(v) for v in vpcs)]
    for t in ip.collapse_addresses(inside):
        used += t.num_addresses
    free = total - used
    free_blocks = []
    for v in vpcs:
        rest = [v]
        for t in ip.collapse_addresses([x for x in inside if x.subnet_of(v)]):
            nxt = []
            for b in rest:
                if t.subnet_of(b):
                    nxt.extend(b.address_exclude(t))
                elif not b.subnet_of(t):
                    nxt.append(b)
            rest = nxt
        free_blocks.extend(sorted(rest))
    if total and free / total < 0.25:
        f("LOW", "LOW_HEADROOM", "plan", f"only {free / total:.0%} of the VPC address space is left free")
    zones = {r["zone"] for r in reqs if r["zone"]}
    if len(reqs) > 1 and len(zones) == 1:
        f("LOW", "SINGLE_ZONE", "plan", f"all requests are in {zones.pop()}; spread subnets over at least two zones")
    rank = {"HIGH": 0, "MEDIUM": 1, "LOW": 2}
    findings.sort(key=lambda x: rank[x["severity"]])
    return {"name": cfg.get("name", "network plan"), "provider": provider, "vpcs": [str(v) for v in vpcs],
            "existing": [{"name": n, "cidr": str(c)} for n, c in existing],
            "allocations": allocs, "total": total, "used": used, "free": free,
            "free_blocks": [str(b) for b in free_blocks], "findings": findings}


def report(res):
    out = [f"# Subnet plan: {res['name']}", "",
           f"Provider: {res['provider']} (reserves {RESERVED[res['provider']]} addresses per subnet)  VPC: {', '.join(res['vpcs'])}", "",
           "| Subnet | Zone | Hosts now | Growth | CIDR | Usable | First host | Last host |", "|---|---|---|---|---|---|---|---|"]
    for a in res["allocations"]:
        out.append(f"| {a['name']} | {a['zone'] or '-'} | {a['hosts']} | {round(a['growth'] * 100)}% | {a['cidr'] or 'NOT PLACED'} | "
                   f"{a['usable']} | {a.get('first', '-')} | {a.get('last', '-')} |")
    if res["existing"]:
        out += ["", "Existing subnets kept: " + ", ".join(f"{e['name']} {e['cidr']}" for e in res["existing"])]
    pct = res["free"] / res["total"] if res["total"] else 0
    out += ["", f"Address space: {res['used']} of {res['total']} used or blocked, {res['free']} free ({pct:.0%})",
            "Largest free blocks: " + (", ".join(sorted(res["free_blocks"], key=lambda c: ip.ip_network(c).prefixlen)[:6]) or "none"),
            "", "## Findings"]
    if not res["findings"]:
        out.append("- none")
    for x in res["findings"]:
        out.append(f"- **{x['severity']} {x['code']}** ({x['where']}): {x['message']}")
    return "\n".join(out) + "\n"


def self_test():
    cases = []

    def ok(name, cond):
        cases.append(bool(cond))
        print(("PASS " if cond else "FAIL ") + name)

    ok("aws /24 usable 251", usable(24, "aws") == 251)
    ok("generic /24 usable 254", usable(24, "generic") == 254)
    ok("gcp /29 usable 4", usable(29, "gcp") == 4)
    ok("900 hosts +50% on aws -> /21", prefix_for(900, "aws", 0.5) == 21)
    ok("250 hosts no growth aws -> /24", prefix_for(250, "aws", 0) == 24)
    ok("252 hosts no growth aws -> /23", prefix_for(252, "aws", 0) == 23)
    ok("too big for aws -> None", prefix_for(70000, "aws", 0) is None)
    base = {"provider": "aws", "vpc_cidrs": ["10.0.0.0/16"]}
    r = plan(dict(base, requests=[{"name": "a", "hosts": 200, "zone": "z1"}, {"name": "b", "hosts": 1000, "zone": "z2"}]))
    cid = {a["name"]: a["cidr"] for a in r["allocations"]}
    ok("largest first gets lowest block", cid == {"b": "10.0.0.0/21", "a": "10.0.8.0/23"})
    ok("clean plan has no findings", r["findings"] == [])
    aa = [a for a in r["allocations"] if a["name"] == "a"][0]
    ok("first/last host skip aws reserved", (aa["first"], aa["last"]) == ("10.0.8.4", "10.0.9.254"))
    g = plan({"provider": "gcp", "vpc_cidrs": ["10.0.0.0/16"], "requests": [{"name": "a", "hosts": 100, "growth": 0}]})["allocations"][0]
    ok("gcp reserves 2 head + 2 tail", (g["cidr"], g["first"], g["last"]) == ("10.0.0.0/25", "10.0.0.2", "10.0.0.125"))
    r = plan(dict(base, existing=[{"name": "old", "cidr": "10.0.0.0/22"}], requests=[{"name": "a", "hosts": 1000}]))
    ok("allocation avoids existing", r["allocations"][0]["cidr"] == "10.0.8.0/21")
    r = plan(dict(base, existing=[{"name": "x", "cidr": "10.0.0.0/24"}, {"name": "y", "cidr": "10.0.0.128/25"}]))
    ok("overlap existing flagged", any(x["code"] == "OVERLAP_EXISTING" for x in r["findings"]))
    r = plan(dict(base, existing=[{"name": "x", "cidr": "10.1.0.0/24"}]))
    ok("outside vpc flagged", any(x["code"] == "OUTSIDE_VPC" for x in r["findings"]))
    r = plan(dict(base, peers=[{"name": "vpn", "cidr": "10.0.4.0/22"}], requests=[{"name": "a", "hosts": 900, "growth": 0}]))
    ok("peer overlap flagged", any(x["code"] == "PEER_OVERLAP" for x in r["findings"]))
    ok("allocation avoids peer range", r["allocations"][0]["cidr"] == "10.0.0.0/22")
    r = plan({"provider": "aws", "vpc_cidrs": ["10.0.0.0/24"], "requests": [{"name": "a", "hosts": 200}]})
    ok("no space flagged", any(x["code"] == "NO_SPACE" for x in r["findings"]))
    r = plan({"provider": "generic", "vpc_cidrs": ["172.16.0.0/12"]})
    ok("docker default flagged", any(x["code"] == "DOCKER_DEFAULT" for x in r["findings"]))
    r = plan({"provider": "generic", "vpc_cidrs": ["8.8.0.0/16"]})
    ok("public range flagged", any(x["code"] == "PUBLIC_RANGE" for x in r["findings"]))
    r = plan({"provider": "aws", "vpc_cidrs": ["10.0.0.0/8"]})
    ok("aws vpc /8 flagged", any(x["code"] == "PREFIX_LIMIT" for x in r["findings"]))
    r = plan({"provider": "aws", "vpc_cidrs": ["10.0.0.0/22"], "requests": [{"name": "a", "hosts": 400, "zone": "z1"}, {"name": "b", "hosts": 300, "zone": "z1"}]})
    ok("low headroom flagged", any(x["code"] == "LOW_HEADROOM" for x in r["findings"]))
    ok("single zone flagged", any(x["code"] == "SINGLE_ZONE" for x in r["findings"]))
    r = plan(dict(base, requests=[{"name": "a", "hosts": 10, "prefix": 30}]))
    ok("forced /30 on aws flagged", any(x["code"] == "PREFIX_LIMIT" for x in r["findings"]))
    r = plan(dict(base, requests=[{"name": "a", "hosts": 1000}]))
    ok("free blocks cover rest", sum(ip.ip_network(b).num_addresses for b in r["free_blocks"]) == 65536 - 2048)
    for bad, label in ((dict(base, vpc_cidrs=[]), "empty vpc"), (dict(base, vpc_cidrs=["10.0.0.1/16"]), "host bits set"),
                       (dict(base, provider="oracle"), "unknown provider"), (dict(base, requests=[{"hosts": 0}]), "zero hosts"),
                       (dict(base, vpc_cidrs=["10.0.0.0/16", "10.0.128.0/17"]), "overlapping vpcs"),
                       (dict(base, vpc_cidrs=["fd00::/48"]), "ipv6")):
        try:
            plan(bad)
            ok(label + " rejected", False)
        except PlanError:
            ok(label + " rejected", True)
    print(f"{sum(cases)}/{len(cases)} passed")
    return 0 if all(cases) else 1


def main(argv=None):
    ap = argparse.ArgumentParser(description="Plan and check VPC subnet CIDR blocks.")
    ap.add_argument("file", nargs="?", help="network plan JSON")
    ap.add_argument("--json", action="store_true", help="print machine-readable JSON")
    ap.add_argument("--self-test", action="store_true")
    a = ap.parse_args(argv)
    if a.self_test:
        return self_test()
    if not a.file:
        ap.error("give a plan JSON file or --self-test")
    try:
        cfg = json.load(open(a.file, encoding="utf-8"))
        res = plan(cfg)
    except (OSError, json.JSONDecodeError, PlanError) as e:
        print(f"error: {e}", file=sys.stderr)
        return 2
    print(json.dumps(res, indent=2) if a.json else report(res), end="" if not a.json else "\n")
    return 1 if any(x["severity"] == "HIGH" for x in res["findings"]) else 0


if __name__ == "__main__":
    sys.exit(main())
```

Prompt from the public prompts.chat library (CC0), credited to its contributor.
