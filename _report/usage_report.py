#!/usr/bin/env python3
"""Aggregate Claude Code session logs for this project into a usage report."""
import json
import os
from collections import defaultdict
from datetime import datetime, timedelta
from pathlib import Path

PROJECT_DIR = Path.home() / ".claude/projects/-Users-timfowler-Desktop-Clients-Trendy-scrape"
OUT = Path(__file__).parent / "usage_report.md"

# Idle gap threshold: if two consecutive messages are further apart than this,
# the gap is treated as idle time and excluded from "active" duration.
IDLE_GAP = timedelta(minutes=5)


def parse_ts(s):
    return datetime.fromisoformat(s.replace("Z", "+00:00"))


def is_real_user_prompt(entry):
    """A real user prompt: type=user, userType=external, not a sidechain turn,
    and not a tool-result message (tool results are user-type with list content
    containing tool_result blocks)."""
    if entry.get("type") != "user":
        return False
    if entry.get("userType") != "external":
        return False
    if entry.get("isSidechain"):
        return False
    msg = entry.get("message", {})
    content = msg.get("content")
    if isinstance(content, str):
        return True
    if isinstance(content, list):
        return not any(
            isinstance(b, dict) and b.get("type") == "tool_result" for b in content
        )
    return False


def analyze_file(path):
    sid = path.stem
    prompts = set()
    total_in = total_out = total_cache_read = total_cache_create = 0
    by_model = defaultdict(lambda: {"in": 0, "out": 0, "cr": 0, "cc": 0, "msgs": 0})
    timestamps = []
    active = timedelta()
    prev_ts = None
    first_ts = last_ts = None
    assistant_msgs = 0
    tool_uses = 0

    with open(path) as f:
        for line in f:
            try:
                d = json.loads(line)
            except json.JSONDecodeError:
                continue
            ts_raw = d.get("timestamp")
            if not ts_raw:
                continue
            try:
                ts = parse_ts(ts_raw)
            except ValueError:
                continue
            if first_ts is None:
                first_ts = ts
            last_ts = ts
            if prev_ts is not None:
                gap = ts - prev_ts
                if timedelta(0) <= gap <= IDLE_GAP:
                    active += gap
            prev_ts = ts

            if is_real_user_prompt(d):
                pid = d.get("promptId") or d.get("uuid")
                prompts.add(pid)

            if d.get("type") == "assistant":
                assistant_msgs += 1
                msg = d.get("message", {})
                model = msg.get("model", "unknown")
                usage = msg.get("usage", {}) or {}
                i = usage.get("input_tokens", 0) or 0
                o = usage.get("output_tokens", 0) or 0
                cr = usage.get("cache_read_input_tokens", 0) or 0
                cc = usage.get("cache_creation_input_tokens", 0) or 0
                total_in += i
                total_out += o
                total_cache_read += cr
                total_cache_create += cc
                m = by_model[model]
                m["in"] += i
                m["out"] += o
                m["cr"] += cr
                m["cc"] += cc
                m["msgs"] += 1
                content = msg.get("content", [])
                if isinstance(content, list):
                    for block in content:
                        if isinstance(block, dict) and block.get("type") == "tool_use":
                            tool_uses += 1

    if first_ts is None:
        return None

    return {
        "session_id": sid,
        "start": first_ts,
        "end": last_ts,
        "wall": last_ts - first_ts,
        "active": active,
        "prompts": len(prompts),
        "assistant_msgs": assistant_msgs,
        "tool_uses": tool_uses,
        "in": total_in,
        "out": total_out,
        "cr": total_cache_read,
        "cc": total_cache_create,
        "by_model": dict(by_model),
    }


def fmt_td(td):
    total = int(td.total_seconds())
    h, rem = divmod(total, 3600)
    m, s = divmod(rem, 60)
    if h:
        return f"{h}h {m}m"
    if m:
        return f"{m}m {s}s"
    return f"{s}s"


def fmt_tokens(n):
    if n >= 1_000_000:
        return f"{n/1_000_000:.2f}M"
    if n >= 1_000:
        return f"{n/1_000:.1f}k"
    return str(n)


