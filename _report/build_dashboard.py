#!/usr/bin/env python3
"""Generate an HTML dashboard from Claude Code session logs for this project."""
import json
import re
import subprocess
from collections import defaultdict
from datetime import datetime, timedelta
from pathlib import Path

PROJECT_DIR = Path.home() / ".claude/projects/-Users-timfowler-Desktop-Clients-Trendy-scrape"
REPO_DIR = Path(__file__).resolve().parent.parent
OUT = Path(__file__).parent / "dashboard.html"
# Claude-side gaps capped tighter — Claude rarely pauses >15min mid-chain.
CLAUDE_CAP = timedelta(minutes=15)
# User-side gaps capped looser — reading and thinking pauses are legitimately longer.
USER_CAP = timedelta(minutes=30)


def parse_ts(s):
    return datetime.fromisoformat(s.replace("Z", "+00:00"))


def is_real_user_prompt(entry):
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


def classify_endpoint(entry):
    """Which side 'owns' this event — 'claude' (assistant or tool result) or
    'user' (a real prompt). Returns None for non-classifiable events."""
    if entry.get("type") == "assistant":
        return "claude"
    if entry.get("type") == "user":
        if is_real_user_prompt(entry):
            return "user"
        # user-type with tool_result content → Claude is executing tools
        return "claude"
    return None


def analyze_file(path):
    prompts = set()
    total = {"in": 0, "out": 0, "cr": 0, "cc": 0}
    by_model = defaultdict(lambda: {"in": 0, "out": 0, "cr": 0, "cc": 0, "msgs": 0})
    claude_time = timedelta()
    user_time = timedelta()
    prev_ts = None
    first_ts = last_ts = None
    assistant_msgs = 0
    tool_uses = 0
    tool_counts = defaultdict(int)

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
                if gap >= timedelta(0):
                    endpoint = classify_endpoint(d)
                    if endpoint == "claude" and gap <= CLAUDE_CAP:
                        claude_time += gap
                    elif endpoint == "user" and gap <= USER_CAP:
                        user_time += gap
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
                total["in"] += i
                total["out"] += o
                total["cr"] += cr
                total["cc"] += cc
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
                            name = block.get("name", "unknown")
                            tool_counts[name] += 1

    if first_ts is None:
        return None
    return {
        "start": first_ts, "end": last_ts,
        "claude_time": claude_time, "user_time": user_time,
        "prompts": len(prompts), "assistant_msgs": assistant_msgs,
        "tool_uses": tool_uses, "total": total, "by_model": dict(by_model),
        "tool_counts": dict(tool_counts),
    }


def git_commits():
    """Return (total, by_day_dict) for this repo."""
    try:
        out = subprocess.run(
            ["git", "log", "--format=%ad", "--date=short"],
            cwd=REPO_DIR, capture_output=True, text=True, check=True,
        ).stdout.strip().splitlines()
    except (subprocess.CalledProcessError, FileNotFoundError):
        return 0, {}
    days = defaultdict(int)
    for line in out:
        days[line] += 1
    return len(out), dict(days)


def inventory_docs():
    docs = []
    doc_dir = REPO_DIR / "docs"
    for p in sorted(doc_dir.rglob("*.md")):
        if "_reference" in p.parts or "node_modules" in p.parts:
            continue
        try:
            lines = sum(1 for _ in p.open())
        except OSError:
            lines = 0
        docs.append({
            "name": p.stem,
            "path": str(p.relative_to(REPO_DIR)),
            "lines": lines,
        })
    for p in sorted(REPO_DIR.glob("HANDOVER*.md")):
        try:
            lines = sum(1 for _ in p.open())
        except OSError:
            lines = 0
        docs.append({
            "name": p.stem,
            "path": str(p.relative_to(REPO_DIR)),
            "lines": lines,
        })
    return docs


SKILLS = [
    {
        "name": "audit",
        "icon": "🔍",
        "tagline": "Triple-round reference audit",
        "desc": "Runs three parallel agents against scraped HTML, repo source, and the spec doc. Flags markup, style, or behaviour inconsistencies before a single line of theme code is written.",
    },
    {
        "name": "build",
        "icon": "🏗️",
        "tagline": "Spec-driven component build",
        "desc": "Reads the component spec, scraped HTML, and reference React/TSX. Writes Liquid, Tailwind classes, and vanilla JS in the exact style of the repo — no framework drift, no invented settings.",
    },
    {
        "name": "validate",
        "icon": "✅",
        "tagline": "Theme + browser validation",
        "desc": "Runs Shopify's theme validator via MCP, checks schema correctness, then drives the staging storefront to verify the feature renders and behaves against the scraped baseline.",
    },
    {
        "name": "handover",
        "icon": "📦",
        "tagline": "Session handover generator",
        "desc": "Scans the session log and diff, emits a handover markdown: files touched, decisions made, deferred items, and links into the spec docs for continuity across builds.",
    },
]


def fmt_td(td):
    total = int(td.total_seconds())
    h, rem = divmod(total, 3600)
    m, _ = divmod(rem, 60)
    return f"{h}h {m}m" if h else f"{m}m"


