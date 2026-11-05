#!/usr/bin/env python3
"""Run the ESL teaching-judgment tasks against models on OpenRouter.

  python run_eval.py                      # all models in config.json, all tasks, N trials
  python run_eval.py --models openai/gpt-6-astra --trials 3 --tasks T01 T07
  python run_eval.py --mock               # keyless dry run with mock models -> results/mock/ (NOT results)

Each trial is a fresh single-turn conversation (no shared history). Raw outputs are saved to
results/raw/<run_id>/<model>/<task>__trial<k>.json together with the exact prompt and settings.
"""
import argparse, json, sys, time, datetime, platform
from concurrent.futures import ThreadPoolExecutor, as_completed
from esl_eval.common import ROOT, load_config, load_tasks, chat, slug, sha, model_catalog, MOCK_PREFIX, QuotaExhausted, PaidCallDetected

def build_messages(cfg, task, model):
    user = task["prompt"]
    if model.startswith(MOCK_PREFIX):          # tag only used by the mock model to look up its canned answer
        user += f"\n[TASK_ID:{task['id']}]"
    return [{"role": "system", "content": cfg["system_prompt"]}, {"role": "user", "content": user}]

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--config")
    ap.add_argument("--models", nargs="+")
    ap.add_argument("--tasks", nargs="+", help="task ids, default all")
    ap.add_argument("--trials", type=int)
    ap.add_argument("--reasoning-effort", choices=["low", "medium", "high"], help="optional; recorded in manifest")
    ap.add_argument("--mock", action="store_true", help="dry run with mock/reference and mock/wrong; writes to results/mock/")
    ap.add_argument("--run-id")
    args = ap.parse_args()

    cfg = load_config(args.config)
    tasks = load_tasks(ids=args.tasks)
    models = ["mock/reference", "mock/wrong"] if args.mock else (args.models or cfg["models"])
    trials = args.trials or (2 if args.mock else cfg["trials"])
    if cfg["judge_model"] in models:
        sys.exit(f"Judge model {cfg['judge_model']} is also a tested model; pick a different judge.")

    run_id = args.run_id or datetime.datetime.now(datetime.timezone.utc).strftime("%Y%m%dT%H%M%SZ")
    out = ROOT / "results" / ("mock" if args.mock else "raw") / run_id
    out.mkdir(parents=True, exist_ok=True)

    supports = {}
    if not args.mock:
        try:
            cat = model_catalog()
            for m in models:
                if m not in cat:
                    sys.exit(f"Model id not found on OpenRouter: {m}")
                supports[m] = {"temperature_supported": "temperature" in (cat[m].get("supported_parameters") or []),
                               "pricing": cat[m].get("pricing")}
        except Exception as e:
            print(f"warning: could not fetch model catalog ({e})")
    extra = {"reasoning": {"effort": args.reasoning_effort}} if args.reasoning_effort else None

    manifest = {"run_id": run_id, "mock": args.mock, "started_utc": run_id, "models": models, "trials": trials,
                "tasks": [t["id"] for t in tasks], "task_file_sha": sha((ROOT / "tasks/tasks.jsonl").read_text()),
                "temperature_requested": cfg["temperature"], "max_tokens": cfg["max_tokens"],
                "reasoning_effort": args.reasoning_effort, "system_prompt": cfg["system_prompt"],
                "model_param_support": supports, "python": platform.python_version(),
                "note": ("MOCK DRY RUN - canned answers, not model results" if args.mock else
                         "Models whose temperature_supported is false ignore temperature on OpenRouter (provider default).")}
    (out / "manifest.json").write_text(json.dumps(manifest, indent=2))

    # trial-major order: trial 1 for every model and task first, so a quota stop leaves balanced partial data
    jobs = [(m, t, k) for k in range(1, trials + 1) for t in tasks for m in models]  # models interleaved to spread upstream rate limits
    def run_one(m, t, k):
        path = out / slug(m) / f"{t['id']}__trial{k}.json"
        if path.exists() and not json.loads(path.read_text()).get("error"):
            return path, "skipped (exists)"
        path.parent.mkdir(parents=True, exist_ok=True)
        msgs = build_messages(cfg, t, m)
        started = datetime.datetime.now(datetime.timezone.utc).isoformat()
        rec = {"run_id": run_id, "model_requested": m, "task_id": t["id"], "trial": k, "started_utc": started,
               "temperature": cfg["temperature"], "max_tokens": cfg["max_tokens"], "messages": msgs,
               "mock": m.startswith(MOCK_PREFIX)}
        try:
            res = chat(m, msgs, temperature=cfg["temperature"], max_tokens=cfg["max_tokens"],
                       timeout=cfg["request_timeout_s"], extra=extra)
            rec.update(res, error=None)
        except (QuotaExhausted, PaidCallDetected):
            raise
        except Exception as e:
            rec.update(text=None, error=str(e))
        rec["finished_utc"] = datetime.datetime.now(datetime.timezone.utc).isoformat()
        path.write_text(json.dumps(rec, indent=2, ensure_ascii=False))
        return path, ("ERROR " + rec["error"][:120]) if rec.get("error") else "ok"

    t0 = time.time()
    workers = 1 if args.mock else cfg["concurrency"]
    stopped = None
    for i, j in enumerate(jobs, 1):
        try:
            p, status = run_one(*j)
        except (QuotaExhausted, PaidCallDetected) as e:
            stopped = f"{type(e).__name__}: {e}"
            print(f"STOPPED at job {i}/{len(jobs)}: {stopped}. Rerun with --run-id {run_id} to resume.")
            break
        print(f"[{i}/{len(jobs)}] {p.relative_to(ROOT)} {status}", flush=True)
    manifest["stopped_reason"] = stopped
    manifest["finished_utc"] = datetime.datetime.now(datetime.timezone.utc).isoformat()
    manifest["wall_time_s"] = round(time.time() - t0, 1)
    (out / "manifest.json").write_text(json.dumps(manifest, indent=2))
    print(f"\nRun saved to {out.relative_to(ROOT)}\nNext: python grade.py {out.relative_to(ROOT)}" + (" --mock-judge" if args.mock else ""))

if __name__ == "__main__":
    main()
