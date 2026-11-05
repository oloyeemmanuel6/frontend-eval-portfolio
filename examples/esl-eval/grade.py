#!/usr/bin/env python3
"""Grade a run: deterministic checks + LLM-as-judge (one call per judge criterion).

  python grade.py results/raw/<run_id>                    # judge = config.json judge_model
  python grade.py results/raw/<run_id> --judge-repeats 2  # run judge twice, report flips
  python grade.py results/mock/<run_id> --mock-judge      # dry run only
  python grade.py --validate-references                   # reference answers must pass, wrong ones must fail

Outputs to results/graded/<run_id>/ (mock runs: results/mock/<run_id>/graded/):
  criteria.csv  one row per (trial, criterion, judge repeat)
  scores.csv    one row per trial
  summary_by_model.csv, summary_by_category.csv, summary.md
"""
import argparse, csv, json, sys, collections, pathlib
from concurrent.futures import ThreadPoolExecutor
from esl_eval.common import ROOT, load_config, load_tasks, chat, extract_json, sha, QuotaExhausted, PaidCallDetected
from graders.deterministic import run_check

JUDGE_TEMPLATE = (ROOT / "graders" / "judge_prompt.md").read_text()
BATCH_TEMPLATE = (ROOT / "graders" / "judge_prompt_batched.md").read_text()

def reference_text(tid, wrong=False):
    return (ROOT / "reference" / ("wrong/" if wrong else "") / f"{tid}.md").read_text()

def judge_one(cfg, judge_model, task, crit, response, repeat, cache, mock):
    key = sha(json.dumps([judge_model, task["id"], crit["id"], response, repeat, JUDGE_TEMPLATE]))
    if key in cache:
        return cache[key]
    notes = task["expected_answer"].get("notes", json.dumps(task["expected_answer"], ensure_ascii=False))
    prompt = JUDGE_TEMPLATE.format(task_prompt=task["prompt"], reference_notes=notes,
                                   criterion_description=crit["description"], pass_if=crit["pass_if"],
                                   fail_if=crit["fail_if"], response=response or "(empty)")
    if mock:
        prompt += "\n[MOCK_IS_REFERENCE:%s]" % ("yes" if (response or "").strip() == reference_text(task["id"]).strip() else "no")
    try:
        res = chat(judge_model, [{"role": "user", "content": prompt}], temperature=0,
                   max_tokens=cfg["judge_max_tokens"], timeout=cfg["request_timeout_s"])
        parsed = extract_json(res["text"]) or {}
        verdict = str(parsed.get("verdict", "UNKNOWN")).upper()
        if verdict not in ("PASS", "FAIL", "UNKNOWN"):
            verdict = "UNKNOWN"
        out = {"verdict": verdict, "evidence": parsed.get("evidence", ""), "reason": parsed.get("reason", ""),
               "judge_raw": res["text"], "judge_cost": (res.get("usage") or {}).get("cost", 0) or 0}
    except (QuotaExhausted, PaidCallDetected):
        raise
    except Exception as e:
        out = {"verdict": "UNKNOWN", "evidence": "", "reason": f"judge error: {e}", "judge_raw": "", "judge_cost": 0}
    cache[key] = out
    return out

def judge_batch(cfg, judge_model, task, crits, response, repeat, cache, mock):
    """One judge call grading all judge criteria of a task; returns {crit_id: result}."""
    key = sha(json.dumps([judge_model, task["id"], [c["id"] for c in crits], response, repeat, BATCH_TEMPLATE, "batched"]))
    if key in cache:
        return cache[key]
    notes = task["expected_answer"].get("notes", json.dumps(task["expected_answer"], ensure_ascii=False))
    block = "\n\n".join(f"### {c['id']}: {c['description']}\nPASS if: {c['pass_if']}\nFAIL if: {c['fail_if']}" for c in crits)
    skel = "{" + ", ".join(f'"{c["id"]}": {{"verdict": "PASS" | "FAIL" | "UNKNOWN", "evidence": "<short quote>", "reason": "<one sentence>"}}' for c in crits) + "}"
    prompt = BATCH_TEMPLATE.format(task_prompt=task["prompt"], reference_notes=notes, criteria_block=block,
                                   response=response or "(empty)", json_skeleton=skel)
    if mock:
        ok = (response or "").strip() == reference_text(task["id"]).strip()
        text = json.dumps({c["id"]: {"verdict": "PASS" if ok else "FAIL", "evidence": "", "reason": "MOCK JUDGE (dry run only)"} for c in crits})
        res = {"text": text, "usage": {"cost": 0}}
    else:
        res = chat(judge_model, [{"role": "user", "content": prompt}], temperature=0,
                   max_tokens=cfg["judge_max_tokens"], timeout=cfg["request_timeout_s"])   # QuotaExhausted propagates
    parsed = extract_json(res["text"]) or {}
    out = {}
    for c in crits:
        v = parsed.get(c["id"]) if isinstance(parsed.get(c["id"]), dict) else {}
        verdict = str(v.get("verdict", "UNKNOWN")).upper()
        out[c["id"]] = {"verdict": verdict if verdict in ("PASS", "FAIL", "UNKNOWN") else "UNKNOWN",
                        "evidence": v.get("evidence", ""), "reason": v.get("reason", ""),
                        "judge_raw": res["text"], "judge_cost": (res.get("usage") or {}).get("cost", 0) or 0}
    cache[key] = out
    return out