def main():
    files = sorted(PROJECT_DIR.glob("*.jsonl"))
    sessions = [s for s in (analyze_file(p) for p in files) if s]
    sessions.sort(key=lambda s: s["start"])

    t_prompts = sum(s["prompts"] for s in sessions)
    t_assistant = sum(s["assistant_msgs"] for s in sessions)
    t_tools = sum(s["tool_uses"] for s in sessions)
    t_in = sum(s["in"] for s in sessions)
    t_out = sum(s["out"] for s in sessions)
    t_cr = sum(s["cr"] for s in sessions)
    t_cc = sum(s["cc"] for s in sessions)
    t_wall = sum((s["wall"] for s in sessions), timedelta())
    t_active = sum((s["active"] for s in sessions), timedelta())
    total_tokens = t_in + t_out + t_cr + t_cc

    # Per-day bucket (by session start, local time)
    by_day = defaultdict(lambda: {"prompts": 0, "tokens": 0, "active": timedelta(), "sessions": 0})
    for s in sessions:
        day = s["start"].astimezone().strftime("%Y-%m-%d")
        b = by_day[day]
        b["prompts"] += s["prompts"]
        b["tokens"] += s["in"] + s["out"] + s["cr"] + s["cc"]
        b["active"] += s["active"]
        b["sessions"] += 1

    # Per-model totals
    model_totals = defaultdict(lambda: {"in": 0, "out": 0, "cr": 0, "cc": 0, "msgs": 0})
    for s in sessions:
        for model, m in s["by_model"].items():
            t = model_totals[model]
            for k in ("in", "out", "cr", "cc", "msgs"):
                t[k] += m[k]

    lines = []
    lines.append("# Trendy Golf — Claude Code Usage Report")
    lines.append("")
    lines.append(f"Generated: {datetime.now().strftime('%Y-%m-%d %H:%M')}")
    lines.append(f"Project log dir: `{PROJECT_DIR}`")
    lines.append("")
    lines.append("## Totals")
    lines.append("")
    lines.append(f"- **Sessions:** {len(sessions)}")
    lines.append(f"- **User prompts:** {t_prompts:,}")
    lines.append(f"- **Assistant responses:** {t_assistant:,}")
    lines.append(f"- **Tool calls:** {t_tools:,}")
    lines.append(f"- **Active time:** {fmt_td(t_active)} (gaps >5min excluded)")
    lines.append(f"- **Wall-clock time:** {fmt_td(t_wall)} (first→last message per session, summed)")
    lines.append("")
    lines.append("### Tokens")
    lines.append("")
    lines.append(f"- **Input:** {fmt_tokens(t_in)} ({t_in:,})")
    lines.append(f"- **Output:** {fmt_tokens(t_out)} ({t_out:,})")
    lines.append(f"- **Cache read:** {fmt_tokens(t_cr)} ({t_cr:,})")
    lines.append(f"- **Cache write:** {fmt_tokens(t_cc)} ({t_cc:,})")
    lines.append(f"- **Grand total:** {fmt_tokens(total_tokens)} ({total_tokens:,})")
    lines.append("")
    lines.append("## By Model")
    lines.append("")
    lines.append("| Model | Messages | Input | Output | Cache read | Cache write | Total |")
    lines.append("|---|---:|---:|---:|---:|---:|---:|")
    for model, t in sorted(model_totals.items(), key=lambda x: -(x[1]["in"] + x[1]["out"] + x[1]["cr"] + x[1]["cc"])):
        tot = t["in"] + t["out"] + t["cr"] + t["cc"]
        lines.append(
            f"| `{model}` | {t['msgs']:,} | {fmt_tokens(t['in'])} | {fmt_tokens(t['out'])} | "
            f"{fmt_tokens(t['cr'])} | {fmt_tokens(t['cc'])} | {fmt_tokens(tot)} |"
        )
    lines.append("")
    lines.append("## By Day")
    lines.append("")
    # Simple bar chart based on active minutes
    max_active = max((b["active"].total_seconds() for b in by_day.values()), default=1) or 1
    lines.append("| Date | Sessions | Prompts | Active | Tokens | Activity |")
    lines.append("|---|---:|---:|---:|---:|---|")
    for day in sorted(by_day.keys()):
        b = by_day[day]
        bar_len = int(round(40 * (b["active"].total_seconds() / max_active)))
        bar = "█" * bar_len
        lines.append(
            f"| {day} | {b['sessions']} | {b['prompts']} | {fmt_td(b['active'])} | "
            f"{fmt_tokens(b['tokens'])} | `{bar}` |"
        )
    lines.append("")
    lines.append("## Per Session")
    lines.append("")
    lines.append("| Date | Session | Prompts | Active | Tokens (in/out/cr/cc) |")
    lines.append("|---|---|---:|---:|---|")
    for s in sessions:
        day = s["start"].astimezone().strftime("%Y-%m-%d %H:%M")
        sid_short = s["session_id"][:8]
        tok = f"{fmt_tokens(s['in'])} / {fmt_tokens(s['out'])} / {fmt_tokens(s['cr'])} / {fmt_tokens(s['cc'])}"
        lines.append(f"| {day} | `{sid_short}` | {s['prompts']} | {fmt_td(s['active'])} | {tok} |")
    lines.append("")
    lines.append("---")
    lines.append("")
    lines.append("### Notes")
    lines.append("- *Active time* sums gaps ≤5min between any two consecutive log events. Long tool runs count as active; idle thinking/breaks don't.")
    lines.append("- *Prompts* = user messages with string content (excludes tool-result messages and sub-agent sidechain turns).")
    lines.append("- *Tool calls* counted from assistant `tool_use` content blocks.")
    lines.append("- Cache-read tokens are much cheaper than fresh input; grand total is a raw sum, not a cost weight.")

    OUT.write_text("\n".join(lines))
    print(f"Wrote {OUT}")
    print(f"Sessions: {len(sessions)}  Prompts: {t_prompts}  Active: {fmt_td(t_active)}  Tokens: {fmt_tokens(total_tokens)}")


if __name__ == "__main__":
    main()