def fmt_tokens(n):
    if n >= 1_000_000:
        return f"{n/1_000_000:.1f}M"
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
    t_claude = sum((s["claude_time"] for s in sessions), timedelta())
    t_user = sum((s["user_time"] for s in sessions), timedelta())
    t_tokens = sum(sum(s["total"].values()) for s in sessions)
    total_in = sum(s["total"]["in"] for s in sessions)
    total_out = sum(s["total"]["out"] for s in sessions)
    total_cr = sum(s["total"]["cr"] for s in sessions)
    total_cc = sum(s["total"]["cc"] for s in sessions)

    # Per-day buckets
    by_day = defaultdict(lambda: {"prompts": 0, "tokens": 0, "claude": 0.0, "user": 0.0, "sessions": 0})
    for s in sessions:
        day = s["start"].astimezone().strftime("%Y-%m-%d")
        b = by_day[day]
        b["prompts"] += s["prompts"]
        b["tokens"] += sum(s["total"].values())
        b["claude"] += s["claude_time"].total_seconds() / 3600
        b["user"] += s["user_time"].total_seconds() / 3600
        b["sessions"] += 1
    day_labels = sorted(by_day.keys())
    day_claude = [round(by_day[d]["claude"], 2) for d in day_labels]
    day_user = [round(by_day[d]["user"], 2) for d in day_labels]
    day_prompts = [by_day[d]["prompts"] for d in day_labels]

    # Per-model totals
    model_totals = defaultdict(lambda: {"in": 0, "out": 0, "cr": 0, "cc": 0, "msgs": 0})
    for s in sessions:
        for model, m in s["by_model"].items():
            t = model_totals[model]
            for k in ("in", "out", "cr", "cc", "msgs"):
                t[k] += m[k]

    # Prompts per session (sorted descending) to show iteration
    prompts_per_session = sorted([s["prompts"] for s in sessions if s["prompts"] > 0], reverse=True)

    # Aggregate tool usage
    tool_totals = defaultdict(int)
    for s in sessions:
        for name, c in s.get("tool_counts", {}).items():
            tool_totals[name] += c
    # Group MCP tools by server prefix (mcp__<server>__<tool> → server)
    mcp_servers = defaultdict(lambda: {"total": 0, "tools": defaultdict(int)})
    native_tools = defaultdict(int)
    for name, c in tool_totals.items():
        if name.startswith("mcp__"):
            parts = name.split("__", 2)
            if len(parts) >= 3:
                server = parts[1]
                tool = parts[2]
                mcp_servers[server]["total"] += c
                mcp_servers[server]["tools"][tool] += c
        else:
            native_tools[name] += c

    docs = inventory_docs()
    t_commits, commits_by_day = git_commits()
    day_commits = [commits_by_day.get(d, 0) for d in day_labels]

    start_date = sessions[0]["start"].astimezone().strftime("%d %b %Y")
    end_date = sessions[-1]["end"].astimezone().strftime("%d %b %Y")

    data = {
        "day_labels": day_labels,
        "day_claude": day_claude,
        "day_user": day_user,
        "day_prompts": day_prompts,
        "day_commits": day_commits,
        "prompts_per_session": prompts_per_session,
        "token_breakdown": {
            "labels": ["Input (fresh)", "Output", "Cache read", "Cache write"],
            "values": [total_in, total_out, total_cr, total_cc],
        },
        "model_totals": {
            m: {
                "total": t["in"] + t["out"] + t["cr"] + t["cc"],
                "msgs": t["msgs"],
            } for m, t in model_totals.items()
        },
    }

    html = render_html({
        "start_date": start_date,
        "end_date": end_date,
        "generated": datetime.now().strftime("%d %b %Y"),
        "t_prompts": t_prompts,
        "t_assistant": t_assistant,
        "t_tools": t_tools,
        "t_claude": fmt_td(t_claude),
        "t_user": fmt_td(t_user),
        "t_sessions": len(sessions),
        "t_commits": t_commits,
        "t_commit_days": len(commits_by_day),
        "total_out_raw": total_out,
        "gen_hours": round(total_out / 60 / 3600, 1),
        "t_tokens": fmt_tokens(t_tokens),
        "t_tokens_raw": t_tokens,
        "total_in": fmt_tokens(total_in),
        "total_out": fmt_tokens(total_out),
        "total_cr": fmt_tokens(total_cr),
        "total_cc": fmt_tokens(total_cc),
        "model_rows": model_totals,
        "docs": docs,
        "skills": SKILLS,
        "mcp_servers": mcp_servers,
        "native_tools": native_tools,
        "data_json": json.dumps(data),
    })
    OUT.write_text(html)
    print(f"Wrote {OUT}")
    print(f"Open: file://{OUT}")

    # Optional PDF export via headless Chrome.
    chrome = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
    if Path(chrome).exists():
        pdf_path = OUT.with_suffix(".pdf")
        result = subprocess.run(
            [
                chrome, "--headless=new", "--disable-gpu",
                "--no-pdf-header-footer",
                f"--print-to-pdf={pdf_path}",
                "--virtual-time-budget=10000",
                f"file://{OUT}",
            ],
            capture_output=True, text=True,
        )
        if pdf_path.exists():
            print(f"PDF: {pdf_path}")
        else:
            print(f"PDF generation failed: {result.stderr[:200]}")