def grade_response(cfg, task, response, judge_model, repeats, cache, mock, pool=None, judge_enabled=True):
    """Return (criteria_rows, score, passed, flags)."""
    parsed = extract_json(response or "")
    rows, num, den, critical_ok, flags = [], 0.0, 0.0, True, []
    dnum = dden = 0.0
    pending = False
    if parsed is None:
        flags.append("FORMAT_FAIL")
    batched = {}
    jcrits = [c for c in task["rubric"] if c["type"] == "judge"]
    if cfg.get("judge_mode") == "batched" and jcrits and judge_enabled:
        for r in range(repeats):
            try:
                for cid, j in judge_batch(cfg, judge_model, task, jcrits, response, r, cache, mock).items():
                    batched.setdefault(cid, []).append(j)
            except (QuotaExhausted, PaidCallDetected):
                raise
            except Exception as e:
                for c in jcrits:
                    batched.setdefault(c["id"], []).append({"verdict": "UNKNOWN", "evidence": "", "reason": f"judge error: {e}", "judge_raw": "", "judge_cost": 0})
    for crit in task["rubric"]:
        if crit["type"] == "deterministic":
            credit, detail = run_check(crit, parsed, task)
            rows.append({"criterion": crit["id"], "type": "deterministic", "weight": crit["weight"],
                         "critical": crit.get("critical", False), "repeat": 0, "verdict": "PASS" if credit == 1 else ("PARTIAL" if credit > 0 else "FAIL"),
                         "credit": round(credit, 3), "detail": detail, "judge_raw": ""})
        elif not judge_enabled:
            pending = True
            rows.append({"criterion": crit["id"], "type": "judge", "weight": crit["weight"], "critical": crit.get("critical", False),
                         "repeat": 0, "verdict": "PENDING", "credit": 0.0, "detail": "judge not run yet (free quota)", "judge_raw": "", "final_verdict": "PENDING"})
            credit = 0.0
        else:
            if batched:
                futs = [(r, _Now(j)) for r, j in enumerate(batched[crit["id"]])]
            else:
                futs = [(r, (pool.submit if pool else (lambda f, *a: _Now(f(*a))))(judge_one, cfg, judge_model, task, crit, response, r, cache, mock)) for r in range(repeats)]
            verdicts = []
            for r, f in futs:
                j = f.result()
                verdicts.append(j["verdict"])
                rows.append({"criterion": crit["id"], "type": "judge", "weight": crit["weight"],
                             "critical": crit.get("critical", False), "repeat": r, "verdict": j["verdict"],
                             "credit": 1.0 if j["verdict"] == "PASS" else 0.0,
                             "detail": f"{j['reason']} | evidence: {j['evidence']}", "judge_raw": j["judge_raw"],
                             "judge_cost": j["judge_cost"]})
            c = collections.Counter(verdicts)
            final = "PASS" if c["PASS"] > repeats / 2 else ("UNKNOWN" if c["UNKNOWN"] > repeats / 2 else "FAIL")
            if len(c) > 1: flags.append(f"JUDGE_FLIP:{crit['id']}")
            if "UNKNOWN" in c: flags.append(f"JUDGE_UNKNOWN:{crit['id']}")
            credit = 1.0 if final == "PASS" else 0.0
            for row in rows[-repeats:]:
                row["final_verdict"] = final
        num += crit["weight"] * credit
        den += crit["weight"]
        if crit["type"] == "deterministic":
            dnum += crit["weight"] * credit; dden += crit["weight"]
        if crit.get("critical") and credit < 1:
            critical_ok = False
    score = num / den if den else 0.0
    passed = critical_ok and score >= task["pass_threshold"] - 1e-9
    if pending:
        flags.append("JUDGE_PENDING")
    det = round(dnum / dden, 4) if dden else None
    return rows, round(score, 4), passed, flags, det

class _Now:
    def __init__(self, v): self.v = v
    def result(self): return self.v

def summarize(scores, tasks, out, title):
    by_task = {t["id"]: t for t in tasks}
    # per model
    models = sorted({s["model"] for s in scores})
    mrows = []
    allscores = scores
    scores = [s for s in scores if s["judge_complete"] and not s["error"]]
    models = sorted({s["model"] for s in allscores})
    for m in models:
        ss = [s for s in scores if s["model"] == m]
        sa = [s for s in allscores if s["model"] == m]
        if not ss:
            mrows.append({"model": m, "trials_per_task": 0, "n_trials": 0, "judge_pending_trials": len(sa)}); continue
        per_task = collections.defaultdict(list)
        for s in ss: per_task[s["task_id"]].append(s["passed"])
        k = max(len(v) for v in per_task.values())
        mrows.append({"model": m, "trials_per_task": k, "n_trials": len(ss),
                      "mean_score": round(sum(s["score"] for s in ss) / len(ss), 3),
                      "pass_rate": round(sum(s["passed"] for s in ss) / len(ss), 3),
                      "pass@k": round(sum(any(v) for v in per_task.values()) / len(per_task), 3),
                      "pass^k": round(sum(all(v) for v in per_task.values()) / len(per_task), 3),
                      "format_failures": sum("FORMAT_FAIL" in s["flags"] for s in ss),
                      "api_errors": sum(bool(s["error"]) for s in ss),
                      "model_cost_usd": round(sum(s["cost_usd"] for s in sa), 4),
                      "deterministic_only_mean_all_trials": round(sum(s["det_score"] or 0 for s in sa) / len(sa), 3),
                      "judge_pending_trials": sum(not s["judge_complete"] for s in sa),
                      "min_trials_per_task": min(len(v) for v in per_task.values()), "tasks_covered": len(per_task)})
    crows = []
    for m in models:
        for cat in sorted({t["category"] for t in tasks}):
            ss = [s for s in scores if s["model"] == m and by_task[s["task_id"]]["category"] == cat]
            if ss:
                crows.append({"model": m, "category": cat, "n_trials": len(ss),
                              "mean_score": round(sum(s["score"] for s in ss) / len(ss), 3),
                              "pass_rate": round(sum(s["passed"] for s in ss) / len(ss), 3)})
    write_csv(out / "summary_by_model.csv", mrows)
    write_csv(out / "summary_by_category.csv", crows)
    trows = []
    for m in models:
        for t in tasks:
            ss = [s for s in scores if s["model"] == m and s["task_id"] == t["id"]]
            if ss:
                trows.append({"model": m, "task_id": t["id"], "passes": f"{sum(s['passed'] for s in ss)}/{len(ss)}",
                              "mean_score": round(sum(s["score"] for s in ss) / len(ss), 3)})
    write_csv(out / "summary_by_task.csv", trows)
    md = [f"# {title}", "", "| Model | Trials/task | Mean score | Pass rate | pass@k | pass^k | Format fails | Model cost (USD) |", "|---|---|---|---|---|---|---|---|"]
    for r in mrows:
        if not r["n_trials"]:
            md.append(f"| {r['model']} | 0 (judge pending: {r['judge_pending_trials']}) | | | | | | |"); continue
        md.append(f"| {r['model']} | {r['trials_per_task']} | {r['mean_score']} | {r['pass_rate']:.0%} | {r['pass@k']:.0%} | {r['pass^k']:.0%} | {r['format_failures']} | {r['model_cost_usd']} |")
    md += ["", "## By task (passes / trials)", "", "| Task | " + " | ".join(models) + " |", "|---|" + "---|" * len(models)]
    for t in tasks:
        cells = [next((r["passes"] for r in trows if r["model"] == m and r["task_id"] == t["id"]), "-") for m in models]
        md.append(f"| {t['id']} {t['category']} | " + " | ".join(cells) + " |")
    (out / "summary.md").write_text("\n".join(md) + "\n")
    print("\n".join(md))

def write_csv(path, rows):
    if not rows:
        path.write_text(""); return
    keys = list(dict.fromkeys(k for r in rows for k in r))
    with open(path, "w", newline="") as f:
        w = csv.DictWriter(f, fieldnames=keys); w.writeheader(); w.writerows(rows)