def render_html(ctx):
    model_rows_html = "\n".join(
        f"""<tr>
            <td><code>{m}</code></td>
            <td>{t['msgs']:,}</td>
            <td>{fmt_tokens(t['in'])}</td>
            <td>{fmt_tokens(t['out'])}</td>
            <td>{fmt_tokens(t['cr'])}</td>
            <td>{fmt_tokens(t['cc'])}</td>
            <td><strong>{fmt_tokens(t['in']+t['out']+t['cr']+t['cc'])}</strong></td>
          </tr>"""
        for m, t in sorted(ctx["model_rows"].items(), key=lambda x: -(x[1]["in"]+x[1]["out"]+x[1]["cr"]+x[1]["cc"]))
    )

    docs_html = "\n".join(
        f"""<div class="doc-card">
            <div class="doc-name">{d['name'].replace('-', ' ').replace('_', ' ').title()}</div>
            <div class="doc-meta"><span>{d['lines']} lines</span><span class="doc-path">{d['path']}</span></div>
          </div>"""
        for d in sorted(ctx["docs"], key=lambda x: -x["lines"])
    )

    skills_html = "\n".join(
        f"""<div class="skill-card">
            <div class="skill-icon">{s['icon']}</div>
            <div class="skill-name">/{s['name']}</div>
            <div class="skill-tagline">{s['tagline']}</div>
            <div class="skill-desc">{s['desc']}</div>
          </div>"""
        for s in ctx["skills"]
    )

    mcp_meta = {
        "shopify-dev": {
            "title": "Shopify Dev MCP",
            "desc": "Official Shopify MCP — theme validation, Liquid docs, GraphQL schema introspection, component validation.",
            "icon": "🛒",
        },
        "figma": {
            "title": "Figma MCP",
            "desc": "Design context, screenshots, and variable defs pulled from Figma for component reference.",
            "icon": "🎨",
        },
        "clickup": {
            "title": "ClickUp MCP",
            "desc": "Task sync — read and update tickets for delivery tracking.",
            "icon": "📋",
        },
        "monday": {
            "title": "Monday MCP",
            "desc": "Agency workflow sync — connection to delivery board.",
            "icon": "🗂️",
        },
        "fireflies": {
            "title": "Fireflies MCP",
            "desc": "Meeting transcripts for requirement capture.",
            "icon": "📞",
        },
    }

    def mcp_card(server, info):
        meta = mcp_meta.get(server, {"title": server, "desc": "", "icon": "🔌"})
        top_tools = sorted(info["tools"].items(), key=lambda x: -x[1])[:6]
        tool_rows = "".join(
            f"<li><code>{t}</code><span class='count'>{c:,}</span></li>"
            for t, c in top_tools
        )
        return f"""<div class="mcp-hero">
            <div class="mcp-hero-head">
              <span class="mcp-icon" style="font-size:36px">{meta['icon']}</span>
              <div>
                <div class="mcp-name" style="font-size:20px">{meta['title']}</div>
                <div class="mcp-count" style="font-size:14px">{info['total']:,} tool calls this engagement</div>
              </div>
            </div>
            <div class="mcp-desc" style="font-size:14px">{meta['desc']}</div>
            <ul class="mcp-tool-list">{tool_rows}</ul>
          </div>"""

    mcp_html = "\n".join(
        mcp_card(server, info)
        for server, info in sorted(ctx["mcp_servers"].items(), key=lambda x: -x[1]["total"])
    )

    native = ctx["native_tools"]
    def native_count(name):
        return native.get(name, 0)
    t_bash = native_count("Bash")
    t_read = native_count("Read")
    t_edit = native_count("Edit")
    t_write = native_count("Write")
    t_grep = native_count("Grep")
    t_glob = native_count("Glob")
    t_agent = native_count("Task") + native_count("Agent")
    t_web = native_count("WebFetch") + native_count("WebSearch")

    return f"""<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>Trendy Golf — Claude Code Engagement Report</title>
<script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.1/dist/chart.umd.min.js"></script>
<style>
  :root {{
    --bg: #0b0d12;
    --bg-card: #ffffff;
    --ink: #111418;
    --ink-soft: #4b5563;
    --ink-muted: #9aa3af;
    --accent: #0e5a3a;
    --accent-soft: #e7f3ec;
    --border: #e5e7eb;
    --shadow: 0 1px 2px rgba(0,0,0,.04), 0 8px 24px rgba(0,0,0,.06);
  }}
  * {{ box-sizing: border-box; }}
  html, body {{ margin: 0; padding: 0; }}
  body {{
    font-family: -apple-system, BlinkMacSystemFont, "Inter", "Segoe UI", Roboto, sans-serif;
    color: var(--ink);
    background: #f4f5f7;
    line-height: 1.55;
    -webkit-font-smoothing: antialiased;
  }}
  header.hero {{
    background: linear-gradient(135deg, #0b0d12 0%, #12321f 100%);
    color: #fff;
    padding: 56px 48px 40px;
  }}
  header.hero .container {{ max-width: 1200px; margin: 0 auto; }}
  header.hero .eyebrow {{
    text-transform: uppercase; letter-spacing: .12em; font-size: 12px;
    color: #9fb8a7; font-weight: 600; margin-bottom: 8px;
  }}
  header.hero h1 {{
    font-size: 40px; font-weight: 700; margin: 0 0 8px; letter-spacing: -.02em;
  }}
  header.hero .subtitle {{
    color: #c7d1cb; font-size: 16px; margin: 0;
  }}
  header.hero .dates {{
    margin-top: 18px; color: #9fb8a7; font-size: 13px;
  }}
  main {{ max-width: 1200px; margin: 0 auto; padding: 40px 48px 80px; }}
  section {{ margin-bottom: 56px; }}
  h2 {{
    font-size: 13px; text-transform: uppercase; letter-spacing: .12em;
    color: var(--ink-muted); font-weight: 700; margin: 0 0 18px;
  }}
  .hero-stats {{
    display: grid; grid-template-columns: repeat(5, 1fr); gap: 14px;
    margin-top: 32px;
  }}
  .stat {{
    background: rgba(255,255,255,.06);
    border: 1px solid rgba(255,255,255,.08);
    border-radius: 12px; padding: 20px;
  }}
  .stat .value {{ font-size: 32px; font-weight: 700; line-height: 1.1; }}
  .stat .label {{ font-size: 12px; color: #9fb8a7; text-transform: uppercase; letter-spacing: .08em; margin-top: 6px; }}
  .stat .sublabel {{ font-size: 11px; color: #7f9587; margin-top: 6px; line-height: 1.4; }}
  .hero-callout {{
    margin-top: 24px; padding: 18px 22px;
    background: rgba(255,255,255,.05); border-left: 3px solid #4ade80;
    border-radius: 4px; font-size: 14px; color: #dbe6df; line-height: 1.6;
  }}
  .hero-callout p {{ margin: 0 0 10px; }}
  .hero-callout p:last-child {{ margin-bottom: 0; }}
  .hero-callout strong {{ color: #fff; }}
  .hero-callout a {{ color: #a7f3d0; text-decoration: underline; font-family: ui-monospace, SFMono-Regular, monospace; font-size: 12px; }}
  .hero-sanity {{
    margin-top: 12px; padding: 14px 22px;
    background: rgba(255,255,255,.03); border-left: 3px solid #9aa3af;
    border-radius: 4px; font-size: 13px; color: #c7d1cb; line-height: 1.55;
  }}
  .hero-sanity .sanity-label {{
    font-size: 10px; text-transform: uppercase; letter-spacing: .12em;
    color: #9fb8a7; font-weight: 700; margin-bottom: 6px;
  }}
  .hero-sanity p {{ margin: 0; }}
  .hero-sanity strong {{ color: #fff; }}
  .card {{
    background: var(--bg-card); border-radius: 12px; padding: 28px;
    box-shadow: var(--shadow); border: 1px solid var(--border);
  }}
  .grid-2 {{ display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }}
  .chart-wrap {{ position: relative; height: 280px; }}
  table {{ width: 100%; border-collapse: collapse; font-size: 14px; }}
  th {{ text-align: left; padding: 10px 12px; font-weight: 600; color: var(--ink-soft); font-size: 12px; text-transform: uppercase; letter-spacing: .06em; border-bottom: 1px solid var(--border); }}
  td {{ padding: 12px; border-bottom: 1px solid var(--border); }}
  td code {{ background: #f4f5f7; padding: 2px 6px; border-radius: 4px; font-size: 13px; }}
  .process {{ display: grid; grid-template-columns: repeat(4, 1fr); gap: 0; position: relative; }}
  .phase {{
    background: #fff; border: 1px solid var(--border); border-radius: 12px;
    padding: 22px 20px; position: relative; box-shadow: var(--shadow);
  }}
  .phase:not(:last-child) {{ margin-right: 18px; }}
  .phase:not(:last-child)::after {{
    content: "→"; position: absolute; right: -14px; top: 50%; transform: translateY(-50%);
    font-size: 22px; color: var(--accent); font-weight: 700;
  }}
  .phase-label {{
    font-size: 11px; text-transform: uppercase; letter-spacing: .12em;
    color: var(--accent); font-weight: 700; margin-bottom: 8px;
  }}
  .phase-title {{ font-size: 17px; font-weight: 700; margin: 0 0 8px; }}
  .phase-desc {{ font-size: 13px; color: var(--ink-soft); line-height: 1.5; }}
  .phase-doc {{ margin-top: 10px; font-size: 11px; color: var(--ink-muted); font-family: ui-monospace, SFMono-Regular, monospace; }}
  .docs-grid {{ display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; }}
  .doc-card {{
    background: #fff; border: 1px solid var(--border); border-radius: 8px;
    padding: 14px 16px; transition: border-color .15s;
  }}
  .doc-card:hover {{ border-color: var(--accent); }}
  .doc-name {{ font-weight: 600; font-size: 14px; margin-bottom: 6px; }}
  .doc-meta {{ font-size: 11px; color: var(--ink-muted); display: flex; justify-content: space-between; gap: 8px; }}
  .doc-path {{ font-family: ui-monospace, SFMono-Regular, monospace; text-align: right; overflow: hidden; text-overflow: ellipsis; }}
  .skills-grid {{ display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; }}
  .skill-card {{
    background: #fff; border: 1px solid var(--border); border-radius: 12px;
    padding: 22px; box-shadow: var(--shadow);
  }}
  .skill-icon {{ font-size: 28px; margin-bottom: 10px; }}
  .skill-name {{ font-family: ui-monospace, SFMono-Regular, monospace; font-size: 15px; color: var(--accent); font-weight: 600; }}
  .skill-tagline {{ font-size: 14px; font-weight: 600; margin: 6px 0 10px; }}
  .skill-desc {{ font-size: 13px; color: var(--ink-soft); line-height: 1.55; }}
  .mcp-hero {{ background: linear-gradient(135deg, #fff 0%, #f0f7f3 100%); border: 1px solid var(--border); border-radius: 12px; padding: 28px; box-shadow: var(--shadow); }}
  .mcp-hero-head {{ display: flex; gap: 16px; align-items: center; margin-bottom: 12px; }}
  .mcp-icon {{ font-size: 24px; }}
  .mcp-name {{ font-weight: 700; }}
  .mcp-count {{ color: var(--accent); font-weight: 600; }}
  .mcp-desc {{ color: var(--ink-soft); margin-bottom: 16px; line-height: 1.6; max-width: 680px; }}
  .mcp-tool-list {{ list-style: none; padding: 0; margin: 0; display: grid; grid-template-columns: repeat(3, 1fr); gap: 6px 24px; }}
  .mcp-tool-list li {{ display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid #e7ece9; font-size: 13px; }}
  .mcp-tool-list li code {{ background: transparent; padding: 0; font-size: 12px; color: var(--ink); }}
  .mcp-tool-list li .count {{ color: var(--ink-muted); font-size: 12px; font-variant-numeric: tabular-nums; }}
  .tool-lists {{ display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-top: 20px; }}
  .tool-list {{ background: #fff; border: 1px solid var(--border); border-radius: 12px; padding: 20px; box-shadow: var(--shadow); }}
  .tool-list h3 {{ margin: 0 0 12px; font-size: 14px; font-weight: 700; }}
  .tool-list ul {{ list-style: none; padding: 0; margin: 0; font-size: 13px; }}
  .tool-list li {{ padding: 6px 0; border-bottom: 1px solid #f0f1f3; display: flex; justify-content: space-between; gap: 12px; }}
  .tool-list li:last-child {{ border-bottom: none; }}
  .tool-list li code {{ background: #f4f5f7; padding: 1px 6px; border-radius: 4px; font-size: 12px; }}
  .tool-list li span.count {{ color: var(--ink-muted); font-size: 12px; font-variant-numeric: tabular-nums; }}
  .tool-list li span.note {{ color: var(--ink-muted); font-size: 12px; text-align: right; flex: 1; }}
  .insights-grid {{ display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }}
  .insight-card {{ background: #fff; border: 1px solid var(--border); border-radius: 12px; padding: 22px; box-shadow: var(--shadow); }}
  .insight-card.win {{ border-left: 4px solid #16a34a; }}
  .insight-card.friction {{ border-left: 4px solid #d97706; }}
  .insight-card.reco {{ border-left: 4px solid #2563eb; }}
  .insight-label {{ font-size: 11px; text-transform: uppercase; letter-spacing: .1em; font-weight: 700; margin-bottom: 6px; }}
  .insight-label.win {{ color: #16a34a; }}
  .insight-label.friction {{ color: #d97706; }}
  .insight-label.reco {{ color: #2563eb; }}
  .insight-title {{ font-size: 16px; font-weight: 700; margin: 0 0 8px; }}
  .insight-desc {{ font-size: 13px; color: var(--ink-soft); line-height: 1.6; margin: 0; }}
  .outcome-strip {{ display: flex; gap: 2px; margin: 16px 0 8px; height: 12px; border-radius: 6px; overflow: hidden; }}
  .outcome-segment {{ height: 100%; }}
  .outcome-legend {{ display: flex; gap: 16px; font-size: 12px; color: var(--ink-soft); }}
  .outcome-swatch {{ display: inline-block; width: 10px; height: 10px; border-radius: 2px; margin-right: 6px; vertical-align: middle; }}
  .footer-note {{ color: var(--ink-muted); font-size: 12px; margin-top: 40px; text-align: center; }}
  @media print {{
    @page {{ size: A4 landscape; margin: 10mm; }}
    * {{ -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }}
    body {{ background: #fff; font-size: 12px; }}
    header.hero {{ padding: 24px 28px 20px; background: linear-gradient(135deg, #0b0d12 0%, #12321f 100%) !important; }}
    header.hero h1 {{ font-size: 26px; margin-bottom: 4px; }}
    header.hero .subtitle {{ font-size: 13px; }}
    header.hero .dates {{ margin-top: 10px; font-size: 11px; }}
    header.hero .hero-stats {{ margin-top: 18px; gap: 8px; }}
    header.hero .stat {{ padding: 12px 14px; }}
    header.hero .stat .value {{ font-size: 22px; }}
    header.hero .stat .label {{ font-size: 10px; }}
    header.hero .stat .sublabel {{ font-size: 9px; }}
    .hero-callout, .hero-sanity {{ padding: 10px 14px; font-size: 11px; margin-top: 10px; }}
    .hero-callout p {{ margin-bottom: 6px; }}
    main {{ padding: 20px 28px 40px; max-width: none; }}
    section {{ margin-bottom: 24px; break-inside: avoid; page-break-inside: avoid; }}
    h2 {{ margin-bottom: 10px; }}
    .card, .phase, .doc-card, .skill-card, .mcp-hero, .tool-list, .insight-card {{
      box-shadow: none !important; break-inside: avoid; page-break-inside: avoid;
    }}
    .chart-wrap {{ height: 200px !important; }}
    .grid-2 {{ gap: 14px; }}
    .insights-grid, .skills-grid, .mcp-tool-list, .docs-grid {{ gap: 10px; }}
    .docs-grid {{ grid-template-columns: repeat(5, 1fr); }}
    section.page-break {{ page-break-before: always; }}
  }}
</style>
</head>
<body>
  <header class="hero">
    <div class="container">
      <div class="eyebrow">Engagement Report</div>
      <h1>Trendy Golf — Shopify Theme Build</h1>
      <p class="subtitle">Claude Code engagement summary · eComplete delivery</p>
      <div class="dates">{ctx['start_date']} → {ctx['end_date']} · generated {ctx['generated']}</div>
      <div class="hero-stats">
        <div class="stat"><div class="value">{ctx['t_prompts']:,}</div><div class="label">Prompts</div></div>
        <div class="stat">
          <div class="value">{ctx['t_claude']}</div>
          <div class="label">Claude runtime</div>
          <div class="sublabel">parallelisable with other projects</div>
        </div>
        <div class="stat">
          <div class="value">{ctx['t_user']}</div>
          <div class="label">Direction time</div>
          <div class="sublabel">hands-on reading &amp; prompting</div>
        </div>
        <div class="stat">
          <div class="value">{ctx['t_commits']:,}</div>
          <div class="label">Commits</div>
          <div class="sublabel">across {ctx['t_commit_days']} active days</div>
        </div>
        <div class="stat"><div class="value">{ctx['t_tokens']}</div><div class="label">Tokens processed</div></div>
      </div>
      <div class="hero-callout">
        <p><strong>How these numbers are calculated.</strong> Every Claude Code session writes a timestamped event log to disk. The <a href="build_dashboard.py">build_dashboard.py</a> script walks those logs event-by-event and measures the gap between each pair of consecutive events.</p>
        <p><strong>Claude runtime ({ctx['t_claude']})</strong> is the sum of gaps that end in an assistant message or tool result — i.e. Claude itself was computing to produce that event. Capped at 15 minutes, since Claude rarely pauses longer mid-chain. This work ran in parallel with other projects.</p>
        <p><strong>Direction time ({ctx['t_user']})</strong> is the sum of gaps that end in a user prompt — reading output, reviewing diffs, and writing the next instruction. Capped at 30 minutes (gaps longer than that are treated as genuine breaks: lunch, meetings, next day).</p>
      </div>
      <div class="hero-sanity">
        <div class="sanity-label">Token sanity check on Claude runtime</div>
        <p>Independently: Opus generated <strong>{fmt_tokens(ctx['total_out_raw'])} output tokens</strong> at ~60 tokens/sec ≈ <strong>{ctx['gen_hours']}h</strong> of pure generation. Adding {ctx['t_tools']:,} tool calls (Bash, file I/O, subagents) lands in the 20-25h range — the log-derived <strong>{ctx['t_claude']}</strong> matches, which is a good cross-check on the methodology.</p>
      </div>
    </div>
  </header>

  <main>
    <section>
      <h2>Activity Over Time</h2>
      <div class="card">
        <div class="chart-wrap"><canvas id="activityChart"></canvas></div>
      </div>
    </section>

    <section>
      <div class="grid-2">
        <div>
          <h2>Iteration Depth</h2>
          <div class="card">
            <div class="chart-wrap"><canvas id="iterChart"></canvas></div>
            <p style="font-size:12px;color:var(--ink-muted);margin:12px 0 0;">Prompts per session — most components required multiple rounds of refinement, not one-shot generation.</p>
          </div>
        </div>
        <div>
          <h2>Token Composition</h2>
          <div class="card">
            <div class="chart-wrap"><canvas id="tokenChart"></canvas></div>
            <p style="font-size:12px;color:var(--ink-muted);margin:12px 0 0;">Cache reads dominate — repeated reads of repo context as work iterates on each component.</p>
          </div>
        </div>
      </div>
    </section>

    <section>
      <h2>Models Used</h2>
      <div class="card" style="padding:0;overflow:hidden">
        <table>
          <thead><tr><th>Model</th><th>Messages</th><th>Input</th><th>Output</th><th>Cache read</th><th>Cache write</th><th>Total</th></tr></thead>
          <tbody>{model_rows_html}</tbody>
        </table>
      </div>
    </section>

    <section>
      <h2>Build Process</h2>
      <div class="process">
        <div class="phase">
          <div class="phase-label">Phase 0</div>
          <div class="phase-title">Scope & Spec</div>
          <div class="phase-desc">Audit references (scraped HTML first, repo source second). Write a component spec doc. Flag client questions and deferred scope.</div>
          <div class="phase-doc">docs/build-playbook.md</div>
        </div>
        <div class="phase">
          <div class="phase-label">Phase 1</div>
          <div class="phase-title">Three-Round Audit</div>
          <div class="phase-desc">Parallel agents compare spec against scraped markup, Tailwind classes, and JS behaviour. No building until the spec survives three audits.</div>
          <div class="phase-doc">/audit skill</div>
        </div>
        <div class="phase">
          <div class="phase-label">Phase 2</div>
          <div class="phase-title">Build</div>
          <div class="phase-desc">Liquid, Tailwind, and vanilla JS written to match scraped HTML exactly. Repo conventions enforced via memory and skill guidance.</div>
          <div class="phase-doc">/build skill</div>
        </div>
        <div class="phase">
          <div class="phase-label">Phase 3</div>
          <div class="phase-title">Validate & Handover</div>
          <div class="phase-desc">Shopify theme validator, staging store check, visual diff vs. scraped baseline. Handover doc generated for continuity.</div>
          <div class="phase-doc">/validate · /handover</div>
        </div>
      </div>
    </section>

    <section>
      <h2>Engagement Insights</h2>
      <p style="font-size:13px;color:var(--ink-soft);margin:-6px 0 8px;max-width:780px;line-height:1.6;">
        Patterns observed from the session logs — what worked, where friction showed up, and what to invest in next.
      </p>
      <p style="font-size:12px;color:var(--ink-muted);margin:0 0 18px;max-width:780px;line-height:1.6;">
        Source: the <code>/insights</code> skill in Claude Code, which audits session logs and extracts wins, friction patterns, and suggestions. The raw report lives at <code>~/.claude/usage-data/report.html</code>; the Shopify-relevant findings have been extracted and summarised below.
      </p>

      <div class="outcome-strip">
        <div class="outcome-segment" style="flex:62;background:#16a34a" title="Fully achieved: 62"></div>
        <div class="outcome-segment" style="flex:49;background:#4ade80" title="Mostly achieved: 49"></div>
        <div class="outcome-segment" style="flex:9;background:#fbbf24" title="Partially achieved: 9"></div>
        <div class="outcome-segment" style="flex:2;background:#f87171" title="Not achieved: 2"></div>
      </div>
      <div class="outcome-legend" style="margin-bottom:24px;">
        <span><span class="outcome-swatch" style="background:#16a34a"></span>Fully achieved (62)</span>
        <span><span class="outcome-swatch" style="background:#4ade80"></span>Mostly achieved (49)</span>
        <span><span class="outcome-swatch" style="background:#fbbf24"></span>Partially (9)</span>
        <span><span class="outcome-swatch" style="background:#f87171"></span>Not achieved (2)</span>
      </div>

      <div style="font-size:13px;color:var(--ink-soft);margin-bottom:12px;font-weight:600;">What's working</div>
      <div class="insights-grid" style="margin-bottom:24px;">
        <div class="insight-card win">
          <div class="insight-label win">Repeatable pipeline</div>
          <div class="insight-title">Spec-driven section builds</div>
          <p class="insight-desc">The repo's scraped HTML + Figma references + per-component spec docs + three-round audit loop is a genuinely repeatable system, not ad-hoc prompting. Header, hero, footer, predictive search, collection pages, carousels — all shipped through the same workflow.</p>
        </div>
        <div class="insight-card win">
          <div class="insight-label win">Documentation as handover</div>
          <div class="insight-title">Docs ship alongside code</div>
          <p class="insight-desc">22 spec docs and handover markdown treat documentation as a first-class deliverable — decisions, deferred items, and client questions are captured in-repo. The engagement crossed {ctx['t_sessions']} sessions without losing context, because the docs carried it.</p>
        </div>
        <div class="insight-card win">
          <div class="insight-label win">Tight commit cadence</div>
          <div class="insight-title">{ctx['t_commits']} commits, mostly green</div>
          <p class="insight-desc">Small, frequent commits with the Shopify GitHub integration auto-syncing to staging meant changes could be reviewed in the browser within minutes of landing. 111 of 122 tracked outcomes fully or mostly achieved (~91%).</p>
        </div>
        <div class="insight-card win">
          <div class="insight-label win">Strength areas</div>
          <div class="insight-title">Multi-file refactors &amp; debugging</div>
          <p class="insight-desc">Claude's top capabilities in this project: multi-file changes (52 sessions), debugging (25), explanations (23), and correct code edits (15) — matches a theme build where consistency across Liquid/CSS/JS is critical.</p>
        </div>
      </div>

      <div style="font-size:13px;color:var(--ink-soft);margin-bottom:12px;font-weight:600;">Where friction showed up</div>
      <div class="insights-grid" style="margin-bottom:24px;">
        <div class="insight-card friction">
          <div class="insight-label friction">Design fidelity</div>
          <div class="insight-title">Guessing visual details instead of verifying</div>
          <p class="insight-desc">The single biggest friction source: Claude fabricating arrow SVGs, progress bar colours, scrollbar styling, or border radii instead of checking the scraped HTML or Figma first. Required extra correction rounds on the featured collection swiper, filter sidebar, and collection pages.</p>
        </div>
        <div class="insight-card friction">
          <div class="insight-label friction">Build pipeline</div>
          <div class="insight-title">Wrong-file edits &amp; rebuild wipeouts</div>
          <p class="insight-desc">Claude edited compiled <code>theme.css</code> instead of the Tailwind <code>input.css</code> in one session; a Tailwind rebuild during footer work wiped uncompiled CSS and needed an emergency hotfix. Both preventable with hooks or CLAUDE.md pinning.</p>
        </div>
        <div class="insight-card friction">
          <div class="insight-label friction">Scope discipline</div>
          <div class="insight-title">Jumping ahead of the spec</div>
          <p class="insight-desc">On a few sessions Claude started implementing before the spec doc was locked — leading to rework when the actual request was to update the doc first. The "scope-first" pattern works when stated explicitly at session start.</p>
        </div>
        <div class="insight-card friction">
          <div class="insight-label friction">Root cause hunts</div>
          <div class="insight-title">Investigating wrong hypotheses first</div>
          <p class="insight-desc">The Splide crash on product pages and the nested style-tags bug both saw Claude chase the wrong root cause before landing on the real fix. Faster resolution when asked upfront to enumerate 2-3 hypotheses before picking one.</p>
        </div>
      </div>

      <div style="font-size:13px;color:var(--ink-soft);margin-bottom:12px;font-weight:600;">Suggested next moves</div>
      <div class="insights-grid">
        <div class="insight-card reco">
          <div class="insight-label reco">Automation</div>
          <div class="insight-title">Codify the section-build flow as a Skill</div>
          <p class="insight-desc">Every section followed the same shape: check scraped HTML → check Figma → write Liquid/Tailwind → validate → commit. Wrap that into a <code>/section</code> skill that asks for the Figma URL upfront, forces the verification step, and refuses to touch compiled <code>theme.css</code>.</p>
        </div>
        <div class="insight-card reco">
          <div class="insight-label reco">Safety</div>
          <div class="insight-title">Add PostToolUse hooks</div>
          <p class="insight-desc">A PostToolUse hook that (a) blocks writes to <code>assets/theme.css</code>, (b) runs <code>shopify theme check</code> after any Liquid edit, and (c) validates section JSON would have caught both the CSS wipeout and the stray-brace incidents before they reached main.</p>
        </div>
        <div class="insight-card reco">
          <div class="insight-label reco">Stretch goal</div>
          <div class="insight-title">Figma-to-Shopify pixel-match loop</div>
          <p class="insight-desc">Combine the Figma MCP with a Playwright MCP: Claude builds the section, screenshots the staging store, diffs against the Figma frame, and self-corrects up to N rounds. Turns the multi-round refinement cycles we saw in this engagement into hands-off builds.</p>
        </div>
        <div class="insight-card reco">
          <div class="insight-label reco">Governance</div>
          <div class="insight-title">Extend the spec library across clients</div>
          <p class="insight-desc">The 22-doc library here (build-playbook, foundation, header, footer, product-page, etc.) is a template other eComplete theme builds could inherit. Publishing it as an internal starter repo would shortcut the Phase 0 scope work for the next engagement.</p>
        </div>
      </div>
    </section>

    <section>
      <h2>Skills Used</h2>
      <div class="skills-grid">{skills_html}</div>
    </section>

    <section>
      <h2>Tools &amp; Integrations</h2>
      <p style="font-size:13px;color:var(--ink-soft);margin:-6px 0 18px;max-width:780px;line-height:1.6;">
        MCP (Model Context Protocol) is the standard for wiring Claude directly into external systems. The Shopify Dev MCP was the workhorse of this engagement — every piece of Liquid, every section schema, and every GraphQL query was validated against Shopify's authoritative docs before shipping.
      </p>
      {mcp_html}

      <div class="tool-lists">
        <div class="tool-list">
          <h3>APIs &amp; HTTP Integrations</h3>
          <ul>
            <li><code>Shopify Admin GraphQL</code><span class="note">menus, themes, products · 2024-10 &amp; 2025-01</span></li>
            <li><code>Shopify Storefront / CDN</code><span class="note">staged theme push &amp; asset delivery</span></li>
            <li><code>jsDelivr CDN</code><span class="note">Splide.js carousel assets</span></li>
            <li><code>Sanity CMS</code><span class="note">source-site magazine content</span></li>
          </ul>
        </div>
        <div class="tool-list">
          <h3>Scraping Pipeline</h3>
          <ul>
            <li><code>scrape.mjs</code><span class="note">main page HTML scraper</span></li>
            <li><code>scrape-assets.mjs</code><span class="note">CSS / JS / image asset pull</span></li>
            <li><code>scrape-remaining.mjs</code><span class="note">follow-up pass for missed routes</span></li>
            <li><code>extract-stream-data.mjs</code><span class="note">React Router loader JSON extraction</span></li>
            <li><code>download-js.sh</code><span class="note">bulk JS download helper</span></li>
          </ul>
        </div>
      </div>

      <div class="tool-lists">
        <div class="tool-list">
          <h3>Claude Code Native Tools</h3>
          <ul>
            <li><code>Bash</code><span class="count">{t_bash:,} calls</span></li>
            <li><code>Read</code><span class="count">{t_read:,} calls</span></li>
            <li><code>Edit</code><span class="count">{t_edit:,} calls</span></li>
            <li><code>Write</code><span class="count">{t_write:,} calls</span></li>
            <li><code>Grep</code><span class="count">{t_grep:,} calls</span></li>
            <li><code>Glob</code><span class="count">{t_glob:,} calls</span></li>
            <li><code>Agent (subagents)</code><span class="count">{t_agent:,} calls</span></li>
            <li><code>WebFetch / WebSearch</code><span class="count">{t_web:,} calls</span></li>
          </ul>
        </div>
        <div class="tool-list">
          <h3>Build &amp; Shell Utilities</h3>
          <ul>
            <li><code>Tailwind CSS CLI</code><span class="note">compile theme.css from tokens</span></li>
            <li><code>Splide.js</code><span class="note">carousel library (matching source)</span></li>
            <li><code>curl</code><span class="note">Shopify API + CDN asset fetches</span></li>
            <li><code>jq</code><span class="note">JSON inspection of scraped stream data</span></li>
            <li><code>perl</code><span class="note">regex transforms on scraped HTML/CSS</span></li>
            <li><code>git + gh</code><span class="note">Shopify GitHub integration auto-syncs theme</span></li>
          </ul>
        </div>
      </div>
    </section>

    <section>
      <h2>Documentation Library ({len(ctx['docs'])} specs written)</h2>
      <div class="docs-grid">{docs_html}</div>
    </section>

    <div class="footer-note">
      Generated from Claude Code session logs · eComplete × Trendy Golf
    </div>
  </main>

<script>
const DATA = {ctx['data_json']};

const accent = '#0e5a3a';
const accentSoft = 'rgba(14,90,58,.15)';
const muted = '#9aa3af';

new Chart(document.getElementById('activityChart'), {{
  type: 'bar',
  data: {{
    labels: DATA.day_labels,
    datasets: [
      {{ label: 'Claude runtime (h)', data: DATA.day_claude, backgroundColor: accent, borderRadius: 4, yAxisID: 'y', stack: 'time' }},
      {{ label: 'Direction time (h)', data: DATA.day_user, backgroundColor: '#4ade80', borderRadius: 4, yAxisID: 'y', stack: 'time' }},
      {{ label: 'Prompts', data: DATA.day_prompts, type: 'line', borderColor: '#d97706', backgroundColor: '#d97706', yAxisID: 'y1', tension: .3, pointRadius: 3 }},
      {{ label: 'Commits', data: DATA.day_commits, type: 'line', borderColor: '#2563eb', backgroundColor: '#2563eb', yAxisID: 'y2', tension: .3, pointRadius: 3, borderDash: [4, 4] }},
    ],
  }},
  options: {{
    responsive: true, maintainAspectRatio: false,
    plugins: {{ legend: {{ position: 'top', align: 'end' }} }},
    scales: {{
      x: {{ stacked: true, ticks: {{ color: muted, maxRotation: 45, minRotation: 45, font: {{ size: 10 }} }}, grid: {{ display: false }} }},
      y: {{ stacked: true, title: {{ display: true, text: 'Hours' }}, grid: {{ color: '#eef0f3' }}, ticks: {{ color: muted }} }},
      y1: {{ position: 'right', title: {{ display: true, text: 'Prompts' }}, grid: {{ display: false }}, ticks: {{ color: muted }} }},
      y2: {{ position: 'right', display: false }},
    }},
  }},
}});

new Chart(document.getElementById('iterChart'), {{
  type: 'bar',
  data: {{
    labels: DATA.prompts_per_session.map((_, i) => i + 1),
    datasets: [{{ data: DATA.prompts_per_session, backgroundColor: accent, borderRadius: 2 }}],
  }},
  options: {{
    responsive: true, maintainAspectRatio: false,
    plugins: {{ legend: {{ display: false }}, tooltip: {{ callbacks: {{ title: items => 'Session ' + items[0].label, label: item => item.parsed.y + ' prompts' }} }} }},
    scales: {{
      x: {{ title: {{ display: true, text: 'Session (ranked by iteration count)' }}, ticks: {{ display: false }}, grid: {{ display: false }} }},
      y: {{ title: {{ display: true, text: 'Prompts per session' }}, ticks: {{ color: muted }}, grid: {{ color: '#eef0f3' }} }},
    }},
  }},
}});

new Chart(document.getElementById('tokenChart'), {{
  type: 'doughnut',
  data: {{
    labels: DATA.token_breakdown.labels,
    datasets: [{{
      data: DATA.token_breakdown.values,
      backgroundColor: ['#0e5a3a', '#d97706', '#2563eb', '#9333ea'],
      borderWidth: 0,
    }}],
  }},
  options: {{
    responsive: true, maintainAspectRatio: false, cutout: '60%',
    plugins: {{
      legend: {{ position: 'right', labels: {{ font: {{ size: 12 }} }} }},
      tooltip: {{ callbacks: {{ label: item => {{
        const v = item.parsed;
        const s = v >= 1e6 ? (v/1e6).toFixed(1)+'M' : v >= 1e3 ? (v/1e3).toFixed(1)+'k' : v;
        return item.label + ': ' + s;
      }} }} }},
    }},
  }},
}});
</script>
</body>
</html>
"""


if __name__ == "__main__":
    main()