def validate_references(cfg, tasks, judge_model, mock):
    """Reference answers must pass every task; deliberately wrong answers must fail every task."""
    cpath = ROOT / "results" / "graded" / f"validation_cache_{judge_model.replace('/', '_')}.json"
    cache = json.loads(cpath.read_text()) if cpath.exists() and not mock else {}
    ok = True
    print(f"Validating graders (judge: {judge_model})")
    for t in tasks:
        for wrong in (False, True):
            try:
                _, score, passed, flags, _ = grade_response(cfg, t, reference_text(t["id"], wrong), judge_model, 1, cache, mock)
            finally:
                if not mock:
                    cpath.write_text(json.dumps(cache))
            good = passed != wrong
            ok &= good
            print(f"  {t['id']} {'wrong' if wrong else 'ref  '}: score={score:.2f} passed={passed} {'OK' if good else 'GRADER PROBLEM'} {flags or ''}")
    print("ALL GRADER CHECKS OK" if ok else "SOME GRADER CHECKS FAILED")
    return ok

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("run_dir", nargs="?")
    ap.add_argument("--judge-model")
    ap.add_argument("--judge-repeats", type=int, default=1)
    ap.add_argument("--mock-judge", action="store_true", help="dry run: mock judge, no API calls")
    ap.add_argument("--validate-references", action="store_true")
    args = ap.parse_args()
    cfg = load_config()
    tasks = load_tasks()
    judge_model = "mock/judge-reference" if args.mock_judge else (args.judge_model or cfg["judge_model"])

    if args.validate_references:
        sys.exit(0 if validate_references(cfg, tasks, judge_model, args.mock_judge) else 1)
    if not args.run_dir:
        ap.error("run_dir required")
    run_dir = (ROOT / args.run_dir) if not pathlib.Path(args.run_dir).is_absolute() else pathlib.Path(args.run_dir)
    manifest = json.loads((run_dir / "manifest.json").read_text())
    if judge_model in manifest["models"]:
        sys.exit("Judge model is one of the tested models; choose another judge.")
    is_mock = manifest.get("mock", False)
    if is_mock and not args.mock_judge:
        sys.exit("This is a mock run; grade it with --mock-judge.")
    out = (run_dir / "graded") if is_mock else (ROOT / "results" / "graded" / run_dir.name)
    out.mkdir(parents=True, exist_ok=True)
    cache_path = out / "judge_cache.json"
    cache = json.loads(cache_path.read_text()) if cache_path.exists() else {}
    by_id = {t["id"]: t for t in tasks}

    files = sorted(p for p in run_dir.glob("*/*.json"))
    files.sort(key=lambda p: (json.loads(p.read_text())["trial"], str(p)))   # judge trial 1 for everyone first
    judge_enabled = True
    crit_rows, scores = [], []
    with ThreadPoolExecutor(1 if args.mock_judge else cfg["concurrency"]) as pool:
        for p in files:
            rec = json.loads(p.read_text())
            t = by_id[rec["task_id"]]
            try:
                rows, score, passed, flags, det = grade_response(cfg, t, rec.get("text"), judge_model, args.judge_repeats, cache, args.mock_judge, pool, judge_enabled)
            except (QuotaExhausted, PaidCallDetected) as e:
                print(f"Judge stopped: {e}. Remaining judge criteria marked PENDING; rerun grade.py later to finish (cached verdicts are reused).")
                judge_enabled = False
                cache_path.write_text(json.dumps(cache))
                rows, score, passed, flags, det = grade_response(cfg, t, rec.get("text"), judge_model, args.judge_repeats, cache, args.mock_judge, pool, False)
            cache_path.write_text(json.dumps(cache))
            base = {"model": rec["model_requested"], "task_id": rec["task_id"], "trial": rec["trial"], "file": str(p.relative_to(ROOT))}
            crit_rows += [{**base, **r} for r in rows]
            scores.append({**base, "category": t["category"], "score": score, "passed": passed, "det_score": det,
                           "judge_complete": "JUDGE_PENDING" not in flags, "flags": ";".join(flags),
                           "error": rec.get("error") or "", "returned_model": rec.get("returned_model"),
                           "cost_usd": ((rec.get("usage") or {}).get("cost") or 0)})
            print(f"{base['model']} {base['task_id']} t{base['trial']}: score={score:.2f} pass={passed} {';'.join(flags)}")
    cache_path.write_text(json.dumps(cache))
    write_csv(out / "criteria.csv", crit_rows)
    write_csv(out / "scores.csv", scores)
    judge_cost = sum(r.get("judge_cost", 0) or 0 for r in crit_rows)
    title = ("MOCK DRY RUN - NOT RESULTS" if is_mock else f"Results for run {run_dir.name}") + f" (judge: {judge_model}, repeats: {args.judge_repeats}, judge cost ${judge_cost:.4f})"
    summarize(scores, tasks, out, title)
    print(f"\nWrote {out.relative_to(ROOT)}/")

if __name__ == "__main__":
    main()
